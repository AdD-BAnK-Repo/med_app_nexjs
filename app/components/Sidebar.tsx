'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarContext';
import { useTheme } from './ThemeContext';
import { 
  Home, 
  ClipboardCheck, 
  Settings, 
  ShieldCheck, 
  FileText, 
  LogOut,
  X,
  Pill,
  ChevronRight,
  CalendarDays
} from 'lucide-react';

const menuItems = [
  { href: '/', label: 'หน้าหลัก', icon: Home },
  { href: '/check', label: 'ตรวจอายุยา', icon: ClipboardCheck },
  { href: '/check-nostock', label: 'ยา No Stock', icon: Pill },
  { href: '/manage', label: 'จัดการข้อมูล', icon: Settings },
  { href: '/safety', label: 'ความปลอดภัย', icon: ShieldCheck },
  { href: '/shift-exchange', label: 'ขายเวร', icon: FileText },
  { href: '/calendar', label: 'ตารางงานและเวร', icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 backdrop-blur-sm transition-opacity lg:hidden"
          style={{ backgroundColor: isDark ? 'rgba(15, 15, 26, 0.8)' : 'rgba(0, 0, 0, 0.5)' }}
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ 
          background: isDark 
            ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' 
            : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRight: isDark ? '1px solid #2d2d44' : '1px solid #e2e8f0'
        }}
      >
        {/* Header */}
        <div 
          className="flex h-16 items-center justify-between px-4" 
          style={{ borderBottom: isDark ? '1px solid #2d2d44' : '1px solid #e2e8f0' }}
        >
          <div className="flex items-center gap-3">
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
              <h1 className="font-bold leading-tight" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5576c 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>ระบบยา</h1>
              <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>OPD Dashboard</p>
            </div>
          </div>
          <button 
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors lg:hidden"
            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all"
                style={{
                  background: isActive 
                    ? 'linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)' 
                    : 'transparent',
                  color: isActive ? '#667eea' : (isDark ? '#94a3b8' : '#64748b'),
                  border: isActive ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid transparent'
                }}
              >
                <item.icon 
                  className="h-5 w-5 transition-colors" 
                  style={{ color: isActive ? '#667eea' : (isDark ? '#64748b' : '#94a3b8') }} 
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4" style={{ color: '#667eea' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-4" 
          style={{ borderTop: isDark ? '1px solid #2d2d44' : '1px solid #e2e8f0' }}
        >
          <div 
            className="mb-3 rounded-xl p-3" 
            style={{ 
              backgroundColor: isDark ? '#1a1a2e' : '#f8fafc',
              border: isDark ? '1px solid #2d2d44' : '1px solid #e2e8f0'
            }}
          >
            <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>ผู้ใช้งาน</p>
            <p className="font-semibold" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>เภสัชกร</p>
            <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>ผู้ดูแลระบบ</p>
          </div>
          <button 
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          >
            <LogOut className="h-5 w-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
}
