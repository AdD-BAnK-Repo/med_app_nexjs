import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, location } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing medication id' }, { status: 400 });
    }

    const med = await prisma.medication.update({
      where: { id },
      data: { location: location || null }
    });

    return NextResponse.json({ success: true, location: med.location });
  } catch (error) {
    console.error('Failed to update location:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
