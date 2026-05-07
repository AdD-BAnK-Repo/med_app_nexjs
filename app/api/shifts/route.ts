import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SHIFT_AMOUNTS: Record<string, number> = {
  'ชน': 380,
  'บน': 380,
  'ชบ': 760,
  'สบ': 190,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get('month') || '0');
  const year = parseInt(searchParams.get('year') || '0');
  const date = searchParams.get('date');

  if (date) {
    const shift = await prisma.shift.findUnique({ where: { date } });
    return NextResponse.json(shift);
  }

  if (!month || !year) {
    return NextResponse.json({ error: 'month and year required' }, { status: 400 });
  }

  const shifts = await prisma.shift.findMany({
    where: { month, year },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(shifts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, shiftType, month, year } = body;

  if (!date || !shiftType || !month || !year) {
    return NextResponse.json({ error: 'date, shiftType, month, year required' }, { status: 400 });
  }

  const amount = SHIFT_AMOUNTS[shiftType] || 0;

  const existing = await prisma.shift.findUnique({ where: { date } });
  if (existing) {
    const updated = await prisma.shift.update({
      where: { date },
      data: { shiftType, amount, month, year },
    });
    return NextResponse.json(updated);
  }

  const created = await prisma.shift.create({
    data: { date, shiftType, amount, month, year },
  });
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });

  await prisma.shift.delete({ where: { date } });
  return NextResponse.json({ success: true });
}
