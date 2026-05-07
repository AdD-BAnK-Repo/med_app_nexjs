import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Thai government holidays 2569 (2026)
const THAI_HOLIDAYS_2569 = [
  { date: '2026-01-01', name: 'วันขึ้นปีใหม่' },
  { date: '2026-02-16', name: 'วันมาฆบูชา' },
  { date: '2026-04-06', name: 'วันจักรี' },
  { date: '2026-04-13', name: 'วันสงกรานต์' },
  { date: '2026-04-14', name: 'วันสงกรานต์' },
  { date: '2026-04-15', name: 'วันสงกรานต์' },
  { date: '2026-05-01', name: 'วันแรงงานแห่งชาติ' },
  { date: '2026-05-11', name: 'วันวิสาขบูชา' },
  { date: '2026-06-03', name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ' },
  { date: '2026-07-10', name: 'วันอาสาฬหบูชา' },
  { date: '2026-07-11', name: 'วันเข้าพรรษา' },
  { date: '2026-07-28', name: 'วันเฉลิมพระชนมพรรษา ร.10' },
  { date: '2026-08-12', name: 'วันแม่แห่งชาติ' },
  { date: '2026-10-13', name: 'วันคล้ายวันสวรรคต ร.9' },
  { date: '2026-10-23', name: 'วันปิยมหาราช' },
  { date: '2026-12-05', name: 'วันพ่อแห่งชาติ' },
  { date: '2026-12-10', name: 'วันรัฐธรรมนูญ' },
  { date: '2026-12-31', name: 'วันสิ้นปี' },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') || '0');
  const autoWeekends = searchParams.get('autoWeekends') === 'true';
  
  let holidays = await prisma.holiday.findMany({
    where: year ? { date: { startsWith: String(year) } } : {},
    orderBy: { date: 'asc' },
  });
  
  // Auto-add weekends if requested
  if (autoWeekends && year) {
    const existingDates = new Set(holidays.map(h => h.date));
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        if (d.getDay() === 0 || d.getDay() === 6) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          if (!existingDates.has(dateStr)) {
            holidays.push({
              id: `weekend-${dateStr}`,
              date: dateStr,
              name: d.getDay() === 0 ? 'วันอาทิตย์' : 'วันเสาร์',
              isWeekend: true,
              createdAt: new Date(),
            });
            existingDates.add(dateStr);
          }
        }
      }
    }
  }
  
  return NextResponse.json(holidays);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, name, isWeekend } = body;
  
  const existing = await prisma.holiday.findUnique({ where: { date } });
  if (existing) {
    const updated = await prisma.holiday.update({
      where: { date },
      data: { name, isWeekend: isWeekend ?? false },
    });
    return NextResponse.json(updated);
  }
  
  const created = await prisma.holiday.create({
    data: { date, name, isWeekend: isWeekend ?? false },
  });
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });
  
  await prisma.holiday.delete({ where: { date } });
  return NextResponse.json({ success: true });
}

// Seed holidays on first call — only create missing, never recreate deleted ones
export async function PUT(req: NextRequest) {
  let year: number | undefined;
  try {
    const body = await req.json();
    year = body?.year;
  } catch {
    // No body or invalid JSON
  }
  
  if (year === 2569 || year === 2026) {
    // Only seed if NO holidays exist for this year at all
    const existingCount = await prisma.holiday.count({
      where: { date: { startsWith: String(year === 2569 ? 2026 : 2026) } },
    });
    
    if (existingCount === 0) {
      for (const h of THAI_HOLIDAYS_2569) {
        await prisma.holiday.create({
          data: { date: h.date, name: h.name, isWeekend: false },
        });
      }
    }
  }
  
  return NextResponse.json({ success: true, seeded: THAI_HOLIDAYS_2569.length });
}
