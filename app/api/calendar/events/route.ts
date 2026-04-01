import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/calendar/events - ดึง events ทั้งหมดหรือตาม filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month'); // 1-12
    const year = searchParams.get('year'); // ค.ศ.
    const type = searchParams.get('type'); // shift, task, work, meeting, holiday

    let where: any = {};

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1);
      where.startDate = {
        gte: startDate,
        lt: endDate,
      };
    }

    if (type) {
      where.type = type;
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// POST /api/calendar/events - สร้าง event ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.startDate || !body.endDate || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, startDate, endDate, type' },
        { status: 400 }
      );
    }

    // Convert string dates to Date objects
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    const event = await prisma.calendarEvent.create({
      data: {
        title: body.title,
        description: body.description || '',
        startDate,
        endDate,
        allDay: body.allDay || false,
        type: body.type,
        category: body.category || null,
        personName: body.personName || null,
        color: body.color || null,
        status: body.status || 'pending',
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}