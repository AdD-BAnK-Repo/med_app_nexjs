'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarComponent from '../../components/CalendarComponent';
import EventForm from '../../components/EventForm';
import { CalendarEvent } from '@prisma/client';
import { 
  Calendar, Plus, Clock, Users, CheckCircle2, AlertCircle,
  LayoutGrid, List, Filter, X
} from 'lucide-react';
import { useTheme } from '../components/ThemeContext';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.type === filterType);

  const handleCreateEvent = async (eventData: any) => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error('Failed to create event');
      const newEvent = await response.json();
      setEvents([...events, newEvent]);
      setShowForm(false);
      setSelectedEvent(null);
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      return false;
    }
  };

  const handleUpdateEvent = async (id: string, eventData: any) => {
    try {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error('Failed to update event');
      const updatedEvent = await response.json();
      setEvents(events.map(e => (e.id === id ? updatedEvent : e)));
      setSelectedEvent(null);
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบงาน/เวรนี้หรือไม่?')) return;
    try {
      const response = await fetch(`/api/calendar/events/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete event');
      setEvents(events.filter(e => e.id !== id));
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'shift': return { bg: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.4)', text: '#3b82f6', label: 'เวร' };
      case 'task': return { bg: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.4)', text: '#10b981', label: 'งานประจำ' };
      case 'work': return { bg: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.4)', text: '#f59e0b', label: 'งานอื่น' };
      case 'meeting': return { bg: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.4)', text: '#8b5cf6', label: 'ประชุม' };
      case 'holiday': return { bg: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.4)', text: '#ef4444', label: 'วันหยุด' };
      default: return { bg: isDark ? 'rgba(107,114,128,0.15)' : 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.4)', text: '#6b7280', label: 'อื่นๆ' };
    }
  };

  const stats = {
    total: events.length,
    shifts: events.filter(e => e.type === 'shift').length,
    tasks: events.filter(e => e.type === 'task').length,
    meetings: events.filter(e => e.type === 'meeting').length,
    pending: events.filter(e => e.status === 'pending').length,
  };

  const upcomingEvents = events
    .filter(e => new Date(e.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const cardBg = isDark ? 'rgba(26,26,37,0.8)' : 'rgba(255,255,255,0.95)';
  const cardBorder = isDark ? 'rgba(102,126,234,0.3)' : 'rgba(102,126,234,0.2)';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const pageBg = isDark
    ? 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)';

  const filterTypes = [
    { value: 'all', label: 'ทุกประเภท', icon: '📋' },
    { value: 'shift', label: 'เวร', icon: '🏥' },
    { value: 'task', label: 'งานประจำ', icon: '✅' },
    { value: 'work', label: 'งานอื่น', icon: '📝' },
    { value: 'meeting', label: 'ประชุม', icon: '🤝' },
    { value: 'holiday', label: 'วันหยุด', icon: '🏖️' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: pageBg }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 rounded-full mx-auto mb-4"
            style={{ borderColor: 'rgba(102,126,234,0.3)', borderTopColor: '#667eea' }}
          />
          <p style={{ color: mutedColor }}>กำลังโหลดปฏิทิน...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 px-3 sm:px-6" style={{ background: pageBg }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="mb-4 sm:mb-6 p-4 sm:p-6 rounded-2xl"
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05, rotate: 5 }}
              className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 25px rgba(102,126,234,0.4)' }}
            >
              <Calendar className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: textColor }}>ปฏิทินตารางงานและเวร</h1>
              <p style={{ color: mutedColor }} className="text-xs sm:text-sm">
                {thaiMonths[currentDate.getMonth()]} พ.ศ. {currentDate.getFullYear() + 543}
              </p>
            </div>
          </div>

          {/* Stats pills - horizontal scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {[
              { label: 'เวร', value: stats.shifts, color: '#3b82f6' },
              { label: 'งานประจำ', value: stats.tasks, color: '#10b981' },
              { label: 'ประชุม', value: stats.meetings, color: '#8b5cf6' },
              { label: 'รอดำเนินการ', value: stats.pending, color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg flex-shrink-0"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}40` }}
              >
                <p className="text-[10px] sm:text-xs" style={{ color: s.color }}>{s.label}</p>
                <p className="text-base sm:text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-3 sm:space-y-4"
        >
          {/* Controls bar */}
          <div className="p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            {/* Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0"
                style={{ background: isDark ? 'rgba(10,10,15,0.5)' : 'rgba(241,245,249,0.8)', border: `1px solid ${isDark ? 'rgba(102,126,234,0.2)' : 'rgba(102,126,234,0.15)'}`, color: mutedColor }}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {filterType === 'all' ? 'ทุกประเภท' : filterTypes.find(f => f.value === filterType)?.label}
                </span>
              </button>
              {/* Active filter badge */}
              {filterType !== 'all' && (
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(102,126,234,0.15)', color: '#667eea' }}>
                  {filterTypes.find(f => f.value === filterType)?.label}
                  <button onClick={() => setFilterType('all')} className="ml-1">×</button>
                </span>
              )}
            </div>

            {/* Add button */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { setSelectedEvent({} as CalendarEvent); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102,126,234,0.4)' }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">เพิ่มงาน/เวร</span>
              <span className="sm:hidden">เพิ่ม</span>
            </motion.button>
          </div>

          {/* Filter dropdown */}
          <AnimatePresence>
            {showFilter && (
              <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }}
                className="rounded-xl overflow-hidden p-3" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {filterTypes.map(ft => (
                    <button key={ft.value} onClick={() => { setFilterType(ft.value); setShowFilter(false); }}
                      className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${filterType === ft.value ? 'scale-105' : ''}`}
                      style={{
                        background: filterType === ft.value ? 'linear-gradient(135deg, #667eea, #764ba2)' : (isDark ? 'rgba(10,10,15,0.5)' : 'rgba(241,245,249,0.8)'),
                        color: filterType === ft.value ? 'white' : mutedColor,
                      }}
                    >
                      <span className="mr-1">{ft.icon}</span>{ft.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Calendar */}
          <motion.div layout
            className="rounded-xl sm:rounded-2xl overflow-hidden"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <CalendarComponent
              events={filteredEvents}
              view={view}
              currentDate={currentDate}
              onEventClick={handleEventClick}
              onViewChange={setView}
              onDateChange={setCurrentDate}
              isDark={isDark}
            />
          </motion.div>
        </motion.div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div key="form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl p-4 sm:p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base sm:text-lg font-bold" style={{ color: textColor }}>
                    {selectedEvent?.id ? 'แก้ไขงาน/เวร' : 'เพิ่มงาน/เวรใหม่'}
                  </h2>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => { setShowForm(false); setSelectedEvent(null); }}
                    className="p-2 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                  >
                    <X className="h-5 w-5" style={{ color: mutedColor }} />
                  </motion.button>
                </div>
                <EventForm
                  event={selectedEvent}
                  onSubmit={selectedEvent?.id ? (data) => handleUpdateEvent(selectedEvent.id, data) : handleCreateEvent}
                  onCancel={() => { setShowForm(false); setSelectedEvent(null); }}
                  onDelete={selectedEvent?.id ? () => handleDeleteEvent(selectedEvent.id) : undefined}
                />
              </motion.div>
            ) : (
              <motion.div key="upcoming" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl p-4 sm:p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(102,126,234,0.15)' }}>
                    <Clock className="h-5 w-5" style={{ color: '#667eea' }} />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold" style={{ color: textColor }}>กำลังจะถึง</h2>
                </div>

                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl mb-3">📅</motion.div>
                    <p style={{ color: mutedColor }} className="text-sm">ไม่มีงานที่กำลังจะถึง</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingEvents.map((event, index) => {
                      const typeColor = getEventTypeColor(event.type);
                      const eventDate = new Date(event.startDate);
                      return (
                        <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          onClick={() => handleEventClick(event)}
                          className="p-2.5 sm:p-3 rounded-xl cursor-pointer"
                          style={{ background: typeColor.bg, border: `1px solid ${typeColor.border}` }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded"
                              style={{ background: typeColor.border, color: 'white' }}
                            >
                              {typeColor.label}
                            </span>
                            <span className="text-[10px] sm:text-xs" style={{ color: typeColor.text }}>
                              {eventDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <h3 className="font-medium text-xs sm:text-sm" style={{ color: textColor }}>{event.title}</h3>
                          {event.personName && <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: mutedColor }}>👤 {event.personName}</p>}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl p-4 sm:p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(139,92,246,0.15)' }}>
                <LayoutGrid className="h-4 w-4" style={{ color: '#8b5cf6' }} />
              </div>
              <h2 className="text-sm sm:text-lg font-bold" style={{ color: textColor }}>คำอธิบายสี</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'shift', label: 'เวร' },
                { type: 'task', label: 'งานประจำ' },
                { type: 'work', label: 'งานอื่น' },
                { type: 'meeting', label: 'ประชุม' },
                { type: 'holiday', label: 'วันหยุด' },
              ].map((item) => {
                const colors = getEventTypeColor(item.type);
                return (
                  <div key={item.type} className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                  >
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: colors.text }} />
                    <span className="text-xs" style={{ color: isDark ? '#e2e8f0' : '#475569' }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
