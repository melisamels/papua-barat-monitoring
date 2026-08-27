'use client';

import React from 'react';
import { AuditLog } from '@/lib/types';
import { History, PlusCircle, Edit3, Trash2, Upload } from 'lucide-react';
import { formatDateTimeIndo } from '@/lib/utils/formatters';

interface RecentActivityProps {
  logs: AuditLog[];
}

export function RecentActivity({ logs }: RecentActivityProps) {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'Create':
        return { icon: PlusCircle, bg: 'bg-emerald-50 text-emerald-700', label: 'Tambah' };
      case 'Update':
        return { icon: Edit3, bg: 'bg-blue-50 text-blue-700', label: 'Ubah' };
      case 'Delete':
        return { icon: Trash2, bg: 'bg-red-50 text-red-700', label: 'Hapus' };
      case 'Upload':
        return { icon: Upload, bg: 'bg-amber-50 text-amber-700', label: 'Upload' };
      default:
        return { icon: History, bg: 'bg-slate-50 text-slate-700', label: action };
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Aktivitas & Riwayat Terbaru</h3>
            <p className="text-xs text-slate-500">Pembaruan data operasional terkini</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
        {logs.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Belum ada aktivitas tercatat.
          </div>
        ) : (
          logs.slice(0, 6).map(log => {
            const badge = getActionBadge(log.action);
            const Icon = badge.icon;
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-xs"
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${badge.bg}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 truncate">
                      {log.module}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatDateTimeIndo(log.created_at)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 truncate mt-0.5">
                    {log.new_values || `Operasi ${log.action} pada ${log.module}`}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Oleh: <span className="font-medium text-slate-700">{log.user_name || 'System'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
