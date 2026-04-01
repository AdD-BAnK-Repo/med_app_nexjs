"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Calendar, AlertTriangle, CheckCircle, Clock, X, Save, LayoutGrid, List, FileSpreadsheet, Printer, Filter, Menu, Home as HomeIcon, Settings, BarChart3, Plus, ArrowUpRight } from "lucide-react";
import * as XLSX from "xlsx";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

type Medication = {
  id: string;
  category: string;
  name: string;
  shelf: string | null;
  isNoStock?: boolean;
  expiryDate: string | null; // DD/MM/YYYY
  qtyUnder3Months: number | null;
  qtyUnder8Months: number | null;
  status?: "safe" | "warning" | "expired" | "unknown";
  monthsLeft?: number;
};

// Calculate status relative to a specific reference date
function calculateStatus(expiryStr: string | null, referenceDate: Date): { status: "safe" | "warning" | "expired" | "unknown", monthsLeft?: number } {
  if (!expiryStr) return { status: "unknown" };
  
  const parts = expiryStr.split(/[\/-]/);
  let expDay = 1, expMonth, expYear;
  
  if (parts.length === 3) {
    expDay = parseInt(parts[0]);
    expMonth = parseInt(parts[1]) - 1;
    expYear = parseInt(parts[2]);
  } else if (parts.length === 2) {
    expMonth = parseInt(parts[0]) - 1;
    expYear = parseInt(parts[1]);
    if (expYear < 100) expYear += 2000;
  } else {
    return { status: "unknown" };
  }

  const expDate = new Date(expYear, expMonth, expDay); 
  
  // Calculate months difference
  const monthsLeft = (expDate.getFullYear() - referenceDate.getFullYear()) * 12 + (expDate.getMonth() - referenceDate.getMonth()) + (expDate.getDate() - referenceDate.getDate()) / 30;

  if (monthsLeft < 0) return { status: "expired", monthsLeft: Math.floor(monthsLeft) };
  if (monthsLeft <= 8) return { status: "warning", monthsLeft: Math.floor(monthsLeft) };
  return { status: "safe", monthsLeft: Math.floor(monthsLeft) };
}

