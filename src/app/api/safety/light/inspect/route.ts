import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if month/year are provided in body
    const d = new Date();
    const month = body.month ? parseInt(body.month) : (d.getMonth() + 1);
    const year = body.year ? parseInt(body.year) : d.getFullYear();

    const inspection = await prisma.lightInspection.upsert({
      where: {
        lightId_month_year: {
          lightId: body.lightId,
          month, year
        }
      },
      update: {
        ledStatus: body.ledStatus,
        chargeStatus: body.chargeStatus,
        testStatus: body.testStatus,
        overallStatus: body.overallStatus,
        inspector: body.inspector,
        note: body.note,
        checkedAt: new Date()
      },
      create: {
        lightId: body.lightId,
        month, year,
        ledStatus: body.ledStatus,
        chargeStatus: body.chargeStatus,
        testStatus: body.testStatus,
        overallStatus: body.overallStatus,
        inspector: body.inspector,
        note: body.note
      }
    });

    return NextResponse.json(inspection);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
