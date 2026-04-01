import React from 'react';
import Link from 'next/link';
import { Flame, Lightbulb, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

export default function SafetyDashboard() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div 
        className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl"
        style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
          border: '1px solid rgba(245, 158, 11, 0.2)'
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-orange-500/10 to-red-500/10 blur-3xl" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div 
            className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}
          >
            <ShieldCheck size={36} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #fff 0%, #e2e8f0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ระบบตรวจสอบอุปกรณ์ความปลอดภัย
            </h1>
            <p className="mt-2 text-slate-400">ตรวจสอบและบันทึกสถานะถังดับเพลิงและไฟฉุกเฉิน</p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link 
          href="/safety/fire" 
          className="group relative overflow-hidden rounded-[1.5rem] p-6 transition-all duration-300 hover:scale-[1.02]"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)',
            minHeight: '280px'
          }}
        >
          {/* Glow effect on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ 
              background: 'radial-gradient(circle at 50% 0%, rgba(220, 38, 38, 0.15) 0%, transparent 70%)'
            }}
          />
          
          <div className="relative z-10 flex flex-col h-full">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)' }}
            >
              <Flame size={32} className="text-red-400" />
            </div>
            <h3 className="text-2xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>ตรวจสอบถังดับเพลิง</h3>
            <p className="font-medium flex-1" style={{ color: 'var(--text-muted)' }}>บันทึกสถานะ สลักล็อค หัวฉีด น้ำหนัก การคว่ำถัง</p>
            <div className="mt-6 flex items-center gap-2 text-red-400 font-bold group-hover:gap-4 transition-all">
              เข้าสู่ระบบตรวจสอบ <ArrowRight size={20} />
            </div>
          </div>
        </Link>

        <Link 
          href="/safety/light" 
          className="group relative overflow-hidden rounded-[1.5rem] p-6 transition-all duration-300 hover:scale-[1.02]"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)',
            minHeight: '280px'
          }}
        >
          {/* Glow effect on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ 
              background: 'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.15) 0%, transparent 70%)'
            }}
          />
          
          <div className="relative z-10 flex flex-col h-full">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)' }}
            >
              <Lightbulb size={32} className="text-amber-400" />
            </div>
            <h3 className="text-2xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>ตรวจสอบไฟฉุกเฉิน</h3>
            <p className="font-medium flex-1" style={{ color: 'var(--text-muted)' }}>บันทึกสถานะ LED, แบตเตอรี่, ทดสอบการตัดไฟ</p>
            <div className="mt-6 flex items-center gap-2 text-amber-400 font-bold group-hover:gap-4 transition-all">
              เข้าสู่ระบบตรวจสอบ <ArrowRight size={20} />
            </div>
          </div>
        </Link>

        <Link 
          href="/safety/report" 
          className="group relative overflow-hidden rounded-[1.5rem] p-6 transition-all duration-300 hover:scale-[1.02]"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)',
            minHeight: '280px'
          }}
        >
          {/* Glow effect on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ 
              background: 'radial-gradient(circle at 50% 0%, rgba(102, 126, 234, 0.15) 0%, transparent 70%)'
            }}
          />
          
          <div className="relative z-10 flex flex-col h-full">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)' }}
            >
              <FileText size={32} className="text-blue-400" />
            </div>
            <h3 className="text-2xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>ออกรายงานรวม</h3>
            <p className="font-medium flex-1" style={{ color: 'var(--text-muted)' }}>สรุปผลถังดับเพลิงและไฟฉุกเฉินในฟอร์มเดียว พร้อมช่องเซ็นชื่อ</p>
            <div className="mt-6 flex items-center gap-2 text-blue-400 font-bold group-hover:gap-4 transition-all">
              เปิดหน้ารายงาน <ArrowRight size={20} />
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
