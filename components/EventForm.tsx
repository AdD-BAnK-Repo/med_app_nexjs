'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent } from '@prisma/client';

interface EventFormProps {
  event: CalendarEvent | null;
  onSubmit: (data: any) => Promise<boolean>;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function EventForm({ event, onSubmit, onCancel, onDelete }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
    type: 'shift',
    category: '',
    personName: '',
    color: '',
    status: 'pending',
  });
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with event data if editing
  useEffect(() => {
    if (event && 'id' in event) {
      // Editing existing event
      setFormData({
        title: event.title || '',
        description: event.description || '',
        startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
        allDay: event.allDay || false,
        type: event.type || 'shift',
        category: event.category || '',
        personName: event.personName || '',
        color: event.color || '',
        status: event.status || 'pending',
      });
    } else if (event) {
      // New event - set default dates to today
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setFormData({
        title: '',
        description: '',
        startDate: now.toISOString().slice(0, 16),
        endDate: tomorrow.toISOString().slice(0, 16),
        allDay: false,
        type: 'shift',
        category: '',
        personName: '',
        color: '',
        status: 'pending',
      });
    } else {
      // No event selected - reset form
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        allDay: false,
        type: 'shift',
        category: '',
        personName: '',
        color: '',
        status: 'pending',
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Convert date strings to ISO format
      const dataToSubmit = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      const success = await onSubmit(dataToSubmit);
      if (success && !(event && 'id' in event)) {
        // Reset form after successful creation
        setFormData({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          allDay: false,
          type: 'shift',
          category: '',
          personName: '',
          color: '',
          status: 'pending',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Get color options based on event type
  const getColorOptions = (type: string) => {
    switch (type) {
      case 'shift': return [
        { value: '#3b82f6', label: 'น้ำเงิน (เวร)' },
        { value: '#1d4ed8', label: 'น้ำเงินเข้ม' },
        { value: '#60a5fa', label: 'น้ำเงินอ่อน' },
      ];
      case 'task': return [
        { value: '#10b981', label: 'เขียว (งานประจำ)' },
        { value: '#059669', label: 'เขียวเข้ม' },
        { value: '#34d399', label: 'เขียวอ่อน' },
      ];
      case 'work': return [
        { value: '#f59e0b', label: 'เหลือง (งานอื่น)' },
        { value: '#d97706', label: 'เหลืองเข้ม' },
        { value: '#fbbf24', label: 'เหลืองอ่อน' },
      ];
      case 'meeting': return [
        { value: '#8b5cf6', label: 'ม่วง (ประชุม)' },
        { value: '#7c3aed', label: 'ม่วงเข้ม' },
        { value: '#a78bfa', label: 'ม่วงอ่อน' },
      ];
      case 'holiday': return [
        { value: '#ef4444', label: 'แดง (วันหยุด)' },
        { value: '#dc2626', label: 'แดงเข้ม' },
        { value: '#f87171', label: 'แดงอ่อน' },
      ];
      default: return [
        { value: '#6b7280', label: 'เทา' },
        { value: '#9ca3af', label: 'เทาอ่อน' },
      ];
    }
  };

  const colorOptions = getColorOptions(formData.type);

  if (!event) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-5xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">ยังไม่ได้เลือกรายการ</h3>
        <p className="text-gray-400">คลิกรายการในปฏิทินเพื่อดูหรือแก้ไข</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่องาน/เวร *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="เช่น เวรนอกเวลา 20:00-08:00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          รายละเอียด
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่เริ่ม *
          </label>
          <input
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่สิ้นสุด *
          </label>
          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="allDay"
          name="allDay"
          checked={formData.allDay}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 rounded"
        />
        <label htmlFor="allDay" className="ml-2 text-sm text-gray-700">
          ทั้งวัน
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ประเภท *
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="shift">เวร (Shift)</option>
          <option value="task">งานประจำ (Task)</option>
          <option value="work">งานอื่น (Work)</option>
          <option value="meeting">ประชุม (Meeting)</option>
          <option value="holiday">วันหยุด (Holiday)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          หมวดหมู่
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- เลือกหมวดหมู่ --</option>
          <option value="เวรนอกเวลา">เวรนอกเวลา</option>
          <option value="งานเอกสาร">งานเอกสาร</option>
          <option value="ตรวจสอบยา">ตรวจสอบยา</option>
          <option value="ตรวจสอบอุปกรณ์">ตรวจสอบอุปกรณ์</option>
          <option value="อบรม">อบรม</option>
          <option value="ประชุม">ประชุม</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อผู้รับผิดชอบ
        </label>
        <input
          type="text"
          name="personName"
          value={formData.personName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="เช่น นพ.สมชาย ใจดี"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          สีในปฏิทิน
        </label>
        <div className="flex items-center space-x-4">
          <select
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">สีอัตโนมัติตามประเภท</option>
            {colorOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {formData.color && (
            <div 
              className="w-8 h-8 rounded border border-gray-300"
              style={{ backgroundColor: formData.color }}
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          สถานะ
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="pending">รอดำเนินการ</option>
          <option value="confirmed">ยืนยันแล้ว</option>
          <option value="in_progress">กำลังดำเนินการ</option>
          <option value="completed">เสร็จสิ้น</option>
          <option value="cancelled">ยกเลิก</option>
        </select>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium"
          >
            ลบ
          </button>
        )}
        
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium"
        >
          ยกเลิก
        </button>
        
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              กำลังบันทึก...
            </>
          ) : event && 'id' in event ? 'อัปเดต' : 'สร้าง'}
        </button>
      </div>

      <div className="text-xs text-gray-500">
        <p>หมายเหตุ:</p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          <li>ช่องที่มี * ต้องกรอกข้อมูล</li>
          <li>เวร (Shift): สำหรับตารางเวรนอกเวลา, เวรประจำ</li>
          <li>งานประจำ (Task): งานที่ต้องทำเป็นประจำทุกวัน/สัปดาห์/เดือน</li>
          <li>ข้อมูลจะถูกบันทึกในฐานข้อมูลและแสดงในปฏิทินทันที</li>
        </ul>
      </div>
    </form>
  );
}