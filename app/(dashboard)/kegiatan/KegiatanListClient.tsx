'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useApp } from '@/components/providers/AppProvider';
import { getRolePermissions } from '@/lib/auth/session';
import { formatRupiah, formatDateIndo, getStatusBadgeClass } from '@/lib/utils/formatters';
import { Training, Regency } from '@/lib/types';
import {
  CalendarDays,
  Search,
  Plus,
  ArrowRight,
  MapPin,
  Calendar,
} from 'lucide-react';

interface KegiatanListClientProps {
  initialTrainings: Training[];
  regencies: Regency[];
}

export default function KegiatanListClient({ initialTrainings, regencies }: KegiatanListClientProps) {
  const { currentUser } = useApp();
  const perms = getRolePermissions(currentUser.role);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regencyFilter, setRegencyFilter] = useState('');

  const filtered = initialTrainings.filter(t => {
    const matchSearch =
      t.venue.toLowerCase().includes(search.toLowerCase()) ||
      (t.district_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.regency_name || '').toLowerCase().includes(search.toLowerCase()) ||
      t.pic.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchRegency = !regencyFilter || t.regency_id === regencyFilter;
    return matchSearch && matchStatus && matchRegency;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Kegiatan Pelatihan GASING' }]} />

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-700" />
            <span>Kegiatan Pelatihan GASING</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Modul Utama: Monitoring jadwal, venue, target peserta, dan anggaran di 23 distrik Papua Barat
          </p>
        </div>

        {perms.canEditTrainings && (
          <Link
            href="/kegiatan/baru"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Kegiatan Baru</span>
          </Link>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari lokasi venue, distrik, kabupaten, atau PIC..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={regencyFilter}
            onChange={(e) => setRegencyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-3 py-2 cursor-pointer"
          >
            <option value="">Semua Kabupaten</option>
            {regencies.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-3 py-2 cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="Completed">Completed (Selesai)</option>
            <option value="Ongoing">Ongoing (Berjalan)</option>
            <option value="Ready">Ready (Siap)</option>
            <option value="Planning">Planning (Perencanaan)</option>
          </select>
        </div>
      </div>

      {/* Trainings Grid / Cards (#19, #20) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Tidak ada kegiatan yang sesuai filter pencarian.
          </div>
        ) : (
          filtered.map(t => {
            const badge = getStatusBadgeClass(t.status);
            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {t.district_name} • {t.regency_name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {t.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2">
                    {t.venue}
                  </h3>

                  <div className="text-xs text-slate-500 space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDateIndo(t.start_date)} - {formatDateIndo(t.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{t.location}</span>
                    </div>
                  </div>

                  {/* Progress & Compliance mini bars */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Guru</span>
                      <strong className="text-slate-800">{t.actual_teachers} / {t.target_teachers}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Siswa</span>
                      <strong className="text-slate-800">{t.actual_students} / {t.target_students}</strong>
                    </div>
                  </div>

                  {perms.canViewFinancialBreakdown && (
                    <div className="pt-2 border-t border-slate-100 text-xs flex items-center justify-between">
                      <span className="text-slate-400 text-[10px]">Realisasi:</span>
                      <strong className="text-emerald-800">{formatRupiah(t.total_realization)}</strong>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-[10px] text-slate-400">ID: {t.id}</span>
                  <Link
                    href={`/kegiatan/${t.id}`}
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>Buka Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
