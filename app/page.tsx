'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from './components/ThemeContext';
import { 
  Pill, 
  ClipboardCheck, 
  Settings, 
  ShieldCheck, 
  FileText,
  CalendarDays, 
  Zap,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

type DashboardStats = {
  totalMeds: number;
  noStockMeds: number;
  checkedThisMonth: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch(`/api/dashboard?month=${currentMonth + 1}&year=${currentYear}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .finally(() => setLoading(false));
  }, [currentMonth, currentYear]);

  const medProgress = stats && stats.totalMeds > 0 
    ? Math.round((stats.checkedThisMonth / stats.totalMeds) * 100) : 0;

  const cards = [
    {
      id: 'expiry',
      title: 'ตรวจสอบวันหมดอายุ',
      subtitle: 'ยาในคลัง',
      value: stats?.totalMeds || 0,
      progress: medProgress,
      progressLabel: `${stats?.checkedThisMonth || 0}/${stats?.totalMeds || 0} รายการ`,
      icon: Pill,
      href: '/check',
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      shadowColor: 'rgba(59, 130, 246, 0.3)'
    },
    {
      id: 'nostock',
      title: 'ยา No Stock',
      subtitle: 'รายการหมด',
      value: stats?.noStockMeds || 0,
      progress: null,
      icon: ClipboardCheck,
      href: '/check-nostock',
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      shadowColor: 'rgba(245, 158, 11, 0.3)'
    },
    {
      id: 'manage',
      title: 'จัดการฐานข้อมูล',
      subtitle: 'รายการยาทั้งหมด',
      value: stats?.totalMeds || 0,
      progress: null,
      icon: Settings,
      href: '/manage',
      gradient: 'from-violet-500 via-purple-600 to-pink-500',
      shadowColor: 'rgba(139, 92, 246, 0.3)'
    },
    {
      id: 'safety',
      title: 'ความปลอดภัย',
      subtitle: 'ตรวจสอบอุปกรณ์',
      value: 12,
      progress: 67,
      progressLabel: '8/12 รายการ',
      icon: ShieldCheck,
      href: '/safety',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      shadowColor: 'rgba(16, 185, 129, 0.3)'
    },
    {
      id: 'shift',
      title: 'ขายเวร',
      subtitle: 'เอกสารทั้งหมด',
      value: 24,
      progress: 75,
      progressLabel: '18/24 รายการ',
      icon: FileText,
      href: '/shift-exchange',
      gradient: 'from-rose-500 via-pink-500 to-purple-500',
      shadowColor: 'rgba(244, 63, 94, 0.3)'
    }
  ];

  return (
    <div className="min-h-screen space-y-8 pb-8">
      {/* Header Section */}
      <div 
        className="relative overflow-hidden rounded-[2rem] p-8 sm:p-10 text-white shadow-2xl"
        style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div 
                className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(102, 126, 234, 0.2)', border: '1px solid rgba(102, 126, 234, 0.3)' }}
              >
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-slate-200">ระบบพร้อมใช้งาน</span>
              </div>
              <h1 className="text-3xl font-bold sm:text-4xl mb-2" style={{ background: 'linear-gradient(135deg, #fff 0%, #e2e8f0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ระบบบริหารจัดการยา OPD
              </h1>
              <p className="flex items-center gap-2 text-slate-400">
                <CalendarDays className="h-4 w-4" />
                {thaiMonths[currentMonth]} พ.ศ. {currentYear + 543}
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-3">
              <div 
                className="rounded-2xl p-5 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(26, 26, 46, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <p className="text-xs text-slate-400 mb-1">ตรวจแล้ว</p>
                <p className="text-3xl font-bold text-emerald-400">{medProgress}%</p>
              </div>
              <div 
                className="rounded-2xl p-5 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(26, 26, 46, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <p className="text-xs text-slate-400 mb-1">ยาในคลัง</p>
                <p className="text-3xl font-bold text-white">{stats?.totalMeds || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="group relative overflow-hidden rounded-[1.5rem] p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            style={{ 
              backgroundColor: isDark ? 'rgba(26, 26, 46, 0.6)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
              backdropFilter: 'blur(10px)',
              boxShadow: `0 4px 30px ${card.shadowColor}`
            }}
          >
            {/* Gradient border effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ 
                background: `linear-gradient(135deg, ${card.gradient.includes('blue') ? '#3b82f6' : card.gradient.includes('amber') ? '#f59e0b' : card.gradient.includes('violet') ? '#8b5cf6' : card.gradient.includes('emerald') ? '#10b981' : '#f43f5e'}20 0%, transparent 50%)`,
                borderRadius: 'inherit'
              }}
            />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${card.gradient})` }}
                >
                  <card.icon className="h-7 w-7" />
                </div>
                <div 
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-all group-hover:scale-110"
                  style={{ backgroundColor: isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)' }}
                >
                  <ArrowUpRight className="h-4 w-4" style={{ color: isDark ? '#667eea' : '#5b21b6' }} />
                </div>
              </div>
              
              <h3 className="text-lg font-bold mb-1" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
                {card.title}
              </h3>
              <p className="text-sm mb-4" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                {card.subtitle}
              </p>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold" style={{ color: isDark ? '#fff' : '#1e293b' }}>
                    {loading ? '-' : card.value}
                  </p>
                  <p className="text-xs mt-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>รายการ</p>
                </div>
                
                {card.progress !== null && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400">{card.progress}%</span>
                    </div>
                    <div 
                      className="h-2 w-24 rounded-full overflow-hidden"
                      style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
                    >
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${card.progress}%`,
                          background: `linear-gradient(90deg, ${card.gradient})`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
