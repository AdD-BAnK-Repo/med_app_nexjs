import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get('month') || '0');
  const year = parseInt(searchParams.get('year') || '0');
  
  if (month && year) {
    const leaves = await prisma.leaveDay.findMany({
      where: { month, year },
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(leaves);
  }
  
  const all = await prisma.leaveDay.findMany({ orderBy: { date: 'asc' } });
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, leaveType, reason, month, year } = body;
  
  // Upsert
  const existing = await prisma.leaveDay.findUnique({ where: { date } });
  
  if (existing) {
    const updated = await prisma.leaveDay.update({
      where: { date },
      data: { leaveType, reason, month, year },
    });
    return NextResponse.json(updated);
  }
  
  const created = await prisma.leaveDay.create({
    data: { date, leaveType, reason, month, year },
  });
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });
  
  await prisma.leaveDay.delete({ where: { date } });
  return NextResponse.json({ success: true });
}
