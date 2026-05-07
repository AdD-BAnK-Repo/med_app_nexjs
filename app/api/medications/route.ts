import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const type = searchParams.get('type') || 'normal'; // 'normal' | 'nostock' | 'all'

    let whereClause = {};
    if (type === 'normal') {
      whereClause = { isNoStock: false };
    } else if (type === 'nostock') {
      whereClause = { isNoStock: true };
    }

    const meds = await prisma.medication.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { shelf: 'asc' },
        { name: 'asc' }
      ],
      include: {
        inspections: {
          where: {
            month: month,
            year: year
          }
        }
      }
    });

    const medsWithLast = await Promise.all(meds.map(async (med) => {
      const lastInspection = await prisma.inspection.findFirst({
        where: { medicationId: med.id },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' }
        ]
      });
      return { med, lastInspection };
    }));

    const formattedMeds = medsWithLast.map(({ med, lastInspection }) => {
      const inspection = med.inspections[0] || null;
      
      // Parse batches
      let batches: any[] = [];
      if (inspection?.batches) {
        try { batches = JSON.parse(inspection.batches); } catch {}
      }
      
      // Find nearest expiry from batches
      let nearestExpiry = inspection?.expiryDate || lastInspection?.expiryDate || null;
      let totalQty3m: number | null = null;
      let totalQty8m: number | null = null;
      
      if (batches.length > 0) {
        // Sum qty from all batches
        totalQty3m = batches.reduce((sum: number, b: any) => sum + (b.qtyUnder3Months || 0), 0) || null;
        totalQty8m = batches.reduce((sum: number, b: any) => sum + (b.qtyUnder8Months || 0), 0) || null;
        
        // Find nearest expiry
        const now = new Date();
        const parsed = batches.map((b: any) => {
          if (!b.expiryDate) return null;
          const parts = b.expiryDate.split(/[\/-]/);
          if (parts.length === 3) {
            const d = parseInt(parts[0]);
            const m = parseInt(parts[1]) - 1;
            let y = parseInt(parts[2]);
            if (y < 100) y += 2000;
            const exp = new Date(y, m, d);
            const ml = (exp.getFullYear() - now.getFullYear()) * 12 + (exp.getMonth() - now.getMonth());
            return { expiryDate: b.expiryDate, monthsLeft: ml };
          }
          return null;
        }).filter(Boolean);
        
        if (parsed.length > 0) {
          const nearest = parsed.reduce((a: any, b: any) => a.monthsLeft < b.monthsLeft ? a : b);
          nearestExpiry = nearest.expiryDate;
        }
      } else {
        totalQty3m = inspection?.qtyUnder3Months !== undefined ? inspection.qtyUnder3Months : null;
        totalQty8m = inspection?.qtyUnder8Months !== undefined ? inspection.qtyUnder8Months : null;
      }
      
      return {
        id: med.id,
        category: med.category,
        name: med.name,
        shelf: med.shelf,
        location: med.location,
        isNoStock: med.isNoStock,
        expiryDate: nearestExpiry,
        qtyUnder3Months: totalQty3m,
        qtyUnder8Months: totalQty8m,
        checkedAt: inspection?.checkedAt ? inspection.checkedAt.toISOString() : null,
        isChecked: inspection !== null,
        batchCount: batches.length > 0 ? batches.length : 0,
        batches: batches.length > 0 ? batches : null,
      };
    });

    return NextResponse.json(formattedMeds);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, expiryDate, qtyUnder3Months, qtyUnder8Months, batches, month, year, location } = body;
    
    if (!id || month === undefined || year === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update location directly on Medication if provided
    if (location !== undefined) {
      await prisma.medication.update({
        where: { id },
        data: { location: location || null }
      });
    }

    const dataToUpdate: any = {};
    if (expiryDate !== undefined) dataToUpdate.expiryDate = expiryDate;
    if (qtyUnder3Months !== undefined) dataToUpdate.qtyUnder3Months = qtyUnder3Months === "" ? null : parseInt(qtyUnder3Months);
    if (qtyUnder8Months !== undefined) dataToUpdate.qtyUnder8Months = qtyUnder8Months === "" ? null : parseInt(qtyUnder8Months);
    if (batches !== undefined) dataToUpdate.batches = batches.length > 0 ? JSON.stringify(batches) : null;
    dataToUpdate.checkedAt = new Date();

    const inspection = await prisma.inspection.upsert({
      where: {
        medicationId_month_year: {
          medicationId: id,
          month: month,
          year: year
        }
      },
      update: dataToUpdate,
      create: {
        medicationId: id,
        month: month,
        year: year,
        expiryDate: dataToUpdate.expiryDate,
        qtyUnder3Months: dataToUpdate.qtyUnder3Months,
        qtyUnder8Months: dataToUpdate.qtyUnder8Months,
        batches: dataToUpdate.batches
      }
    });

    return NextResponse.json(inspection);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update medication' }, { status: 500 });
  }
}
