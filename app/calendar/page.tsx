"use client";

import React, { useState, useEffect } from 'react';
import { CalendarComponent } from '../../components/CalendarComponent';

type TabType = 'schedule' | 'shifts' | 'leaves' | 'holidays' | 'settings';

interface WorkSchedule {
  date: string;
  workType: string;
  month: number;
  year: number;
}

interface Shift {
  date: string;
  shiftType: string;
  amount: number;
  month: number;
  year: number;
}

interface LeaveDay {
  date: string;
  leaveType: string;
  reason: string;
  month: number;
  year: number;
}

interface Holiday {
  id: string;
  date: string;
  name: string;
  isWeekend: boolean;
}

interface UserSettings {
  id?: string;
  salary: number;
  teamMembers: string[];
}

const WORK_TYPES = [
  { value: 'OPD1', label: 'OPD1', color: '#3b82f6' },
  { value: 'OPD2', label: 'OPD2', color: '#8b5cf6' },
  { value: 'OPD3', label: 'OPD3', color: '#10b981' },
  { value: 'ER', label: 'ER', color: '#f59e0b' },
  { value: 'QUE', label: 'QUE', color: '#ec4899' },
  { value: 'ลา', label: 'ลา', color: '#f97316' },
];

const SHIFT_TYPES = [
  { value: 'ชน', label: 'ชน (380 บาท)', amount: 380 },
  { value: 'บน', label: 'บน (380 บาท)', amount: 380 },
  { value: 'ชบ', label: 'ชบ (760 บาท)', amount: 760 },
  { value: 'สบ', label: 'สบ (190 บาท)', amount: 190 },
];

