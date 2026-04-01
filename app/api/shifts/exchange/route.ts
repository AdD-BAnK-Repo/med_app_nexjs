import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { documentNo, requesterName, receiverName, shiftDate, shiftType, reason } = body;

    if (!documentNo || !requesterName || !receiverName || !shiftDate || !shiftType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get month and year from shiftDate
    const shiftDateObj = new Date(shiftDate);
    const month = shiftDateObj.getMonth() + 1; // 1-12
    const year = shiftDateObj.getFullYear();

    // Check for duplicate document number in the same month/year
    const existing = await prisma.shiftExchange.findUnique({
      where: {
        documentNo_month_year: {
          documentNo,
          month,
          year,
        }
      }
    });

    if (existing) {
      return NextResponse.json({ 
        error: `เลขที่เอกสาร ${documentNo} มีอยู่แล้วในเดือน ${month}/${year} กรุณาใช้เลขอื่น` 
      }, { status: 409 });
    }

    const exchange = await prisma.shiftExchange.create({
      data: {
        documentNo,
        requesterName,
        receiverName,
        shiftDate: shiftDateObj,
        shiftType,
        reason: reason || null,
        month,
        year,
      },
    });

    return NextResponse.json(exchange, { status: 201 });
  } catch (error: any) {
    console.error('Error creating shift exchange:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'เลขที่เอกสารซ้ำในเดือนนี้ กรุณาใช้เลขอื่น' 
      }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create shift exchange' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const exchanges = await prisma.shiftExchange.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(exchanges);
  } catch (error) {
    console.error('Error fetching shift exchanges:', error);
    return NextResponse.json({ error: 'Failed to fetch shift exchanges' }, { status: 500 });
  }
}
