"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, Clock, Download, Printer, CheckCircle, AlertTriangle } from 'lucide-react';

export default function EmergencyLightCheck() {
  const [items, setItems] = useState<any[]>([]);
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
    fetch(`/api/safety/light?month=${month}&year=${year}`)
      .then(res => res.json())
      .then(data => { setItems(data); setLoading(false); });
  };

  useEffect(() => {
    fetchItems();
  }, [month, year]);

  const handleExportCSV = () => {
    const headers = ['ลำดับ', 'จุดที่ติดตั้ง', 'รหัสครุภัณฑ์', 'LED/AC', 'สถานะการชาร์จ', 'ทดสอบตัดแหล่งจ่ายไฟ', 'สถานะรวม', 'ผู้ตรวจสอบ', 'วันที่ตรวจ', 'หมายเหตุ'];
    const csvContent = [
      headers.join(','),
      ...items.map((item, index) => {
        const insp = item.inspections?.[0] || {};
        return [
          index + 1,
          `"${item.location}"`,
          `"${item.assetCode || '-'}"`,
          `"${insp.ledStatus || '-'}"`,
          `"${insp.chargeStatus || '-'}"`,
          `"${insp.testStatus || '-'}"`,
          `"${insp.overallStatus || '-'}"`,
          `"${insp.inspector || '-'}"`,
          insp.checkedAt ? `"${new Date(insp.checkedAt).toLocaleDateString('th-TH')}"` : '"-"',
          `"${insp.note || '-'}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `emergency_light_report_${month}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Stats calculation
  const total = items.length;
  const checked = items.filter(i => i.inspections?.length > 0).length;
  const ready = items.filter(i => i.inspections?.[0]?.overallStatus === 'พร้อมใช้งาน').length;
  const defective = items.filter(i => i.inspections?.length > 0 && i.inspections[0].overallStatus !== 'พร้อมใช้งาน').length;
  const progress = total === 0 ? 0 : Math.round((checked / total) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0">
      <div className="bg-yellow-500 text-white pt-12 pb-24 px-4 md:px-8 rounded-b-[2rem] shadow-xl relative z-10 print:hidden">
        <div className="max-w-5xl mx-auto">
          <Link href="/safety" className="inline-flex items-center text-yellow-100 hover:text-white mb-6 font-medium transition-colors">
            <ArrowLeft size={20} className="mr-2" /> กลับหน้าระบบความปลอดภัย
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lightbulb size={40} />
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">ตรวจสอบไฟฉุกเฉิน</h1>
            </div>
            
            <div className="flex gap-2">
              <button onClick={handleExportCSV} className="flex items-center gap-2 bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 px-4 py-2 rounded-xl font-bold transition">
                <Download size={18} /> CSV
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 bg-white text-yellow-600 hover:bg-slate-50 px-4 py-2 rounded-xl font-bold transition shadow-sm">
                <Printer size={18} /> พิมพ์รายงาน
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden print:block text-center pt-8 mb-4">
        <h1 className="text-2xl font-bold">รายงานตรวจสอบไฟฉุกเฉิน ประจำเดือน {months.find(m => m.value === month)?.label} ปี {year + 543}</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20 print:mt-0 print:p-0 text-slate-800">
        
        {/* Filter & Dashboard */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 print:hidden">
          <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
            <div className="w-full md:w-auto flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-500 mb-2">เดือนที่ตรวจสอบ</label>
                <select value={month} onChange={e => setMonth(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none">
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-500 mb-2">ปี (ค.ศ.)</label>
                <select value={year} onChange={e => setYear(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none">
                  {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y + 543}</option>)}
                </select>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                <span>ความคืบหน้าการตรวจ</span>
                <span className="text-yellow-600">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div className="bg-yellow-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-slate-500 font-medium text-sm">จุดตรวจทั้งหมด</p>
              <p className="text-3xl font-black text-slate-800">{total}</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-blue-600 font-medium text-sm">ตรวจแล้ว</p>
              <p className="text-3xl font-black text-blue-700">{checked}</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
              <p className="text-green-600 font-medium text-sm">พร้อมใช้งาน</p>
              <p className="text-3xl font-black text-green-700">{ready}</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
              <p className="text-red-600 font-medium text-sm">พบชำรุด</p>
              <p className="text-3xl font-black text-red-700">{defective}</p>
            </div>
          </div>
        </div>

        {/* List items */}
        <div className="bg-white rounded-3xl shadow-xl p-4 md:p-8 print:shadow-none print:p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-slate-500 font-bold">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mr-3"></div>
              กำลังโหลดข้อมูล...
            </div>
          ) : (
            <div className="grid gap-4 print:hidden">
              {Array.isArray(items) ? items.map((item, index) => {
                const lastCheck = item.inspections?.[0];
                const isReady = lastCheck?.overallStatus === 'พร้อมใช้งาน';
                
                return (
                  <div key={item.id} className="border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-all bg-slate-50/50">
                    <div className="mb-4 md:mb-0">
                      <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
                        <span className="text-slate-400 text-base">{index + 1}.</span> {item.location}
                      </h3>
                      {item.assetCode && <p className="text-xs text-slate-400 mt-1">รหัส: {item.assetCode}</p>}
                      <div className="flex items-center gap-2 mt-3 text-sm">
                        {lastCheck ? (
                          <>
                            <CheckCircle size={16} className={isReady ? "text-green-500" : "text-red-500"} />
                            <span className="text-slate-600">
                              ตรวจเมื่อ: {new Date(lastCheck.checkedAt).toLocaleDateString('th-TH')} ({lastCheck.inspector})
                            </span>
                            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${isReady ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                              {lastCheck.overallStatus}
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center text-orange-500 font-medium">
                            <AlertTriangle size={16} className="mr-1" /> รอดำเนินการตรวจสอบ
                          </div>
                        )}
                      </div>
                    </div>
                    <Link href={`/safety/light/${item.id}`} className={`w-full md:w-auto text-center px-6 py-3 rounded-xl font-bold transition-colors ${lastCheck ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-500 hover:text-white'}`}>
                      {lastCheck ? 'แก้ไขผลตรวจ' : 'บันทึกผลตรวจ'}
                    </Link>
                  </div>
                );
              }) : <p className="text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>}
            </div>
          )}

          {/* Table for Print View */}
          <div className="hidden print:block w-full">
            <table className="w-full border-collapse border border-slate-300 text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 p-2 text-center w-12">ที่</th>
                  <th className="border border-slate-300 p-2 text-left">จุดติดตั้ง / รหัสครุภัณฑ์</th>
                  <th className="border border-slate-300 p-2 text-center">LED/AC</th>
                  <th className="border border-slate-300 p-2 text-center">สถานะการชาร์จ</th>
                  <th className="border border-slate-300 p-2 text-center">ทดสอบตัดไฟ</th>
                  <th className="border border-slate-300 p-2 text-center">สถานะรวม</th>
                  <th className="border border-slate-300 p-2 text-left">ผู้ตรวจ/วันที่</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const insp = item.inspections?.[0];
                  return (
                    <tr key={item.id}>
                      <td className="border border-slate-300 p-2 text-center">{index + 1}</td>
                      <td className="border border-slate-300 p-2">
                        <div className="font-bold">{item.location}</div>
                        <div className="text-xs text-slate-500">{item.assetCode || '-'}</div>
                      </td>
                      <td className="border border-slate-300 p-2 text-center">{insp?.ledStatus || '-'}</td>
                      <td className="border border-slate-300 p-2 text-center">{insp?.chargeStatus || '-'}</td>
                      <td className="border border-slate-300 p-2 text-center">{insp?.testStatus || '-'}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-slate-700">{insp?.overallStatus || 'ยังไม่ตรวจ'}</td>
                      <td className="border border-slate-300 p-2">
                        {insp ? (
                          <div className="text-xs">
                            <div>{insp.inspector}</div>
                            <div>{new Date(insp.checkedAt).toLocaleDateString('th-TH')}</div>
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
