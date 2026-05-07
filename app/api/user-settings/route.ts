import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  let settings = await prisma.userSettings.findFirst();
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { salary: 0, teamMembers: '["พี่ต้อง","พี่สม","พี่จิ๋ม","พี่แอ๊ด","น้องบี"]' },
    });
  }
  return NextResponse.json({
    ...settings,
    teamMembers: JSON.parse(settings.teamMembers || '[]'),
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const existing = await prisma.userSettings.findFirst();
  
  const data: any = {};
  if (body.salary !== undefined) data.salary = body.salary;
  if (body.teamMembers) data.teamMembers = JSON.stringify(body.teamMembers);
  
  if (existing) {
    const updated = await prisma.userSettings.update({
      where: { id: existing.id },
      data,
    });
    return NextResponse.json({
      ...updated,
      teamMembers: JSON.parse(updated.teamMembers || '[]'),
    });
  }
  
  const created = await prisma.userSettings.create({ data });
  return NextResponse.json({
    ...created,
    teamMembers: JSON.parse(created.teamMembers || '[]'),
  }, { status: 201 });
}
