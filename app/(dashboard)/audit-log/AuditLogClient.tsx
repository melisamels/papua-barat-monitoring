'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { formatDateTimeIndo } from '@/lib/utils/formatters';
import { AuditLog } from '@/lib/types';
import { History, Search } from 'lucide-react';

interface AuditLogClientProps {
  initialLogs: AuditLog[];
}

export default function AuditLogClient({ initialLogs }: AuditLogClientProps) {
  const [search, setSearch] = useState('');

  const filtered = initialLogs.filter(l =>
    l.module.toLowerCase().includes(search.toLowerCase()) ||
    (l.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.new_values || '').toLowerCase().includes(search.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'Create': return 'bg-emerald-100 text-emerald-800';
      case 'Update': return 'bg-blue-100 text-blue-800';
      case 'Delete': return 'bg-red-100 text-red-800';
      case 'Upload': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Audit Trail (Riwayat Aktivitas Sistem)' }]} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-700" />
            <span>Audit Trail Sistem</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak setiap perubahan data (Create, Update, Delete, Upload) demi akuntabilitas operasional
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
          Akses Khusus Super Admin
        </span>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan modul, user, atau rincian..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Waktu (WIT)</th>
                <th className="py-3.5 px-4">Pengguna</th>
                <th className="py-3.5 px-3 text-center">Aksi</th>
                <th className="py-3.5 px-4">Modul</th>
                <th className="py-3.5 px-4">Keterangan / Rincian Nilai Baru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {formatDateTimeIndo(log.created_at)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {log.user_name || 'System Admin'}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {log.module}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {log.new_values || log.old_values || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
