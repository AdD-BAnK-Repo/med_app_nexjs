import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let inspectionQuery: any = {
      orderBy: { checkedAt: 'desc' },
      take: 1
    };

    if (month && year) {
      inspectionQuery = {
        where: {
          month: parseInt(month),
          year: parseInt(year)
        },
        take: 1
      };
    }

    const lights = await prisma.emergencyLight.findMany({
      include: {
        inspections: inspectionQuery
      }
    });
    return NextResponse.json(lights);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
