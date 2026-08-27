'use client';

import React from 'react';
import {
  Building2,
  CalendarCheck,
  GraduationCap,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  PlayCircle,
  Calendar,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils/formatters';

interface KpiCardsProps {
  summary: {
    regency_count: number;
    district_count: number;
    school_count: number;
    training_count: number;
    status_counts: {
      planning: number;
      ready: number;
      ongoing: number;
      completed: number;
    };
    participants: {
      target_teachers: number;
      actual_teachers: number;
      target_students: number;
      actual_students: number;
      teacher_rate: number;
      student_rate: number;
    };
    financial: {
      total_rab: number;
      total_realization: number;
      balance: number;
      absorption_rate: number;
    };
    overall_progress: number;
  };
  showFinancial?: boolean;
}

export function KpiCards({ summary, showFinancial = true }: KpiCardsProps) {
  return (
    <div className="space-y-4">
      {/* Top Banner Progress (#8, #70) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#071629] via-[#0B2545] to-[#14472F] text-white p-6 rounded-2xl shadow-xl border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Glow orb decorations */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full md:w-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Progress Program Keseluruhan (T.A. 2026)</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{summary.status_counts.completed} dari {summary.training_count} Kegiatan Selesai</span>
            <span className="text-amber-400 text-sm font-bold px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
              {summary.overall_progress}%
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed">
            Program Pandai Berhitung dengan Metode GASING — Kolaborasi 7 Kabupaten & 23 Distrik Provinsi Papua Barat
          </p>
        </div>

        <div className="relative z-10 w-full md:w-80 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-lg">
          <div className="flex justify-between items-center text-xs font-bold mb-2.5">
            <span className="text-slate-200">Indeks Capaian Wilayah</span>
            <span className="text-amber-300 text-base font-black">{summary.overall_progress}%</span>
          </div>
          <div className="w-full h-3.5 bg-slate-950/60 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 rounded-full transition-all duration-700 shadow-md shadow-emerald-400/50"
              style={{ width: `${Math.min(100, Math.max(0, summary.overall_progress))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-300 mt-2 font-semibold">
            <span>Target: 23 Distrik</span>
            <span>Tercapai: {summary.status_counts.completed} Distrik</span>
          </div>
        </div>
      </div>

      {/* 4 KPI Groups Grid (#8) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Wilayah Sasaran */}
        <div className="bg-gradient-to-br from-white via-white to-blue-50/50 p-5 rounded-2xl border border-blue-100/80 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cakupan Wilayah</span>
            <span className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            {summary.regency_count} <span className="text-sm font-semibold text-slate-500">Kabupaten</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div><span className="font-bold text-slate-900">{summary.district_count}</span> Distrik</div>
            <div><span className="font-bold text-slate-900">{summary.school_count}</span> Sekolah</div>
            <div><span className="font-bold text-slate-900">{summary.training_count}</span> Kegiatan</div>
          </div>
        </div>

        {/* 2. Status Kegiatan */}
        <div className="bg-gradient-to-br from-white via-white to-emerald-50/50 p-5 rounded-2xl border border-emerald-100/80 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status Pelatihan</span>
            <span className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            {summary.status_counts.completed} <span className="text-sm font-semibold text-emerald-700">Selesai</span>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-3 border-t border-slate-100 text-[11px]">
            <span className="text-amber-700 font-bold px-1.5 py-0.5 bg-amber-50 rounded-md text-center">{summary.status_counts.ongoing} Berjalan</span>
            <span className="text-blue-700 font-bold px-1.5 py-0.5 bg-blue-50 rounded-md text-center">{summary.status_counts.ready} Siap</span>
            <span className="text-slate-600 font-bold px-1.5 py-0.5 bg-slate-100 rounded-md text-center">{summary.status_counts.planning} Rencana</span>
          </div>
        </div>

        {/* 3. Peserta Guru & Siswa */}
        <div className="bg-gradient-to-br from-white via-white to-amber-50/50 p-5 rounded-2xl border border-amber-100/80 shadow-xs hover:shadow-lg hover:border-amber-300 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Realisasi Peserta</span>
            <span className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            {(summary.participants.actual_teachers + summary.participants.actual_students).toLocaleString('id-ID')}
            <span className="text-sm font-semibold text-slate-500"> Orang</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div>
              Guru: <strong className="text-slate-900">{summary.participants.actual_teachers}</strong>
              <span className="text-[10px] text-slate-400">/{summary.participants.target_teachers}</span>
            </div>
            <div>
              Siswa: <strong className="text-slate-900">{summary.participants.actual_students}</strong>
              <span className="text-[10px] text-slate-400">/{summary.participants.target_students}</span>
            </div>
          </div>
        </div>

        {/* 4. Keuangan (RAB & Penyerapan) */}
        {showFinancial ? (
          <div className="bg-gradient-to-br from-white via-white to-teal-50/50 p-5 rounded-2xl border border-teal-100/80 shadow-xs hover:shadow-lg hover:border-teal-300 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Penyerapan Anggaran</span>
              <span className="p-2.5 bg-teal-500/10 text-teal-700 rounded-xl group-hover:scale-110 group-hover:bg-teal-700 group-hover:text-white transition-all shadow-xs">
                <Wallet className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-teal-800 mb-2 truncate tracking-tight">
              {formatRupiah(summary.financial.total_realization)}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500 truncate">RAB: {formatRupiah(summary.financial.total_rab)}</span>
              <span className="font-black text-teal-800 px-2 py-0.5 bg-teal-100/80 rounded-md shrink-0">
                {summary.financial.absorption_rate}%
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-center text-center">
            <span className="text-xs font-bold text-slate-400">Rincian Anggaran</span>
            <span className="text-xs text-slate-500 mt-1">Dibatasi untuk peran Viewer</span>
          </div>
        )}
      </div>
    </div>
  );
}
