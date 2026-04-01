"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Lightbulb, Calendar } from 'lucide-react';

export default function LightInspectForm() {
  const { id } = useParams();
  const router = useRouter();
  const [locationName, setLocationName] = useState('กำลังโหลด...');
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    ledStatus: 'แสดงปกติ',
    chargeStatus: 'ทำงาน',
    testStatus: 'ปกติ',
    overallStatus: 'พร้อมใช้งาน',
    inspector: '',
    note: ''
  });

  const months = [
    { value: 1, label: 'มกราคม' }, { value: 2, label: 'กุมภาพันธ์' },
    { value: 3, label: 'มีนาคม' }, { value: 4, label: 'เมษายน' },
    { value: 5, label: 'พฤษภาคม' }, { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' }, { value: 8, label: 'สิงหาคม' },
    { value: 9, label: 'กันยายน' }, { value: 10, label: 'ตุลาคม' },
    { value: 11, label: 'พฤศจิกายน' }, { value: 12, label: 'ธันวาคม' }
  ];

  useEffect(() => {
    fetch('/api/safety/light').then(res => res.json()).then(data => {
      const target = data.find((d: any) => d.id === id);
      if(target) setLocationName(target.location);
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
          <label key={opt} className={`flex-1 flex justify-center items-center p-3 rounded-xl border-2 cursor-pointer font-bold transition-all ${form[name as keyof typeof form] === opt ? (opt === 'แสดงปกติ' || opt === 'ทำงาน' || opt === 'ปกติ' || opt === 'พร้อมใช้งาน' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
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
      <div className="bg-yellow-500 text-slate-900 pt-8 pb-20 px-4 md:px-8 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <Link href="/safety/light" className="inline-flex items-center text-yellow-900 hover:text-white mb-6">
            <ArrowLeft size={20} className="mr-2" /> กลับ
          </Link>
          <h1 className="text-3xl font-black mb-2 text-white">บันทึกผลไฟฉุกเฉิน</h1>
          <p className="text-xl text-yellow-100 flex items-center gap-2"><Lightbulb /> จุด: {locationName}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          
          <div className="flex gap-4 mb-6 border-b border-slate-100 pb-6">
            <div className="flex-1">
              <label className="block text-slate-700 font-bold mb-2 flex items-center gap-2"><Calendar size={18}/> ประจำเดือน</label>
              <select value={form.month} onChange={e => setForm({...form, month: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-medium text-slate-800">
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-slate-700 font-bold mb-2">ปี (ค.ศ.)</label>
              <select value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-medium text-slate-800">
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y + 543}</option>)}
              </select>
            </div>
          </div>

          <RadioGroup label="1. ไฟ LED / AC (แหล่งจ่ายไฟ)" name="ledStatus" options={['แสดงปกติ', 'ไม่ปกติ']} />
          <RadioGroup label="2. สถานะการชาร์จแบตเตอรี่" name="chargeStatus" options={['ทำงาน', 'ไม่ทำงาน']} />
          <RadioGroup label="3. ทดสอบถอดปลั๊ก (ตัดไฟ)" name="testStatus" options={['ปกติ', 'ไม่เก็บไฟ']} />
          
          <div className="border-t-2 border-slate-100 my-6"></div>
          
          <RadioGroup label="สรุปสภาพการใช้งาน" name="overallStatus" options={['พร้อมใช้งาน', 'ชำรุด']} />

          <div className="mb-6">
            <label className="block text-slate-700 font-bold mb-2">ชื่อผู้ตรวจ</label>
            <input type="text" required value={form.inspector} onChange={e => setForm({...form, inspector: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-medium" 
              placeholder="ระบุชื่อ (เช่น พงศ์ภพ)" />
          </div>

          <div className="mb-8">
            <label className="block text-slate-700 font-bold mb-2">หมายเหตุ (ถ้ามี)</label>
            <input type="text" value={form.note} onChange={e => setForm({...form, note: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-medium" 
              placeholder="ระบุสาเหตุที่ชำรุด..." />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-yellow-500 text-white font-black text-lg py-4 rounded-xl hover:bg-yellow-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-yellow-500/30">
            <Save size={24} /> {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </form>
      </div>
    </div>
  );
}