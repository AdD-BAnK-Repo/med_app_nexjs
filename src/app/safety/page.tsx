import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Flame, Lightbulb, ShieldCheck, FileText } from 'lucide-react';

export default function SafetyDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <div className="bg-orange-600 text-white pt-12 pb-24 px-4 md:px-8 rounded-b-[2rem] shadow-xl relative z-10">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="inline-flex items-center text-orange-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={20} className="mr-2" /> กลับไปหน้าหลัก
          </Link>
          <div className="flex items-center gap-3">
            <ShieldCheck size={40} />
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">ระบบตรวจสอบอุปกรณ์ความปลอดภัย</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link href="/safety/fire" className="group flex flex-col justify-between bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all border border-slate-100">
            <div>
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Flame size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">ตรวจสอบถังดับเพลิง</h3>
              <p className="text-slate-500 font-medium">บันทึกสถานะ สลักล็อค หัวฉีด น้ำหนัก การคว่ำถัง</p>
            </div>
            <div className="mt-8 text-red-600 font-bold">เข้าสู่ระบบตรวจสอบ &rarr;</div>
          </Link>

          <Link href="/safety/light" className="group flex flex-col justify-between bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all border border-slate-100">
            <div>
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">ตรวจสอบไฟฉุกเฉิน</h3>
              <p className="text-slate-500 font-medium">บันทึกสถานะ LED, แบตเตอรี่, ทดสอบการตัดไฟ</p>
            </div>
            <div className="mt-8 text-yellow-600 font-bold">เข้าสู่ระบบตรวจสอบ &rarr;</div>
          </Link>

          <Link href="/safety/report" className="group flex flex-col justify-between bg-slate-800 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all border border-slate-700">
            <div>
              <div className="w-16 h-16 bg-slate-700 text-white rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <FileText size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">ออกรายงานรวม (PDF)</h3>
              <p className="text-slate-400 font-medium">สรุปผลถังดับเพลิงและไฟฉุกเฉินในฟอร์มเดียว พร้อมช่องเซ็นชื่อ</p>
            </div>
            <div className="mt-8 text-blue-400 font-bold flex items-center">เปิดหน้ารายงาน <span className="ml-2">📄</span></div>
          </Link>

        </div>
      </div>
    </div>
  );
}
