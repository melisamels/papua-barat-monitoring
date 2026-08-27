'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
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
  const data = [
    { name: 'Completed (Selesai)', value: statusCounts.completed, color: '#16A34A' },
    { name: 'Ongoing (Berjalan)', value: statusCounts.ongoing, color: '#D97706' },
    { name: 'Ready (Siap)', value: statusCounts.ready, color: '#2563EB' },
    { name: 'Planning (Rencana)', value: statusCounts.planning, color: '#64748B' },
  ].filter(d => d.value > 0);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Status Program Pelatihan</h3>
          <p className="text-xs text-slate-500">Distribusi 23 distrik kegiatan</p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded-lg">
          Total: {total} Kegiatan
        </span>
      </div>

      <div className="w-full h-64 relative flex items-center justify-center">
        {total === 0 ? (
          <div className="text-slate-400 text-xs">Tidak ada data kegiatan</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${value} Kegiatan`, 'Jumlah']}
                contentStyle={{ backgroundColor: '#0B2545', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
