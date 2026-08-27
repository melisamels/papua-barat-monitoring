'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Regency } from '@/lib/types';
import { formatRupiah } from '@/lib/utils/formatters';

interface BudgetComparisonChartProps {
  regencies: Regency[];
}

export function BudgetComparisonChart({ regencies }: BudgetComparisonChartProps) {
  const chartData = regencies.map(r => ({
    name: r.name,
    RAB: r.total_rab || 0,
    Realisasi: r.total_realization || 0,
  }));

  // Custom Tooltip displaying IDR format (#10)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0B2545] text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
          <p className="font-bold text-emerald-400 mb-1.5">{label}</p>
          <p className="text-slate-200">
            RAB: <span className="font-semibold">{formatRupiah(payload[0]?.value)}</span>
          </p>
          <p className="text-emerald-300">
            Realisasi: <span className="font-semibold">{formatRupiah(payload[1]?.value)}</span>
          </p>
          {payload[0]?.value > 0 && (
            <p className="text-slate-400 text-[10px] mt-1 pt-1 border-t border-slate-700">
              Penyerapan: {Math.round(((payload[1]?.value || 0) / payload[0]?.value) * 100)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Perbandingan RAB vs Realisasi</h3>
          <p className="text-xs text-slate-500">Alokasi anggaran dan pengeluaran per kabupaten</p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
          Satuan: Rupiah (Rp)
        </span>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#64748B' }}
              angle={-25}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748B' }}
              tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)} jt`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              height={30}
              formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
            />
            <Bar dataKey="RAB" fill="#134074" radius={[4, 4, 0, 0]} name="Total RAB" />
            <Bar dataKey="Realisasi" fill="#16A34A" radius={[4, 4, 0, 0]} name="Realisasi Biaya" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
