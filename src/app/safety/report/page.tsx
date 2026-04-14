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

  const getStatusColor = (status: string) => {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s.includes('ไม่พร้อม') || s.includes('ผิดปกติ') || s.includes('เสีย') || s.includes('ขัดข้อง') || s.includes('ชำรุด')) {
      return 'bg-red-200';
    }
    if (s.includes('พร้อม') || s.includes('ปกติ') || s.includes('ดี') || s.includes('ใช้งานได้')) {
      return 'bg-green-200';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0">
      
      {/* --- UI Controls (Hidden on Print) --- */}
      <div className="bg-slate-800 text-white pt-12 pb-24 px-4 md:px-8 rounded-b-[2rem] shadow-xl relative z-10 print:hidden">
        <div className="max-w-5xl mx-auto">
          <Link href="/safety" className="inline-flex items-center text-slate-300 hover:text-white mb-6 font-medium transition-colors">
            <ArrowLeft size={20} className="mr-2" /> กลับหน้าระบบความปลอดภัย
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-black">รายงานรวม (PDF Format)</h1>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="flex items-center gap-2 bg-white text-slate-800 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold transition shadow-sm">
                <Printer size={20} /> พิมพ์รายงาน (Print PDF)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20 print:mt-0 print:p-0 text-slate-800">
        
        {/* Filter */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 print:hidden">
          <div className="flex flex-col md:flex-row items-end md:items-center justify-start gap-6">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-bold text-slate-500 mb-2 flex items-center gap-2"><Calendar size={16}/> เดือนที่ออกรายงาน</label>
              <select value={month} onChange={e => setMonth(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-slate-500 outline-none">
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-bold text-slate-500 mb-2">ปี (ค.ศ.)</label>
              <select value={year} onChange={e => setYear(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-slate-500 outline-none">
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y + 543}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* --- PRINTABLE REPORT AREA --- */}
        {loading ? (
          <div className="text-center py-20 animate-pulse font-bold text-slate-500 print:hidden">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="bg-white p-4 md:p-6 print:p-4 rounded-3xl shadow-xl print:shadow-none font-sarabun text-sm md:text-base">
            
            <div className="text-center font-bold text-lg md:text-xl mb-4 print:mb-2">
              รายงานการตรวจสอบถังดับเพลิง และ ไฟฉุกเฉิน ประจำเดือน {monthLabel} พ.ศ. {year + 543}
            </div>

            {/* Fire Extinguisher Table */}
            <div className="mb-2 font-bold text-base print:text-lg">ตรวจสอบถังดับเพลิง</div>
            <table className="w-full border-collapse border border-black text-center mb-6 print:mb-3">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 print:p-1 w-24 text-sm">วันที่</th>
                  <th className="border border-black p-2 print:p-1 text-left text-sm">จุดที่ตรวจสอบ</th>
                  <th className="border border-black p-2 print:p-1 text-sm">หัวฉีด/สายฉีด</th>
                  <th className="border border-black p-2 print:p-1 text-sm">สลักล็อค</th>
                  <th className="border border-black p-2 print:p-1 text-sm">คว่ำถัง</th>
                  <th className="border border-black p-2 print:p-1 text-sm">เข็มวัด/น้ำหนัก</th>
                  <th className="border border-black p-2 print:p-1 text-sm">สภาพการใช้งาน</th>
                  <th className="border border-black p-2 print:p-1 text-sm">ผู้ตรวจ</th>
                  <th className="border border-black p-2 print:p-1 text-sm">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {fireItems.map((item, i) => {
                  const insp = item.inspections?.[0];
                  const rowColor = getStatusColor(insp?.overallStatus || '');
                  return (
                    <tr key={i} className={rowColor}>
                      <td className="border border-black p-2 print:p-1">{insp?.checkedAt ? new Date(insp.checkedAt).toLocaleDateString('th-TH') : '-'}</td>
                      <td className="border border-black p-2 print:p-1 text-left">{item.location}</td>
                      <td className="border border-black p-2 print:p-1">{insp?.nozzleStatus || '-'}</td>
                      <td className="border border-black p-2 print:p-1">{insp?.pinStatus || '-'}</td>
                      <td className="border border-black p-2 print:p-1">{insp?.invertStatus || '-'}</td>
                      <td className="border border-black p-2 print:p-1">{insp?.gaugeStatus || '-'}</td>
                      <td className="border border-black p-2 print:p-1">{insp?.overallStatus || '-'}</td>
                      <td className="border border-black p-2 print:p-1">{insp?.inspector || '-'}</td>
                      <td className="border border-black p-2 print:p-1">{insp?.note || ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Emergency Light Table */}
            <div className="mb-2 font-bold text-base print:text-lg">ตรวจสอบไฟฉุกเฉิน</div>
            <table className="w-full border-collapse border border-black text-center mb-6 print:mb-3">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 print:p-1 w-24 text-sm">วันที่</th>
                  <th className="border border-black p-2 print:p-1 text-left text-sm">ตำแหน่งที่ติดตั้ง</th>
                  <th className="border border-black p-2 print:p-1 text-sm">LED / AC</th>
                  <th className="border border-black p-2 print:p-1 text-sm">สถานะการชาร์จ</th>
                  <th className="border border-black p-2 print:p-1 text-sm">ทดสอบตัดแหล่งจ่ายไฟ</th>
                  <th className="border border-black p-2 print:p-1 text-sm">สภาพการใช้งาน</th>
                  <th className="border border-black p-2 print:p-1 text-sm">ผู้ตรวจ</th>
                  <th className="border border-black p-2 print:p-1 text-sm">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {lightItems.map((item, i) => {
                  const insp = item.inspections?.[0];
                  const rowColor = getStatusColor(insp?.overallStatus || '');
                  return (
                    <tr key={i} className={rowColor}>
                      <td className="border border-black p-2 print:p-1">{insp?.checkedAt ? new Date(insp.checkedAt).toLocaleDateString('th-TH') : '-'}</td>
                      <td className="border border-black p-2 print:p-1 text-left">
                        {item.location}
                      </td>
                      <td className="border border-black p-2 print:p-1">{insp?.ledStatus || '-'}</td>
                      <td className="border border-black p-2 print:p-1">{insp?.chargeStatus || '-'}</td>
                      <td className="border border-black p-2 print:p-1">{insp?.testStatus || '-'}</td>
                      <td className="border border-black p-2 print:p-1">{insp?.overallStatus || '-'}</td>
                      <td className="border border-black p-2 print:p-1">{insp?.inspector || '-'}</td>
                      <td className="border border-black p-2 print:p-1">{insp?.note || ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Signature Area */}
            <div className="flex flex-col items-end mt-8 print:mt-4 pr-8 print:pr-12">
              <div className="text-center text-sm print:text-base">
                <div className="mb-4">ผู้ตรวจสอบ ......................................................................</div>
                <div>(นางสาวปิยรัตน์ ธรรมโชติวร)</div>
                <div className="mt-1">หัวหน้ากลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}