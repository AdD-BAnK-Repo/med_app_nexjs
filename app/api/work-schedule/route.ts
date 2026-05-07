import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get('month') || '0');
  const year = parseInt(searchParams.get('year') || '0');
  
  if (month && year) {
    const schedules = await prisma.workSchedule.findMany({
      where: { month, year },
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(schedules);
  }
  
  const all = await prisma.workSchedule.findMany({ orderBy: { date: 'asc' } });
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, workType, month, year } = body;
  
  // Upsert: if date exists, update it
  const existing = await prisma.workSchedule.findUnique({ where: { date } });
  
  if (existing) {
    const updated = await prisma.workSchedule.update({
      where: { date },
      data: { workType, month, year },
    });
    return NextResponse.json(updated);
  }
  
  const created = await prisma.workSchedule.create({
    data: { date, workType, month, year },
  });
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { date, workType, month, year } = body;
  
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });
  
  const updated = await prisma.workSchedule.update({
    where: { date },
    data: { workType: workType ?? undefined, month: month ?? undefined, year: year ?? undefined },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });
  
  await prisma.workSchedule.delete({ where: { date } });
  return NextResponse.json({ success: true });
}
