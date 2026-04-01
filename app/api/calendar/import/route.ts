import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Parse schedule data from SCHEDULE.md
function parseScheduleData() {
  try {
    const schedulePath = path.join(process.cwd(), '..', '..', '..', 'SCHEDULE.md');
    const content = fs.readFileSync(schedulePath, 'utf8');
    
    const events = [];
    
    // Split by lines and look for table rows
    const lines = content.split('\n');
    let inTable = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect start of table (line starting with | and containing ---)
      if (line.startsWith('|') && line.includes('---')) {
        inTable = true;
        continue;
      }
      
      if (inTable && line.startsWith('|') && !line.includes('---')) {
        // Parse table row
        const cells = line.split('|').filter(cell => cell.trim() !== '');
        
        if (cells.length >= 4) {
          const date = cells[0].trim();
          const shift = cells[1].trim();
          const person = cells[2].trim();
          const notes = cells[3].trim();
          
          // Parse date (assume format: "วันอาทิตย์ที่ 16 มีนาคม 2568")
          // Extract day and month from Thai date string
          const dateMatch = date.match(/(\d{1,2})\s+(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s+(\d{4})/);
          
          if (dateMatch) {
            const day = parseInt(dateMatch[1]);
            const monthThai = dateMatch[2];
            const yearThai = parseInt(dateMatch[3]);
            
            // Convert Thai year to Christian year (subtract 543)
            const year = yearThai - 543;
            
            // Convert Thai month to number (1-12)
            const months: Record<string, number> = {
              'มกราคม': 1, 'กุมภาพันธ์': 2, 'มีนาคม': 3, 'เมษายน': 4,
              'พฤษภาคม': 5, 'มิถุนายน': 6, 'กรกฎาคม': 7, 'สิงหาคม': 8,
              'กันยายน': 9, 'ตุลาคม': 10, 'พฤศจิกายน': 11, 'ธันวาคม': 12
            };
            const month = months[monthThai] || 1;
            
            // Create start and end dates (assume shift is 20:00-08:00)
            const startDate = new Date(year, month - 1, day, 20, 0, 0); // 20:00
            const endDate = new Date(year, month - 1, day + 1, 8, 0, 0); // 08:00 next day
            
            // Determine event type based on shift description
            let type = 'shift';
            let category = 'เวรนอกเวลา';
            
            if (shift.includes('เวรนอกเวลา')) {
              type = 'shift';
              category = 'เวรนอกเวลา';
            } else if (shift.includes('งานประจำ')) {
              type = 'task';
              category = 'งานประจำ';
            } else if (shift.includes('ประชุม')) {
              type = 'meeting';
              category = 'ประชุม';
            }
            
            events.push({
              title: shift,
              description: notes || `เวรของ ${person}`,
              startDate,
              endDate,
              allDay: false,
              type,
              category,
              personName: person,
              color: type === 'shift' ? '#3b82f6' : 
                     type === 'task' ? '#10b981' : 
                     type === 'meeting' ? '#8b5cf6' : '#6b7280',
              status: 'confirmed'
            });
          }
        }
      }
      
      // End of table
      if (inTable && !line.startsWith('|')) {
        inTable = false;
      }
    }
    
    return events;
  } catch (error) {
    console.error('Error parsing schedule data:', error);
    return [];
  }
}

// POST /api/calendar/import - นำเข้าข้อมูลจาก SCHEDULE.md
export async function POST(request: NextRequest) {
  try {
    // Parse events from SCHEDULE.md
    const events = parseScheduleData();
    
    if (events.length === 0) {
      return NextResponse.json(
        { error: 'No schedule data found or failed to parse' },
        { status: 400 }
      );
    }
    
    // Clear existing calendar events (optional)
    const { clearExisting } = await request.json().catch(() => ({ clearExisting: false }));
    
    if (clearExisting) {
      await prisma.calendarEvent.deleteMany({});
    }
    
    // Import events to database
    const importedEvents = [];
    for (const eventData of events) {
      try {
        const event = await prisma.calendarEvent.create({
          data: eventData,
        });
        importedEvents.push(event);
      } catch (error) {
        console.error(`Failed to import event: ${eventData.title}`, error);
      }
    }
    
    return NextResponse.json({
      message: `Imported ${importedEvents.length} events successfully`,
      importedCount: importedEvents.length,
      events: importedEvents,
    }, { status: 201 });
  } catch (error) {
    console.error('Error importing schedule data:', error);
    return NextResponse.json(
      { error: 'Failed to import schedule data' },
      { status: 500 }
    );
  }
}

// GET /api/calendar/import - ตรวจสอบข้อมูลที่จะนำเข้า
export async function GET() {
  try {
    const events = parseScheduleData();
    
    return NextResponse.json({
      parseable: events.length > 0,
      eventCount: events.length,
      sampleEvents: events.slice(0, 5), // Show first 5 events as sample
      totalEvents: events.length,
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking schedule data:', error);
    return NextResponse.json(
      { error: 'Failed to parse schedule data' },
      { status: 500 }
    );
  }
}