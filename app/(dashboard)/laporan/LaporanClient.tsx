'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { formatRupiah, formatDateIndo, formatDateTimeIndo } from '@/lib/utils/formatters';
import { Regency, Training, SystemSettings } from '@/lib/types';
import {
  FileText,
  Printer,
  RotateCcw,
} from 'lucide-react';

import { getMergedTrainings } from '@/lib/utils/customStorageSync';

interface LaporanClientProps {
  regencies: Regency[];
  trainings: Training[];
  initialSummary: any;
  settings: SystemSettings;
}

export default function LaporanClient({ regencies, trainings: initialTrainings, initialSummary, settings }: LaporanClientProps) {
  const [reportType, setReportType] = useState<
    'kegiatan' | 'kabupaten' | 'bulanan' | 'tahunan' | 'keseluruhan'
  >('keseluruhan');

  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('');
  const [regencyId, setRegencyId] = useState('');
  const [status, setStatus] = useState('');
  const [trainings, setTrainings] = useState<Training[]>(initialTrainings);

  React.useEffect(() => {
    const sync = () => setTrainings(getMergedTrainings(initialTrainings));
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, [initialTrainings]);

  // Filtered trainings for report preview
  const filteredTrainings = useMemo(() => {
    return trainings.filter(t => {
      const matchReg = !regencyId || t.regency_id === regencyId;
      const matchStatus = !status || t.status === status;
      return matchReg && matchStatus;
    });
  }, [trainings, regencyId, status]);

  const handleReset = () => {
    setYear('2026');
    setMonth('');
    setRegencyId('');
    setStatus('');
  };

  const printUrl = `/laporan/cetak?type=${reportType}&year=${year}&month=${month}&regency=${regencyId}&status=${status}`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Laporan & Eksekutif PDF' }]} />

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-700" />
            <span>Pusat Laporan & Cetak Program</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate 5 jenis laporan resmi bertanda tangan pejabat, format A4 ramah cetak & unduh PDF
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={printUrl}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Buka Format Cetak / PDF</span>
          </Link>
        </div>
      </div>

      {/* Filter and Report Type Selector (#39, #40) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">
            Pilih Jenis Laporan:
          </span>
        </div>

        {/* 5 Report Type Tabs (#39) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { id: 'keseluruhan', label: '1. Laporan Keseluruhan Program' },
            { id: 'kabupaten', label: '2. Laporan Per Kabupaten' },
            { id: 'kegiatan', label: '3. Laporan Per Kegiatan' },
            { id: 'bulanan', label: '4. Laporan Bulanan' },
            { id: 'tahunan', label: '5. Laporan Tahunan' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`p-3 rounded-xl text-xs font-bold border text-left transition-all ${
                reportType === tab.id
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters (#40) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tahun Anggaran</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Bulan</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg cursor-pointer"
            >
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Kabupaten</label>
            <select
              value={regencyId}
              onChange={(e) => setRegencyId(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg cursor-pointer"
            >
              <option value="">Semua Kabupaten</option>
              {regencies.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Status Kegiatan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="Completed">Completed</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Ready">Ready</option>
              <option value="Planning">Planning</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>

      {/* Report Preview Document Container (#41, #42, #43) */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Report Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            {settings.institution_name}
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            PAPUA BARAT MONITORING SYSTEM
          </h2>
          <p className="text-sm font-semibold text-emerald-800 mt-0.5">
            {settings.program_name} — Tahun Anggaran {year}
          </p>
          <div className="text-[10px] text-slate-400 mt-2">
            Tanggal Pratinjau: {formatDateTimeIndo(new Date())}
          </div>
        </div>

        {/* Executive Summary Metrics Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Distrik Kegiatan</span>
            <strong className="text-slate-900 text-base">{initialSummary.training_count} Kegiatan</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Kegiatan Selesai</span>
            <strong className="text-emerald-700 text-base">
              {initialSummary.status_counts.completed} ({initialSummary.overall_progress}%)
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Realisasi Guru</span>
            <strong className="text-slate-900 text-base">
              {initialSummary.participants.actual_teachers} / {initialSummary.participants.target_teachers}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Realisasi Siswa</span>
            <strong className="text-slate-900 text-base">
              {initialSummary.participants.actual_students} / {initialSummary.participants.target_students}
            </strong>
          </div>
        </div>

        {/* Table of Results */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-2.5 border-r border-slate-200">No</th>
                <th className="p-2.5 border-r border-slate-200">Kabupaten</th>
                <th className="p-2.5 border-r border-slate-200">Distrik</th>
                <th className="p-2.5 border-r border-slate-200">Venue & Lokasi</th>
                <th className="p-2.5 border-r border-slate-200">Jadwal</th>
                <th className="p-2.5 border-r border-slate-200 text-center">Status</th>
                <th className="p-2.5 border-r border-slate-200 text-right">RAB (Rp)</th>
                <th className="p-2.5 text-right">Realisasi (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredTrainings.map((t, idx) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">{t.regency_name}</td>
                  <td className="p-2.5 border-r border-slate-200">{t.district_name}</td>
                  <td className="p-2.5 border-r border-slate-200">{t.venue}</td>
                  <td className="p-2.5 border-r border-slate-200 text-[11px] whitespace-nowrap">
                    {formatDateIndo(t.start_date)} - {formatDateIndo(t.end_date)}
                  </td>
                  <td className="p-2.5 border-r border-slate-200 text-center">
                    <span className="font-bold text-[10px]">{t.status}</span>
                  </td>
                  <td className="p-2.5 border-r border-slate-200 text-right">{formatRupiah(t.total_rab)}</td>
                  <td className="p-2.5 text-right font-bold text-emerald-800">{formatRupiah(t.total_realization)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Report Signature (#111) */}
        <div className="flex justify-end pt-8 pr-6 text-xs">
          <div className="text-center space-y-12">
            <div>
              <p className="text-slate-600">Manokwari, {formatDateIndo(new Date())}</p>
              <p className="font-bold text-slate-900 mt-1">Mengetahui,</p>
              <p className="text-slate-700">{settings.report_signatory_title}</p>
            </div>
            <div>
              <p className="font-black text-slate-900 underline text-sm tracking-wide">
                {settings.report_signatory_name}
              </p>
              <p className="text-[10px] text-slate-500">NIP. 19680512 199403 1 005</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
