'use client';

import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SystemNotification } from '@/lib/types';
import { Bell, AlertTriangle, Info, Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/components/providers/AppProvider';

export default function NotifikasiPage() {
  const { showToast } = useApp();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
      });
  }, []);

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({ action: 'mark_all_read' }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    showToast('Semua notifikasi ditandai telah dibaca');
  };

  const handleMarkRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? ({ ...n, is_read: true }) : n));
  };

  const filtered = notifications.filter(n => filter === 'all' || !n.is_read);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: 'Pusat Peringatan & Notifikasi' }]} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-700" />
            <span>Pusat Notifikasi & Peringatan Otomatis</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aturan otomatis: H-30/14/7 jadwal kegiatan, keterlambatan, kelengkapan LPJ, dan over budget
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
        >
          Tandai Semua Dibaca
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            filter === 'all' ? 'bg-emerald-800 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Semua ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            filter === 'unread' ? 'bg-emerald-800 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Belum Dibaca ({notifications.filter(n => !n.is_read).length})
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
            Tidak ada notifikasi pada kategori ini.
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleMarkRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                !notif.is_read
                  ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-white shadow-xs shrink-0 mt-0.5">
                  {notif.severity === 'critical' ? (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  ) : notif.severity === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{notif.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                      {notif.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                  <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{notif.created_at || 'Baru saja'}</span>
                  </div>
                </div>
              </div>

              {!notif.is_read && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
