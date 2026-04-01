"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Save, X, Settings, ArrowLeft, Filter, DownloadCloud, UploadCloud } from "lucide-react";
import Link from "next/link";

type Medication = {
  id: string;
  category: string;
  name: string;
  shelf: string | null;
  isNoStock: boolean;
};

export default function ManageMedications() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStockStatus, setFilterStockStatus] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState("ยาเม็ด");
  const [formName, setFormName] = useState("");
  const [formShelf, setFormShelf] = useState("");
  const [formIsNoStock, setFormIsNoStock] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMeds();
  }, []);

  async function fetchMeds() {
    try {
      const res = await fetch('/api/medications');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: Medication[] = await res.json();
      setMeds(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(meds.map(m => m.category));
    const arr = Array.from(cats).sort();
    if (!arr.includes("ยาเม็ด")) arr.push("ยาเม็ด");
    if (!arr.includes("ยาฉีด")) arr.push("ยาฉีด");
    if (!arr.includes("ยาทา")) arr.push("ยาทา");
    if (!arr.includes("ยาจิตเวช")) arr.push("ยาจิตเวช");
    if (!arr.includes("ยาน้ำ")) arr.push("ยาน้ำ");
    return Array.from(new Set(arr)).sort();
  }, [meds]);

  const filteredMeds = useMemo(() => {
    return meds.filter(med => {
      const matchSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (med.shelf && med.shelf.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCategory = filterCategory === "all" || med.category === filterCategory;
      const matchStock = filterStockStatus === "all" ? true : (filterStockStatus === "nostock" ? med.isNoStock : !med.isNoStock);
      return matchSearch && matchCategory && matchStock;
    });
  }, [meds, searchTerm, filterCategory, filterStockStatus]);

  const handleOpenModal = (med?: Medication) => {
    if (med) {
      setEditingId(med.id);
      setFormCategory(med.category);
      setFormName(med.name);
      setFormShelf(med.shelf || "");
      setFormIsNoStock(med.isNoStock);
    } else {
      setEditingId(null);
      setFormCategory(filterCategory === "all" ? "ยาเม็ด" : filterCategory);
      setFormName("");
      setFormShelf("");
      setFormIsNoStock(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formCategory) return;
    
    setIsSaving(true);
    const shelfValue = formShelf.trim() || null;
    
    try {
      if (editingId) {
        // Update
        const res = await fetch('/api/manage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, name: formName.trim(), category: formCategory, shelf: shelfValue, isNoStock: formIsNoStock })
        });
        if (!res.ok) throw new Error('Failed to update');
        const updatedMed = await res.json();
        setMeds(prev => prev.map(m => m.id === editingId ? { ...m, ...updatedMed } : m));
      } else {
        // Create
        const res = await fetch('/api/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName.trim(), category: formCategory, shelf: shelfValue, isNoStock: formIsNoStock })
        });
        if (!res.ok) throw new Error('Failed to create');
        const newMed = await res.json();
        setMeds(prev => [...prev, newMed]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบยา "${name}" ออกจากระบบถาวร?`)) return;
    
    try {
      const res = await fetch(`/api/manage?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      setMeds(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  // --- Backup & Restore Handlers ---
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(meds, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medications_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) throw new Error("รูปแบบไฟล์ JSON ไม่ถูกต้อง");
        
        if (!confirm(`ต้องการกู้คืนข้อมูลยาจำนวน ${json.length} รายการใช่หรือไม่?\n(ยาที่มีชื่อซ้ำกันจะถูกอัปเดตข้อมูลตู้ยา/หมวดหมู่ ส่วนยาที่ไม่มีในระบบจะถูกเพิ่มใหม่)`)) return;
        
        setIsSaving(true); // Re-use saving state for UI feedback
        const res = await fetch('/api/manage/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json)
        });
        
        if (!res.ok) throw new Error('Failed to restore');
        const result = await res.json();
        alert(`นำเข้า/อัปเดตข้อมูลสำเร็จ ${result.count} รายการ`);
        fetchMeds(); // Refresh the list
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านหรือนำเข้าไฟล์ JSON (กรุณาตรวจสอบโครงสร้างไฟล์)');
        console.error(err);
      } finally {
        setIsSaving(false);
        if (e.target) e.target.value = ''; // Reset input
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* Header */}
      <div className="bg-slate-800 text-white py-4 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <Settings className="text-blue-400" /> จัดการฐานข้อมูลยา
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-8">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>รายชื่อยาทั้งหมดในระบบ</h1>
            <p className="font-medium mt-1" style={{ color: 'var(--text-muted)' }}>มียาทั้งหมด {meds.length} รายการ (เพิ่ม, ลบ, หรือแก้ไขชื่อและตู้ยาได้ที่นี่)</p>
          </div>
          <div className="w-full md:w-auto flex flex-wrap gap-2">
            <button 
              onClick={handleExportJSON}
              className="flex-1 md:flex-none px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              title="ดาวน์โหลดไฟล์สำรองข้อมูล (JSON)"
            >
              <DownloadCloud size={18} className="text-blue-400" /> ส่งออก (Export)
            </button>
            <label className="flex-1 md:flex-none px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer" 
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              title="กู้คืนข้อมูลจากไฟล์ JSON">
              <UploadCloud size={18} className="text-orange-400" /> กู้คืน (Restore)
              <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} disabled={isSaving} />
            </label>
            <button 
              onClick={() => handleOpenModal()} 
              className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
            >
              <Plus size={20} /> เพิ่มรายการยาใหม่
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-muted)' }} size={18} />
            <input type="text" placeholder="ค้นหาชื่อยา หรือรหัสตู้ยา..." 
              className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all font-medium"
              style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400" size={18} />
            <select className="w-full pl-11 pr-4 py-3 rounded-xl outline-none appearance-none font-bold"
              style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', color: '#667eea', border: '1px solid rgba(102, 126, 234, 0.3)' }}
              value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">ทุกหมวดหมู่ (ประเภท)</option>
              {categories.map(cat => <option key={cat} value={cat} style={{ backgroundColor: 'var(--bg-primary)' }}>{cat}</option>)}
            </select>
          </div>
        </div>

        {/* Data Table */}
        {loading || isSaving ? (
          <div className="text-center py-20 font-bold animate-pulse" style={{ color: '#667eea' }}>กำลังประมวลผลข้อมูล...</div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-sm" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', borderBottom: '1px solid var(--border-color)', color: '#667eea' }}>
                    <th className="p-4 font-bold w-16 text-center">ลำดับ</th>
                    <th className="p-4 font-bold w-24 text-center">รหัสตู้ยา</th>
                    <th className="p-4 font-bold w-32">หมวดหมู่</th>
                    <th className="p-4 font-bold">ชื่อยา (Medication Name)</th>
                    <th className="p-4 font-bold w-24 text-center">สถานะ</th>
                    <th className="p-4 font-bold w-32 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeds.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center font-medium" style={{ color: 'var(--text-muted)' }}>ไม่พบรายชื่อยาที่ค้นหา</td>
                    </tr>
                  ) : (
                    filteredMeds.map((med, index) => (
                      <tr key={med.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: med.isNoStock ? 'rgba(245, 158, 11, 0.05)' : 'transparent' }}>
                        <td className="p-4 text-center font-medium" style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-1 rounded font-bold text-xs" style={{ backgroundColor: med.shelf ? 'var(--bg-tertiary)' : 'transparent', color: med.shelf ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {med.shelf || "-"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold px-2.5 py-1 rounded-md text-xs whitespace-nowrap" style={{ backgroundColor: 'rgba(102, 126, 234, 0.2)', color: '#667eea', border: '1px solid rgba(102, 126, 234, 0.3)' }}>
                            {med.category}
                          </span>
                        </td>
                        <td className="p-4 font-bold" style={{ color: 'var(--text-primary)' }}>{med.name}</td>
                        <td className="p-4 text-center">
                          {med.isNoStock ? (
                            <span className="font-bold px-2.5 py-1 rounded-md text-xs whitespace-nowrap" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                              No Stock
                            </span>
                          ) : (
                            <span className="font-bold px-2.5 py-1 rounded-md text-xs whitespace-nowrap" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                              ปกติ
                            </span>
                          )}
                        </td>
                        <td className="p-4 flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenModal(med)}
                            className="p-2 rounded-lg transition-colors" style={{ color: '#667eea' }} title="แก้ไข"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(med.id, med.name)}
                            className="p-2 rounded-lg transition-colors" style={{ color: '#ef4444' }} title="ลบ"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4" style={{ backgroundColor: 'rgba(15, 15, 26, 0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {editingId ? "แก้ไขข้อมูลยา" : "เพิ่มรายการยาใหม่"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full transition-colors" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>หมวดหมู่ยา (Category) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select 
                    className="w-full pl-4 pr-10 py-3 rounded-xl outline-none appearance-none font-bold"
                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                    value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {categories.map(cat => <option key={cat} value={cat} style={{ backgroundColor: 'var(--bg-primary)' }}>{cat}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4" style={{ color: 'var(--text-muted)' }}>
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>รหัสตู้ยา/ชั้นวาง (Shelf Number)</label>
                <input 
                  type="text" 
                  value={formShelf} onChange={(e) => setFormShelf(e.target.value.toUpperCase())}
                  placeholder="เช่น A1, B12, C5 (ถ้าไม่มีเว้นว่างไว้)"
                  className="w-full px-4 py-3 rounded-xl outline-none font-bold placeholder-slate-500"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>ชื่อยา (Medication Name) <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  value={formName} onChange={(e) => setFormName(e.target.value)}
                  placeholder="ระบุชื่อยา..."
                  className="w-full px-4 py-3 rounded-xl outline-none font-bold placeholder-slate-500"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl mt-4" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <input 
                  type="checkbox" 
                  id="isNoStock"
                  checked={formIsNoStock}
                  onChange={(e) => setFormIsNoStock(e.target.checked)}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: '#f59e0b' }}
                />
                <label htmlFor="isNoStock" className="text-sm font-bold cursor-pointer" style={{ color: '#fbbf24' }}>
                  เป็นยา No Stock (ไม่จัดเก็บในคลัง OPD)
                  <p className="text-xs font-normal mt-0.5" style={{ color: 'rgba(251, 191, 36, 0.7)' }}>ยาที่ติ๊กนี้จะไม่นำมาคิดในระบบตรวจวันหมดอายุ</p>
                </label>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 rounded-xl font-bold transition-colors"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formName.trim() || !formCategory}
                className="flex-[2] py-4 rounded-xl font-black text-white shadow-lg transition-all flex justify-center items-center gap-2"
                style={{ 
                  background: (isSaving || !formName.trim()) ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: (isSaving || !formName.trim()) ? 'var(--text-muted)' : 'white',
                  cursor: (isSaving || !formName.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? (
                  <span className="animate-pulse">กำลังบันทึก...</span>
                ) : (
                  <>
                    <Save size={20} /> บันทึกข้อมูล
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
