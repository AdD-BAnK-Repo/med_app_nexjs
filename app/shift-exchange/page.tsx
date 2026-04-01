'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { 
  Home, 
  ClipboardCheck, 
  Settings, 
  ShieldCheck, 
  FileText, 
  Menu, 
  X, 
  ChevronLeft,
  LogOut,
  Calendar,
  Clock,
  User,
  Users,
  FileDown,
  Save,
  History,
  AlertTriangle,
  Settings2,
  ChevronRight,
  Pencil,
  Trash2,
  Type,
  MoreVertical
} from 'lucide-react';

interface MonthlySettings {
  id: string;
  month: number;
  year: number;
  hospitalOrderNo: string;
  hospitalOrderDate: string;
  formVersion: string;
  formVersionDate: string;
}

export default function ShiftExchangePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [monthlySettings, setMonthlySettings] = useState<MonthlySettings | null>(null);
  const [settingsRequired, setSettingsRequired] = useState(false);
  
  const [formData, setFormData] = useState({
    requesterName: '',
    receiverName: '',
    shiftDate: '',
    shiftType: 'เช้า',
    reason: 'ติดธุระไม่สามารถมาปฏิบัติงานได้',
    documentNo: '',
  });
  
  const [settingsForm, setSettingsForm] = useState({
    hospitalOrderNo: '',
    hospitalOrderDate: '',
    formVersion: 'แบบฟอร์มสำนักงานสาธารณสุขจังหวัดสระแก้ว ณ 16 มีนาคม 2561',
    formVersionDate: 'ปรับปรุงข้อมูลครั้งที่ 3 ณ 17 ตุลาคม 2566',
  });
  
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Edit and Rename states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [editingExchange, setEditingExchange] = useState<any>(null);
  const [renameValue, setRenameValue] = useState('');
  const [editFormData, setEditFormData] = useState({
    requesterName: '',
    receiverName: '',
    shiftDate: '',
    shiftType: 'เช้า',
    reason: '',
  });
  
  // Detect if running in Telegram Mini App
  const [isTelegram, setIsTelegram] = useState(false);
  
  useEffect(() => {
    // Check if running inside Telegram WebApp
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      setIsTelegram(true);
    }
  }, []);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

  useEffect(() => {
    fetchExchanges();
    checkMonthlySettings();
  }, []);

  const checkMonthlySettings = async () => {
    try {
      const res = await fetch(`/api/shifts/settings?month=${currentMonth}&year=${currentYear}`);
      if (res.ok) {
        const data = await res.json();
        setMonthlySettings(data.settings);
        setSettingsRequired(false);
      } else {
        setSettingsRequired(true);
        setShowSettingsModal(true);
      }
    } catch (error) {
      console.error('Error checking settings:', error);
      setSettingsRequired(true);
    }
  };

  const fetchExchanges = async () => {
    try {
      const res = await fetch('/api/shifts/exchange');
      if (res.ok) {
        const data = await res.json();
        setExchanges(data);
      }
    } catch (error) {
      console.error('Error fetching exchanges:', error);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      const res = await fetch('/api/shifts/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: currentMonth,
          year: currentYear,
          ...settingsForm
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMonthlySettings(data.settings);
        setSettingsRequired(false);
        setShowSettingsModal(false);
        alert('✅ บันทึกข้อมูลเอกสารประจำเดือนสำเร็จ');
      } else {
        alert('❌ เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDownload = async (exchange: any) => {
    try {
      const dateObj = new Date(exchange.shiftDate);
      const day = dateObj.getDate().toString();
      const month = dateObj.toLocaleDateString('th-TH', { month: 'long' });
      const year = (dateObj.getFullYear() + 543).toString();

      const data = {
        requester: exchange.requesterName,
        substitute: exchange.receiverName,
        day,
        month,
        year,
        shiftTime: exchange.shiftType,
        exchangeId: exchange.id,
      };

      const res = await fetch('/api/shifts/exchange/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shift_exchange_${exchange.id}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'เกิดข้อผิดพลาดในการสร้างไฟล์');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อดาวน์โหลด');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettingsForm({ ...settingsForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (settingsRequired) {
      Swal.fire({
        icon: 'warning',
        title: 'ตั้งค่าเอกสารก่อน',
        text: 'กรุณาตั้งค่าข้อมูลเอกสารประจำเดือนก่อน',
        confirmButtonColor: '#f59e0b',
      });
      setShowSettingsModal(true);
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch('/api/shifts/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          requesterName: '',
          receiverName: '',
          shiftDate: '',
          shiftType: 'เช้า',
          reason: 'ติดธุระไม่สามารถมาปฏิบัติงานได้',
          documentNo: '',
        });
        fetchExchanges();
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'บันทึกข้อมูลการขายเวรเรียบร้อยแล้ว',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
      } else if (res.status === 409) {
        const data = await res.json();
        Swal.fire({
          icon: 'error',
          title: 'เลขที่เอกสารซ้ำ',
          text: data.error || 'เลขที่เอกสารนี้มีอยู่แล้วในเดือนนี้ กรุณาใช้เลขอื่น',
          confirmButtonColor: '#ef4444',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'บันทึกไม่สำเร็จ',
          text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Swal.fire({
        icon: 'error',
        title: 'เชื่อมต่อล้มเหลว',
        text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit, Delete, Rename handlers
  const handleEdit = (exchange: any) => {
    setEditingExchange(exchange);
    setEditFormData({
      requesterName: exchange.requesterName,
      receiverName: exchange.receiverName,
      shiftDate: exchange.shiftDate.split('T')[0],
      shiftType: exchange.shiftType,
      reason: exchange.reason || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExchange) return;

    try {
      const res = await fetch(`/api/shifts/exchange/${editingExchange.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingExchange(null);
        fetchExchanges();
        Swal.fire({
          icon: 'success',
          title: 'แก้ไขสำเร็จ',
          text: 'แก้ไขข้อมูลเรียบร้อยแล้ว',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'แก้ไขไม่สำเร็จ',
          text: 'เกิดข้อผิดพลาดในการแก้ไข',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (error) {
      console.error('Error updating:', error);
      Swal.fire({
        icon: 'error',
        title: 'เชื่อมต่อล้มเหลว',
        text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleDelete = async (exchangeId: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการลบ',
      text: 'คุณแน่ใจหรือไม่ที่จะลบรายการนี้?',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    });
    
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/shifts/exchange/${exchangeId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchExchanges();
        Swal.fire({
          icon: 'success',
          title: 'ลบสำเร็จ',
          text: 'ลบข้อมูลเรียบร้อยแล้ว',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'ลบไม่สำเร็จ',
          text: 'เกิดข้อผิดพลาดในการลบ',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (error) {
      console.error('Error deleting:', error);
      Swal.fire({
        icon: 'error',
        title: 'เชื่อมต่อล้มเหลว',
        text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleRenameClick = (exchange: any) => {
    setEditingExchange(exchange);
    setRenameValue(exchange.requesterName);
    setShowRenameModal(true);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExchange) return;

    try {
      const res = await fetch(`/api/shifts/exchange/${editingExchange.id}/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterName: renameValue }),
      });

      if (res.ok) {
        setShowRenameModal(false);
        setEditingExchange(null);
        setRenameValue('');
        fetchExchanges();
        Swal.fire({
          icon: 'success',
          title: 'เปลี่ยนชื่อสำเร็จ',
          text: 'เปลี่ยนชื่อเรียบร้อยแล้ว',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เปลี่ยนชื่อไม่สำเร็จ',
          text: 'เกิดข้อผิดพลาดในการเปลี่ยนชื่อ',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (error) {
      console.error('Error renaming:', error);
      Swal.fire({
        icon: 'error',
        title: 'เชื่อมต่อล้มเหลว',
        text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const menuItems = [
    { href: '/', label: 'หน้าหลัก', icon: Home },
    { href: '/check', label: 'ตรวจสอบวันหมดอายุ', icon: ClipboardCheck },
    { href: '/manage', label: 'จัดการฐานข้อมูลยา', icon: Settings },
    { href: '/safety', label: 'ตรวจสอบความปลอดภัย', icon: ShieldCheck },
    { href: '/shift-exchange', label: 'ฟอร์มขายเวร', icon: FileText, active: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15, 15, 26, 0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="px-6 py-4" style={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="flex items-center gap-3">
                <Pencil className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">แก้ไขข้อมูลขายเวร</h2>
              </div>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                    ชื่อผู้ขอขายเวร <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.requesterName}
                    onChange={(e) => setEditFormData({...editFormData, requesterName: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-xl transition outline-none"
                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                    ชื่อผู้รับเวรแทน <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.receiverName}
                    onChange={(e) => setEditFormData({...editFormData, receiverName: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-xl transition outline-none"
                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                    วันที่เวร <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={editFormData.shiftDate}
                    onChange={(e) => setEditFormData({...editFormData, shiftDate: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-xl transition outline-none"
                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                    เวลาเวร <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={editFormData.shiftType}
                    onChange={(e) => setEditFormData({...editFormData, shiftType: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl transition outline-none"
                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="เช้า" style={{ backgroundColor: 'var(--bg-primary)' }}>🌅 เช้า</option>
                    <option value="บ่าย" style={{ backgroundColor: 'var(--bg-primary)' }}>☀️ บ่าย</option>
                    <option value="ดึก" style={{ backgroundColor: 'var(--bg-primary)' }}>🌙 ดึก</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  เหตุผล
                </label>
                <textarea
                  value={editFormData.reason}
                  onChange={(e) => setEditFormData({...editFormData, reason: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl transition resize-none outline-none"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium transition"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-white font-bold rounded-xl transition shadow-lg"
                  style={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15, 15, 26, 0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="rounded-2xl shadow-2xl max-w-md w-full" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="px-6 py-4" style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)' }}>
              <div className="flex items-center gap-3">
                <Type className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">เปลี่ยนชื่อ</h2>
              </div>
            </div>
            
            <form onSubmit={handleRename} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  ชื่อผู้ขอขายเวรใหม่ <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl transition outline-none"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  placeholder="ระบุชื่อใหม่"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium transition"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-white font-bold rounded-xl transition shadow-lg"
                  style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)' }}
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Required Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15, 15, 26, 0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="px-6 py-4" style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)' }}>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">ตั้งค่าเอกสารประจำเดือน</h2>
              </div>
            </div>
            
            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <p className="text-sm" style={{ color: '#fbbf24' }}>
                  <strong>กรุณากรอกข้อมูลเอกสารสำหรับเดือน{thaiMonths[currentMonth-1]} {currentYear+543}</strong><br/>
                  ข้อมูลนี้จะใช้ในการสร้างเอกสารคำสั่งขายเวรทั้งหมดในเดือนนี้
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  เลขที่คำสั่งโรงพยาบาล <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="hospitalOrderNo"
                  value={settingsForm.hospitalOrderNo}
                  onChange={handleSettingsChange}
                  required
                  placeholder="เช่น 136/2568"
                  className="w-full px-4 py-3 rounded-xl transition outline-none"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  วันที่ลงคำสั่ง <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="hospitalOrderDate"
                  value={settingsForm.hospitalOrderDate}
                  onChange={handleSettingsChange}
                  required
                  placeholder="เช่น 20 ตุลาคม 2568"
                  className="w-full px-4 py-3 rounded-xl transition outline-none"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  แบบฟอร์มสำนักงานสาธารณสุข <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="formVersion"
                  value={settingsForm.formVersion}
                  onChange={handleSettingsChange}
                  required
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl transition resize-none outline-none"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  วันที่ปรับปรุงแบบฟอร์ม <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="formVersionDate"
                  value={settingsForm.formVersionDate}
                  onChange={handleSettingsChange}
                  required
                  className="w-full px-4 py-3 rounded-xl transition outline-none"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)' }}
              >
                {savingSettings ? 'กำลังบันทึก...' : 'บันทึกข้อมูลเอกสาร'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden when in Telegram */}
      {!isTelegram && (
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">ระบบขายเวร</h1>
              <p className="text-xs text-slate-400">โรงพยาบาล</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${item.active 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.active && <div className="ml-auto w-2 h-2 bg-white rounded-full" />}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition w-full">
            <LogOut className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>

        {/* Floating Settings Button for Telegram */}
        {isTelegram && (
          <button
            onClick={() => setShowSettingsModal(true)}
            className={`fixed top-4 right-4 z-40 p-3 rounded-full shadow-lg transition ${
              settingsRequired 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-white text-slate-600'
            }`}
          >
            <Settings2 className="w-5 h-5" />
          </button>
        )}

        {/* Page Content */}
        <main className={`flex-1 p-4 lg:p-8 overflow-auto ${isTelegram ? 'pt-16' : ''}`}>
          {/* Warning if settings required */}
          {settingsRequired && (
            <div className="mb-6 rounded-2xl p-4 flex items-center gap-4" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)' }}>
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-300">ต้องตั้งค่าเอกสารประจำเดือนก่อน</h3>
                <p className="text-sm text-red-400">กรุณากรอกข้อมูลเลขที่คำสั่งและแบบฟอร์มสำหรับเดือน{thaiMonths[currentMonth-1]} {currentYear+543}</p>
              </div>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-4 py-2 rounded-xl font-medium transition"
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              >
                ตั้งค่าเลย
              </button>
            </div>
          )}

          {/* Page Header */}
          {/* Page Header */}
          <div 
            className="relative overflow-hidden rounded-[2rem] p-8 mb-8 text-white shadow-2xl"
            style={{ 
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-teal-500/10 to-cyan-500/10 blur-3xl" />
            
            <div className="relative z-10 flex items-center gap-4">
              <div 
                className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' }}
              >
                <FileText size={36} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #fff 0%, #e2e8f0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ฟอร์มขอขายเวร/แลกเวร
                </h1>
                <p className="mt-2 text-slate-400">บันทึกและจัดการการขอขายเวรพยาบาล พร้อมพิมพ์เอกสารคำสั่ง</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="xl:col-span-2 space-y-6">
              {/* Current Settings Display */}
              {monthlySettings && (
                <div className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-blue-300">ข้อมูลเอกสารประจำเดือน{thaiMonths[currentMonth-1]} {currentYear+543}</span>
                  </div>
                  <p className="text-sm text-blue-400">
                    คำสั่ง ที่ {monthlySettings.hospitalOrderNo} ลงวันที่ {monthlySettings.hospitalOrderDate}
                  </p>
                </div>
              )}

              {/* Shift Exchange Form Card */}
              <div className="rounded-[1.5rem] overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div className="px-6 py-4" style={{ background: 'linear-gradient(90deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)' }}>
                  <h2 className="text-white font-bold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    รายละเอียดการขายเวร
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Document Number */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      <span className="text-red-400">*</span> เลขที่เอกสาร (สก 0033.05.303/xxxx)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="documentNo"
                        value={formData.documentNo}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-[#1a1a2e] border border-[#2d2d44] text-slate-200 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] transition outline-none placeholder-slate-500"
                        placeholder="ระบุเลขที่เอกสาร เช่น 1203"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">* เลขที่เอกสารห้ามซ้ำในเดือนเดียวกัน</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        <span className="text-red-400">*</span> ชื่อผู้ขอขายเวร
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="requesterName"
                          value={formData.requesterName}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-[#1a1a2e] border border-[#2d2d44] text-slate-200 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] transition outline-none placeholder-slate-500"
                          placeholder="ระบุชื่อ-นามสกุล"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        <span className="text-red-400">*</span> ชื่อผู้รับเวรแทน
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="receiverName"
                          value={formData.receiverName}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-[#1a1a2e] border border-[#2d2d44] text-slate-200 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] transition outline-none placeholder-slate-500"
                          placeholder="ระบุชื่อ-นามสกุล"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        <span className="text-red-400">*</span> วันที่เวร
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          name="shiftDate"
                          value={formData.shiftDate}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-[#1a1a2e] border border-[#2d2d44] text-slate-200 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] transition outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        <span className="text-red-400">*</span> เวลาเวร
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select
                          name="shiftType"
                          value={formData.shiftType}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-[#1a1a2e] border border-[#2d2d44] text-slate-200 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] transition outline-none appearance-none"
                        >
                          <option value="เช้า" style={{ backgroundColor: '#1a1a2e' }}>🌅 เช้า (08.00-16.00 น.)</option>
                          <option value="บ่าย" style={{ backgroundColor: '#1a1a2e' }}>☀️ บ่าย (16.00-00.00 น.)</option>
                          <option value="ดึก" style={{ backgroundColor: '#1a1a2e' }}>🌙 ดึก (00.00-08.00 น.)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      เหตุผล (ถ้ามี)
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#1a1a2e] border border-[#2d2d44] text-slate-200 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] transition outline-none resize-none placeholder-slate-500"
                      placeholder="ระบุเหตุผล เช่น ติดธุระส่วนตัว, ลาป่วย"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        บันทึกข้อมูล
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* History Section */}
            <div className="xl:col-span-1">
              <div className="rounded-3xl overflow-hidden sticky top-24" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div className="px-6 py-4" style={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}>
                  <h2 className="text-white font-bold flex items-center gap-2">
                    <History className="w-5 h-5" />
                    ประวัติการขอขายเวร
                  </h2>
                </div>
                <div className="p-4 max-h-[600px] overflow-y-auto">
                  {exchanges.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <History className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <p style={{ color: 'var(--text-muted)' }}>ยังไม่มีข้อมูล</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {exchanges.map((exchange) => (
                        <div 
                          key={exchange.id} 
                          className="p-4 rounded-2xl transition"
                          style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {exchange.requesterName}
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                → {exchange.receiverName}
                              </p>
                            </div>
                            {/* Action Menu */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(exchange)}
                                className="p-1.5 rounded-lg transition"
                                style={{ color: '#667eea' }}
                                title="แก้ไข"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRenameClick(exchange)}
                                className="p-1.5 rounded-lg transition"
                                style={{ color: '#f59e0b' }}
                                title="เปลี่ยนชื่อ"
                              >
                                <Type className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(exchange.id)}
                                className="p-1.5 rounded-lg transition"
                                style={{ color: '#ef4444' }}
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(exchange.shiftDate).toLocaleDateString('th-TH')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {exchange.shiftType}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownload(exchange)}
                            className="w-full py-2 rounded-xl transition flex items-center justify-center gap-2 text-sm font-medium"
                            style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                          >
                            <FileDown className="w-4 h-4" />
                            พิมพ์เอกสาร Word
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
