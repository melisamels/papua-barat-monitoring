'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useApp } from '@/components/providers/AppProvider';
import { getRolePermissions } from '@/lib/auth/session';
import { formatRupiah, formatDateIndo, getStatusBadgeClass } from '@/lib/utils/formatters';
import {
  MapPin,
  Building2,
  GraduationCap,
  CalendarDays,
  Users,
  Wallet,
  Receipt,
  Camera,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface RegencyDetailClientProps {
  regency: any;
}

export default function RegencyDetailClient({ regency }: RegencyDetailClientProps) {
  const { currentUser } = useApp();
  const perms = getRolePermissions(currentUser.role);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'distrik' | 'sekolah' | 'kegiatan' | 'peserta' | 'rab' | 'realisasi' | 'dokumentasi' | 'laporan'
  >('overview');

  if (!regency) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Kabupaten Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mt-1">Data kabupaten dengan ID tersebut tidak tersedia.</p>
        <Link
          href="/kabupaten"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Kabupaten</span>
        </Link>
      </div>
    );
  }

  const badge = getStatusBadgeClass(regency.status || 'Planning');

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Master Kabupaten', href: '/kabupaten' },
          { label: regency.name },
        ]}
      />

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-black text-xl shrink-0">
            {regency.code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{regency.name}</h1>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                {regency.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ibukota: <strong className="text-slate-800">{regency.capital || '-'}</strong> • Progress Program: <strong className="text-emerald-700">{regency.progress}%</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/laporan/cetak?kabupaten=${regency.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>Cetak Rekap Kabupaten</span>
          </Link>
          <Link
            href="/kabupaten"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </div>

      {/* 9 Tabs Detail Kabupaten */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/70 p-1.5 gap-1 text-xs font-bold">
          {[
            { key: 'overview', label: '1. Overview', icon: MapPin },
            { key: 'distrik', label: `2. Distrik (${regency.districts.length})`, icon: Building2 },
            { key: 'sekolah', label: `3. Sekolah (${regency.schools.length})`, icon: GraduationCap },
            { key: 'kegiatan', label: `4. Kegiatan (${regency.trainings.length})`, icon: CalendarDays },
            { key: 'peserta', label: '5. Rekap Peserta', icon: Users },
            { key: 'rab', label: '6. RAB', icon: Wallet, hidden: !perms.canViewFinancialBreakdown },
            { key: 'realisasi', label: '7. Realisasi', icon: Receipt, hidden: !perms.canViewFinancialBreakdown },
            { key: 'dokumentasi', label: `8. Dokumentasi (${regency.documentation.length})`, icon: Camera },
            { key: 'laporan', label: '9. Laporan', icon: FileText },
          ]
            .filter(t => !t.hidden)
            .map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
        </div>

        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Distrik</span>
                  <div className="text-xl font-black text-slate-800">{regency.district_count} Distrik</div>
                  <span className="text-xs text-emerald-700 font-semibold">{regency.trainings.length} Kegiatan</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Sekolah</span>
                  <div className="text-xl font-black text-slate-800">{regency.school_count} Sekolah</div>
                  <span className="text-xs text-slate-500">SD, SMP, SMA/SMK</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Guru</span>
                  <div className="text-xl font-black text-slate-800">
                    {regency.actual_teachers} <span className="text-xs font-normal text-slate-500">/ {regency.target_teachers}</span>
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold">
                    {regency.target_teachers > 0 ? Math.round((regency.actual_teachers / regency.target_teachers) * 100) : 0}% Tercapai
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Siswa</span>
                  <div className="text-xl font-black text-slate-800">
                    {regency.actual_students} <span className="text-xs font-normal text-slate-500">/ {regency.target_students}</span>
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold">
                    {regency.target_students > 0 ? Math.round((regency.actual_students / regency.target_students) * 100) : 0}% Tercapai
                  </span>
                </div>
              </div>

              {perms.canViewFinancialBreakdown && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0B2545] text-white space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Ringkasan Keuangan {regency.name}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Alokasi RAB</span>
                      <strong className="text-base">{formatRupiah(regency.total_rab)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Realisasi</span>
                      <strong className="text-base text-emerald-400">{formatRupiah(regency.total_realization)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sisa Anggaran</span>
                      <strong className="text-base text-amber-300">
                        {formatRupiah(regency.total_rab - regency.total_realization)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tingkat Penyerapan</span>
                      <strong className="text-base">
                        {regency.total_rab > 0 ? Math.round((regency.total_realization / regency.total_rab) * 100) : 0}%
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DISTRIK */}
          {activeTab === 'distrik' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Daftar Distrik di {regency.name} ({regency.districts.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {regency.districts.map((d: any) => (
                  <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Distrik {d.name}</span>
                      <span className="text-[10px] text-slate-500">Kode: {d.code}</span>
                    </div>
                    <div className="text-slate-600">Koordinator: <strong>{d.coordinator}</strong></div>
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
                      <span>Target Guru: <strong>{d.target_teachers}</strong></span>
                      <span>Target Siswa: <strong>{d.target_students}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SEKOLAH */}
          {activeTab === 'sekolah' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Daftar Sekolah Terdaftar ({regency.schools.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {regency.schools.map((s: any) => (
                  <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{s.name}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">{s.school_level}</span>
                    </div>
                    <div className="text-slate-600">Distrik: <strong>{s.district_name}</strong></div>
                    <div className="text-slate-600">Kepala Sekolah: <strong>{s.principal}</strong></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: KEGIATAN */}
          {activeTab === 'kegiatan' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Kegiatan Pelatihan di Wilayah Ini ({regency.trainings.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {regency.trainings.map((t: any) => (
                  <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{t.venue}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200">{t.status}</span>
                    </div>
                    <div className="text-slate-600">Distrik: <strong>{t.district_name}</strong></div>
                    <div className="text-slate-600">Jadwal: {formatDateIndo(t.start_date)} - {formatDateIndo(t.end_date)}</div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-emerald-700 font-bold">{formatRupiah(t.total_realization)}</span>
                      <Link href={`/kegiatan/${t.id}`} className="text-emerald-700 font-bold hover:underline">
                        Buka Workspace →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PESERTA */}
          {activeTab === 'peserta' && (
            <div className="text-xs space-y-3">
              <h4 className="font-bold text-slate-900 uppercase">Rekapitulasi Sasaran Peserta</h4>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div>Total Guru Mengikuti: <strong>{regency.actual_teachers} Orang</strong></div>
                <div>Total Siswa Mengikuti: <strong>{regency.actual_students} Siswa</strong></div>
              </div>
            </div>
          )}

          {/* TAB 6 & 7: RAB & REALISASI */}
          {(activeTab === 'rab' || activeTab === 'realisasi') && (
            <div className="text-xs space-y-3">
              <h4 className="font-bold text-slate-900 uppercase">Rincian Anggaran Tingkat Kabupaten</h4>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div>Alokasi RAB Kabupaten: <strong>{formatRupiah(regency.total_rab)}</strong></div>
                <div>Realisasi Biaya: <strong className="text-emerald-800">{formatRupiah(regency.total_realization)}</strong></div>
                <div>Sisa Anggaran: <strong>{formatRupiah(regency.total_rab - regency.total_realization)}</strong></div>
              </div>
            </div>
          )}

          {/* TAB 8: DOKUMENTASI */}
          {activeTab === 'dokumentasi' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Dokumentasi Kegiatan ({regency.documentation.length} Foto)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {regency.documentation.map((doc: any) => (
                  <div key={doc.id} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={doc.file_url} alt={doc.caption} className="w-full h-32 object-cover" />
                    <div className="p-2 text-[11px] font-medium text-slate-800 truncate">{doc.caption}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: LAPORAN */}
          {activeTab === 'laporan' && (
            <div className="text-xs space-y-3">
              <h4 className="font-bold text-slate-900 uppercase">Laporan Pelaksanaan Tingkat Kabupaten</h4>
              <p className="text-slate-600">Unduh atau cetak laporan resmi pelaksanaan di {regency.name}.</p>
              <Link
                href={`/laporan/cetak?type=kabupaten&regency=${regency.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold"
              >
                <FileText className="w-4 h-4" />
                <span>Buka Dokumen Cetak / PDF</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
