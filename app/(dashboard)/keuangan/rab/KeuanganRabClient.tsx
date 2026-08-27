'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { formatRupiah } from '@/lib/utils/formatters';
import { Training, Regency } from '@/lib/types';
import { Wallet, Search, ExternalLink } from 'lucide-react';

interface KeuanganRabClientProps {
  initialTrainings: Training[];
  regencies: Regency[];
}

export default function KeuanganRabClient({ initialTrainings, regencies }: KeuanganRabClientProps) {
  const [search, setSearch] = useState('');
  const [regencyFilter, setRegencyFilter] = useState('');

  const filtered = initialTrainings.filter(t => {
    const matchSearch = t.venue.toLowerCase().includes(search.toLowerCase()) || (t.district_name || '').toLowerCase().includes(search.toLowerCase());
    const matchRegency = !regencyFilter || t.regency_id === regencyFilter;
    return matchSearch && matchRegency;
  });

  const grandTotal = filtered.reduce((acc, curr) => acc + (curr.total_rab || 0), 0);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Keuangan' },
          { label: 'Rencana Anggaran Biaya (RAB)' },
        ]}
      />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-700" />
            <span>Rencana Anggaran Biaya (RAB) Program</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi dan manajemen item anggaran pelatihan per distrik (Volume × Harga Satuan = Jumlah)
          </p>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Akumulasi RAB</span>
          <span className="text-lg font-black text-emerald-900">{formatRupiah(grandTotal)}</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kegiatan atau distrik..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={regencyFilter}
          onChange={(e) => setRegencyFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-3 py-2"
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
                <th className="py-3.5 px-4">Kabupaten & Distrik</th>
                <th className="py-3.5 px-4">Venue Kegiatan</th>
                <th className="py-3.5 px-4 text-right">Total RAB Terdaftar</th>
                <th className="py-3.5 px-4 text-right">Realisasi Berjalan</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {t.regency_name} • {t.district_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800">{t.venue}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {formatRupiah(t.total_rab)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                    {formatRupiah(t.total_realization)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/kegiatan/${t.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold rounded-lg transition-colors"
                    >
                      <span>Detail RAB</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
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
