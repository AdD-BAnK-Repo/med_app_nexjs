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
  TrendingUp,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

type DashboardStats = {
  totalMeds: number;
  noStockMeds: number;
  checkedThisMonth: number;
  lastUpdated: string;
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
      shadowColor: 'rgba(59, 130, 246, 0.3)',
      accentColor: '#3b82f6'
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
      shadowColor: 'rgba(245, 158, 11, 0.3)',
      accentColor: '#f59e0b'
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
      shadowColor: 'rgba(139, 92, 246, 0.3)',
      accentColor: '#8b5cf6'
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
      shadowColor: 'rgba(16, 185, 129, 0.3)',
      accentColor: '#10b981'
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
      shadowColor: 'rgba(244, 63, 94, 0.3)',
      accentColor: '#f43f5e'
    },
    {
      id: 'calendar',
      title: 'ตารางงานและเวร',
      subtitle: 'ปฏิทินเวรประจำเดือน',
      value: 30,
      progress: 85,
      progressLabel: '25/30 รายการ',
      icon: CalendarDays,
      href: '/calendar',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      shadowColor: 'rgba(99, 102, 241, 0.3)',
      accentColor: '#6366f1'
    }
  ];

  return (
    <div className="min-h-screen space-y-8 pb-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] p-8 sm:p-10">
        {/* Dynamic Background */}
        <div 
          className="absolute inset-0 transition-colors duration-500"
          style={{ 
            background: isDark 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
            border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
          }}
        />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${isDark ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#fff' : '#000'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        <div className="relative z-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-4">
              {/* Status Badge */}
              <div 
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-sm animate-fade-in"
                style={{ 
                  background: isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)',
                  border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)'}`,
                }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium" style={{ color: isDark ? '#e2e8f0' : '#475569' }}>
                  ระบบพร้อมใช้งาน
                </span>
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  <span className="gradient-text">ระบบบริหารจัดการยา</span>
                  <span style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}> OPD</span>
                </h1>
                <p className="flex items-center gap-2" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                  <Clock className="h-4 w-4" />
                  {thaiMonths[currentMonth]} พ.ศ. {currentYear + 543}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4">
              <div 
                className="rounded-2xl p-5 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                style={{ 
                  background: isDark ? 'rgba(26, 26, 37, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                  border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs font-medium" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>ความคืบหน้า</p>
                </div>
                <p className="text-3xl font-bold" style={{ color: isDark ? '#34d399' : '#059669' }}>{medProgress}%</p>
              </div>
              <div 
                className="rounded-2xl p-5 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                style={{ 
                  background: isDark ? 'rgba(26, 26, 37, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                  border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <p className="text-xs font-medium" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>ยาในคลัง</p>
                </div>
                <p className="text-3xl font-bold" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {stats?.totalMeds || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Link
            key={card.id}
            href={card.href}
            className="group relative overflow-hidden rounded-[1.5rem] p-6 transition-all duration-500 hover:scale-[1.02]"
            style={{ 
              background: isDark ? 'rgba(26, 26, 37, 0.6)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)'}`,
              backdropFilter: 'blur(20px)',
              boxShadow: isDark 
                ? `0 4px 30px ${card.shadowColor}, 0 0 0 1px rgba(102, 126, 234, 0.05)` 
                : `0 4px 20px ${card.shadowColor}`,
              animationDelay: `${index * 0.1}s`
            }}
          >
            {/* Hover Gradient Overlay */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ 
                background: `linear-gradient(135deg, ${card.accentColor}10 0%, transparent 60%)`,
              }}
            />
            
            {/* Animated Border Glow */}
            <div 
              className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, ${card.accentColor}30 0%, transparent 50%, ${card.accentColor}10 100%)`,
                padding: '1px',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude'
              }}
            />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                {/* Icon Container */}
                <div 
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ 
                    background: `linear-gradient(135deg, ${card.gradient})`,
                    boxShadow: `0 8px 25px ${card.shadowColor}`
                  }}
                >
                  <card.icon className="h-7 w-7" />
                </div>
                
                {/* Arrow */}
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-opacity-20"
                  style={{ 
                    background: isDark ? `${card.accentColor}15` : `${card.accentColor}10`,
                    color: card.accentColor
                  }}
                >
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
              
              {/* Title & Subtitle */}
              <div className="space-y-1 mb-5">
                <h3 className="text-lg font-bold transition-colors" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {card.title}
                </h3>
                <p className="text-sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                  {card.subtitle}
                </p>
              </div>
              
              {/* Stats & Progress */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold transition-colors" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {loading ? (
                      <span className="animate-pulse">-</span>
                    ) : (
                      card.value
                    )}
                  </p>
                  <p className="text-xs mt-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>รายการ</p>
                </div>
                
                {card.progress !== null && (
                  <div className="text-right space-y-2">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" style={{ color: card.accentColor }} />
                      <span className="text-sm font-semibold" style={{ color: card.accentColor }}>{card.progress}%</span>
                    </div>
                    <div 
                      className="h-2 w-28 rounded-full overflow-hidden"
                      style={{ background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }}
                    >
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: loading ? '0%' : `${card.progress}%`,
                          background: `linear-gradient(90deg, ${card.gradient})`
                        }}
                      />
                    </div>
                    <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{card.progressLabel}</p>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div 
        className="rounded-[1.5rem] p-6"
        style={{ 
          background: isDark ? 'rgba(26, 26, 37, 0.4)' : 'rgba(255, 255, 255, 0.6)',
          border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)'}`,
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)' }}
          >
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>สรุปภาพรวม</h3>
            <p className="text-sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>ข้อมูลล่าสุดจากระบบ</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            className="flex items-center gap-3 rounded-xl p-4"
            style={{ background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)' }}
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>ตรวจสอบแล้ว</p>
              <p className="font-semibold" style={{ color: isDark ? '#34d399' : '#059669' }}>
                {stats?.checkedThisMonth || 0} รายการ
              </p>
            </div>
          </div>
          <div 
            className="flex items-center gap-3 rounded-xl p-4"
            style={{ background: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)' }}
          >
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>ยา No Stock</p>
              <p className="font-semibold" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>
                {stats?.noStockMeds || 0} รายการ
              </p>
            </div>
          </div>
          <div 
            className="flex items-center gap-3 rounded-xl p-4"
            style={{ background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)' }}
          >
            <Zap className="h-5 w-5 text-violet-500" />
            <div>
              <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>อัปเดตล่าสุด</p>
              <p className="font-semibold" style={{ color: isDark ? '#a78bfa' : '#7c3aed' }}>
                {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
