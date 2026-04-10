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
      const isCheckedCurrentMonth = inspection !== null;
      return {
        id: med.id,
        category: med.category,
        name: med.name,
        shelf: med.shelf,
        isNoStock: med.isNoStock,
        expiryDate: inspection?.expiryDate || lastInspection?.expiryDate || null,
        qtyUnder3Months: inspection?.qtyUnder3Months !== undefined ? inspection.qtyUnder3Months : (lastInspection?.qtyUnder3Months ?? null),
        qtyUnder8Months: inspection?.qtyUnder8Months !== undefined ? inspection.qtyUnder8Months : (lastInspection?.qtyUnder8Months ?? null),
        checkedAt: inspection?.checkedAt ? inspection.checkedAt.toISOString() : (lastInspection?.checkedAt ? lastInspection.checkedAt.toISOString() : null),
        isChecked: isCheckedCurrentMonth,
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
    const { id, expiryDate, qtyUnder3Months, qtyUnder8Months, month, year } = body;
    
    if (!id || month === undefined || year === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (expiryDate !== undefined) dataToUpdate.expiryDate = expiryDate;
    if (qtyUnder3Months !== undefined) dataToUpdate.qtyUnder3Months = qtyUnder3Months === "" ? null : parseInt(qtyUnder3Months);
    if (qtyUnder8Months !== undefined) dataToUpdate.qtyUnder8Months = qtyUnder8Months === "" ? null : parseInt(qtyUnder8Months);
    dataToUpdate.checkedAt = new Date(); // Update check time

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
        qtyUnder8Months: dataToUpdate.qtyUnder8Months
      }
    });

    return NextResponse.json(inspection);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update medication' }, { status: 500 });
  }
}