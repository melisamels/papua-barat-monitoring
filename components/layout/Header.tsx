'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  User,
  Shield,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProvider';
import { DEMO_USERS, getRoleNameIndo } from '@/lib/auth/session';
import { UserRole, SystemNotification } from '@/lib/types';

export function Header() {
  const router = useRouter();
  const { currentUser, switchRole, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Fetch notifications
  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {});
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/kegiatan?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    showToast('Semua notifikasi ditandai telah dibaca', 'info');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      {/* Papua Signature Gradient Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-amber-500 to-teal-600" />
      
      <div className="h-16 px-6 flex items-center justify-between">
      {/* Global Search Bar (#46) */}
      <form onSubmit={handleSearch} className="relative w-80 max-w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari kabupaten, distrik, sekolah, kegiatan..."
          className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 transition-all placeholder:text-slate-400"
        />
      </form>

      {/* Right Controls: Role Switcher, Notification Bell, User Avatar */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher (Super Admin, Finance, Pimpinan, Viewer) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all"
            title="Ganti Role Pengguna Demo"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>Role: <strong className="text-emerald-800">{getRoleNameIndo(currentUser.role)}</strong></span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Pilih Hak Akses (Role)
              </div>
              {DEMO_USERS.map(user => (
                <button
                  key={user.role}
                  onClick={() => {
                    switchRole(user.role);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    currentUser.role === user.role ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{getRoleNameIndo(user.role)}</div>
                    <div className="text-[10px] text-slate-500 truncate">{user.full_name}</div>
                  </div>
                  {currentUser.role === user.role && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Quick Button */}
        <Link
          href="/ai-assistant"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all hover:brightness-105"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Tanya AI</span>
        </Link>

        {/* Notification Bell (#33) */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Pusat Notifikasi & Peringatan"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-xs">Pusat Peringatan & Notifikasi</h3>
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                    {unreadCount} baru
                  </span>
                </div>
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-emerald-700 hover:underline font-medium"
                >
                  Tandai Dibaca
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    Tidak ada notifikasi aktif saat ini.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 text-xs ${
                        !notif.is_read ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {notif.severity === 'critical' ? (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        ) : notif.severity === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 leading-tight">
                          {notif.title}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                          {notif.message}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{notif.created_at || 'Baru saja'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 text-center">
                <Link
                  href="/notifikasi"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Lihat Semua Notifikasi →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Info & Avatar (#5) */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-600/20 shadow-xs">
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight max-w-[150px] truncate">
              {currentUser.full_name}
            </div>
            <div className="text-[10px] font-medium text-emerald-700">
              {getRoleNameIndo(currentUser.role)}
            </div>
          </div>
          <button
            onClick={() => {
              showToast('Sesi pengguna telah diakhiri', 'info');
              router.push('/login');
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="Keluar (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
    </header>
  );
}
