'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarComponent from '../../components/CalendarComponent';
import EventForm from '../../components/EventForm';
import { CalendarEvent } from '@prisma/client';
import { 
  Calendar, 
  Plus, 
  Sparkles, 
  Clock, 
  Users, 
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Filter,
  X
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events by type
  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.type === filterType);

  // Handle event creation
  const handleCreateEvent = async (eventData: any) => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

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

  // Handle event update
  const handleUpdateEvent = async (id: string, eventData: any) => {
    try {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updatedEvent = await response.json();
      setEvents(events.map(e => (e.id === id ? updatedEvent : e)));
      setSelectedEvent(null);
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบงาน/เวรนี้หรือไม่?')) {
      return;
    }

    try {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setEvents(events.filter(e => e.id !== id));
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'shift': return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.4)', text: '#3b82f6', label: 'เวร' };
      case 'task': return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.4)', text: '#10b981', label: 'งานประจำ' };
      case 'work': return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.4)', text: '#f59e0b', label: 'งานอื่น' };
      case 'meeting': return { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.4)', text: '#8b5cf6', label: 'ประชุม' };
      case 'holiday': return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.4)', text: '#ef4444', label: 'วันหยุด' };
      default: return { bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.4)', text: '#6b7280', label: 'อื่นๆ' };
    }
  };

  // Stats
  const stats = {
    total: events.length,
    shifts: events.filter(e => e.type === 'shift').length,
    tasks: events.filter(e => e.type === 'task').length,
    meetings: events.filter(e => e.type === 'meeting').length,
    pending: events.filter(e => e.status === 'pending').length,
  };

  // Upcoming events (next 7 days)
  const upcomingEvents = events
    .filter(e => new Date(e.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 rounded-full mx-auto mb-4"
            style={{ 
              borderColor: 'rgba(102, 126, 234, 0.3)',
              borderTopColor: '#667eea'
            }}
          />
          <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>กำลังโหลดปฏิทิน...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 p-6 rounded-2xl"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(26, 26, 37, 0.9) 0%, rgba(102, 126, 234, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(102, 126, 234, 0.05) 100%)',
          border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)'}`,
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
              }}
            >
              <Calendar className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                ปฏิทินตารางงานและเวร
              </h1>
              <p style={{ color: isDark ? '#64748b' : '#64748b' }}>
                {thaiMonths[currentDate.getMonth()]} พ.ศ. {currentDate.getFullYear() + 543}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-2 flex-wrap">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <p className="text-xs" style={{ color: '#3b82f6' }}>เวร</p>
              <p className="text-lg font-bold" style={{ color: '#3b82f6' }}>{stats.shifts}</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <p className="text-xs" style={{ color: '#10b981' }}>งานประจำ</p>
              <p className="text-lg font-bold" style={{ color: '#10b981' }}>{stats.tasks}</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              <p className="text-xs" style={{ color: '#8b5cf6' }}>ประชุม</p>
              <p className="text-lg font-bold" style={{ color: '#8b5cf6' }}>{stats.meetings}</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <p className="text-xs" style={{ color: '#f59e0b' }}>รอดำเนินการ</p>
              <p className="text-lg font-bold" style={{ color: '#f59e0b' }}>{stats.pending}</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Controls */}
          <div 
            className="p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4"
            style={{
              background: isDark ? 'rgba(26, 26, 37, 0.6)' : 'rgba(255, 255, 255, 0.8)',
              border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
            }}
          >
            {/* View Toggle */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: isDark ? 'rgba(10, 10, 15, 0.5)' : 'rgba(241, 245, 249, 0.8)' }}>
              {['month', 'week', 'day'].map((v) => (
                <motion.button
                  key={v}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView(v as any)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: view === v ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                    color: view === v ? 'white' : isDark ? '#94a3b8' : '#64748b',
                  }}
                >
                  {v === 'month' ? 'เดือน' : v === 'week' ? 'สัปดาห์' : 'วัน'}
                </motion.button>
              ))}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm font-medium outline-none"
                style={{
                  background: isDark ? 'rgba(10, 10, 15, 0.5)' : 'rgba(241, 245, 249, 0.8)',
                  border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
                  color: isDark ? '#f8fafc' : '#0f172a',
                }}
              >
                <option value="all">ทุกประเภท</option>
                <option value="shift">เวร</option>
                <option value="task">งานประจำ</option>
                <option value="work">งานอื่น</option>
                <option value="meeting">ประชุม</option>
                <option value="holiday">วันหยุด</option>
              </select>
            </div>

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedEvent({} as CalendarEvent);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              }}
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">เพิ่มงาน/เวร</span>
            </motion.button>
          </div>

          {/* Calendar */}
          <motion.div
            layout
            className="rounded-2xl overflow-hidden"
            style={{
              background: isDark ? 'rgba(26, 26, 37, 0.6)' : 'rgba(255, 255, 255, 0.8)',
              border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
            }}
          >
            <CalendarComponent
              events={filteredEvents}
              view={view}
              currentDate={currentDate}
              onEventClick={handleEventClick}
              onViewChange={setView}
              onDateChange={setCurrentDate}
            />
          </motion.div>
        </motion.div>

        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Event Form or Upcoming Events */}
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl p-6"
                style={{
                  background: isDark ? 'rgba(26, 26, 37, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)'}`,
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {selectedEvent?.id ? 'แก้ไขงาน/เวร' : 'เพิ่มงาน/เวรใหม่'}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowForm(false);
                      setSelectedEvent(null);
                    }}
                    className="p-2 rounded-lg"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <X className="h-5 w-5" style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
                  </motion.button>
                </div>
                <EventForm
                  event={selectedEvent}
                  onSubmit={selectedEvent?.id ? 
                    (data) => handleUpdateEvent(selectedEvent.id, data) : 
                    handleCreateEvent}
                  onCancel={() => {
                    setShowForm(false);
                    setSelectedEvent(null);
                  }}
                  onDelete={selectedEvent?.id ? 
                    () => handleDeleteEvent(selectedEvent.id) : 
                    undefined}
                />
              </motion.div>
            ) : (
              <motion.div
                key="upcoming"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl p-6"
                style={{
                  background: isDark ? 'rgba(26, 26, 37, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)'}`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: 'rgba(102, 126, 234, 0.15)' }}
                  >
                    <Clock className="h-5 w-5" style={{ color: '#667eea' }} />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                    กำลังจะถึง
                  </h2>
                </div>

                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-4xl mb-3"
                    >
                      📅
                    </motion.div>
                    <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                      ไม่มีงานที่กำลังจะถึง
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event, index) => {
                      const typeColor = getEventTypeColor(event.type);
                      const eventDate = new Date(event.startDate);
                      
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          onClick={() => handleEventClick(event)}
                          className="p-3 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: typeColor.bg,
                            border: `1px solid ${typeColor.border}`,
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span 
                              className="text-xs font-bold px-2 py-0.5 rounded"
                              style={{ 
                                background: typeColor.border,
                                color: 'white'
                              }}
                            >
                              {typeColor.label}
                            </span>
                            <span className="text-xs" style={{ color: typeColor.text }}>
                              {eventDate.toLocaleDateString('th-TH', { 
                                day: 'numeric', 
                                month: 'short' 
                              })}
                            </span>
                          </div>
                          <h3 className="font-medium text-sm" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                            {event.title}
                          </h3>
                          {event.personName && (
                            <p className="text-xs mt-1" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                              👤 {event.personName}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl p-6"
            style={{
              background: isDark ? 'rgba(26, 26, 37, 0.8)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)'}`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-2 rounded-lg"
                style={{ background: 'rgba(139, 92, 246, 0.15)' }}
              >
                <Sparkles className="h-5 w-5" style={{ color: '#8b5cf6' }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                คำอธิบายสี
              </h2>
            </div>
            
            <div className="space-y-2">
              {[
                { type: 'shift', label: 'เวร (Shift)' },
                { type: 'task', label: 'งานประจำ (Task)' },
                { type: 'work', label: 'งานอื่น (Work)' },
                { type: 'meeting', label: 'ประชุม (Meeting)' },
                { type: 'holiday', label: 'วันหยุด (Holiday)' },
              ].map((item, index) => {
                const colors = getEventTypeColor(item.type);
                return (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center gap-3 p-2 rounded-lg"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ 
                        background: colors.text,
                        boxShadow: `0 0 8px ${colors.text}40`
                      }}
                    />
                    <span className="text-sm" style={{ color: isDark ? '#e2e8f0' : '#475569' }}>
                      {item.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Add Button Mobile */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedEvent({} as CalendarEvent);
              setShowForm(true);
            }}
            className="lg:hidden w-full flex items-center justify-center gap-2 p-4 rounded-xl font-medium text-white"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
          >
            <Plus className="h-5 w-5" />
            เพิ่มงาน/เวรใหม่
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
