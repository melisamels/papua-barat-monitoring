'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface StatusChartProps {
  statusCounts: {
    planning: number;
    ready: number;
    ongoing: number;
    completed: number;
  };
}

export function StatusChart({ statusCounts }: StatusChartProps) {
  // Pilihan posisi label persentase: 'dalam' (di dalam irisan donat) atau 'luar' (di luar lingkaran donat)
  const [labelPosition, setLabelPosition] = useState<'dalam' | 'luar'>('dalam');

  const rawData = [
    { key: 'ongoing', name: 'Ongoing (Berjalan)', value: statusCounts.ongoing || 0, color: '#D97706', bgLight: 'bg-amber-50', textCol: 'text-amber-800', borderCol: 'border-amber-200' },
    { key: 'ready', name: 'Ready (Siap)', value: statusCounts.ready || 0, color: '#2563EB', bgLight: 'bg-blue-50', textCol: 'text-blue-800', borderCol: 'border-blue-200' },
    { key: 'planning', name: 'Planning (Rencana)', value: statusCounts.planning || 0, color: '#64748B', bgLight: 'bg-slate-100', textCol: 'text-slate-700', borderCol: 'border-slate-200' },
    { key: 'completed', name: 'Completed (Selesai)', value: statusCounts.completed || 0, color: '#16A34A', bgLight: 'bg-emerald-50', textCol: 'text-emerald-800', borderCol: 'border-emerald-200' },
  ];

  const total = rawData.reduce((acc, curr) => acc + curr.value, 0);

  const data = rawData.map(item => {
    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
    return {
      ...item,
      percentage: `${pct}%`,
      numericPct: total > 0 ? Math.round((item.value / total) * 100) : 0,
    };
  });

  const activeSlices = data.filter(d => d.value > 0);

  // Custom Label Renderer untuk Di Dalam Irisan
  const renderInnerLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[11px] font-black pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom Label Renderer untuk Di Luar Irisan
  const renderOuterLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
    if (percent < 0.04) return null;
    const radius = outerRadius + 14;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    return (
      <text
        x={x}
        y={y}
        fill="#1e293b"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-[10px] font-black pointer-events-none"
      >
        {`${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Status Program & Kegiatan</h3>
            <p className="text-xs text-slate-500">Distribusi status 23 distrik kegiatan</p>
          </div>

          {/* Toggle Tombol Label Persentase: Di Dalam / Di Luar */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold self-start sm:self-auto">
            <button
              onClick={() => setLabelPosition('dalam')}
              className={`px-2 py-1 rounded-md transition-all ${
                labelPosition === 'dalam'
                  ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilkan nilai persentase di dalam irisan donat"
            >
              Di Dalam
            </button>
            <button
              onClick={() => setLabelPosition('luar')}
              className={`px-2 py-1 rounded-md transition-all ${
                labelPosition === 'luar'
                  ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilkan nilai persentase di luar lingkaran donat"
            >
              Di Luar
            </button>
          </div>
        </div>

        {/* Bagan Donat dengan Persentase Langsung */}
        <div className="w-full h-56 relative flex items-center justify-center">
          {total === 0 ? (
            <div className="text-slate-400 text-xs">Tidak ada data kegiatan</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, bottom: 10, left: 15, right: 15 }}>
                  <Pie
                    data={activeSlices}
                    innerRadius={labelPosition === 'luar' ? 45 : 55}
                    outerRadius={labelPosition === 'luar' ? 70 : 82}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={labelPosition === 'luar'}
                    label={labelPosition === 'dalam' ? renderInnerLabel : renderOuterLabel}
                  >
                    {activeSlices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} Kegiatan (${item.payload.percentage})`,
                      item.payload.name,
                    ]}
                    contentStyle={{
                      backgroundColor: '#0B2545',
                      color: '#fff',
                      borderRadius: '10px',
                      fontSize: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 leading-none">{total}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Kegiatan</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rincian Donat dengan Nilai Persentase Eksplisit */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
        {data.map(item => (
          <div
            key={item.key}
            className={`p-2 rounded-xl border ${item.bgLight} ${item.borderCol} flex items-center justify-between`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-semibold text-[11px] text-slate-700 truncate">{item.name.split(' ')[0]}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-black text-xs text-slate-900 mr-1">{item.value}</span>
              <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md bg-white/80 ${item.textCol} border border-black/5 shadow-2xs`}>
                {item.percentage}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
