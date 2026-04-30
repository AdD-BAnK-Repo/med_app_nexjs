'use client';

import { useState } from 'react';
import { CalendarEvent } from '@prisma/client';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, X } from 'lucide-react';

interface CalendarComponentProps {
  events: CalendarEvent[];
  view: 'month' | 'week' | 'day';
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onDateChange: (date: Date) => void;
  isDark: boolean;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const DAY_NAMES_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const EVENT_COLORS: Record<string, { bg: string; bgDark: string; border: string; text: string; dot: string }> = {
  shift:    { bg: 'rgba(59,130,246,0.1)',  bgDark: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.4)',  text: '#3b82f6', dot: '#3b82f6' },
  task:     { bg: 'rgba(16,185,129,0.1)',  bgDark: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.4)',  text: '#10b981', dot: '#10b981' },
  work:     { bg: 'rgba(245,158,11,0.1)',  bgDark: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.4)',  text: '#f59e0b', dot: '#f59e0b' },
  meeting:  { bg: 'rgba(139,92,246,0.1)',  bgDark: 'rgba(139,92,246,0.15)',  border: 'rgba(139,92,246,0.4)',  text: '#8b5cf6', dot: '#8b5cf6' },
  holiday:  { bg: 'rgba(239,68,68,0.1)',   bgDark: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   text: '#ef4444', dot: '#ef4444' },
};

const DEFAULT_COLOR = { bg: 'rgba(107,114,128,0.1)', bgDark: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.4)', text: '#6b7280', dot: '#6b7280' };

function getEventColor(type: string) {
  return EVENT_COLORS[type] || DEFAULT_COLOR;
}

export default function CalendarComponent({
  events, view, currentDate, onEventClick, onViewChange, onDateChange, isDark
}: CalendarComponentProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
  const [showDaySheet, setShowDaySheet] = useState(false);
  const [sheetDate, setSheetDate] = useState<Date | null>(null);
  const [sheetEvents, setSheetEvents] = useState<CalendarEvent[]>([]);

  const navigate = (dir: -1 | 0 | 1) => {
    const d = new Date(selectedDate);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setSelectedDate(d);
    onDateChange(d);
  };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter(e => {
      const ed = new Date(e.startDate);
      return ed.getDate() === date!.getDate() && ed.getMonth() === date!.getMonth() && ed.getFullYear() === date!.getFullYear();
    });
  };

