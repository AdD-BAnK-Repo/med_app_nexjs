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
  CalendarDays,
  Sparkles
} from 'lucide-react';

const menuItems = [
  { href: '/', label: 'หน้าหลัก', icon: Home, description: 'ภาพรวมระบบ' },
  { href: '/check', label: 'ตรวจอายุยา', icon: ClipboardCheck, description: 'ตรวจสอบวันหมดอายุ' },
  { href: '/check-nostock', label: 'ยา No Stock', icon: Pill, description: 'รายการยาหมด' },
  { href: '/manage', label: 'จัดการข้อมูล', icon: Settings, description: 'ฐานข้อมูลยา' },
  { href: '/safety', label: 'ความปลอดภัย', icon: ShieldCheck, description: 'ตรวจอุปกรณ์' },
  { href: '/shift-exchange', label: 'ขายเวร', icon: FileText, description: 'เอกสารเวร' },
  { href: '/calendar', label: 'ตารางงานและเวร', icon: CalendarDays, description: 'ปฏิทิน' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 backdrop-blur-sm transition-opacity lg:hidden"
          style={{ backgroundColor: isDark ? 'rgba(10, 10, 15, 0.8)' : 'rgba(0, 0, 0, 0.5)' }}
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 z-50 h-full w-72 transform transition-transform duration-300 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ 
          background: isDark 
            ? 'linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)' 
            : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRight: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)'}`,
        }}
      >
        {/* Header */}
        <div 
          className="flex h-16 items-center justify-between px-5" 
          style={{ 
            borderBottom: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)'}`,
            background: isDark ? 'rgba(102, 126, 234, 0.03)' : 'rgba(102, 126, 234, 0.02)'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg transition-all duration-300 hover:scale-105 hover:rotate-3"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: isDark ? '0 0 20px rgba(102, 126, 234, 0.5)' : '0 4px 15px rgba(102, 126, 234, 0.3)',
              }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold leading-tight"> 
                <span className="gradient-text">ระบบยา</span>
              </h1>
              <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>OPD Dashboard</p>
            </div>
          </div>
          <button 
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 lg:hidden"
            style={{ 
              color: isDark ? '#94a3b8' : '#64748b',
              background: isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)',
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          <p 
            className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            เมนูหลัก
          </p>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300"
                style={{
                  background: isActive 
                    ? isDark 
                      ? 'linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.1) 100%)' 
                      : 'linear-gradient(90deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.05) 100%)'
                    : 'transparent',
                  color: isActive 
                    ? '#667eea' 
                    : (isDark ? '#94a3b8' : '#64748b'),
                  border: isActive 
                    ? `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.25)'}'` 
                    : '1px solid transparent',
                  transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                }}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div 
                    className="absolute left-0 w-1 h-8 rounded-r-full"
                    style={{
                      background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
                    }}
                  />
                )}
                
                <item.icon 
                  className="h-5 w-5 transition-all duration-300 group-hover:scale-110" 
                  style={{ 
                    color: isActive 
                      ? '#667eea' 
                      : (isDark ? '#64748b' : '#94a3b8'),
                  }} 
                />
                <div className="flex-1">
                  <span className="block">{item.label}</span>
                  <span 
                    className="block text-xs transition-opacity duration-300"
                    style={{ 
                      color: isDark ? '#475569' : '#94a3b8',
                      opacity: isActive ? 1 : 0.7
                    }}
                  >
                    {item.description}
                  </span>
                </div>
                {isActive && (
                  <ChevronRight className="h-4 w-4 animate-pulse" style={{ color: '#667eea' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-4" 
          style={{ 
            borderTop: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)'}`,
            background: isDark ? 'rgba(102, 126, 234, 0.02)' : 'rgba(102, 126, 234, 0.01)'
          }}
        >
          {/* User Info Card */}
          <div 
            className="mb-3 rounded-xl p-3 transition-all duration-300 hover:scale-[1.02]"
            style={{ 
              background: isDark 
                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)' 
                : 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.03) 100%)',
              border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-semibold"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                }}
              >
                ภ
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>เภสัชกร</p>
                <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>ผู้ดูแลระบบ</p>
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <button 
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
            style={{ 
              color: isDark ? '#94a3b8' : '#64748b',
              background: isDark ? 'rgba(245, 87, 108, 0.05)' : 'rgba(245, 87, 108, 0.03)',
              border: `1px solid ${isDark ? 'rgba(245, 87, 108, 0.1)' : 'rgba(245, 87, 108, 0.08)'}`,
            }}
          >
            <LogOut className="h-5 w-5 text-rose-500" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
}
