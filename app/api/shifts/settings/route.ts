import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET monthly settings for current month
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '');
    const year = parseInt(searchParams.get('year') || '');

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }

    const settings = await prisma.monthlyDocumentSettings.findUnique({
      where: {
        month_year: {
          month,
          year
        }
      }
    });

    if (!settings) {
      return NextResponse.json({ 
        exists: false,
        message: 'No settings found for this month'
      }, { status: 404 });
    }

    return NextResponse.json({
      exists: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching monthly settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST create or update monthly settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { month, year, hospitalOrderNo, hospitalOrderDate, formVersion, formVersionDate } = body;

    if (!month || !year || !hospitalOrderNo || !hospitalOrderDate || !formVersion || !formVersionDate) {
      return NextResponse.json({ 
        error: 'All fields are required: month, year, hospitalOrderNo, hospitalOrderDate, formVersion, formVersionDate' 
      }, { status: 400 });
    }

    const settings = await prisma.monthlyDocumentSettings.upsert({
      where: {
        month_year: {
          month,
          year
        }
      },
      update: {
        hospitalOrderNo,
        hospitalOrderDate,
        formVersion,
        formVersionDate,
      },
      create: {
        month,
        year,
        hospitalOrderNo,
        hospitalOrderDate,
        formVersion,
        formVersionDate,
      },
    });

    return NextResponse.json({
      message: 'Settings saved successfully',
      settings
    }, { status: 200 });
  } catch (error) {
    console.error('Error saving monthly settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
