"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, Calendar } from 'lucide-react';

export default function CombinedSafetyReport() {
  const [fireItems, setFireItems] = useState<any[]>([]);
  const [lightItems, setLightItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: 'มกราคม' }, { value: 2, label: 'กุมภาพันธ์' },
    { value: 3, label: 'มีนาคม' }, { value: 4, label: 'เมษายน' },
    { value: 5, label: 'พฤษภาคม' }, { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' }, { value: 8, label: 'สิงหาคม' },
    { value: 9, label: 'กันยายน' }, { value: 10, label: 'ตุลาคม' },
    { value: 11, label: 'พฤศจิกายน' }, { value: 12, label: 'ธันวาคม' }
  ];

  const fetchItems = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/safety/fire?month=${month}&year=${year}`).then(res => res.json()),
      fetch(`/api/safety/light?month=${month}&year=${year}`).then(res => res.json())
    ]).then(([fireData, lightData]) => {
      setFireItems(fireData);
      setLightItems(lightData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchItems();
  }, [month, year]);

  const handlePrint = () => {
    window.print();
  };

  const monthLabel = months.find(m => m.value === month)?.label;

  const getRowColor = (overallStatus: string) => {
    if (overallStatus === 'พร้อมใช้') return 'bg-green-50 border-l-4 border-l-green-500';
    if (overallStatus === 'ไม่พร้อมใช้') return 'bg-red-50 border-l-4 border-l-red-500';
    return 'bg-yellow-50 border-l-4 border-l-yellow-500';
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20 print:bg-white print:pb-0">
      
      {/* --- UI Controls (Hidden on Print) --- */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white pt-8 pb-20 px-4 md:px-8 rounded-b-[2rem] shadow-2xl relative z-10 print:hidden">
        <div className="max-w-7xl mx-auto">
          <Link href="/safety" className="inline-flex items-center text-slate-300 hover:text-white mb-4 font-medium transition-colors">
            <ArrowLeft size={20} className="mr-2" /> กลับหน้าระบบความปลอดภัย
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-black">รายงานรวม (PDF Format)</h1>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-white text-slate-800 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold transition shadow-lg hover:shadow-xl">
              <Printer size={20} /> พิมพ์รายงาน (Print PDF)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 md:px-4 -mt-12 relative z-20 print:mt-0 print:p-0 text-slate-800">
        
        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 print:hidden">
          <div className="flex flex-col md:flex-row items-end md:items-center justify-start gap-4">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-bold text-slate-500 mb-2 flex items-center gap-2"><Calendar size={16}/> เดือนที่ออกรายงาน</label>
              <select value={month} onChange={e => setMonth(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:ring-2 focus:ring-slate-500 outline-none">
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-bold text-slate-500 mb-2">ปี (ค.ศ.)</label>
              <select value={year} onChange={e => setYear(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:ring-2 focus:ring-slate-500 outline-none">
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y + 543}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* --- PRINTABLE REPORT AREA --- */}
        {loading ? (
          <div className="text-center py-20 animate-pulse font-bold text-slate-500 print:hidden">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="bg-white p-3 md:p-6 print:p-1 rounded-2xl shadow-lg print:shadow-none font-sarabun text-sm md:text-base print:text-[10px]">
            
            <div className="text-center font-bold text-lg md:text-xl print:text-sm mb-4 print:mb-1">
              รายงานการตรวจสอบถังดับเพลิง และ ไฟฉุกเฉิน ประจำเดือน {monthLabel} พ.ศ. {year + 543}
            </div>

            {/* Fire Extinguisher Table */}
            <div className="mb-3 font-bold text-base print:text-xs">ตรวจสอบถังดับเพลิง</div>
            <table className="w-full border-collapse border border-black text-center mb-6 print:mb-2">
              <thead>
                <tr className="bg-slate-200 print:bg-gray-200">
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px] w-20">วันที่</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px] text-left">จุดที่ตรวจสอบ</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px]">หัวฉีด/สายฉีด</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px]">สลักล็อค</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px]">คว่ำถัง</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px]">เข็มวัด/น้ำหนัก</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px]">สภาพการใช้งาน</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px]">ผู้ตรวจ</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px]">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {fireItems.map((item, i) => {
                  const insp = item.inspections?.[0];
                  const isReady = insp?.overallStatus === 'พร้อมใช้';
                  const rowClass = getRowColor(insp?.overallStatus);
                  return (
                    <tr key={i} className={rowClass}>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px]">{insp?.checkedAt ? new Date(insp.checkedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '-'}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px] text-left">{item.location}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px]">{insp?.nozzleStatus || '-'}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px]">{insp?.pinStatus || '-'}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px]">{insp?.invertStatus || '-'}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px]">{insp?.gaugeStatus || '-'}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px] font-bold" style={{ color: isReady ? '#16a34a' : '#dc2626' }}>{insp?.overallStatus || '-'}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px]">{insp?.inspector || '-'}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px]">{insp?.note || ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Emergency Light Table */}
            <div className="mb-3 font-bold text-base print:text-xs">ตรวจสอบไฟฉุกเฉิน</div>
            <table className="w-full border-collapse border border-black text-center mb-12 print:mb-2">
              <thead>
                <tr className="bg-slate-200 print:bg-gray-200">
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px] w-20">วันที่</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px] text-left">ตำแหน่งที่ติดตั้ง</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px]">LED / AC</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px]">สถานะการชาร์จ</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px]">ทดสอบตัดไฟ</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px]">สภาพการใช้งาน</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px]">ผู้ตรวจ</th>
                  <th className="border border-black p-1.5 print:p-0.5 print:text-[8px]">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {lightItems.map((item, i) => {
                  const insp = item.inspections?.[0];
                  const isReady = insp?.overallStatus === 'พร้อมใช้';
                  const rowClass = getRowColor(insp?.overallStatus);
                  return (
                    <tr key={i} className={rowClass}>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px]">{insp?.checkedAt ? new Date(insp.checkedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '-'}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px] text-left">
                        {item.location}
                      </td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px]">{insp?.ledStatus || '-'}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px]">{insp?.chargeStatus || '-'}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px]">{insp?.testStatus || '-'}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px] font-bold" style={{ color: isReady ? '#16a34a' : '#dc2626' }}>{insp?.overallStatus || '-'}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px]">{insp?.inspector || '-'}</td>
                      <td className="border border-black p-1.5 print:p-0.5 print:text-[8px]">{insp?.note || ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Signature Area */}
            <div className="flex flex-col items-end mt-8 pr-8 print:mt-2 print:pr-2">
              <div className="text-center print:text-[9px]">
                <div className="mb-3 print:mb-1">ผู้ตรวจสอบ ......................................................................</div>
                <div>(นางสาวปิยรัตน์ ธรรมโชติวร)</div>
                <div className="mt-0.5">หัวหน้ากลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}