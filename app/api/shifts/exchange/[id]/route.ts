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
    const { requesterName, receiverName, shiftDate, shiftType, reason } = body;

    if (!requesterName || !receiverName || !shiftDate || !shiftType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const exchange = await prisma.shiftExchange.update({
      where: { id },
      data: {
        requesterName,
        receiverName,
        shiftDate: new Date(shiftDate),
        shiftType,
        reason: reason || null,
      },
    });

    return NextResponse.json(exchange);
  } catch (error) {
    console.error('Error updating shift exchange:', error);
    return NextResponse.json({ error: 'Failed to update shift exchange' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.shiftExchange.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift exchange:', error);
    return NextResponse.json({ error: 'Failed to delete shift exchange' }, { status: 500 });
  }
}