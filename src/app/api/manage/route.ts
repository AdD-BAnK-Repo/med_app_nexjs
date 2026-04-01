import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Create a new medication
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, shelf, isNoStock } = body;
    
    if (!name || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a simple ID based on timestamp to avoid collisions
    const id = `${category}-${Date.now()}`;

    const newMed = await prisma.medication.create({
      data: {
        id,
        name,
        category,
        shelf: shelf || null,
        isNoStock: isNoStock || false
      }
    });

    return NextResponse.json(newMed, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 });
  }
}

// Update an existing medication's details (name, category, shelf)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, category, shelf, isNoStock } = body;
    
    if (!id || !name || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedMed = await prisma.medication.update({
      where: { id },
      data: {
        name,
        category,
        shelf: shelf || null,
        isNoStock: isNoStock !== undefined ? isNoStock : false
      }
    });

    return NextResponse.json(updatedMed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update medication' }, { status: 500 });
  }
}

// Delete a medication
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await prisma.medication.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete medication' }, { status: 500 });
  }
}