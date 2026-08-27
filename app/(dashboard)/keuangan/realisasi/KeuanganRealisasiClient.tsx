'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { formatRupiah } from '@/lib/utils/formatters';
import { Training, Regency } from '@/lib/types';
import { Receipt, Search, ExternalLink } from 'lucide-react';

interface KeuanganRealisasiClientProps {
  initialTrainings: Training[];
  regencies: Regency[];
}

export default function KeuanganRealisasiClient({ initialTrainings, regencies }: KeuanganRealisasiClientProps) {
  const [search, setSearch] = useState('');
  const [regencyFilter, setRegencyFilter] = useState('');

  const filtered = initialTrainings.filter(t => {
    const matchSearch = t.venue.toLowerCase().includes(search.toLowerCase()) || (t.district_name || '').toLowerCase().includes(search.toLowerCase());
    const matchRegency = !regencyFilter || t.regency_id === regencyFilter;
    return matchSearch && matchRegency;
  });

  const totalRAB = filtered.reduce((acc, curr) => acc + (curr.total_rab || 0), 0);
  const totalRealisasi = filtered.reduce((acc, curr) => acc + (curr.total_realization || 0), 0);
  const absorption = totalRAB > 0 ? Math.round((totalRealisasi / totalRAB) * 100) : 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Keuangan' },
          { label: 'Realisasi Anggaran & Variance' },
        ]}
      />

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-700" />
            <span>Realisasi Biaya Kegiatan & Penyerapan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring perbandingan RAB vs Realisasi (Variance = RAB - Realisasi) dan bukti kuitansi pertanggungjawaban
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-right text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-bold">Total Realisasi</span>
            <span className="font-black text-emerald-800 text-sm">{formatRupiah(totalRealisasi)}</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] text-emerald-700 block font-bold">Penyerapan Rerata</span>
            <span className="font-black text-emerald-900 text-sm">{absorption}%</span>
          </div>
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Wilayah & Kegiatan</th>
                <th className="py-3.5 px-4 text-right">RAB Awal</th>
                <th className="py-3.5 px-4 text-right">Total Realisasi</th>
                <th className="py-3.5 px-4 text-right">Sisa Anggaran (Variance)</th>
                <th className="py-3.5 px-3 text-center">Penyerapan</th>
                <th className="py-3.5 px-3 text-center">Status Anggaran</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map(t => {
                const variance = (t.total_rab || 0) - (t.total_realization || 0);
                const isOver = variance < 0 && (t.total_rab || 0) > 0;
                const statusBudget = isOver
                  ? 'Over Budget'
                  : (t.total_realization || 0) > 0 && variance === 0
                  ? 'Sesuai Anggaran'
                  : 'Under Budget';

                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{t.district_name} ({t.regency_name})</div>
                      <div className="text-[11px] text-slate-500">{t.venue}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                      {formatRupiah(t.total_rab)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-800">
                      {formatRupiah(t.total_realization)}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold ${variance < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                      {formatRupiah(variance)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-emerald-700">
                      {t.absorption_rate}%
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isOver
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {statusBudget}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/kegiatan/${t.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold rounded-lg transition-colors"
                      >
                        <span>Input Transaksi</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
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
