import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // จำนวนยาทั้งหมด
    const totalMeds = await prisma.medication.count();
    
    // จำนวนยา No Stock
    const noStockMeds = await prisma.medication.count({ where: { isNoStock: true } });
    
    // จำนวนยาที่ได้รับการตรวจในเดือนนี้แล้ว (มี expiryDate ถูกบันทึกไว้)
    const checkedThisMonth = await prisma.inspection.count({
      where: {
        month: month,
        year: year,
        expiryDate: { not: null }
      }
    });

    // วันที่อัปเดตล่าสุด
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
      lastUpdatedAt: lastUpdate?.checkedAt || null
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