  const isToday = (d: Date | null) => {
    if (!d) return false;
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const openDaySheet = (date: Date) => {
    setSheetDate(date);
    setSheetEvents(getEventsForDate(date));
    setShowDaySheet(true);
  };

  // ─── Month View ───
  const renderMonthView = () => {
    const days = getDaysInMonth();
    const cardBg = isDark ? 'rgba(26,26,37,0.6)' : 'rgba(255,255,255,0.8)';
    const borderColor = isDark ? 'rgba(102,126,234,0.15)' : 'rgba(102,126,234,0.1)';
    const textColor = isDark ? '#e2e8f0' : '#475569';
    const mutedText = isDark ? '#475569' : '#cbd5e1';

    return (
      <>
        {/* Day name header */}
        <div className="grid grid-cols-7" style={{ borderBottom: `1px solid ${borderColor}` }}>
          {DAY_NAMES_SHORT.map((d, i) => (
            <div key={i} className="py-2 text-center text-[11px] font-semibold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {days.map((date, idx) => {
            const today = isToday(date);
            const dayEvts = getEventsForDate(date);
            const cellBg = today
              ? (isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.06)')
              : (!date ? 'transparent' : 'transparent');

            return (
              <div
                key={idx}
                onClick={() => date && openDaySheet(date)}
                className="border cursor-pointer transition-colors hover:brightness-110"
                style={{
                  borderColor,
                  background: cellBg,
                  minHeight: 'clamp(48px, 12vw, 100px)',
                }}
              >
                {date && (
                  <div className="flex flex-col h-full p-0.5 sm:p-1">
                    {/* Date number */}
                    <div className="flex justify-between items-center mb-0.5">
                      <span
                        className={`text-[11px] sm:text-sm font-semibold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center ${today ? 'sm:font-bold' : ''}`}
                        style={{
                          color: today ? '#3b82f6' : textColor,
                          background: today ? (isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)') : 'transparent',
                        }}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    {/* Desktop: event pills */}
                    <div className="hidden sm:block space-y-0.5 overflow-hidden flex-1">
                      {dayEvts.slice(0, 3).map(evt => {
                        const c = getEventColor(evt.type);
                        return (
                          <div
                            key={evt.id}
                            className="text-[10px] px-1 py-0.5 rounded truncate cursor-pointer"
                            style={{ background: c.bg, borderLeft: `2px solid ${c.text}`, color: c.text }}
                            onClick={e => { e.stopPropagation(); onEventClick(evt); }}
                          >
                            {evt.title}
                          </div>
                        );
                      })}
                      {dayEvts.length > 3 && (
                        <div className="text-[10px] text-center" style={{ color: mutedText }}>
                          +{dayEvts.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Mobile: event dots */}
                    <div className="sm:hidden flex flex-wrap gap-0.5 mt-0.5 justify-center">
                      {dayEvts.slice(0, 4).map(evt => (
                        <div
                          key={evt.id}
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: getEventColor(evt.type).dot }}
                        />
                      ))}
                      {dayEvts.length > 4 && (
                        <span className="text-[8px]" style={{ color: mutedText }}>+</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // ─── Week View ───
  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
    const cardBg = isDark ? 'rgba(26,26,37,0.6)' : 'rgba(255,255,255,0.8)';
    const borderColor = isDark ? 'rgba(102,126,234,0.15)' : 'rgba(102,126,234,0.1)';
    const textColor = isDark ? '#e2e8f0' : '#1e293b';

    return (
      <div style={{ background: cardBg }}>
        {/* Header row */}
        <div className="grid grid-cols-7" style={{ borderBottom: `1px solid ${borderColor}` }}>
          {days.map((d, i) => {
            const today = isToday(d);
            return (
              <div key={i} className="py-2 text-center" style={{ background: today ? (isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.06)') : 'transparent' }}>
                <div className="text-[10px] sm:text-xs font-semibold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  <span className="hidden sm:inline">{DAY_NAMES_SHORT[d.getDay()]}</span>
                  <span className="sm:hidden">{DAY_NAMES_SHORT[d.getDay()].charAt(0)}</span>
                </div>
                <div className={`text-sm sm:text-lg font-bold ${today ? '' : ''}`} style={{ color: today ? '#3b82f6' : textColor }}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Events list per day */}
        <div className="p-2 sm:p-4 space-y-4">
          {days.map((d, i) => {
            const dayEvts = getEventsForDate(d);
            return (
              <div key={i}>
                <div className="text-xs font-semibold mb-2" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  {d.getDate()} {THAI_MONTHS[d.getMonth()]} {d.getFullYear() + 543}
                </div>
                {dayEvts.length > 0 ? (
                  <div className="space-y-2">
                    {dayEvts.map(evt => {
                      const c = getEventColor(evt.type);
                      return (
                        <div
                          key={evt.id}
                          onClick={() => onEventClick(evt)}
                          className="p-2 sm:p-3 rounded-xl cursor-pointer"
                          style={{ background: isDark ? c.bgDark : c.bg, border: `1px solid ${c.border}` }}
                        >
                          <div className="font-medium text-sm" style={{ color: c.text }}>{evt.title}</div>
                          {evt.description && <div className="text-xs mt-1" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{evt.description}</div>}
                          {evt.personName && <div className="text-xs mt-1">👤 {evt.personName}</div>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs py-2" style={{ color: isDark ? '#475569' : '#cbd5e1' }}>ไม่มีงาน</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Day View ───
  const renderDayView = () => {
    const dayEvts = getEventsForDate(selectedDate);
    const cardBg = isDark ? 'rgba(26,26,37,0.6)' : 'rgba(255,255,255,0.8)';
    const textColor = isDark ? '#e2e8f0' : '#1e293b';

    return (
      <div style={{ background: cardBg }} className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: textColor }}>
          {selectedDate.getDate()} {THAI_MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear() + 543}
        </h2>
        {dayEvts.length > 0 ? (
          <div className="space-y-3">
            {dayEvts.map(evt => {
              const c = getEventColor(evt.type);
              return (
                <div
                  key={evt.id}
                  onClick={() => onEventClick(evt)}
                  className="p-3 sm:p-4 rounded-xl cursor-pointer"
                  style={{ background: isDark ? c.bgDark : c.bg, border: `1px solid ${c.border}` }}
                >
                  <div className="font-bold text-base sm:text-lg" style={{ color: c.text }}>{evt.title}</div>
                  {evt.description && <div className="text-sm mt-1" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{evt.description}</div>}
                  {evt.personName && <div className="text-sm mt-2">👤 {evt.personName}</div>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📅</div>
            <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>ไม่มีงานหรือเวรในวันนี้</p>
          </div>
        )}
      </div>
    );
  };

  // ─── Bottom Sheet (Day Detail on Mobile) ───
  const renderDaySheet = () => {
    if (!showDaySheet || !sheetDate) return null;
    const cardBg = isDark ? '#1e1e2e' : '#ffffff';
    const textColor = isDark ? '#e2e8f0' : '#1e293b';
    const borderColor = isDark ? 'rgba(102,126,234,0.2)' : 'rgba(102,126,234,0.15)';

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowDaySheet(false)}
        />
        {/* Sheet */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden"
          style={{
            background: cardBg,
            maxHeight: '75vh',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
          }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full" style={{ background: isDark ? '#475569' : '#cbd5e1' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
            <div>
              <h3 className="text-lg font-bold" style={{ color: textColor }}>
                {sheetDate.getDate()} {THAI_MONTHS[sheetDate.getMonth()]} {sheetDate.getFullYear() + 543}
              </h3>
              <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                {sheetEvents.length} รายการ
              </p>
            </div>
            <button onClick={() => setShowDaySheet(false)} className="p-2 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              <X className="h-5 w-5" style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
            </button>
          </div>

          {/* Events */}
          <div className="overflow-y-auto px-5 py-4 space-y-3" style={{ maxHeight: '55vh' }}>
            {sheetEvents.length > 0 ? sheetEvents.map(evt => {
              const c = getEventColor(evt.type);
              return (
                <div
                  key={evt.id}
                  onClick={() => { setShowDaySheet(false); onEventClick(evt); }}
                  className="p-3 rounded-xl cursor-pointer"
                  style={{ background: isDark ? c.bgDark : c.bg, border: `1px solid ${c.border}` }}
                >
                  <div className="font-medium text-sm" style={{ color: c.text }}>{evt.title}</div>
                  {evt.description && <div className="text-xs mt-1" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{evt.description}</div>}
                  {evt.personName && <div className="text-xs mt-1">👤 {evt.personName}</div>}
                </div>
              );
            }) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">📅</div>
                <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>ไม่มีงานในวันนี้</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const cardBg = isDark ? 'rgba(26,26,37,0.6)' : 'rgba(255,255,255,0.8)';

  return (
    <div className="space-y-4">
      {/* Navigation bar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl sm:rounded-2xl" style={{ background: cardBg, border: `1px solid ${isDark ? 'rgba(102,126,234,0.15)' : 'rgba(102,126,234,0.1)'}` }}>
        {/* Left: prev/today/next */}
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(-1)} className="p-1.5 sm:p-2 rounded-lg transition-colors" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: isDark ? '#e2e8f0' : '#334155' }} />
          </button>
          <button onClick={() => navigate(0)} className="px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-sm rounded-lg font-medium transition-colors" style={{ background: isDark ? 'rgba(102,126,234,0.15)' : 'rgba(102,126,234,0.1)', color: '#667eea' }}>
            วันนี้
          </button>
          <button onClick={() => navigate(1)} className="p-1.5 sm:p-2 rounded-lg transition-colors" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: isDark ? '#e2e8f0' : '#334155' }} />
          </button>
        </div>

        {/* Month/year title */}
        <div className="text-xs sm:text-lg font-bold truncate px-2" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
          <span className="hidden sm:inline">{THAI_MONTHS[selectedDate.getMonth()]} </span>{THAI_MONTHS[selectedDate.getMonth()].slice(0, 3)} {selectedDate.getFullYear() + 543}
        </div>

        {/* View toggle */}
        <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: isDark ? 'rgba(10,10,15,0.5)' : 'rgba(241,245,249,0.8)' }}>
          {([['month', '📅'], ['week', '📆'], ['day', '☀️']] as const).map(([v, icon]) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all ${view === v ? 'shadow-sm' : ''}`}
              style={{
                background: view === v ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                color: view === v ? 'white' : (isDark ? '#94a3b8' : '#64748b'),
              }}
            >
              <span className="sm:hidden">{icon}</span>
              <span className="hidden sm:inline">{v === 'month' ? 'เดือน' : v === 'week' ? 'สัปดาห์' : 'วัน'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar body */}
      <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${isDark ? 'rgba(102,126,234,0.15)' : 'rgba(102,126,234,0.1)'}` }}>
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>

      {/* Day detail bottom sheet */}
      {renderDaySheet()}
    </div>
  );
}