const LEAVE_TYPES = [
  { value: 'ลาป่วย', label: 'ลาป่วย' },
  { value: 'ลากิจ', label: 'ลากิจ' },
  { value: 'ลาพักร้อน', label: 'ลาพักร้อน' },
];

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  
  // Data
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [leaves, setLeaves] = useState<LeaveDay[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ salary: 0, teamMembers: [] });
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [showDayModal, setShowDayModal] = useState(false);
  const [newMember, setNewMember] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const thaiYear = currentYear + 543;

  // Fetch data when month/year changes
  const [refetchKey, setRefetchKey] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetch(`/api/work-schedule?month=${currentMonth}&year=${currentYear}`),
      fetch(`/api/shifts?month=${currentMonth}&year=${currentYear}`),
      fetch(`/api/leaves?month=${currentMonth}&year=${currentYear}`),
      fetch(`/api/holidays?year=${currentYear}&autoWeekends=true`),
      fetch('/api/user-settings'),
    ]).then(async ([scheduleRes, shiftRes, leaveRes, holidayRes, settingsRes]) => {
      if (cancelled) return;
      if (scheduleRes.ok) setWorkSchedules(await scheduleRes.json());
      if (shiftRes.ok) setShifts(await shiftRes.json());
      if (leaveRes.ok) setLeaves(await leaveRes.json());
      if (holidayRes.ok) setHolidays(await holidayRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
      setLoading(false);
    }).catch(e => {
      console.error('Fetch error:', e);
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, currentYear, refetchKey]);

  // Seed holidays once (only if none exist)
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (seeded) return;
    setSeeded(true);
    fetch('/api/holidays', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: thaiYear }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers
  const getDateData = (dateStr: string) => {
    const schedule = workSchedules.find(s => s.date === dateStr);
    const shift = shifts.find(s => s.date === dateStr);
    const leave = leaves.find(l => l.date === dateStr);
    const holiday = holidays.find(h => h.date === dateStr);
    return { schedule, shift, leave, holiday };
  };

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  // API calls
  const saveWorkSchedule = async (date: string, workType: string) => {
    const month = new Date(date).getMonth() + 1;
    const year = new Date(date).getFullYear();
    const res = await fetch('/api/work-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, workType, month, year }),
    });
    if (res.ok) setRefetchKey(k => k + 1);
  };

  const saveShift = async (date: string, shiftType: string) => {
    const month = new Date(date).getMonth() + 1;
    const year = new Date(date).getFullYear();
    const res = await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, shiftType, month, year }),
    });
    if (res.ok) setRefetchKey(k => k + 1);
  };

  const saveLeave = async (date: string, leaveType: string, reason: string) => {
    const month = new Date(date).getMonth() + 1;
    const year = new Date(date).getFullYear();
    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, leaveType, reason, month, year }),
    });
    if (res.ok) setRefetchKey(k => k + 1);
  };

  const deleteSchedule = async (date: string) => {
    await fetch(`/api/work-schedule?date=${date}`, { method: 'DELETE' });
    setRefetchKey(k => k + 1);
  };

  const deleteShift = async (date: string) => {
    await fetch(`/api/shifts?date=${date}`, { method: 'DELETE' });
    setRefetchKey(k => k + 1);
  };

  const deleteLeave = async (date: string) => {
    await fetch(`/api/leaves?date=${date}`, { method: 'DELETE' });
    setRefetchKey(k => k + 1);
  };

  const saveHoliday = async (date: string, name: string) => {
    const res = await fetch('/api/holidays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, name, isWeekend: false }),
    });
    if (res.ok) setRefetchKey(k => k + 1);
  };

  const deleteHoliday = async (date: string) => {
    await fetch(`/api/holidays?date=${date}`, { method: 'DELETE' });
    setRefetchKey(k => k + 1);
  };

  const saveSettings = async (data: Partial<UserSettings>) => {
    const res = await fetch('/api/user-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setSettings(updated);
    }
  };

  // Day modal handler
  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowDayModal(true);
  };

  // Calendar badges for each day
  const getDayBadges = (dateStr: string) => {
    const { schedule, shift, leave, holiday } = getDateData(dateStr);
    const badges: { text: string; color: string }[] = [];
    if (schedule) {
      const wt = WORK_TYPES.find(w => w.value === schedule.workType);
      badges.push({ text: schedule.workType, color: wt?.color || '#6b7280' });
    }
    if (shift) {
      badges.push({ text: shift.shiftType, color: '#34d399' });
    }
    if (leave) {
      badges.push({ text: 'ลา', color: '#f97316' });
    }
    if (holiday && !holiday.isWeekend) {
      if (holiday.name.includes('นักขัตฤกษ์')) {
        badges.push({ text: 'PH', color: '#ef4444' });
      } else {
        badges.push({ text: 'H', color: '#ef4444' });
      }
    }
    return badges;
  };

  // Tabs
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'schedule', label: 'ตารางเวร', icon: '📅' },
    { id: 'shifts', label: 'เข้าเวร', icon: '⏰' },
    { id: 'leaves', label: 'ลา', icon: '🏖️' },
    { id: 'holidays', label: 'วันหยุด', icon: '🎌' },
    { id: 'settings', label: 'ตั้งค่า', icon: '⚙️' },
  ];

  if (loading && !workSchedules.length) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-gray-500">กำลังโหลด...</div></div>;
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateMonth(-1)} className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow hover:bg-gray-100">{'< เดือนก่อน'}</button>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {THAI_MONTHS[currentDate.getMonth()]} {thaiYear}
          </h2>
          <button onClick={() => navigateMonth(1)} className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow hover:bg-gray-100">เดือนถัด {'>'}</button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="max-w-2xl mx-auto">
        <CalendarComponent
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
          getDayBadges={getDayBadges}
        />
      </div>

      {/* Day Detail Modal */}
      {showDayModal && selectedDate && (
        <DayModal
          date={selectedDate}
          data={getDateData(selectedDate)}
          workTypes={WORK_TYPES}
          shiftTypes={SHIFT_TYPES}
          leaveTypes={LEAVE_TYPES}
          onClose={() => setShowDayModal(false)}
          onSaveWork={(type) => { saveWorkSchedule(selectedDate, type); }}
          onDeleteWork={() => { deleteSchedule(selectedDate); }}
          onSaveShift={(type) => { saveShift(selectedDate, type); }}
          onDeleteShift={() => { deleteShift(selectedDate); }}
          onSaveLeave={(type, reason) => { saveLeave(selectedDate, type, reason); }}
          onDeleteLeave={() => { deleteLeave(selectedDate); }}
        />
      )}

      {/* Tab Content */}
      <div className="max-w-2xl mx-auto mt-4">
        {/* Schedule tab */}
        {activeTab === 'schedule' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
            <h3 className="text-lg font-bold mb-3">ตารางเวร {THAI_MONTHS[currentDate.getMonth()]} {thaiYear}</h3>
            {workSchedules.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีตารางเวร — กดที่วันในปฏิทินเพื่อตั้งค่า</p>
            ) : (
              <div className="space-y-2">
                {workSchedules.map(s => (
                  <div key={s.date} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <span className="font-medium">{s.date}</span>
                      <span className="ml-2 text-sm" style={{ color: WORK_TYPES.find(w => w.value === s.workType)?.color }}>{s.workType}</span>
                    </div>
                    <button onClick={() => deleteSchedule(s.date)} className="text-red-500 hover:text-red-700">ลบ</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shifts tab */}
        {activeTab === 'shifts' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
            <h3 className="text-lg font-bold mb-3">เข้าเวร {THAI_MONTHS[currentDate.getMonth()]} {thaiYear}</h3>
            {shifts.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีรายการเข้าเวร — กดที่วันในปฏิทินเพื่อตั้งค่า</p>
            ) : (
              <div className="space-y-2">
                {shifts.map(s => (
                  <div key={s.date} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <span className="font-medium">{s.date}</span>
                      <span className="ml-2 text-sm text-green-600">{s.shiftType}</span>
                      <span className="ml-2 text-sm text-gray-500">+{s.amount} บาท</span>
                    </div>
                    <button onClick={() => deleteShift(s.date)} className="text-red-500 hover:text-red-700">ลบ</button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <span className="font-bold">รวมค่าเวรเดือนนี้</span>
              <span className="text-xl font-bold text-green-600">{shifts.reduce((sum, s) => sum + s.amount, 0).toLocaleString()} บาท</span>
            </div>
          </div>
        )}

        {/* Leaves tab */}
        {activeTab === 'leaves' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
            <h3 className="text-lg font-bold mb-3">วันลา {THAI_MONTHS[currentDate.getMonth()]} {thaiYear}</h3>
            {leaves.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีรายการลา — กดที่วันในปฏิทินเพื่อตั้งค่า</p>
            ) : (
              <div className="space-y-2">
                {leaves.map(l => (
                  <div key={l.date} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <span className="font-medium">{l.date}</span>
                      <span className="ml-2 text-sm text-orange-600">{l.leaveType}</span>
                      {l.reason && <span className="ml-2 text-sm text-gray-500">({l.reason})</span>}
                    </div>
                    <button onClick={() => deleteLeave(l.date)} className="text-red-500 hover:text-red-700">ลบ</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'holidays' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
            <h3 className="text-lg font-bold mb-3">วันหยุด {thaiYear}</h3>
            <div className="space-y-1">
              {holidays.filter(h => !h.isWeekend).map(h => {
                const isPublicHoliday = h.name.includes('นักขัตฤกษ์');
                return (
                  <div key={h.date} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <span className="font-medium">{h.date}</span>
                      <span className="ml-2">{h.name}</span>
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded font-bold ${
                        isPublicHoliday ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isPublicHoliday ? 'PH' : 'H'}
                      </span>
                    </div>
                    <button onClick={() => deleteHoliday(h.date)} className="text-red-500 hover:text-red-700">ลบ</button>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <input
                type="date"
                className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
                id="newHolidayDate"
              />
              <input
                type="text"
                placeholder="ชื่อวันหยุด"
                className="border rounded px-2 py-1 flex-1 min-w-[120px] dark:bg-gray-700 dark:border-gray-600"
                value={newHolidayName}
                onChange={e => setNewHolidayName(e.target.value)}
              />
              <select id="newHolidayType" className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600">
                <option value="H">H วันหยุดราชการ</option>
                <option value="PH">PH นักขัตฤกษ์</option>
              </select>
              <button
                onClick={() => {
                  const dateEl = document.getElementById('newHolidayDate') as HTMLInputElement;
                  const typeEl = document.getElementById('newHolidayType') as HTMLSelectElement;
                  if (dateEl?.value && newHolidayName) {
                    const name = typeEl.value === 'PH' ? `${newHolidayName} (นักขัตฤกษ์)` : newHolidayName;
                    saveHoliday(dateEl.value, name);
                    setNewHolidayName('');
                  }
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                เพิ่ม
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
            <h3 className="text-lg font-bold mb-3">ตั้งค่า</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">เงินเดือน (บาท)</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                  value={settings.salary}
                  onChange={e => saveSettings({ salary: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">สมาชิกในทีม</label>
                <div className="space-y-1">
                  {settings.teamMembers.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span>{m}</span>
                      <button
                        onClick={() => saveSettings({ teamMembers: settings.teamMembers.filter((_, j) => j !== i) })}
                        className="text-red-500 hover:text-red-700"
                      >
                        ลบ
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="flex-1 border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="ชื่อสมาชิกใหม่"
                    value={newMember}
                    onChange={e => setNewMember(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      if (newMember.trim()) {
                        saveSettings({ teamMembers: [...settings.teamMembers, newMember.trim()] });
                        setNewMember('');
                      }
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    เพิ่ม
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Day Modal Component
function DayModal({ date, data, workTypes, shiftTypes, leaveTypes, onClose, onSaveWork, onDeleteWork, onSaveShift, onDeleteShift, onSaveLeave, onDeleteLeave }: {
  date: string;
  data: any;
  workTypes: any[];
  shiftTypes: any[];
  leaveTypes: any[];
  onClose: () => void;
  onSaveWork: (type: string) => void;
  onDeleteWork: () => void;
  onSaveShift: (type: string) => void;
  onDeleteShift: () => void;
  onSaveLeave: (type: string, reason: string) => void;
  onDeleteLeave: () => void;
}) {
  const [selectedWork, setSelectedWork] = useState(data.schedule?.workType || '');
  const [selectedShift, setSelectedShift] = useState(data.shift?.shiftType || '');
  const [selectedLeave, setSelectedLeave] = useState(data.leave?.leaveType || '');
  const [leaveReason, setLeaveReason] = useState(data.leave?.reason || '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 max-w-md w-full max-h-[80vh] overflow-y-auto" dir="rtl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{date}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Work Type */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">ประเภทเวร</h4>
          <div className="grid grid-cols-2 gap-2">
            {workTypes.map((wt: any) => (
              <button
                key={wt.value}
                onClick={() => { setSelectedWork(wt.value); onSaveWork(wt.value); }}
                className={`p-2 rounded-lg border-2 transition text-sm ${
                  selectedWork === wt.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
                style={{ backgroundColor: selectedWork === wt.value ? wt.color + '20' : undefined }}
              >
                <span style={{ color: wt.color }} className="font-bold">{wt.value}</span>
                <span className="text-xs block text-gray-500">{wt.label}</span>
              </button>
            ))}
          </div>
          {data.schedule && (
            <button onClick={onDeleteWork} className="mt-2 text-sm text-red-500 hover:text-red-700">ลบประเภทเวร</button>
          )}
        </div>

        {/* Shift Type */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">เข้าเวร</h4>
          <div className="grid grid-cols-2 gap-2">
            {shiftTypes.map((st: any) => (
              <button
                key={st.value}
                onClick={() => { setSelectedShift(st.value); onSaveShift(st.value); }}
                className={`p-2 rounded-lg border-2 transition text-sm ${
                  selectedShift === st.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="font-bold">{st.value}</span>
                <span className="text-xs block text-gray-500">{st.amount} บาท</span>
              </button>
            ))}
          </div>
          {data.shift && (
            <button onClick={onDeleteShift} className="mt-2 text-sm text-red-500 hover:text-red-700">ลบเข้าเวร</button>
          )}
        </div>

        {/* Leave */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">ลา</h4>
          <div className="grid grid-cols-3 gap-2">
            {leaveTypes.map((lt: any) => (
              <button
                key={lt.value}
                onClick={() => {
                  setSelectedLeave(lt.value);
                  onSaveLeave(lt.value, leaveReason);
                }}
                className={`p-2 rounded-lg border-2 transition text-sm ${
                  selectedLeave === lt.value
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                {lt.label}
              </button>
            ))}
          </div>
          {selectedLeave && (
            <input
              type="text"
              className="w-full mt-2 border rounded px-3 py-1 text-sm dark:bg-gray-700 dark:border-gray-600"
              placeholder="เหตุผล (ถ้ามี)"
              value={leaveReason}
              onChange={e => { setLeaveReason(e.target.value); onSaveLeave(selectedLeave, e.target.value); }}
            />
          )}
          {data.leave && (
            <button onClick={onDeleteLeave} className="mt-2 text-sm text-red-500 hover:text-red-700">ลบลางาน</button>
          )}
        </div>
      </div>
    </div>
  );
}
