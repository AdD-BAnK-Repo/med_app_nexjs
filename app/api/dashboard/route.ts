import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function calculateMonthsLeft(expiryDate: string | null, refDate: Date): number | null {
  if (!expiryDate) return null;
  const parts = expiryDate.split(/[\/-]/);
  let expDay = 1, expMonth, expYear;
  
  if (parts.length === 3) {
    expDay = parseInt(parts[0]);
    expMonth = parseInt(parts[1]) - 1;
    expYear = parseInt(parts[2]);
  } else if (parts.length === 2) {
    expMonth = parseInt(parts[0]) - 1;
    expYear = parseInt(parts[1]);
    if (expYear < 100) expYear += 2000;
  } else {
    return null;
  }

  const expDate = new Date(expYear, expMonth, expDay);
  const monthsLeft = (expDate.getFullYear() - refDate.getFullYear()) * 12 
    + (expDate.getMonth() - refDate.getMonth()) 
    + (expDate.getDate() - refDate.getDate()) / 30;
  return monthsLeft;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const refDate = new Date(year, month - 1, new Date().getDate());

    const totalMeds = await prisma.medication.count();
    const noStockMeds = await prisma.medication.count({ where: { isNoStock: true } });

    const checkedThisMonth = await prisma.inspection.count({
      where: {
        month: month,
        year: year,
        expiryDate: { not: null }
      }
    });

    // Get all medications with their current month inspection (or latest)
    const meds = await prisma.medication.findMany({
      where: { isNoStock: false },
      include: {
        inspections: {
          where: { month, year },
          take: 1
        }
      }
    });

    const medsWithStatus = await Promise.all(meds.map(async (med) => {
      const inspection = med.inspections[0];
      let lastInspection = null;
      if (!inspection) {
        lastInspection = await prisma.inspection.findFirst({
          where: { medicationId: med.id },
          orderBy: [{ year: 'desc' }, { month: 'desc' }]
        });
      }

      const expiryDate = inspection?.expiryDate || lastInspection?.expiryDate || null;
      const isChecked = inspection !== null;
      const monthsLeft = calculateMonthsLeft(expiryDate, refDate);

      return {
        id: med.id,
        isChecked,
        monthsLeft,
        expiryDate
      };
    }));

    // Count by status
    let safe = 0, warning = 0, expired = 0, unknown = 0;
    medsWithStatus.forEach(m => {
      if (!m.isChecked) {
        unknown++;
      } else if (m.monthsLeft === null) {
        unknown++;
      } else if (m.monthsLeft < 0) {
        expired++;
      } else if (m.monthsLeft <= 8) {
        warning++;
      } else {
        safe++;
      }
    });

    const lastUpdate = await prisma.inspection.findFirst({
      orderBy: { checkedAt: 'desc' },
      select: { checkedAt: true }
    });

    return NextResponse.json({
      totalMeds,
      noStockMeds,
      checkedThisMonth,
      month,
      year,
      lastUpdatedAt: lastUpdate?.checkedAt || null,
      safe,
      warning,
      expired,
      unknown
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
