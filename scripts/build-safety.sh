#!/bin/bash
BASE_DIR="/home/nn/.openclaw/workspace/med-expiry-checker"

# 1. Update Fire List Page
cat << 'INNER_EOF' > $BASE_DIR/src/app/safety/fire/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Flame, CheckCircle, Clock } from 'lucide-react';

export default function FireExtinguisherCheck() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/safety/fire')
      .then(res => res.json())
      .then(data => { setItems(data); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-red-600 text-white pt-12 pb-24 px-4 md:px-8 rounded-b-[2rem] shadow-xl relative z-10">
        <div className="max-w-4xl mx-auto">
          <Link href="/safety" className="inline-flex items-center text-red-200 hover:text-white mb-6 font-medium transition-colors">
            <ArrowLeft size={20} className="mr-2" /> กลับหน้าระบบความปลอดภัย
          </Link>
          <div className="flex items-center gap-3">
            <Flame size={40} />
            <h1 className="text-3xl md:text-4xl font-black">ตรวจสอบถังดับเพลิง</h1>
          </div>
          <p className="text-red-200 mt-2 text-lg">รายการจุดติดตั้งถังดับเพลิงทั้งหมด {items.length} จุด</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl p-4 md:p-8">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-slate-500 font-bold">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mr-3"></div>
              กำลังโหลดข้อมูล...
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map(item => {
                const lastCheck = item.inspections?.[0];
                const isReady = lastCheck?.overallStatus === 'พร้อมใช้งาน';
                
                return (
                  <div key={item.id} className="border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-all bg-slate-50/50">
                    <div className="mb-4 md:mb-0">
                      <h3 className="font-black text-slate-800 text-xl">{item.location}</h3>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        {lastCheck ? (
                          <>
                            <Clock size={16} className="text-slate-400" />
                            <span className="text-slate-500">
                              ตรวจล่าสุด: {new Date(lastCheck.checkedAt).toLocaleDateString('th-TH')} ({lastCheck.inspector})
                            </span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${isReady ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {lastCheck.overallStatus}
                            </span>
                          </>
                        ) : (
                          <span className="text-orange-500 font-medium">ยังไม่มีข้อมูลการตรวจสอบ</span>
                        )}
                      </div>
                    </div>
                    <Link href={`/safety/fire/${item.id}`} className="w-full md:w-auto text-center bg-red-100 text-red-700 px-6 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-colors">
                      บันทึกผลตรวจ
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
INNER_EOF

# 2. Fire Form Page
mkdir -p $BASE_DIR/src/app/safety/fire/[id]
cat << 'INNER_EOF' > $BASE_DIR/src/app/safety/fire/[id]/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Flame, AlertCircle } from 'lucide-react';

export default function FireInspectForm() {
  const { id } = useParams();
  const router = useRouter();
  const [locationName, setLocationName] = useState('กำลังโหลด...');
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    nozzleStatus: 'ปกติ',
    pinStatus: 'ปกติ',
    invertStatus: 'ปกติ',
    gaugeStatus: 'ปกติ',
    overallStatus: 'พร้อมใช้งาน',
    inspector: '',
    note: ''
  });

  useEffect(() => {
    fetch('/api/safety/fire').then(res => res.json()).then(data => {
      const target = data.find((d: any) => d.id === id);
      if(target) setLocationName(target.location);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.inspector) return alert('กรุณาระบุชื่อผู้ตรวจ');
    setLoading(true);
    
    const res = await fetch('/api/safety/fire/inspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extinguisherId: id, ...form })
    });

    if(res.ok) {
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
      router.push('/safety/fire');
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึก');
      setLoading(false);
    }
  };

  const RadioGroup = ({ label, name, options }: { label:string, name:string, options:string[] }) => (
    <div className="mb-6">
      <label className="block text-slate-700 font-bold mb-3 text-lg">{label}</label>
      <div className="flex gap-3">
        {options.map(opt => (
          <label key={opt} className={`flex-1 flex justify-center items-center p-3 rounded-xl border-2 cursor-pointer font-bold transition-all ${form[name as keyof typeof form] === opt ? (opt === 'ปกติ' || opt === 'พร้อมใช้งาน' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <input type="radio" name={name} value={opt} className="hidden" 
              checked={form[name as keyof typeof form] === opt}
              onChange={(e) => setForm({...form, [name]: e.target.value})} 
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-red-600 text-white pt-8 pb-20 px-4 md:px-8 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <Link href="/safety/fire" className="inline-flex items-center text-red-200 hover:text-white mb-6">
            <ArrowLeft size={20} className="mr-2" /> กลับ
          </Link>
          <h1 className="text-3xl font-black mb-2">บันทึกผลถังดับเพลิง</h1>
          <p className="text-xl text-red-100 flex items-center gap-2"><Flame /> จุด: {locationName}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          
          <RadioGroup label="1. หัวฉีด / สายฉีด" name="nozzleStatus" options={['ปกติ', 'ชำรุด']} />
          <RadioGroup label="2. สลักล็อค" name="pinStatus" options={['ปกติ', 'ชำรุด']} />
          <RadioGroup label="3. การคว่ำถัง" name="invertStatus" options={['ปกติ', 'ไม่ได้ทำ']} />
          <RadioGroup label="4. เข็มวัด / น้ำหนัก (เกจ)" name="gaugeStatus" options={['ปกติ', 'เกจตก']} />
          
          <div className="border-t-2 border-slate-100 my-6"></div>
          
          <RadioGroup label="สรุปสภาพการใช้งาน" name="overallStatus" options={['พร้อมใช้งาน', 'ไม่พร้อมใช้งาน']} />

          <div className="mb-6">
            <label className="block text-slate-700 font-bold mb-2">ชื่อผู้ตรวจ</label>
            <input type="text" required value={form.inspector} onChange={e => setForm({...form, inspector: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium" 
              placeholder="ระบุชื่อ (เช่น พงศ์ภพ)" />
          </div>

          <div className="mb-8">
            <label className="block text-slate-700 font-bold mb-2">หมายเหตุ (ถ้ามี)</label>
            <input type="text" value={form.note} onChange={e => setForm({...form, note: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium" 
              placeholder="ระบุสาเหตุที่ชำรุด..." />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-black text-lg py-4 rounded-xl hover:bg-red-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
            <Save size={24} /> {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </form>
      </div>
    </div>
  );
}
INNER_EOF

# 3. Fire API POST
mkdir -p $BASE_DIR/src/app/api/safety/fire/inspect
cat << 'INNER_EOF' > $BASE_DIR/src/app/api/safety/fire/inspect/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const d = new Date();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

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
INNER_EOF

# 4. Light API GET
mkdir -p $BASE_DIR/src/app/api/safety/light
cat << 'INNER_EOF' > $BASE_DIR/src/app/api/safety/light/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const lights = await prisma.emergencyLight.findMany({
      include: {
        inspections: {
          orderBy: { checkedAt: 'desc' },
          take: 1
        }
      }
    });
    return NextResponse.json(lights);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
INNER_EOF

# 5. Light API POST
mkdir -p $BASE_DIR/src/app/api/safety/light/inspect
cat << 'INNER_EOF' > $BASE_DIR/src/app/api/safety/light/inspect/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const d = new Date();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

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
INNER_EOF

# 6. Light List Page
mkdir -p $BASE_DIR/src/app/safety/light
cat << 'INNER_EOF' > $BASE_DIR/src/app/safety/light/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, Clock } from 'lucide-react';

export default function EmergencyLightCheck() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/safety/light')
      .then(res => res.json())
      .then(data => { setItems(data); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-yellow-500 text-white pt-12 pb-24 px-4 md:px-8 rounded-b-[2rem] shadow-xl relative z-10">
        <div className="max-w-4xl mx-auto">
          <Link href="/safety" className="inline-flex items-center text-yellow-100 hover:text-white mb-6 font-medium transition-colors">
            <ArrowLeft size={20} className="mr-2" /> กลับหน้าระบบความปลอดภัย
          </Link>
          <div className="flex items-center gap-3">
            <Lightbulb size={40} />
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">ตรวจสอบไฟฉุกเฉิน</h1>
          </div>
          <p className="text-yellow-900 mt-2 text-lg font-bold">รายการจุดติดตั้งไฟฉุกเฉินทั้งหมด {items.length} จุด</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl p-4 md:p-8">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-slate-500 font-bold">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mr-3"></div>
              กำลังโหลดข้อมูล...
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map(item => {
                const lastCheck = item.inspections?.[0];
                const isReady = lastCheck?.overallStatus === 'พร้อมใช้งาน' || lastCheck?.overallStatus === 'ปกติ';
                
                return (
                  <div key={item.id} className="border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-all bg-slate-50/50">
                    <div className="mb-4 md:mb-0">
                      <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
                        {item.location} 
                        {item.assetCode && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-md">{item.assetCode}</span>}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        {lastCheck ? (
                          <>
                            <Clock size={16} className="text-slate-400" />
                            <span className="text-slate-500">
                              ตรวจล่าสุด: {new Date(lastCheck.checkedAt).toLocaleDateString('th-TH')} ({lastCheck.inspector})
                            </span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${isReady ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {lastCheck.overallStatus}
                            </span>
                          </>
                        ) : (
                          <span className="text-orange-500 font-medium">ยังไม่มีข้อมูลการตรวจสอบ</span>
                        )}
                      </div>
                    </div>
                    <Link href={`/safety/light/${item.id}`} className="w-full md:w-auto text-center bg-yellow-100 text-yellow-700 px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 hover:text-white transition-colors">
                      บันทึกผลตรวจ
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
INNER_EOF

# 7. Light Form Page
mkdir -p $BASE_DIR/src/app/safety/light/[id]
cat << 'INNER_EOF' > $BASE_DIR/src/app/safety/light/[id]/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Lightbulb } from 'lucide-react';

export default function LightInspectForm() {
  const { id } = useParams();
  const router = useRouter();
  const [locationName, setLocationName] = useState('กำลังโหลด...');
  const [assetCode, setAssetCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    ledStatus: 'แสดงปกติ',
    chargeStatus: 'ทำงาน',
    testStatus: 'ปกติ',
    overallStatus: 'ปกติ',
    inspector: '',
    note: ''
  });

  useEffect(() => {
    fetch('/api/safety/light').then(res => res.json()).then(data => {
      const target = data.find((d: any) => d.id === id);
      if(target) {
        setLocationName(target.location);
        setAssetCode(target.assetCode || '');
      }
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.inspector) return alert('กรุณาระบุชื่อผู้ตรวจ');
    setLoading(true);
    
    const res = await fetch('/api/safety/light/inspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lightId: id, ...form })
    });

    if(res.ok) {
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
      router.push('/safety/light');
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึก');
      setLoading(false);
    }
  };

  const RadioGroup = ({ label, name, options }: { label:string, name:string, options:string[] }) => (
    <div className="mb-6">
      <label className="block text-slate-700 font-bold mb-3 text-lg">{label}</label>
      <div className="flex gap-3">
        {options.map(opt => (
          <label key={opt} className={`flex-1 flex justify-center items-center p-3 rounded-xl border-2 cursor-pointer font-bold transition-all ${form[name as keyof typeof form] === opt ? (opt === 'แสดงปกติ' || opt === 'ทำงาน' || opt === 'ปกติ' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <input type="radio" name={name} value={opt} className="hidden" 
              checked={form[name as keyof typeof form] === opt}
              onChange={(e) => setForm({...form, [name]: e.target.value})} 
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-yellow-500 text-white pt-8 pb-20 px-4 md:px-8 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <Link href="/safety/light" className="inline-flex items-center text-yellow-100 hover:text-slate-900 mb-6 font-bold transition-colors">
            <ArrowLeft size={20} className="mr-2" /> กลับ
          </Link>
          <h1 className="text-3xl font-black mb-2 text-slate-900">บันทึกผลไฟฉุกเฉิน</h1>
          <p className="text-xl text-yellow-900 font-bold flex items-center gap-2">
            <Lightbulb /> จุด: {locationName} {assetCode && `(${assetCode})`}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          
          <RadioGroup label="1. สถานะ LED / AC" name="ledStatus" options={['แสดงปกติ', 'ไม่ปกติ']} />
          <RadioGroup label="2. สถานะการชาร์จ" name="chargeStatus" options={['ทำงาน', 'ไม่ทำงาน']} />
          <RadioGroup label="3. ทดสอบตัดแหล่งจ่ายไฟ" name="testStatus" options={['ปกติ', 'ไม่เก็บไฟ']} />
          
          <div className="border-t-2 border-slate-100 my-6"></div>
          
          <RadioGroup label="สรุปสภาพการใช้งาน" name="overallStatus" options={['ปกติ', 'ชำรุด']} />

          <div className="mb-6">
            <label className="block text-slate-700 font-bold mb-2">ชื่อผู้ตรวจ</label>
            <input type="text" required value={form.inspector} onChange={e => setForm({...form, inspector: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-medium" 
              placeholder="ระบุชื่อ (เช่น พงศ์ภพ)" />
          </div>

          <div className="mb-8">
            <label className="block text-slate-700 font-bold mb-2">หมายเหตุ / รหัสอุปกรณ์ (ถ้ามี)</label>
            <input type="text" value={form.note} onChange={e => setForm({...form, note: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-medium" 
              placeholder="ระบุสาเหตุที่ชำรุด..." />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black text-lg py-4 rounded-xl hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
            <Save size={24} /> {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </form>
      </div>
    </div>
  );
}
INNER_EOF

echo "Done generating safety check code."
