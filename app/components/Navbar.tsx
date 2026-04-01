'use client';

import { useSidebar } from './SidebarContext';
import { useTheme } from './ThemeContext';
import { Menu, Calendar, Bell, Sun, Moon, Monitor } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
  const { toggle } = useSidebar();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const isDark = resolvedTheme === 'dark';

  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });

  // Close theme menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header 
      className="sticky top-0 z-40 w-full transition-all duration-300"
      style={{ 
        background: isDark 
          ? 'rgba(10, 10, 15, 0.8)' 
          : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)'}`,
      }}
    >
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 active:scale-95 lg:hidden hover:scale-105"
            style={{ 
              background: isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)',
              color: isDark ? '#94a3b8' : '#64748b',
              border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
            }}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Logo/Brand - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all duration-300 hover:scale-105 hover:rotate-3"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: isDark ? '0 0 20px rgba(102, 126, 234, 0.5)' : '0 4px 15px rgba(102, 126, 234, 0.3)',
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight"> 
                <span className="gradient-text">ระบบจัดการยา</span>
              </h1>
              <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>OPD Dashboard</p>
            </div>
          </div>
        </div>

        {/* Center - Date with icon */}
        <div 
          className="hidden md:flex items-center gap-2 rounded-full px-4 py-2 text-sm"
          style={{ 
            background: isDark ? 'rgba(102, 126, 234, 0.08)' : 'rgba(102, 126, 234, 0.05)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)'}`,
            color: isDark ? '#94a3b8' : '#64748b'
          }}
        >
          <Calendar className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{currentDate}</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <div className="relative" ref={themeMenuRef}>
            <button 
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:scale-105"
              style={{ 
                background: isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)',
                color: isDark ? '#fbbf24' : '#f59e0b',
                border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
              }}
              title={isDark ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
            >
              {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Theme Dropdown */}
            {showThemeMenu && (
              <div 
                className="absolute right-0 mt-2 w-40 rounded-xl py-2 shadow-xl animate-fade-in"
                style={{ 
                  background: isDark ? 'rgba(26, 26, 37, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
                }}
              >
                <button
                  onClick={() => { toggleTheme(); setShowThemeMenu(false); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-blue-500/10"
                  style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}
                >
                  {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-blue-500" />}
                  <span>{isDark ? 'ธีมสว่าง' : 'ธีมมืด'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Notification Button */}
          <button 
            className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:scale-105"
            style={{ 
              background: isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)',
              color: isDark ? '#94a3b8' : '#64748b',
              border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
            }}
          >
            <Bell className="h-5 w-5" />
            <span 
              className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full animate-pulse"
              style={{ 
                background: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
                boxShadow: `0 0 0 2px ${isDark ? '#0a0a0f' : '#ffffff'}`
              }}
            />
          </button>

          {/* User Avatar */}
          <div 
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl ml-1"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: isDark ? '0 0 15px rgba(102, 126, 234, 0.4)' : '0 4px 12px rgba(102, 126, 234, 0.25)',
            }}
          >
            <span className="text-white font-semibold text-sm">เภสัช</span>
          </div>
        </div>
      </div>
    </header>
  );
}
