"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardCheck, Settings, Pill, Activity, CalendarDays, Clock, ChevronRight, BarChart3, ShieldCheck, FileText } from "lucide-react";

type DashboardStats = {
  totalMeds: number;
  noStockMeds: number;
  checkedThisMonth: number;
  month: number;
  year: number;
  lastUpdatedAt: string | null;
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/dashboard?month=${currentMonth + 1}&year=${currentYear}`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [currentMonth, currentYear]);

  const progressPercentage = stats && stats.totalMeds > 0 
    ? Math.round((stats.checkedThisMonth / stats.totalMeds) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-slate-800 text-white pt-12 pb-24 px-4 md:px-8 rounded-b-[2rem] shadow-xl relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">ระบบบริหารจัดการยา OPD</h1>
              <p className="text-slate-300 text-lg font-medium flex items-center gap-2">
                <CalendarDays size={20} /> 
                ภาพรวมประจำเดือน {thaiMonths[currentMonth]} พ.ศ. {currentYear + 543}
              </p>
            </div>
            <div className="hidden md:flex bg-slate-700/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-600/50">
              <div className="text-right">
                <p className="text-slate-300 text-sm font-bold mb-1">อัปเดตล่าสุด</p>
                <p className="text-white font-mono text-sm flex items-center gap-2 justify-end">
                  <Clock size={14} className="text-blue-400" />
                  {stats?.lastUpdatedAt ? new Date(stats.lastUpdatedAt).toLocaleString('th-TH') : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-16 relative z-20">
        
        {/* Progress Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 mb-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Activity className="text-blue-500" /> ความคืบหน้าการตรวจยาเดือนนี้
              </h2>
              <p className="text-slate-500 font-medium mt-1">อ้างอิงจากรายการยาทั้งหมดในระบบ</p>
            </div>
            <div className="text-right flex flex-col items-center md:items-end">
              <span className="text-4xl font-black text-blue-600 leading-none">
                {loading ? "..." : `${progressPercentage}%`}
              </span>
              <span className="text-slate-400 font-bold text-sm mt-1">
                ตรวจแล้ว {stats?.checkedThisMonth || 0} / {stats?.totalMeds || 0} รายการ
              </span>
            </div>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-4 md:h-6 overflow-hidden shadow-inner border border-slate-200">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-3 relative"
              style={{ width: `${progressPercentage}%` }}
            >
               {progressPercentage > 5 && <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse absolute right-2"></div>}
            </div>
          </div>
        </div>

        {/* Action Menu Grid */}
        <h3 className="text-slate-800 font-black text-xl mb-4 pl-2">เลือกฟังก์ชันการทำงาน</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Check Expiry Module */}
          <Link href="/check" className="group flex flex-col justify-between bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 cursor-pointer overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500 z-0"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                <ClipboardCheck size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">ตรวจสอบวันหมดอายุ</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                บันทึกการตรวจสอบวันหมดอายุของยาประจำเดือน, ดูรายการยาที่ใกล้หมดอายุ, และพิมพ์รายงานตรวจสอบยา
              </p>
            </div>
            
            <div className="mt-8 flex items-center justify-between text-blue-600 font-bold relative z-10">
              <span className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                เข้าสู่ระบบ <ChevronRight size={18} />
              </span>
            </div>
          </Link>

          {/* Manage DB Module */}
          <Link href="/manage" className="group flex flex-col justify-between bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 cursor-pointer overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500 z-0"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                <Settings size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">จัดการฐานข้อมูลยา</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                เพิ่ม-ลบ-แก้ไข รายชื่อยา, หมวดหมู่, และกำหนดเลขตู้ยา
              </p>
            </div>
            
            <div className="mt-8 flex items-center justify-between text-indigo-600 font-bold relative z-10">
              <span className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                เข้าสู่ระบบ <ChevronRight size={18} />
              </span>
            </div>
          </Link>

          {/* Safety Check Module */}
          <Link href="/safety" className="group flex flex-col justify-between bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 cursor-pointer overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500 z-0"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">ตรวจสอบอุปกรณ์ความปลอดภัย</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                บันทึกการตรวจสอบ ถังดับเพลิง และ ไฟฉุกเฉิน ประจำเดือน พร้อมรายงานแจ้งซ่อมออนไลน์
              </p>
            </div>
            
            <div className="mt-8 flex items-center justify-between text-orange-600 font-bold relative z-10">
              <span className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                เข้าสู่ระบบ <ChevronRight size={18} />
              </span>
            </div>
          </Link>

          {/* Shift Exchange Module */}
          <Link href="/shift-exchange" className="group flex flex-col justify-between bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 cursor-pointer overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500 z-0"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                <FileText size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">ฟอร์ม ขายเวร</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                สร้างและพิมพ์เอกสารขออนุมัติขายเวร พร้อมระบบเก็บประวัติเอกสารประจำเดือน
              </p>
            </div>
            
            <div className="mt-8 flex items-center justify-between text-emerald-600 font-bold relative z-10">
              <span className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                เข้าสู่ระบบ <ChevronRight size={18} />
              </span>
            </div>
          </Link>
          
        </div>
      </div>
    </div>
  );
}
