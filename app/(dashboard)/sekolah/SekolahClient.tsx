'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useApp } from '@/components/providers/AppProvider';
import { getRolePermissions } from '@/lib/auth/session';
import { School, Regency, District } from '@/lib/types';
import { getMergedSchools } from '@/lib/utils/customStorageSync';
import {
  GraduationCap,
  Search,
  Plus,
  Building,
} from 'lucide-react';

interface SekolahClientProps {
  initialSchools: School[];
  regencies: Regency[];
  districts: District[];
}

export default function SekolahClient({ initialSchools, regencies, districts }: SekolahClientProps) {
  const { currentUser } = useApp();
  const perms = getRolePermissions(currentUser.role);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [schools, setSchools] = useState<School[]>(initialSchools);

  React.useEffect(() => {
    const sync = () => setSchools(getMergedSchools(initialSchools));
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, [initialSchools]);

  const filtered = schools.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.principal.toLowerCase().includes(search.toLowerCase());
    const matchLevel = !levelFilter || s.school_level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Master Data Sekolah' }]} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-700" />
            <span>Master Data Sekolah</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data {schools.length} sekolah asal peserta guru dan siswa dalam Program GASING di Papua Barat
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
            placeholder="Cari nama sekolah atau kepala sekolah..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="">Semua Jenjang</option>
          <option value="SD">SD</option>
          <option value="SMP">SMP</option>
          <option value="SMA">SMA</option>
          <option value="SMK">SMK</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Nama Sekolah</th>
                <th className="py-3.5 px-3 text-center">Jenjang</th>
                <th className="py-3.5 px-4">Kabupaten & Distrik</th>
                <th className="py-3.5 px-4">Kepala Sekolah</th>
                <th className="py-3.5 px-3 text-center">Guru Peserta</th>
                <th className="py-3.5 px-3 text-center">Siswa Peserta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-500">{s.address}</div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-50 text-blue-800 border border-blue-200">
                      {s.school_level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 font-medium">{s.district_name}</div>
                    <div className="text-[10px] text-slate-400">{s.regency_name}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{s.principal}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-900">{s.teacher_participants}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-emerald-800">{s.student_participants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
