import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { requester, substitute, day, month, year, shiftTime, exchangeId } = data;

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get monthly document settings
    const monthlySettings = await prisma.monthlyDocumentSettings.findUnique({
      where: {
        month_year: {
          month: currentMonth,
          year: currentYear
        }
      }
    });

    // Default values if not set
    const hospitalOrderNo = monthlySettings?.hospitalOrderNo || '____/____';
    const hospitalOrderDate = monthlySettings?.hospitalOrderDate || '____ __________ ____';
    const formVersion = monthlySettings?.formVersion || 'แบบฟอร์มสำนักงานสาธารณสุขจังหวัดสระแก้ว';
    const formVersionDate = monthlySettings?.formVersionDate || '(ปรับปรุงข้อมูลครั้งที่ _ ณ ____ __________ ____)';

    // Load the template file
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'shift_exchange_template.docx');
    
    // Check if template exists, if not create from the uploaded file
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ 
        error: 'Template file not found. Please upload template file first.' 
      }, { status: 500 });
    }

    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Determine start and end times based on shift type
    let startTime = '________';
    let endTime = '________';
    
    if (shiftTime === 'เช้า') {
      startTime = '08.00';
      endTime = '16.00';
    } else if (shiftTime === 'บ่าย') {
      startTime = '16.00';
      endTime = '00.00';
    } else if (shiftTime === 'ดึก') {
      startTime = '00.00';
      endTime = '08.00';
    }

    // Replace template variables
    doc.render({
      requester: requester || '____________________',
      substitute: substitute || '____________________',
      day: day || '__',
      month: month || '__________',
      year: year || '____',
      shiftTime: shiftTime || '__________',
      startTime: startTime,
      endTime: endTime,
      hospitalOrderNo: hospitalOrderNo,
      hospitalOrderDate: hospitalOrderDate,
      formVersion: formVersion,
      formVersionDate: formVersionDate,
    });

    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="shift_exchange_${exchangeId || Date.now()}.docx"`,
      },
    });
  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}
