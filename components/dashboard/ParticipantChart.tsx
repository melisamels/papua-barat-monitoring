'use client';

import React, { useState } from 'react';
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

interface ParticipantChartProps {
  regencies: Regency[];
}

export function ParticipantChart({ regencies }: ParticipantChartProps) {
  const [tab, setTab] = useState<'guru' | 'siswa'>('guru');

  const chartData = regencies.map(r => ({
    name: r.name,
    Target: tab === 'guru' ? (r.target_teachers || 0) : (r.target_students || 0),
    Realisasi: tab === 'guru' ? (r.actual_teachers || 0) : (r.actual_students || 0),
  }));

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Target vs Realisasi Peserta</h3>
          <p className="text-xs text-slate-500">Capaian guru dan siswa per kabupaten</p>
        </div>

        {/* Tab Selector (#11) */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setTab('guru')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              tab === 'guru' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Guru
          </button>
          <button
            onClick={() => setTab('siswa')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              tab === 'siswa' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Siswa
          </button>
        </div>
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
            <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
            <Tooltip
              formatter={(val: any, name: any) => [`${val} orang`, name]}
              contentStyle={{ backgroundColor: '#0B2545', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={30}
              formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
            />
            <Bar dataKey="Target" fill="#D97706" radius={[4, 4, 0, 0]} name={`Target ${tab === 'guru' ? 'Guru' : 'Siswa'}`} />
            <Bar dataKey="Realisasi" fill="#0B2545" radius={[4, 4, 0, 0]} name={`Realisasi ${tab === 'guru' ? 'Guru' : 'Siswa'}`} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
