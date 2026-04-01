import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { requesterName } = body;

    if (!requesterName) {
      return NextResponse.json({ error: 'Missing requesterName' }, { status: 400 });
    }

    const exchange = await prisma.shiftExchange.update({
      where: { id },
      data: {
        requesterName,
      },
    });

    return NextResponse.json(exchange);
  } catch (error) {
    console.error('Error renaming shift exchange:', error);
    return NextResponse.json({ error: 'Failed to rename shift exchange' }, { status: 500 });
  }
}