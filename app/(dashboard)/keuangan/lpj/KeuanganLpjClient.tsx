'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { formatRupiah } from '@/lib/utils/formatters';
import { Training } from '@/lib/types';
import { FileCheck2, Search, ExternalLink } from 'lucide-react';

interface KeuanganLpjClientProps {
  initialTrainings: Training[];
}

export default function KeuanganLpjClient({ initialTrainings }: KeuanganLpjClientProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = initialTrainings.filter(t => {
    const matchSearch = t.venue.toLowerCase().includes(search.toLowerCase()) || (t.district_name || '').toLowerCase().includes(search.toLowerCase()) || (t.regency_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || (statusFilter === '100' ? (t.lpj_completeness || 0) === 100 : (t.lpj_completeness || 0) < 100);
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Keuangan' },
          { label: 'Monitoring LPJ Kegiatan' },
        ]}
      />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-700" />
            <span>Laporan Pertanggungjawaban (LPJ) Kegiatan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring kelengkapan 14 berkas checklist baku LPJ, kuitansi, invoice, berita acara, dan laporan kegiatan
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
            placeholder="Cari kegiatan, distrik, atau kabupaten..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-3 py-2"
        >
          <option value="">Semua Kelengkapan LPJ</option>
          <option value="100">Lengkap 100%</option>
          <option value="incomplete">Belum Lengkap (&lt; 100%)</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Wilayah & Kegiatan</th>
                <th className="py-3.5 px-4 text-right">RAB Total</th>
                <th className="py-3.5 px-4 text-right">Realisasi Diserap</th>
                <th className="py-3.5 px-4 text-right">Selisih</th>
                <th className="py-3.5 px-4 text-center">Kelengkapan 14 Dokumen</th>
                <th className="py-3.5 px-3 text-center">Status LPJ</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map(t => {
                const isComplete = (t.lpj_completeness || 0) === 100;
                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{t.district_name} ({t.regency_name})</div>
                      <div className="text-[11px] text-slate-500">{t.venue}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800">{formatRupiah(t.total_rab)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-800">{formatRupiah(t.total_realization)}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-700">{formatRupiah(t.balance)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isComplete ? 'bg-emerald-600' : 'bg-amber-500'}`}
                            style={{ width: `${t.lpj_completeness}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{t.lpj_completeness}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isComplete
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isComplete ? 'Lengkap ✓' : 'Belum Lengkap'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/kegiatan/${t.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold rounded-lg transition-colors"
                      >
                        <span>Cek Checklist</span>
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
