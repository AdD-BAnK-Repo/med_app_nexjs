import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const meds = await prisma.medication.findMany();
    return NextResponse.json(meds);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch backup' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const meds = await request.json();
    if (!Array.isArray(meds)) {
      return NextResponse.json({ error: 'Invalid data format, expected an array.' }, { status: 400 });
    }

    let count = 0;
    for (const med of meds) {
      if (!med.name) continue;
      
      const existing = await prisma.medication.findFirst({
        where: { name: med.name }
      });

      if (existing) {
        // Update existing record (don't overwrite ID, keep inspection history intact)
        await prisma.medication.update({
          where: { id: existing.id },
          data: {
            category: med.category || existing.category,
            shelf: med.shelf !== undefined ? med.shelf : existing.shelf,
            isNoStock: med.isNoStock !== undefined ? med.isNoStock : existing.isNoStock,
          }
        });
      } else {
        // Create new record
        await prisma.medication.create({
          data: {
            id: med.id || Math.random().toString(36).substring(2, 10),
            name: med.name,
            category: med.category || 'ยาเม็ด',
            shelf: med.shelf || null,
            isNoStock: med.isNoStock || false,
          }
        });
      }
      count++;
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Backup restore error:', error);
    return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
  }
}
