'use client';

import React from 'react';

const THAI_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

interface CalendarComponentProps {
  currentDate: Date;
  selectedDate: string | null;
  onDayClick: (dateStr: string) => void;
  getDayBadges: (dateStr: string) => { text: string; color: string }[];
}

export function CalendarComponent({ currentDate, onDayClick, getDayBadges }: CalendarComponentProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  const today = new Date();
  const isToday = (day: number) => 
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  
  const getDateStr = (day: number) => 
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  // Fill remaining cells
  const remaining = 42 - cells.length;
  for (let i = 0; i < remaining; i++) cells.push(null);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b dark:border-gray-700">
        {THAI_DAYS_SHORT.map((d, i) => (
          <div key={i} className={`py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 ${i === 0 ? 'text-red-500' : ''}`}>
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d.charAt(0)}</span>
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={idx} className="border-b border-r dark:border-gray-700 min-h-[60px] sm:min-h-[80px] bg-gray-50 dark:bg-gray-800/50" />;
          }
          
          const dateStr = getDateStr(day);
          const today = isToday(day);
          const badges = getDayBadges(dateStr);
          const dayOfWeek = new Date(year, month, day).getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          
          return (
            <div
              key={idx}
              onClick={() => onDayClick(dateStr)}
              className={`border-b border-r dark:border-gray-700 min-h-[60px] sm:min-h-[80px] p-1 cursor-pointer transition hover:bg-blue-50 dark:hover:bg-gray-700 ${
                today ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              {/* Day number */}
              <div className={`text-xs sm:text-sm font-semibold mb-0.5 ${
                today ? 'text-blue-600 dark:text-blue-400' : isWeekend ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {day}
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-0.5">
                {badges.map((badge, i) => (
                  <span
                    key={i}
                    className="text-[9px] sm:text-[10px] px-1 py-0.5 rounded font-medium truncate max-w-full"
                    style={{
                      backgroundColor: badge.color + '25',
                      color: badge.color,
                      border: `1px solid ${badge.color}50`,
                    }}
                  >
                    {badge.text}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
