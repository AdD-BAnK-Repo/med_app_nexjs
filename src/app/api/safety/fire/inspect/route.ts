import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if month/year are provided in body (from explicit form selection), otherwise use current
    const d = new Date();
    const month = body.month ? parseInt(body.month) : (d.getMonth() + 1);
    const year = body.year ? parseInt(body.year) : d.getFullYear();

    const inspection = await prisma.fireInspection.upsert({
      where: {
        extinguisherId_month_year: {
          extinguisherId: body.extinguisherId,
          month, year
        }
      },
      update: {
        nozzleStatus: body.nozzleStatus,
        pinStatus: body.pinStatus,
        invertStatus: body.invertStatus,
        gaugeStatus: body.gaugeStatus,
        overallStatus: body.overallStatus,
        inspector: body.inspector,
        note: body.note,
        checkedAt: new Date()
      },
      create: {
        extinguisherId: body.extinguisherId,
        month, year,
        nozzleStatus: body.nozzleStatus,
        pinStatus: body.pinStatus,
        invertStatus: body.invertStatus,
        gaugeStatus: body.gaugeStatus,
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
