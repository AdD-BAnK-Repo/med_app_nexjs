import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' }
    });
    
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'default',
          orderNumber: '',
          orderDate: ''
        }
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { orderNumber, orderDate } = data;
    
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {
        orderNumber: orderNumber !== undefined ? orderNumber : undefined,
        orderDate: orderDate !== undefined ? orderDate : undefined,
      },
      create: {
        id: 'default',
        orderNumber: orderNumber || '',
        orderDate: orderDate || '',
      }
    });
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}