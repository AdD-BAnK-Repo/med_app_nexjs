"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Save, X, Settings, Filter, DownloadCloud, UploadCloud, Package, Database, AlertCircle } from "lucide-react";
import { useTheme } from '../components/ThemeContext';

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
        const res = await fetch('/api/manage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, name: formName.trim(), category: formCategory, shelf: shelfValue, isNoStock: formIsNoStock })
        });
        if (!res.ok) throw new Error('Failed to update');
        const updatedMed = await res.json();
        setMeds(prev => prev.map(m => m.id === editingId ? { ...m, ...updatedMed } : m));
      } else {
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
        
        if (!confirm(`ต้องการกู้คืนข้อมูลยาจำนวน ${json.length} รายการใช่หรือไม่?`)) return;
        
        setIsSaving(true);
        const res = await fetch('/api/manage/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json)
        });
        
        if (!res.ok) throw new Error('Failed to restore');
        const result = await res.json();
        alert(`นำเข้า/อัปเดตข้อมูลสำเร็จ ${result.count} รายการ`);
        fetchMeds();
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านหรือนำเข้าไฟล์ JSON');
        console.error(err);
      } finally {
        setIsSaving(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      'ยาเม็ด': { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.4)', text: '#3b82f6' },
      'ยาฉีด': { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.4)', text: '#8b5cf6' },
      'ยาทา': { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.4)', text: '#10b981' },
      'ยาจิตเวช': { bg: 'rgba(245, 87, 108, 0.1)', border: 'rgba(245, 87, 108, 0.4)', text: '#f5576c' },
      'ยาน้ำ': { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.4)', text: '#f59e0b' },
    };
    return colors[category] || { bg: 'rgba(102, 126, 234, 0.1)', border: 'rgba(102, 126, 234, 0.4)', text: '#667eea' };
  };

  // Status counts
  const totalCount = meds.length;
  const noStockCount = meds.filter(m => m.isNoStock).length;
  const normalCount = totalCount - noStockCount;

  return (
    <div className="min-h-screen pb-24">
      {/* Header Card */}
      <div 
        className="mb-6 p-6 rounded-2xl"
        style={{
          background: isDark ? 'rgba(26, 26, 37, 0.8)' : 'rgba(255, 255, 255, 0.95)',
          border: `2px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`,
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{
                background: 'rgba(102, 126, 234, 0.15)',
                border: '2px solid rgba(102, 126, 234, 0.4)',
              }}
            >
              <Database className="h-7 w-7" style={{ color: '#667eea' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                จัดการฐานข้อมูลยา
              </h1>
              <p style={{ color: isDark ? '#64748b' : '#64748b' }}>
                รายการยาทั้งหมดในระบบ {totalCount} รายการ
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-3">
            <div 
              className="px-4 py-2 rounded-lg"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: '#10b981' }}>ปกติ</p>
              <p className="text-xl font-bold" style={{ color: '#10b981' }}>{normalCount}</p>
            </div>
            <div 
              className="px-4 py-2 rounded-lg"
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: '#f59e0b' }}>No Stock</p>
              <p className="text-xl font-bold" style={{ color: '#f59e0b' }}>{noStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div 
        className="mb-6 p-4 rounded-xl"
        style={{
          background: isDark ? 'rgba(26, 26, 37, 0.6)' : 'rgba(255, 255, 255, 0.8)',
          border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
        }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2" 
              size={18} 
              style={{ color: isDark ? '#64748b' : '#94a3b8' }} 
            />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อยา หรือรหัสตู้ยา..."
              className="w-full pl-11 pr-4 py-3 rounded-lg outline-none font-medium"
              style={{
                background: isDark ? 'rgba(10, 10, 15, 0.5)' : 'rgba(241, 245, 249, 0.8)',
                border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
                color: isDark ? '#f8fafc' : '#0f172a',
              }}
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="relative lg:w-56">
            <Filter 
              className="absolute left-4 top-1/2 -translate-y-1/2" 
              size={18} 
              style={{ color: '#667eea' }} 
            />
            <select 
              className="w-full pl-11 pr-4 py-3 rounded-lg outline-none appearance-none font-medium"
              style={{
                background: isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)',
                border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`,
                color: isDark ? '#f8fafc' : '#0f172a',
              }}
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button 
              onClick={handleExportJSON}
              className="px-4 py-3 rounded-lg font-medium flex items-center gap-2"
              style={{
                background: isDark ? 'rgba(26, 26, 37, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`,
                color: isDark ? '#f8fafc' : '#0f172a',
              }}
            >
              <DownloadCloud size={18} style={{ color: '#667eea' }} /> 
              <span className="hidden sm:inline">ส่งออก</span>
            </button>
            
            <label 
              className="px-4 py-3 rounded-lg font-medium flex items-center gap-2 cursor-pointer"
              style={{
                background: isDark ? 'rgba(26, 26, 37, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.35)'}`,
                color: isDark ? '#f8fafc' : '#0f172a',
              }}
            >
              <UploadCloud size={18} style={{ color: '#f59e0b' }} /> 
              <span className="hidden sm:inline">กู้คืน</span>
              <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} disabled={isSaving} />
            </label>
            
            <button 
              onClick={() => handleOpenModal()} 
              className="px-5 py-3 rounded-lg font-bold flex items-center gap-2 text-white"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '1px solid rgba(102, 126, 234, 0.5)',
              }}
            >
              <Plus size={20} /> 
              <span className="hidden sm:inline">เพิ่มรายการ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{
          background: isDark ? 'rgba(26, 26, 37, 0.6)' : 'rgba(255, 255, 255, 0.8)',
          border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
        }}
      >
        {loading || isSaving ? (
          <div className="text-center py-16">
            <div 
              className="inline-block px-6 py-3 rounded-lg"
              style={{
                background: isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)',
                border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`,
              }}
            >
              <span style={{ color: '#667eea' }}>กำลังประมวลผลข้อมูล...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: isDark ? 'rgba(102, 126, 234, 0.08)' : 'rgba(102, 126, 234, 0.06)' }}>
                  <th className="p-4 text-center font-bold text-sm w-16" style={{ borderBottom: `2px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`, color: isDark ? '#f8fafc' : '#0f172a' }}>ลำดับ</th>
                  <th className="p-4 text-center font-bold text-sm w-24" style={{ borderBottom: `2px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`, color: isDark ? '#f8fafc' : '#0f172a' }}>รหัสตู้ยา</th>
                  <th className="p-4 font-bold text-sm w-36" style={{ borderBottom: `2px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`, color: isDark ? '#f8fafc' : '#0f172a' }}>หมวดหมู่</th>
                  <th className="p-4 font-bold text-sm" style={{ borderBottom: `2px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`, color: isDark ? '#f8fafc' : '#0f172a' }}>ชื่อยา</th>
                  <th className="p-4 text-center font-bold text-sm w-28" style={{ borderBottom: `2px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`, color: isDark ? '#f8fafc' : '#0f172a' }}>สถานะ</th>
                  <th className="p-4 text-center font-bold text-sm w-28" style={{ borderBottom: `2px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`, color: isDark ? '#f8fafc' : '#0f172a' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div 
                        className="inline-flex flex-col items-center gap-3 p-6 rounded-xl"
                        style={{
                          background: isDark ? 'rgba(26, 26, 37, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                          border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
                        }}
                      >
                        <Package size={32} style={{ color: isDark ? '#475569' : '#94a3b8' }} />
                        <span style={{ color: isDark ? '#64748b' : '#64748b' }}>ไม่พบรายชื่อยาที่ค้นหา</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMeds.map((med, index) => {
                    const catColor = getCategoryColor(med.category);
                    return (
                      <tr 
                        key={med.id} 
                        style={{ 
                          borderBottom: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)'}`,
                          background: med.isNoStock 
                            ? (isDark ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.03)')
                            : 'transparent'
                        }}
                      >
                        <td className="p-4 text-center" style={{ color: isDark ? '#64748b' : '#64748b' }}>
                          {index + 1}
                        </td>
                        <td className="p-4 text-center">
                          {med.shelf ? (
                            <span 
                              className="px-2 py-1 rounded font-bold text-xs"
                              style={{
                                background: isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)',
                                border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`,
                                color: '#667eea',
                              }}
                            >
                              {med.shelf}
                            </span>
                          ) : (
                            <span style={{ color: isDark ? '#475569' : '#cbd5e1' }}>-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span 
                            className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                            style={{
                              background: catColor.bg,
                              border: `1px solid ${catColor.border}`,
                              color: catColor.text,
                            }}
                          >
                            {med.category}
                          </span>
                        </td>
                        <td className="p-4 font-medium" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                          {med.name}
                        </td>
                        <td className="p-4 text-center">
                          {med.isNoStock ? (
                            <span 
                              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                              style={{
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.4)',
                                color: '#f59e0b',
                              }}
                            >
                              No Stock
                            </span>
                          ) : (
                            <span 
                              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                              style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                color: '#10b981',
                              }}
                            >
                              ปกติ
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => handleOpenModal(med)}
                              className="p-2 rounded-lg"
                              style={{
                                background: 'rgba(102, 126, 234, 0.1)',
                                border: '1px solid rgba(102, 126, 234, 0.3)',
                              }}
                              title="แก้ไข"
                            >
                              <Edit2 size={16} style={{ color: '#667eea' }} />
                            </button>
                            <button 
                              onClick={() => handleDelete(med.id, med.name)}
                              className="p-2 rounded-lg"
                              style={{
                                background: 'rgba(245, 87, 108, 0.1)',
                                border: '1px solid rgba(245, 87, 108, 0.3)',
                              }}
                              title="ลบ"
                            >
                              <Trash2 size={16} style={{ color: '#f5576c' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[100] p-4"
          style={{ backgroundColor: 'rgba(10, 10, 15, 0.7)' }}
        >
          <div 
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              background: isDark ? 'rgba(26, 26, 37, 0.95)' : 'rgba(255, 255, 255, 0.98)',
              border: `2px solid ${isDark ? 'rgba(102, 126, 234, 0.4)' : 'rgba(102, 126, 234, 0.35)'}`,
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                {editingId ? "แก้ไขข้อมูลยา" : "เพิ่มรายการยาใหม่"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 rounded-lg"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                }}
              >
                <X size={20} style={{ color: isDark ? '#64748b' : '#64748b' }} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                  หมวดหมู่ยา <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select 
                  className="w-full px-4 py-3 rounded-lg outline-none font-medium"
                  style={{
                    background: isDark ? 'rgba(10, 10, 15, 0.5)' : 'rgba(241, 245, 249, 0.8)',
                    border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`,
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}
                  value={formCategory} 
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                  รหัสตู้ยา/ชั้นวาง
                </label>
                <input 
                  type="text" 
                  value={formShelf} 
                  onChange={(e) => setFormShelf(e.target.value.toUpperCase())}
                  placeholder="เช่น A1, B12 (ถ้าไม่มีเว้นว่างไว้)"
                  className="w-full px-4 py-3 rounded-lg outline-none font-medium"
                  style={{
                    background: isDark ? 'rgba(10, 10, 15, 0.5)' : 'rgba(241, 245, 249, 0.8)',
                    border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`,
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                  ชื่อยา <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ระบุชื่อยา..."
                  className="w-full px-4 py-3 rounded-lg outline-none font-medium"
                  style={{
                    background: isDark ? 'rgba(10, 10, 15, 0.5)' : 'rgba(241, 245, 249, 0.8)',
                    border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`,
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}
                />
              </div>

              <div 
                className="flex items-center gap-3 p-4 rounded-lg"
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <input 
                  type="checkbox" 
                  id="isNoStock"
                  checked={formIsNoStock}
                  onChange={(e) => setFormIsNoStock(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <div>
                  <label htmlFor="isNoStock" className="text-sm font-medium cursor-pointer" style={{ color: '#f59e0b' }}>
                    เป็นยา No Stock
                  </label>
                  <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                    ยาที่ติ๊กนี้จะไม่นำมาคิดในระบบตรวจวันหมดอายุ
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-lg font-medium"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  color: isDark ? '#94a3b8' : '#475569',
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formName.trim() || !formCategory}
                className="flex-[2] py-3 rounded-lg font-bold text-white flex justify-center items-center gap-2"
                style={{
                  background: (isSaving || !formName.trim()) 
                    ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.4)' : 'rgba(102, 126, 234, 0.35)'}`,
                  cursor: (isSaving || !formName.trim()) ? 'not-allowed' : 'pointer',
                }}
              >
                {isSaving ? 'กำลังบันทึก...' : <><Save size={18} /> บันทึกข้อมูล</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
