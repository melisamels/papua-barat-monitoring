'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  GraduationCap,
  CalendarDays,
  Users,
  Wallet,
  Receipt,
  FileCheck2,
  Camera,
  FileText,
  BotMessageSquare,
  Bell,
  UserCheck,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProvider';
import { getRolePermissions } from '@/lib/auth/session';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { currentUser } = useApp();
  const perms = getRolePermissions(currentUser.role);

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard, visible: true },
    {
      group: 'Monitoring Program',
      items: [
        { label: 'Kabupaten', href: '/kabupaten', icon: MapPin, visible: true },
        { label: 'Distrik', href: '/distrik', icon: Building2, visible: true },
        { label: 'Sekolah', href: '/sekolah', icon: GraduationCap, visible: true },
        { label: 'Kegiatan Pelatihan', href: '/kegiatan', icon: CalendarDays, visible: true },
        { label: 'Peserta (Guru & Siswa)', href: '/peserta', icon: Users, visible: true },
      ],
    },
    {
      group: 'Keuangan & LPJ',
      items: [
        { label: 'RAB Anggaran', href: '/keuangan/rab', icon: Wallet, visible: perms.canViewFinancialBreakdown },
        { label: 'Realisasi Anggaran', href: '/keuangan/realisasi', icon: Receipt, visible: perms.canViewFinancialBreakdown },
        { label: 'LPJ Kegiatan', href: '/keuangan/lpj', icon: FileCheck2, visible: true },
      ],
    },
    {
      group: 'Informasi & Layanan',
      items: [
        { label: 'Galeri Dokumentasi', href: '/dokumentasi', icon: Camera, visible: true },
        { label: 'Laporan Program', href: '/laporan', icon: FileText, visible: true },
        { label: 'AI Assistant', href: '/ai-assistant', icon: BotMessageSquare, visible: true },
        { label: 'Notifikasi', href: '/notifikasi', icon: Bell, visible: true },
      ],
    },
    {
      group: 'Administrator',
      items: [
        { label: 'Manajemen User', href: '/users', icon: UserCheck, visible: perms.canManageUsers },
        { label: 'Audit Trail', href: '/audit-log', icon: History, visible: perms.canViewAuditLogs },
        { label: 'Pengaturan Sistem', href: '/pengaturan', icon: Settings, visible: perms.canManageSettings },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-gradient-to-b from-slate-950 via-[#0B2545] to-[#071629] text-slate-200 transition-all duration-300 flex flex-col z-30 shadow-2xl border-r border-slate-800/80 ${
        collapsed ? 'w-20' : 'w-64'
      } no-print`}
    >
      {/* Brand Header with Papua Pattern Accent (#57) */}
      <div className="p-4 border-b border-slate-800/80 relative bg-white/5 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-900/50 shrink-0 ring-2 ring-amber-400/30">
            PB
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-black text-white text-sm leading-tight truncate tracking-wide flex items-center gap-1.5">
                <span>PAPUA BARAT</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </h1>
              <p className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">
                GASING Berhitung
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subtle Ethnic Geometric Papua Motif Divider (#57) */}
      <div className="papua-motif-divider w-full shrink-0" />

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navItems.map((section, idx) => {
          if ('group' in section && Array.isArray(section.items)) {
            const visibleItems = section.items.filter(item => item.visible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 text-[10px] font-bold text-amber-400/90 uppercase tracking-widest flex items-center gap-1">
                    <span>{section.group}</span>
                  </div>
                )}
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-md shadow-emerald-950/40 border-l-4 border-amber-400'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          } else if ('href' in section && section.href && section.icon) {
            const Icon = section.icon as any;
            const isActive = pathname === section.href;
            return (
              <Link
                key={section.href}
                href={section.href}
                title={collapsed ? section.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-md shadow-emerald-950/40 border-l-4 border-amber-400'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{section.label}</span>}
              </Link>
            );
          }
          return null;
        })}
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between">
        {!collapsed && (
          <div className="text-[11px] text-slate-400 font-medium">
            Tahun Anggaran 2026
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-auto"
          title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
