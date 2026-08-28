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
import {
  Users,
  GraduationCap,
  Building2,
  CalendarDays,
  Search,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface AttendanceAnalytics {
  summary: {
    teacher_target: number;
    teacher_hadir: number;
    teacher_rate: number;
    student_target: number;
    student_hadir: number;
    student_rate: number;
    overall_rate: number;
  };
  byRegency: Array<{
    id: string;
    name: string;
    code: string;
    teacher_target: number;
    teacher_actual: number;
    teacher_hadir: number;
    teacher_rate: number;
    student_target: number;
    student_actual: number;
    student_hadir: number;
    student_rate: number;
    overall_rate: number;
  }>;
  byDistrict: Array<{
    id: string;
    name: string;
    regency_name: string;
    status: string;
    teacher_target: number;
    teacher_hadir: number;
    teacher_rate: number;
    student_target: number;
    student_hadir: number;
    student_rate: number;
    overall_rate: number;
  }>;
  byTraining: Array<{
    id: string;
    venue: string;
    regency_name: string;
    district_name: string;
    pic: string;
    status: string;
    teacher_target: number;
    teacher_hadir: number;
    teacher_rate: number;
    student_target: number;
    student_hadir: number;
    student_rate: number;
    overall_rate: number;
  }>;
}

interface AttendanceDashboardProps {
  analytics: AttendanceAnalytics;
}

export function AttendanceDashboard({ analytics }: AttendanceDashboardProps) {
  const [viewMode, setViewMode] = useState<'kabupaten' | 'distrik' | 'kegiatan'>('kabupaten');
  const [searchTerm, setSearchTerm] = useState('');

  const { summary, byRegency, byDistrict, byTraining } = analytics;

  // Prepare chart data according to viewMode
  let chartData: any[] = [];
  let tableRows: any[] = [];

  if (viewMode === 'kabupaten') {
    chartData = byRegency.map(r => ({
      name: r.code || r.name,
      fullName: r.name,
      'Absensi Guru (%)': r.teacher_rate,
      'Absensi Siswa (%)': r.student_rate,
      teacherHadir: r.teacher_hadir,
      teacherTarget: r.teacher_target,
      studentHadir: r.student_hadir,
      studentTarget: r.student_target,
      overallRate: r.overall_rate,
    }));
    tableRows = byRegency.map(r => ({
      id: r.id,
      title: r.name,
      subtitle: `Kode Wilayah: ${r.code}`,
      teacherHadir: r.teacher_hadir,
      teacherTarget: r.teacher_target,
      teacherRate: r.teacher_rate,
      studentHadir: r.student_hadir,
      studentTarget: r.student_target,
      studentRate: r.student_rate,
      overallRate: r.overall_rate,
    }));
  } else if (viewMode === 'distrik') {
    chartData = byDistrict.slice(0, 10).map(d => ({
      name: d.name.length > 12 ? `${d.name.substring(0, 10)}...` : d.name,
      fullName: `Distrik ${d.name} (${d.regency_name})`,
      'Absensi Guru (%)': d.teacher_rate,
      'Absensi Siswa (%)': d.student_rate,
      teacherHadir: d.teacher_hadir,
      teacherTarget: d.teacher_target,
      studentHadir: d.student_hadir,
      studentTarget: d.student_target,
      overallRate: d.overall_rate,
    }));
    tableRows = byDistrict.map(d => ({
      id: d.id,
      title: `Distrik ${d.name}`,
      subtitle: d.regency_name,
      teacherHadir: d.teacher_hadir,
      teacherTarget: d.teacher_target,
      teacherRate: d.teacher_rate,
      studentHadir: d.student_hadir,
      studentTarget: d.student_target,
      studentRate: d.student_rate,
      overallRate: d.overall_rate,
    }));
  } else {
    chartData = byTraining.slice(0, 8).map(t => ({
      name: t.venue.length > 14 ? `${t.venue.substring(0, 12)}...` : t.venue,
      fullName: `${t.venue} (${t.district_name})`,
      'Absensi Guru (%)': t.teacher_rate,
      'Absensi Siswa (%)': t.student_rate,
      teacherHadir: t.teacher_hadir,
      teacherTarget: t.teacher_target,
      studentHadir: t.student_hadir,
      studentTarget: t.student_target,
      overallRate: t.overall_rate,
    }));
    tableRows = byTraining.map(t => ({
      id: t.id,
      title: t.venue,
      subtitle: `${t.district_name}, ${t.regency_name}`,
      teacherHadir: t.teacher_hadir,
      teacherTarget: t.teacher_target,
      teacherRate: t.teacher_rate,
      studentHadir: t.student_hadir,
      studentTarget: t.student_target,
      studentRate: t.student_rate,
      overallRate: t.overall_rate,
    }));
  }

  const filteredRows = tableRows.filter(row =>
    row.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      {/* Header & Quick Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
              Absensi & Kehadiran GASING
            </span>
          </div>
          <h3 className="font-black text-slate-900 text-lg mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <span>Tabel & Grafik Absensi Guru dan Siswa</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring tingkat kehadiran guru dan siswa per Kabupaten, Distrik, dan Kegiatan Pelatihan
          </p>
        </div>

        {/* View Switcher: Kabupaten / Distrik / Kegiatan */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
          <button
            onClick={() => setViewMode('kabupaten')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'kabupaten'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Per Kabupaten</span>
          </button>
          <button
            onClick={() => setViewMode('distrik')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'distrik'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Per Distrik</span>
          </button>
          <button
            onClick={() => setViewMode('kegiatan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'kegiatan'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Per Kegiatan</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards for Attendance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Guru Attendance */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Absensi Guru
            </span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {summary.teacher_hadir} <span className="text-xs font-normal text-slate-500">/ {summary.teacher_target} Hadir</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-700">{summary.teacher_rate}%</span>
            <span className="text-[10px] text-slate-500 block font-medium">Tingkat Kehadiran</span>
          </div>
        </div>

        {/* Siswa Attendance */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Absensi Siswa
            </span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {summary.student_hadir} <span className="text-xs font-normal text-slate-500">/ {summary.student_target} Hadir</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-700">{summary.student_rate}%</span>
            <span className="text-[10px] text-slate-500 block font-medium">Tingkat Kehadiran</span>
          </div>
        </div>

        {/* Overall Attendance */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Rata-Rata Wilayah
            </span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {summary.teacher_hadir + summary.student_hadir} <span className="text-xs font-normal text-slate-500">Total Peserta</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-700">{summary.overall_rate}%</span>
            <span className="text-[10px] text-slate-500 block font-medium">Konsistensi Kelas</span>
          </div>
        </div>
      </div>

      {/* Visual Chart: Perbandingan Kehadiran Guru vs Siswa */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Grafik Perbandingan Kehadiran Guru vs Siswa ({viewMode === 'kabupaten' ? '7 Kabupaten' : viewMode === 'distrik' ? 'Distrik Terpilih' : 'Kegiatan Terpilih'})
          </h4>
          <span className="text-slate-400 text-xs font-medium">Satuan: Persentase (%)</span>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} unit="%" />
              <Tooltip
                formatter={(val: any, name: any) => [`${val}%`, name]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                contentStyle={{ backgroundColor: '#0B2545', color: '#fff', borderRadius: '10px', fontSize: '12px', border: 'none' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Absensi Guru (%)" fill="#D97706" radius={[6, 6, 0, 0]} maxBarSize={35} />
              <Bar dataKey="Absensi Siswa (%)" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Table: Rekap Absensi */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Tabel Rincian Absensi {viewMode === 'kabupaten' ? 'Per Kabupaten' : viewMode === 'distrik' ? 'Per Distrik' : 'Per Kegiatan'}
          </h4>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari wilayah / kegiatan..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Nama {viewMode === 'kabupaten' ? 'Kabupaten' : viewMode === 'distrik' ? 'Distrik' : 'Kegiatan'}</th>
                <th className="p-3">Absensi Guru</th>
                <th className="p-3">Absensi Siswa</th>
                <th className="p-3">Rata-Rata Kehadiran</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map(row => {
                const isGreat = row.overallRate >= 90;
                const isGood = row.overallRate >= 75;

                return (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{row.title}</div>
                      <div className="text-[10px] text-slate-500">{row.subtitle}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{row.teacherHadir} / {row.teacherTarget}</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          {row.teacherRate}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{row.studentHadir} / {row.studentTarget}</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {row.studentRate}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full ${
                              isGreat ? 'bg-emerald-600' : isGood ? 'bg-blue-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${row.overallRate}%` }}
                          />
                        </div>
                        <span className="font-black text-slate-800">{row.overallRate}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isGreat
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isGood
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {isGreat ? 'Sangat Baik' : isGood ? 'Baik' : 'Cukup'}
                      </span>
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
