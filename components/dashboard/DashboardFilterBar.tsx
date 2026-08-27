'use client';

import React from 'react';
import { Regency, DashboardFilter } from '@/lib/types';
import { Filter, RotateCcw } from 'lucide-react';

interface DashboardFilterBarProps {
  regencies: Regency[];
  filter: DashboardFilter;
  onChange: (filter: DashboardFilter) => void;
  onReset: () => void;
}

const MONTHS = [
  { val: 1, name: 'Januari' },
  { val: 2, name: 'Februari' },
  { val: 3, name: 'Maret' },
  { val: 4, name: 'April' },
  { val: 5, name: 'Mei' },
  { val: 6, name: 'Juni' },
  { val: 7, name: 'Juli' },
  { val: 8, name: 'Agustus' },
  { val: 9, name: 'September' },
  { val: 10, name: 'Oktober' },
  { val: 11, name: 'November' },
  { val: 12, name: 'Desember' },
];

export function DashboardFilterBar({ regencies, filter, onChange, onReset }: DashboardFilterBarProps) {
  return (
    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
        <Filter className="w-4 h-4 text-emerald-700" />
        <span>Filter Data:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Tahun Filter (#109) */}
        <select
          value={filter.fiscal_year}
          onChange={(e) => onChange({ ...filter, fiscal_year: Number(e.target.value) })}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 cursor-pointer"
        >
          <option value={2026}>Tahun 2026</option>
          <option value={2027}>Tahun 2027</option>
          <option value={2028}>Tahun 2028</option>
        </select>

        {/* Bulan Filter */}
        <select
          value={filter.month || ''}
          onChange={(e) => onChange({ ...filter, month: e.target.value ? Number(e.target.value) : null })}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 cursor-pointer"
        >
          <option value="">Semua Bulan</option>
          {MONTHS.map(m => (
            <option key={m.val} value={m.val}>{m.name}</option>
          ))}
        </select>

        {/* Kabupaten Filter */}
        <select
          value={filter.regency_id || ''}
          onChange={(e) => onChange({ ...filter, regency_id: e.target.value || null })}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 cursor-pointer max-w-[180px] truncate"
        >
          <option value="">Semua Kabupaten</option>
          {regencies.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Reset filter ke kondisi awal"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