export default function Home() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  // Filters & Reference Date
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterShelf, setFilterShelf] = useState<string>("all");
  const [refMonth, setRefMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [refYear, setRefYear] = useState<number>(new Date().getFullYear());
  
  // Popup Nav State
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Modal State
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [qty3m, setQty3m] = useState<string>("");
  const [qty8m, setQty8m] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMeds();
  }, [refMonth, refYear]);

  async function fetchMeds() {
    try {
      setLoading(true);
      const res = await fetch(`/api/medications?month=${refMonth + 1}&year=${refYear}&type=nostock`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: Medication[] = await res.json();
      setMeds(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Derive Reference Date
  const referenceDate = useMemo(() => {
    return new Date(refYear, refMonth, new Date().getDate());
  }, [refMonth, refYear]);

  // Processed Meds (calculated against reference date)
  const processedMeds = useMemo(() => {
    return meds.map(med => {
      const { status, monthsLeft } = calculateStatus(med.expiryDate, referenceDate);
      return { ...med, status, monthsLeft };
    });
  }, [meds, referenceDate]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(processedMeds.map(m => m.category));
    return Array.from(cats).sort();
  }, [processedMeds]);

  // Extract unique shelf letters
  const shelfLetters = useMemo(() => {
    const letters = new Set<string>();
    processedMeds.forEach(m => {
      if (m.shelf) {
        const letter = m.shelf.charAt(0).toUpperCase();
        if (/[A-Z]/.test(letter)) {
          letters.add(letter);
        }
      }
    });
    return Array.from(letters).sort();
  }, [processedMeds]);

  // Filtered Meds
  const filteredMeds = useMemo(() => {
    return processedMeds.filter(med => {
      const matchSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          med.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (med.shelf && med.shelf.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCategory = filterCategory === "all" || med.category === filterCategory;
      const matchStatus = filterStatus === "all" 
                          ? true 
                          : filterStatus === "checked" 
                            ? med.expiryDate !== null 
                            : filterStatus === "unchecked"
                            ? med.expiryDate === null
                            : med.status === filterStatus;
      const matchShelf = filterShelf === "all" || (med.shelf && med.shelf.toUpperCase().startsWith(filterShelf));
                            
      return matchSearch && matchCategory && matchStatus && matchShelf;
    });
  }, [processedMeds, searchTerm, filterCategory, filterStatus, filterShelf]);

  // Statistics for Dashboard
  const stats = useMemo(() => {
    const total = processedMeds.length;
    let safe = 0, warning = 0, expired = 0, unknown = 0;
    
    processedMeds.forEach(m => {
      if (m.status === "safe") safe++;
      else if (m.status === "warning") warning++;
      else if (m.status === "expired") expired++;
      else unknown++;
    });

    return { total, safe, warning, expired, unknown };
  }, [processedMeds]);

  const chartData = [
    { name: 'ปลอดภัย', value: stats.safe, color: '#10b981' }, 
    { name: 'ใกล้หมดอายุ', value: stats.warning, color: '#f59e0b' }, 
    { name: 'หมดอายุ', value: stats.expired, color: '#ef4444' }, 
  ].filter(d => d.value > 0);

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredMeds.map(m => ({
      "ลำดับ": "", 
      "หมวดหมู่ยา": m.category,
      "รหัสชั้นวาง": m.shelf || "-",
      "รายชื่อยา": m.name,
      "วันหมดอายุ": m.expiryDate || "",
      "จำนวนยาต่ำกว่า 3 เดือน": m.qtyUnder3Months !== null ? m.qtyUnder3Months : "",
      "จำนวนยาต่ำกว่า 8 เดือน": m.qtyUnder8Months !== null ? m.qtyUnder8Months : "",
      "สถานะ": m.status === "expired" ? "หมดอายุ" : m.status === "warning" ? "ใกล้หมดอายุ" : m.status === "safe" ? "ปลอดภัย" : "รอดำเนินการ",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const wscols = [ {wch: 8}, {wch: 20}, {wch: 12}, {wch: 40}, {wch: 15}, {wch: 25}, {wch: 25}, {wch: 25} ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "รายงานยาหมดอายุ");
    XLSX.writeFile(workbook, `Report_${getThaiYear(refYear)}_${thaiMonths[refMonth]}.xlsx`);
  };

  const handlePrint = () => window.print();

  // Modal Handlers
  const openModal = (med: Medication) => {
    setEditingMed(med);
    setQty3m(med.qtyUnder3Months !== null ? med.qtyUnder3Months.toString() : "");
    setQty8m(med.qtyUnder8Months !== null ? med.qtyUnder8Months.toString() : "");

    if (med.expiryDate) {
      const parts = med.expiryDate.split(/[\/-]/);
      if (parts.length === 3) {
         setSelectedDay(parseInt(parts[0]));
         setSelectedMonth(parseInt(parts[1]));
         setSelectedYear(parseInt(parts[2]));
      } else if (parts.length === 2) {
         setSelectedDay(null);
         setSelectedMonth(parseInt(parts[0]));
         let y = parseInt(parts[1]);
         if (y < 100) y += 2000;
         setSelectedYear(y);
      }
    } else {
      setSelectedDay(null);
      setSelectedMonth(null);
      setSelectedYear(new Date().getFullYear());
    }
  };

  const saveData = async () => {
    if (!editingMed) return;
    setUpdating(true);
    
    let newDate = editingMed.expiryDate;
    if (selectedDay !== null && selectedMonth !== null && selectedYear !== null) {
        const d = selectedDay.toString().padStart(2, '0');
        const m = selectedMonth.toString().padStart(2, '0');
        newDate = `${d}/${m}/${selectedYear}`;
    }
    
    try {
      const res = await fetch('/api/medications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id: editingMed.id, 
            month: refMonth + 1, // Store for current viewing month
            year: refYear,       // Store for current viewing year
            expiryDate: newDate,
            qtyUnder3Months: qty3m,
            qtyUnder8Months: qty8m
        })
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      setMeds(prev => prev.map(m => {
        if (m.id === editingMed.id) {
          return { 
              ...m, 
              expiryDate: newDate, 
              qtyUnder3Months: qty3m === "" ? null : parseInt(qty3m),
              qtyUnder8Months: qty8m === "" ? null : parseInt(qty8m)
          };
        }
        return m;
      }));
      setEditingMed(null);
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setUpdating(false);
    }
  };

  const months = [
    { value: 1, label: "1 - Jan" }, { value: 2, label: "2 - Feb" }, { value: 3, label: "3 - Mar" },
    { value: 4, label: "4 - Apr" }, { value: 5, label: "5 - May" }, { value: 6, label: "6 - Jun" },
    { value: 7, label: "7 - Jul" }, { value: 8, label: "8 - Aug" }, { value: 9, label: "9 - Sep" },
    { value: 10, label: "10 - Oct" }, { value: 11, label: "11 - Nov" }, { value: 12, label: "12 - Dec" }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => currentYear - 1 + i);
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const getThaiYear = (year: number) => year + 543;

  const getDaysInMonth = (month: number | null, year: number) => {
    if (!month) return [];
    return Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1);
  };
  const days = getDaysInMonth(selectedMonth, selectedYear);

  let tempMonthsLeft: number | null = null;
  if (selectedDay && selectedMonth && selectedYear) {
    const exp = new Date(selectedYear, selectedMonth - 1, selectedDay);
    tempMonthsLeft = (exp.getFullYear() - referenceDate.getFullYear()) * 12 + (exp.getMonth() - referenceDate.getMonth()) + (exp.getDate() - referenceDate.getDate()) / 30;
  }
  const showQty3m = tempMonthsLeft !== null && tempMonthsLeft <= 3;
  const showQty8m = tempMonthsLeft !== null && tempMonthsLeft <= 8 && tempMonthsLeft > 3;
  const isDateComplete = selectedYear !== null && selectedMonth !== null && selectedDay !== null;
  const isQtyValid = () => {
      if (showQty3m && qty3m === "") return false;
      if (showQty8m && qty8m === "") return false;
      return true;
  };
  const isSaveDisabled = updating || !isDateComplete || !isQtyValid();


  // Print Template
  const PrintTemplate = () => (
    <div className="hidden print:block font-sans text-sm pb-10 print-area">
      <div className="text-center mb-6 print-header-section">
        <h1 className="text-xl font-bold" style={{ color: '#000000' }}>รายงานตรวจสอบวันหมดอายุยา ประจำเดือน {thaiMonths[refMonth]} พ.ศ. {getThaiYear(refYear)}</h1>
        <h2 className="text-lg font-bold mt-1" style={{ color: '#000000' }}>ห้องยา OPD</h2>
        <div className="flex justify-between mt-6 px-10" style={{ color: '#000000' }}>
            <p>ตรวจสอบโดยอ้างอิง ณ: เดือน {thaiMonths[refMonth]} พ.ศ. {getThaiYear(refYear)}</p>
            <p>ผู้ตรวจสอบ: นายพงศ์ภพ วงษ์ประเสริฐ</p>
        </div>
      </div>
      <table className="w-full border-collapse border border-black mt-4 print-table" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        <thead>
          <tr className="print-header" style={{ backgroundColor: '#d1d5db !important', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            <th className="border border-black p-2 w-12 text-center" style={{ backgroundColor: '#d1d5db', color: '#000000' }}>ลำดับ</th>
            <th className="border border-black p-2" style={{ backgroundColor: '#d1d5db', color: '#000000' }}>รายชื่อยา</th>
            <th className="border border-black p-2 w-28 text-center whitespace-nowrap" style={{ backgroundColor: '#d1d5db', color: '#000000' }}>วันหมดอายุ</th>
            <th className="border border-black p-2 w-32 text-center whitespace-nowrap" style={{ backgroundColor: '#d1d5db', color: '#000000' }}>
              <div>จำนวนยา</div>
              <div>{'(< 3 เดือน)'}</div>
              <div className="text-[10px] font-normal">({new Date().toLocaleDateString('th-TH')})</div>
            </th>
            <th className="border border-black p-2 w-32 text-center whitespace-nowrap" style={{ backgroundColor: '#d1d5db', color: '#000000' }}>
              <div>จำนวนยา</div>
              <div>{'(< 8 เดือน)'}</div>
              <div className="text-[10px] font-normal">({new Date().toLocaleDateString('th-TH')})</div>
            </th>
            <th className="border border-black p-2 w-24 text-center" style={{ backgroundColor: '#d1d5db', color: '#000000' }}>หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {categories.filter(c => filterCategory === "all" || c === filterCategory).map(cat => {
            const catMeds = filteredMeds.filter(m => m.category === cat);
            if (catMeds.length === 0) return null;
            return (
              <React.Fragment key={cat}>
                <tr className="print-category" style={{ backgroundColor: '#f3f4f6 !important', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <td colSpan={6} className="border border-black p-2 font-bold bg-gray-100 text-black" style={{ backgroundColor: '#f3f4f6', color: '#000000' }}>{cat}</td>
                </tr>
                {catMeds.map((med, index) => {
                  // Determine row background color based on months left
                  let rowBgColor = '#ffffff';
                  let highlightClass = '';
                  if (med.monthsLeft !== undefined && med.monthsLeft !== null) {
                    if (med.monthsLeft <= 3) {
                      rowBgColor = '#fca5a5'; // Light red for <= 3 months
                      highlightClass = 'print-row-red';
                    } else if (med.monthsLeft <= 8) {
                      rowBgColor = '#fdba74'; // Light orange for <= 8 months
                      highlightClass = 'print-row-orange';
                    }
                  }
                  
                  return (
                    <tr key={med.id} className={highlightClass} style={{ 
                      backgroundColor: rowBgColor,
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact'
                    }}>
                      <td className="border border-black p-2 text-center text-black" style={{ color: '#000000' }}>{index + 1}</td>
                      <td className="border border-black p-2 text-black" style={{ color: '#000000' }}>
                        {med.name}
                        {med.isNoStock && <span className="ml-2 text-[10px] text-orange-600 bg-orange-50 px-1 py-0.5 rounded border border-orange-200">No Stock</span>}
                      </td>
                      <td className="border border-black p-2 text-center whitespace-nowrap text-black" style={{ color: '#000000' }}>{med.expiryDate || ""}</td>
                      <td className="border border-black p-2 text-center text-black" style={{ color: '#000000' }}>{med.qtyUnder3Months !== null ? med.qtyUnder3Months : ""}</td>
                      <td className="border border-black p-2 text-center text-black" style={{ color: '#000000' }}>{med.qtyUnder8Months !== null ? med.qtyUnder8Months : ""}</td>
                      <td className="border border-black p-2 text-center text-xs text-black" style={{ color: '#000000' }}>
                          {med.status === "expired" ? "หมดอายุ" : med.status === "warning" ? "ใกล้หมดอายุ" : ""}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans print:bg-white print:p-0">
      
      {/* Dynamic Header & Overview Dashboard */}
      <div 
        className="text-white rounded-b-[2rem] shadow-2xl pt-6 pb-8 px-4 md:px-8 mb-8 print:hidden"
        style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.2)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}
                >
                  <BarChart3 size={24} className="text-white" />
                </div>
                <span style={{ background: 'linear-gradient(135deg, #fff 0%, #e2e8f0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ระบบตรวจสอบวันหมดอายุ (ยา No Stock)
                </span>
              </h1>
              <p className="text-slate-400 ml-15">บันทึกและตรวจสอบสถานะยาที่ไม่ได้จัดเก็บในคลังย่อย</p>
            </div>
            
            {/* Reference Date Selector */}
            <div className="mt-4 md:mt-0 bg-blue-700/50 p-3 rounded-xl border border-blue-500 backdrop-blur-sm flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold"><Calendar size={16} className="inline mr-1"/> ตรวจสอบ ณ:</span>
              <div className="flex gap-2">
                <select 
                  className="bg-white text-blue-900 text-sm rounded-lg px-2 py-1 outline-none font-bold cursor-pointer"
                  value={refMonth} onChange={(e) => setRefMonth(parseInt(e.target.value))}
                >
                  {months.map(m => <option key={m.value} value={m.value - 1}>{m.label}</option>)}
                </select>
                <select 
                  className="bg-white text-blue-900 text-sm rounded-lg px-2 py-1 outline-none font-bold cursor-pointer"
                  value={refYear} onChange={(e) => setRefYear(parseInt(e.target.value))}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Stat Cards & Chart Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
            {/* Cards */}
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 cursor-pointer transition-all hover:bg-white/20 ${filterStatus === 'all' ? 'ring-2 ring-white scale-105' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                <p className="text-blue-200 text-sm mb-1 font-semibold">ยาทั้งหมด</p>
                <div className="text-3xl font-bold">{stats.total} <span className="text-sm font-normal text-blue-300">รายการ</span></div>
              </div>
              <div 
                className={`bg-emerald-500/20 backdrop-blur-sm rounded-2xl p-4 border border-emerald-400/30 cursor-pointer transition-all hover:bg-emerald-500/30 ${filterStatus === 'safe' ? 'ring-2 ring-emerald-400 scale-105' : ''}`}
                onClick={() => setFilterStatus('safe')}
              >
                <p className="text-emerald-200 text-sm mb-1 font-semibold flex items-center gap-1"><CheckCircle size={14}/> ปลอดภัย</p>
                <div className="text-3xl font-bold text-white">{stats.safe}</div>
              </div>
              <div 
                className={`bg-amber-500/20 backdrop-blur-sm rounded-2xl p-4 border border-amber-400/30 cursor-pointer transition-all hover:bg-amber-500/30 ${filterStatus === 'warning' ? 'ring-2 ring-amber-400 scale-105' : ''}`}
                onClick={() => setFilterStatus('warning')}
              >
                <p className="text-amber-200 text-sm mb-1 font-semibold flex items-center gap-1"><Clock size={14}/> ใกล้หมดอายุ</p>
                <div className="text-3xl font-bold text-white">{stats.warning}</div>
              </div>
              <div 
                className={`bg-rose-500/20 backdrop-blur-sm rounded-2xl p-4 border border-rose-400/30 cursor-pointer transition-all hover:bg-rose-500/30 ${filterStatus === 'expired' ? 'ring-2 ring-rose-400 scale-105' : ''}`}
                onClick={() => setFilterStatus('expired')}
              >
                <p className="text-rose-200 text-sm mb-1 font-semibold flex items-center gap-1"><AlertTriangle size={14}/> หมดอายุ</p>
                <div className="text-3xl font-bold text-white">{stats.expired}</div>
              </div>
            </div>
            
            {/* Tiny Chart */}
            <div className="h-32 lg:h-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center p-2">
              {stats.total > 0 && stats.unknown < stats.total ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius={35} outerRadius={50} paddingAngle={3} dataKey="value">
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-blue-200/50 text-sm">รอข้อมูลการตรวจสอบ</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 print:p-0 print:m-0">
        
        {/* Filters & Actions Bar */}
        <div className="rounded-2xl p-4 mb-6 flex flex-col gap-4 print:hidden" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          
          {/* Top row: Search & Basic Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-muted)' }} size={18} />
                  <input type="text" placeholder="ค้นหาชื่อยา หรือ รหัสตู้ยา..." 
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl outline-none transition-all text-sm"
                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={18} />
                  <select className="w-full pl-9 pr-3 py-2.5 rounded-xl outline-none appearance-none text-sm font-medium"
                    style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', color: '#667eea', border: '1px solid rgba(102, 126, 234, 0.3)' }}
                    value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option value="all" style={{ backgroundColor: 'var(--bg-primary)' }}>ทุกหมวดหมู่ (ประเภท)</option>
                    {categories.map(cat => <option key={cat} value={cat} style={{ backgroundColor: 'var(--bg-primary)' }}>{cat}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-muted)' }} size={18} />
                  <select className="w-full pl-9 pr-3 py-2.5 rounded-xl outline-none appearance-none text-sm"
                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                    value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all" style={{ backgroundColor: 'var(--bg-primary)' }}>ทั้งหมด (ตรวจแล้ว & ยังไม่ตรวจ)</option>
                    <option value="checked" style={{ backgroundColor: 'var(--bg-primary)' }}>เฉพาะที่ตรวจแล้ว</option>
                    <option value="unchecked" style={{ backgroundColor: 'var(--bg-primary)' }}>เฉพาะที่ "ยังไม่ได้ตรวจ"</option>
                    <option value="safe" style={{ backgroundColor: 'var(--bg-primary)' }}>ปลอดภัย (อายุ {'>'} 8 เดือน)</option>
                    <option value="warning" style={{ backgroundColor: 'var(--bg-primary)' }}>ใกล้หมดอายุ (อายุ {'<='} 8 เดือน)</option>
                    <option value="expired" style={{ backgroundColor: 'var(--bg-primary)' }}>หมดอายุ</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="flex p-1.5 rounded-xl mr-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "shadow-sm" : ""}`} style={{ backgroundColor: viewMode === "list" ? 'var(--bg-primary)' : 'transparent', color: viewMode === "list" ? '#667eea' : 'var(--text-muted)' }}><List size={18} /></button>
                    <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "shadow-sm" : ""}`} style={{ backgroundColor: viewMode === "grid" ? 'var(--bg-primary)' : 'transparent', color: viewMode === "grid" ? '#667eea' : 'var(--text-muted)' }}><LayoutGrid size={18} /></button>
                </div>
              </div>
          </div>

          {/* Bottom row: Shelf Quick Filter */}
          <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase mr-2 tracking-wider" style={{ color: 'var(--text-muted)' }}>เลือกตู้ยา:</span>
                  <button 
                      onClick={() => setFilterShelf("all")}
                      className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                      style={{ backgroundColor: filterShelf === "all" ? '#667eea' : 'var(--bg-tertiary)', color: filterShelf === "all" ? 'white' : 'var(--text-muted)' }}
                  >
                      ทุกตู้
                  </button>
                  {shelfLetters.map(letter => (
                      <button 
                          key={letter}
                          onClick={() => setFilterShelf(letter)}
                          className="px-4 py-1.5 rounded-lg text-sm font-black transition-all"
                          style={{ backgroundColor: filterShelf === letter ? '#667eea' : 'var(--bg-tertiary)', color: filterShelf === letter ? 'white' : '#667eea', border: filterShelf === letter ? 'none' : '1px solid var(--border-color)' }}
                      >
                          ตู้ {letter}
                      </button>
                  ))}
              </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-blue-500 font-bold animate-pulse print:hidden">กำลังโหลดข้อมูลและประมวลผลกราฟ...</div>
        ) : (
          <div className={`${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"} print:hidden`}>
            
            {viewMode === "list" && filteredMeds.length > 0 && (
                <div className="hidden md:flex p-4 rounded-xl font-bold text-sm mb-2" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    <div className="w-20 text-center mr-4">ชั้นยา</div>
                    <div className="flex-1">หมวดหมู่ / รายการยา</div>
                    <div className="w-32 text-center">วันหมดอายุ</div>
                    <div className="w-28 text-center text-xs">จำนวน {'<'} 3ด.</div>
                    <div className="w-28 text-center text-xs">จำนวน {'<'} 8ด.</div>
                    <div className="w-16 text-center">สถานะ</div>
                </div>
            )}

            {filteredMeds.map(med => (
              <div key={med.id} onClick={() => openModal(med)} 
                className={`p-4 flex cursor-pointer transition-all border-l-4 hover:shadow-md hover:-translate-y-1 group
                    ${viewMode === "list" ? "flex-col md:flex-row md:items-center justify-between rounded-xl" : "flex-col rounded-2xl gap-3"}
                `}
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderLeftColor: med.status === "expired" ? "#ef4444" : med.status === "warning" ? "#f59e0b" : med.status === "safe" ? "#10b981" : "var(--border-color)" }}
              >
                {viewMode === "list" && (
                    <div className="w-20 text-center font-black rounded-lg py-2 mr-4 hidden md:flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                        {med.shelf || "-"}
                    </div>
                )}
                <div className={`${viewMode === "list" ? "flex-1" : "w-full"}`}>
                  <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(102, 126, 234, 0.2)', color: '#667eea', border: '1px solid rgba(102, 126, 234, 0.3)' }}>{med.category}</span>
                      {viewMode === "grid" && med.shelf && (
                          <span className="text-xs font-black px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{med.shelf}</span>
                      )}
                  </div>
                  <h3 className="text-md font-bold leading-tight transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {med.name}
                    {med.isNoStock && (
                      <span className="ml-2 inline-block align-middle text-[10px] px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                        No Stock
                      </span>
                    )}
                  </h3>
                </div>
                
                <div className={`flex ${viewMode === "list" ? "items-center justify-between md:justify-end w-full md:w-auto gap-4 md:gap-6 mt-3 md:mt-0" : "items-center justify-between w-full mt-auto pt-3"}`} style={{ borderTop: viewMode === "grid" ? '1px solid var(--border-color)' : 'none' }}>
                    
                    <div className="text-sm font-bold px-3 py-1.5 rounded-lg min-w-[110px] text-center border" style={{ backgroundColor: med.expiryDate ? 'var(--bg-tertiary)' : 'transparent', color: med.expiryDate ? 'var(--text-primary)' : 'var(--text-muted)', borderStyle: med.expiryDate ? 'solid' : 'dashed', borderColor: 'var(--border-color)' }}>
                        {med.expiryDate || "ระบุวันที่"}
                    </div>
                    
                    <div className={`flex ${viewMode === "list" ? "flex-col md:flex-row gap-2 md:gap-6" : "flex-col gap-1.5"} items-center text-center`}>
                        <div className={`text-xs ${viewMode === "list" ? "md:w-28" : ""} ${med.qtyUnder3Months !== null ? "font-bold px-2 py-0.5 rounded-md" : ""}`} style={{ color: med.qtyUnder3Months !== null ? '#ef4444' : 'var(--text-muted)', backgroundColor: med.qtyUnder3Months !== null ? 'rgba(239, 68, 68, 0.1)' : 'transparent', border: med.qtyUnder3Months !== null ? '1px solid rgba(239, 68, 68, 0.3)' : 'none' }}>
                            <span className={viewMode === "list" ? "md:hidden" : ""}>{'<'} 3ด.: </span> 
                            {med.qtyUnder3Months !== null ? `${med.qtyUnder3Months} เม็ด` : "-"}
                        </div>
                        <div className={`text-xs ${viewMode === "list" ? "md:w-28" : ""} ${med.qtyUnder8Months !== null ? "font-bold px-2 py-0.5 rounded-md" : ""}`} style={{ color: med.qtyUnder8Months !== null ? '#f59e0b' : 'var(--text-muted)', backgroundColor: med.qtyUnder8Months !== null ? 'rgba(245, 158, 11, 0.1)' : 'transparent', border: med.qtyUnder8Months !== null ? '1px solid rgba(245, 158, 11, 0.3)' : 'none' }}>
                            <span className={viewMode === "list" ? "md:hidden" : ""}>{'<'} 8ด.: </span>
                            {med.qtyUnder8Months !== null ? `${med.qtyUnder8Months} เม็ด` : "-"}
                        </div>
                    </div>

                    <div className="w-8 flex justify-end">
                        {med.status === "expired" && <AlertTriangle className="text-red-500 drop-shadow-md" size={22} />}
                        {med.status === "warning" && <Clock className="text-amber-400 drop-shadow-md" size={22} />}
                        {med.status === "safe" && <CheckCircle className="text-emerald-400 drop-shadow-md" size={22} />}
                    </div>
                </div>
              </div>
            ))}
            
            {filteredMeds.length === 0 && (
              <div className="text-center py-20 text-lg w-full rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px dashed var(--border-color)' }}>
                <Search size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                ไม่พบข้อมูลที่ตรงกับเงื่อนไข
              </div>
            )}
          </div>
        )}

        {/* PRINT TEMPLATE */}
        {!loading && <PrintTemplate />}
      </div>

      {/* --- Popup Navigation (Floating Action Button & Menu) --- */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden flex flex-col items-end gap-3">
        {isNavOpen && (
          <div className="rounded-2xl shadow-2xl p-2 flex flex-col gap-2 animate-in slide-in-from-bottom-5 fade-in duration-200 mb-2" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <button onClick={exportToExcel} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors w-full text-left" style={{ color: 'var(--text-primary)' }}>
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}><FileSpreadsheet size={18} /></div> ส่งออก Excel
            </button>
            <button onClick={handlePrint} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors w-full text-left" style={{ color: 'var(--text-primary)' }}>
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(102, 126, 234, 0.2)', color: '#667eea' }}><Printer size={18} /></div> ปริ้นรายงาน
            </button>
            <div className="h-px w-full my-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
            <a href="/manage" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors w-full text-left" style={{ color: 'var(--text-primary)' }}>
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}><Settings size={18} /></div> จัดการรายชื่อยา
            </a>
          </div>
        )}
        <button 
          onClick={() => setIsNavOpen(!isNavOpen)}
          className="text-white p-4 rounded-full transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)' }}
        >
          {isNavOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Update Modal */}
      {editingMed && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 print:hidden" style={{ backgroundColor: 'rgba(15, 15, 26, 0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-200" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>อัปเดตข้อมูลยา</h2>
              <button onClick={() => setEditingMed(null)} className="p-2 rounded-full transition-colors" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6 border-l-4 pl-4 py-1 rounded-r-xl" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', borderColor: '#667eea' }}>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#667eea' }}>{editingMed.category}</span>
                <p className="font-bold text-lg mt-1" style={{ color: 'var(--text-primary)' }}>{editingMed.name}</p>
            </div>
            
            {/* Date Section */}
            <div className="mb-6 p-5 rounded-2xl border shadow-inner" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                <h3 className="font-bold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}><Calendar size={20} className="mr-2 text-blue-400"/> ระบุวันหมดอายุ</h3>
                
                <div className="mb-5">
                    <label className="block text-xs font-black mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>1. ปี (Year)</label>
                    <div className="flex overflow-x-auto pb-2 gap-2 snap-x scrollbar-hide">
                        {years.map(y => (
                        <button key={y} onClick={() => { setSelectedYear(y); setSelectedMonth(null); setSelectedDay(null); }}
                            className="min-w-[70px] py-2.5 rounded-xl text-sm font-bold transition-all snap-start"
                            style={{ backgroundColor: selectedYear === y ? '#667eea' : 'var(--bg-primary)', color: selectedYear === y ? 'white' : 'var(--text-primary)', border: selectedYear === y ? 'none' : '1px solid var(--border-color)' }}
                        >
                            {y}
                        </button>
                        ))}
                    </div>
                </div>

                {selectedYear !== null && (
                    <div className="mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-xs font-black mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>2. เดือน (Month)</label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {months.map(m => (
                            <button key={m.value} onClick={() => { setSelectedMonth(m.value); setSelectedDay(null); }}
                                className="py-2 rounded-xl text-xs font-bold transition-all"
                                style={{ backgroundColor: selectedMonth === m.value ? '#667eea' : 'var(--bg-primary)', color: selectedMonth === m.value ? 'white' : 'var(--text-primary)', border: selectedMonth === m.value ? 'none' : '1px solid var(--border-color)' }}
                            >
                                {m.label}
                            </button>
                            ))}
                        </div>
                    </div>
                )}

                {selectedMonth !== null && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-xs font-black mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>3. วันที่ (Day)</label>
                        <div className="grid grid-cols-7 gap-1.5">
                            {days.map(d => (
                            <button key={d} onClick={() => setSelectedDay(d)}
                                className="py-2 rounded-lg text-sm font-bold transition-all"
                                style={{ backgroundColor: selectedDay === d ? '#667eea' : 'var(--bg-primary)', color: selectedDay === d ? 'white' : 'var(--text-primary)', border: selectedDay === d ? 'none' : '1px solid var(--border-color)' }}
                            >
                                {d}
                            </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Conditional Quantity Section */}
            {isDateComplete && (showQty3m || showQty8m) && (
                <div className="mb-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-3 text-red-600 font-bold bg-red-50 p-3 rounded-xl border border-red-200">
                        <div className="bg-red-100 p-2 rounded-full animate-pulse"><AlertTriangle size={20} /></div>
                        <span>ยาใกล้หมดอายุ! ระบุจำนวนคงเหลือ</span>
                    </div>

                    {showQty3m && (
                        <div className="bg-white p-5 rounded-2xl border-2 border-red-400 shadow-md relative overflow-hidden group focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100 transition-all">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                            <label className="block text-sm font-black text-red-800 mb-2 pl-2 flex items-center justify-between">
                                <span>จำนวนเม็ด (อายุน้อยกว่า 3 เดือน)</span>
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase">บังคับ</span>
                            </label>
                            <input 
                                type="number" 
                                value={qty3m}
                                onChange={(e) => setQty3m(e.target.value)}
                                placeholder="0"
                                className="w-full p-4 border-none rounded-xl bg-red-50 text-2xl font-black text-red-900 placeholder-red-300 focus:outline-none"
                            />
                        </div>
                    )}

                    {showQty8m && (
                        <div className="bg-white p-5 rounded-2xl border-2 border-orange-400 shadow-md relative overflow-hidden group focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100 transition-all">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                            <label className="block text-sm font-black text-orange-800 mb-2 pl-2 flex items-center justify-between">
                                <span>จำนวนเม็ด (อายุน้อยกว่า 8 เดือน)</span>
                                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded uppercase">บังคับ</span>
                            </label>
                            <input 
                                type="number" 
                                value={qty8m}
                                onChange={(e) => setQty8m(e.target.value)}
                                placeholder="0"
                                className="w-full p-4 border-none rounded-xl bg-orange-50 text-2xl font-black text-orange-900 placeholder-orange-300 focus:outline-none"
                            />
                        </div>
                    )}
                </div>
            )}
            
            <button
              onClick={saveData}
              disabled={isSaveDisabled}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all flex justify-center items-center gap-3 text-lg tracking-wide ${
                isSaveDisabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 hover:-translate-y-1 active:translate-y-0 active:scale-95'
              }`}
            >
              <Save size={24} className={updating ? "animate-spin" : ""} />
              <span>
                  {updating ? 'กำลังอัปเดตระบบ...' : 
                   !isDateComplete ? 'กรุณาเลือกวัน/เดือน/ปี ให้ครบ' : 
                   !isQtyValid() ? 'กรุณาระบุจำนวนยา' : 
                   'บันทึกข้อมูล'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
