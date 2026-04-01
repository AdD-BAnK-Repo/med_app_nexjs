'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent } from '@prisma/client';

interface CalendarComponentProps {
  events: CalendarEvent[];
  view: 'month' | 'week' | 'day';
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onDateChange: (date: Date) => void;
}

export default function CalendarComponent({
  events,
  view,
  currentDate,
  onEventClick,
  onEventDrop,
  onViewChange,
  onDateChange,
}: CalendarComponentProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);

  // Navigate to previous month/week/day
  const navigatePrevious = () => {
    const newDate = new Date(selectedDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  // Navigate to next month/week/day
  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  // Navigate to today
  const navigateToday = () => {
    const today = new Date();
    setSelectedDate(today);
    onDateChange(today);
  };

  // Get month name in Thai
  const getMonthName = (date: Date) => {
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return months[date.getMonth()];
  };

  // Generate days in month
  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push(date);
    }

    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Get color for event type
  const getEventColor = (type: string) => {
    switch (type) {
      case 'shift': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'task': return 'bg-green-100 border-green-300 text-green-800';
      case 'work': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'meeting': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'holiday': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  // Render month view
  const renderMonthView = () => {
    const days = getDaysInMonth();
    const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {dayNames.map((day, index) => (
            <div key={index} className="py-3 text-center font-semibold text-gray-700">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const isToday = date && 
              date.getDate() === new Date().getDate() && 
              date.getMonth() === new Date().getMonth() && 
              date.getFullYear() === new Date().getFullYear();
            
            const dayEvents = getEventsForDate(date);
            
            return (
              <div 
                key={index} 
                className={`min-h-[120px] border border-gray-200 p-2 ${
                  !date ? 'bg-gray-50' : isToday ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                {date && (
                  <>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {date.getDate()}
                      </span>
                      {isToday && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          วันนี้
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 max-h-[80px] overflow-y-auto">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded border cursor-pointer truncate ${getEventColor(event.type)}`}
                          onClick={() => onEventClick(event)}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayEvents.length - 3} อื่นๆ
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render week view (simplified)
  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {days.map((date, index) => {
            const isToday = date.getDate() === new Date().getDate() && 
              date.getMonth() === new Date().getMonth() && 
              date.getFullYear() === new Date().getFullYear();
            
            return (
              <div key={index} className={`py-3 text-center ${isToday ? 'bg-blue-50' : ''}`}>
                <div className="font-semibold text-gray-700">
                  {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'][date.getDay()]}
                </div>
                <div className={`text-lg ${isToday ? 'text-blue-600 font-bold' : 'text-gray-800'}`}>
                  {date.getDate()}
                </div>
                <div className="text-sm text-gray-500">
                  {date.getMonth() + 1}/{date.getFullYear() + 543}
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4">
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            
            return (
              <div key={index} className="mb-4 last:mb-0">
                <h3 className="font-medium text-gray-800 mb-2">
                  {date.getDate()} {getMonthName(date)} {date.getFullYear() + 543}
                </h3>
                <div className="space-y-2">
                  {dayEvents.length > 0 ? (
                    dayEvents.map(event => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border cursor-pointer ${getEventColor(event.type)}`}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm opacity-80">{event.description}</div>
                        <div className="text-xs mt-1">
                          {event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {event.personName && (
                          <div className="text-xs mt-1">
                            👤 {event.personName}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-center py-4">
                      ไม่มีงานหรือเวรในวันนี้
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayEvents = getEventsForDate(selectedDate);
    
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {selectedDate.getDate()} {getMonthName(selectedDate)} {selectedDate.getFullYear() + 543}
          </h2>
          
          <div className="space-y-4">
            {dayEvents.length > 0 ? (
              dayEvents.map(event => (
                <div
                  key={event.id}
                  className={`p-4 rounded-xl border cursor-pointer ${getEventColor(event.type)}`}
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-lg">{event.title}</div>
                      <div className="text-gray-700 mt-1">{event.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-sm mt-2">
                        <span className="px-2 py-1 rounded-full bg-white bg-opacity-50">
                          {event.type === 'shift' ? 'เวร' : 
                           event.type === 'task' ? 'งานประจำ' : 
                           event.type === 'work' ? 'งานอื่น' : 
                           event.type === 'meeting' ? 'ประชุม' : 'วันหยุด'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {event.personName && (
                    <div className="flex items-center mt-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                        👤
                      </div>
                      <span>{event.personName}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-xl text-gray-500 mb-2">ไม่มีงานหรือเวรในวันนี้</h3>
                <p className="text-gray-400">ใช้ปุ่ม "เพิ่มงาน/เวรใหม่" เพื่อเพิ่มงานแรกของคุณ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <button
            onClick={navigateToday}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium"
          >
            วันนี้
          </button>
          <div className="flex items-center">
            <button
              onClick={navigatePrevious}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-800 mx-4">
              {getMonthName(selectedDate)} {selectedDate.getFullYear() + 543}
            </h2>
            <button
              onClick={navigateNext}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onViewChange('month')}
            className={`px-4 py-2 rounded-lg font-medium ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
          >
            เดือน
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={`px-4 py-2 rounded-lg font-medium ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
          >
            สัปดาห์
          </button>
          <button
            onClick={() => onViewChange('day')}
            className={`px-4 py-2 rounded-lg font-medium ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
          >
            วัน
          </button>
        </div>
      </div>

      {/* Calendar view */}
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-blue-800 font-bold text-2xl">
            {events.filter(e => e.type === 'shift').length}
          </div>
          <div className="text-blue-600">เวรทั้งหมด</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-green-800 font-bold text-2xl">
            {events.filter(e => e.type === 'task').length}
          </div>
          <div className="text-green-600">งานประจำ</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="text-yellow-800 font-bold text-2xl">
            {events.filter(e => e.status === 'pending').length}
          </div>
          <div className="text-yellow-600">รอดำเนินการ</div>
        </div>
      </div>
    </div>
  );
}