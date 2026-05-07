"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Calendar } from 'lucide-react';

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

  // --- Stats ---
  const fireChecked = fireItems.filter(i => i.inspections?.length > 0).length;
  const fireReady = fireItems.filter(i => i.inspections?.[0]?.overallStatus === 'พร้อมใช้งาน').length;
  const fireDefective = fireChecked - fireReady;
  const fireUnchecked = fireItems.length - fireChecked;

  const lightChecked = lightItems.filter(i => i.inspections?.length > 0).length;
  const lightReady = lightItems.filter(i => i.inspections?.[0]?.overallStatus === 'พร้อมใช้งาน').length;
  const lightDefective = lightChecked - lightReady;
  const lightUnchecked = lightItems.length - lightChecked;

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

      <div className="max-w-7xl mx-auto px-2 md:px-4 -mt-12 relative z-20 print:mt-0 print:p-0 print:max-w-none print:w-full print:px-0 text-slate-800" suppressHydrationWarning>
        
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
          <div className="bg-white rounded-2xl shadow-lg print:rounded-none print:shadow-none print:p-0 p-4 md:p-8 font-sans">
            
            {/* Print Header */}
            <div className="text-center print:mb-2 mb-4">
              <div className="font-bold text-lg md:text-xl print:text-[14pt] leading-relaxed">
                รายงานการตรวจสอบถังดับเพลิง และ ไฟฉุกเฉิน
              </div>
              <div className="font-bold text-base md:text-lg print:text-[12pt] text-slate-600">
                ประจำเดือน {monthLabel} พ.ศ. {year + 543}
              </div>
            </div>

            {/* ===== FIRE EXTINGUISHER TABLE ===== */}
            <div className="font-bold text-base print:text-[12pt] mb-1 print:mb-1">
              1. ตรวจสอบถังดับเพลิง
            </div>
            <table className="w-full border-collapse border-2 border-black text-center mb-2 print:mb-1">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] w-16">ลำดับ</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">จุดที่ติดตั้ง</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">หัวฉีด/สายฉีด</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">สลักล็อค</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">คว่ำถัง</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">เข็มวัด/น้ำหนัก</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">สภาพ</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">ผู้ตรวจ</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {fireItems.map((item, i) => {
                  const insp = item.inspections?.[0];
                  const isReady = insp?.overallStatus === 'พร้อมใช้งาน';
                  return (
                    <tr key={i}>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">{i + 1}</td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] text-left">{item.location}</td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">{insp?.nozzleStatus || '-'}</td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">{insp?.pinStatus || '-'}</td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">{insp?.invertStatus || '-'}</td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">{insp?.gaugeStatus || '-'}</td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] font-bold" style={{ color: isReady ? '#16a34a' : !insp ? '#999' : '#dc2626' }}>
                        {insp?.overallStatus || 'ยังไม่ตรวจ'}
                      </td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">{insp?.inspector || '-'}</td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">{insp?.note || ''}</td>
                    </tr>
                  )
                })}
                {/* Summary Row */}
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={6} className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] text-right">
                    รวม (ตรวจ {fireChecked}/{fireItems.length}) :
                  </td>
                  <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] text-green-700">พร้อม {fireReady}</td>
                  <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] text-red-700">ชำรุด {fireDefective}</td>
                  <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] text-gray-500">ไม่ตรวจ {fireUnchecked}</td>
                </tr>
              </tbody>
            </table>

            {/* ===== EMERGENCY LIGHT TABLE ===== */}
            <div className="font-bold text-base print:text-[12pt] mb-1 print:mb-1 mt-4 print:mt-2">
              2. ตรวจสอบไฟฉุกเฉิน
            </div>
            <table className="w-full border-collapse border-2 border-black text-center mb-2 print:mb-1">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] w-16">ลำดับ</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">ตำแหน่งที่ติดตั้ง</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">LED / AC</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">สถานะชาร์จ</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">ทดสอบตัดไฟ</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">สภาพ</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">ผู้ตรวจ</th>
                  <th className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {lightItems.map((item, i) => {
                  const insp = item.inspections?.[0];
                  const isReady = insp?.overallStatus === 'พร้อมใช้งาน';
                  return (
                    <tr key={i}>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">{i + 1}</td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] text-left">{item.location}</td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">{insp?.ledStatus || '-'}</td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">{insp?.chargeStatus || '-'}</td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">{insp?.testStatus || '-'}</td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] font-bold" style={{ color: isReady ? '#16a34a' : !insp ? '#999' : '#dc2626' }}>
                        {insp?.overallStatus || 'ยังไม่ตรวจ'}
                      </td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">{insp?.inspector || '-'}</td>
                      <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt]">{insp?.note || ''}</td>
                    </tr>
                  )
                })}
                {/* Summary Row */}
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={5} className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] text-right">
                    รวม (ตรวจ {lightChecked}/{lightItems.length}) :
                  </td>
                  <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] text-green-700">พร้อม {lightReady}</td>
                  <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] text-red-700">ชำรุด {lightDefective}</td>
                  <td className="border border-black px-2 py-1 print:px-1 print:py-0.5 text-[12px] print:text-[10pt] text-gray-500">ไม่ตรวจ {lightUnchecked}</td>
                </tr>
              </tbody>
            </table>

            {/* ===== SIGNATURE AREA ===== */}
            <div className="mt-6 print:mt-4">
              <div className="flex justify-end">
                <div className="text-center w-80 print:w-72">
                  <div className="mb-8 print:mb-6 text-[14px] print:text-[11pt]">
                    ผู้ตรวจสอบ ......................................................................
                  </div>
                  <div className="font-bold text-[14px] print:text-[11pt]">(นางสาวปิยรัตน์ ธรรมโชติวร)</div>
                  <div className="text-[13px] print:text-[10pt] text-slate-600">หัวหน้ากลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
