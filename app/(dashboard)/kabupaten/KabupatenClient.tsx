'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useApp } from '@/components/providers/AppProvider';
import { getRolePermissions } from '@/lib/auth/session';
import { formatRupiah, getStatusBadgeClass } from '@/lib/utils/formatters';
import { Regency } from '@/lib/types';
import {
  MapPin,
  Search,
  Plus,
  ArrowRight,
  Eye,
  Building,
  GraduationCap,
} from 'lucide-react';

interface KabupatenClientProps {
  initialRegencies: Regency[];
}

export default function KabupatenClient({ initialRegencies }: KabupatenClientProps) {
  const { currentUser, showToast } = useApp();
  const perms = getRolePermissions(currentUser.role);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regencies, setRegencies] = useState(initialRegencies);

  const filtered = regencies.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Master Wilayah Kabupaten' }]} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-700" />
            <span>Master Data Kabupaten</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar kabupaten sasaran Program Pandai Berhitung dengan Metode GASING di Provinsi Papua Barat
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kabupaten atau kode..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(r => {
          const badge = getStatusBadgeClass(r.status || 'Planning');
          return (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      KODE: {r.code}
                    </span>
                    <h3 className="font-black text-lg text-slate-900 mt-0.5">{r.name}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {r.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block flex items-center gap-1">
                      <Building className="w-3 h-3 text-emerald-700" /> Distrik
                    </span>
                    <span className="text-base font-black text-slate-800 mt-1 block">{r.district_count}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-emerald-700" /> Sekolah
                    </span>
                    <span className="text-base font-black text-slate-800 mt-1 block">{r.school_count}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Guru:</span>
                    <span className="font-bold text-slate-800">{r.actual_teachers} / {r.target_teachers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Siswa:</span>
                    <span className="font-bold text-slate-800">{r.actual_students} / {r.target_students}</span>
                  </div>
                  {perms.canViewFinancialBreakdown && (
                    <div className="flex justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-500">Realisasi Anggaran:</span>
                      <span className="font-bold text-emerald-800">{formatRupiah(r.total_realization)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Progress: <strong className="text-emerald-700">{r.progress}%</strong>
                </span>
                <Link
                  href={`/kabupaten/${r.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-slate-200 hover:border-emerald-200 transition-all shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail Wilayah</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
