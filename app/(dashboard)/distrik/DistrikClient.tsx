'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useApp } from '@/components/providers/AppProvider';
import { getRolePermissions } from '@/lib/auth/session';
import { getStatusBadgeClass } from '@/lib/utils/formatters';
import { District, Regency } from '@/lib/types';
import { getMergedDistricts } from '@/lib/utils/customStorageSync';
import {
  Building2,
  Search,
  Plus,
  ExternalLink,
  Users,
  GraduationCap,
} from 'lucide-react';

interface DistrikClientProps {
  initialDistricts: District[];
  regencies: Regency[];
}

export default function DistrikClient({ initialDistricts, regencies }: DistrikClientProps) {
  const { currentUser, showToast } = useApp();
  const perms = getRolePermissions(currentUser.role);
  const [search, setSearch] = useState('');
  const [regencyFilter, setRegencyFilter] = useState('');
  const [districts, setDistricts] = useState<District[]>(initialDistricts);

  React.useEffect(() => {
    const sync = () => setDistricts(getMergedDistricts(initialDistricts));
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, [initialDistricts]);

  const filtered = districts.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.coordinator.toLowerCase().includes(search.toLowerCase());
    const matchRegency = !regencyFilter || d.regency_id === regencyFilter;
    return matchSearch && matchRegency;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Master Wilayah Distrik' }]} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-700" />
            <span>Master Data Distrik</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {districts.length} distrik sasaran pelatihan berhitung GASING (Aturan: 1 distrik memiliki 1 kegiatan utama pelatihan)
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
            placeholder="Cari nama distrik atau koordinator..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

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
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Nama Distrik</th>
                <th className="py-3.5 px-4">Kabupaten</th>
                <th className="py-3.5 px-4">Koordinator (PIC)</th>
                <th className="py-3.5 px-3 text-center">Jml Sekolah</th>
                <th className="py-3.5 px-3 text-center">Target Peserta</th>
                <th className="py-3.5 px-3 text-center">Status Kegiatan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map(d => {
                const badge = getStatusBadgeClass(d.status || 'Planning');
                return (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{d.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">KODE: {d.code}</span>
                    </td>
                    <td className="py-3.5 px-4">{d.regency_name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{d.coordinator}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                        {d.school_count}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="text-slate-700">{d.target_teachers} Guru / {d.target_students} Siswa</span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {d.status || 'Planning'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {d.training_id ? (
                        <Link
                          href={`/kegiatan/${d.training_id}`}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
                        >
                          <span>Workspace</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
