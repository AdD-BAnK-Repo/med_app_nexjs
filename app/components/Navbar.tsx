'use client';

import { useSidebar } from './SidebarContext';
import { useTheme } from './ThemeContext';
import { Menu, Calendar, Bell, Sun, Moon } from 'lucide-react';

export function Navbar() {
  const { toggle } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isDark = theme === 'dark';

  return (
    <header 
      className="sticky top-0 z-40 w-full transition-all duration-300"
      style={{ 
        backgroundColor: isDark ? 'rgba(15, 15, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: isDark ? '1px solid #2d2d44' : '1px solid #e2e8f0'
      }}
    >
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95 lg:hidden"
            style={{ 
              backgroundColor: isDark ? '#1a1a2e' : '#f1f5f9',
              color: isDark ? '#cbd5e1' : '#475569'
            }}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Logo/Brand - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)'
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5576c 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>ระบบจัดการยา</h1>
              <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>OPD Dashboard</p>
            </div>
          </div>
        </div>

        {/* Center - Date */}
        <div 
          className="hidden md:flex items-center gap-2 rounded-full px-4 py-2 text-sm"
          style={{ 
            backgroundColor: isDark ? 'rgba(26, 26, 46, 0.8)' : 'rgba(241, 245, 249, 0.8)',
            backdropFilter: 'blur(10px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            color: isDark ? '#cbd5e1' : '#475569'
          }}
        >
          <Calendar className="h-4 w-4" style={{ color: '#667eea' }} />
          <span className="font-medium">{currentDate}</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all"
            style={{ 
              backgroundColor: isDark ? '#1a1a2e' : '#f1f5f9',
              color: isDark ? '#fbbf24' : '#f59e0b',
              border: isDark ? '1px solid #2d2d44' : '1px solid #e2e8f0'
            }}
            title={isDark ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notification */}
          <button 
            className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all"
            style={{ 
              backgroundColor: isDark ? '#1a1a2e' : '#f1f5f9',
              color: isDark ? '#94a3b8' : '#64748b',
              border: isDark ? '1px solid #2d2d44' : '1px solid #e2e8f0'
            }}
          >
            <Bell className="h-5 w-5" />
            <span 
              className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full"
              style={{ 
                background: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
                boxShadow: `0 0 0 2px ${isDark ? '#0f0f1a' : '#ffffff'}`
              }}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
