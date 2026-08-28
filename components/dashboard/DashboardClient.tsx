'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/components/providers/AppProvider';
import { fetchProgramSummary, fetchRegencies, fetchAttendanceStats } from '@/app/actions/data';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { BudgetComparisonChart } from '@/components/dashboard/BudgetComparisonChart';
import { ParticipantChart } from '@/components/dashboard/ParticipantChart';
import { AttendanceDashboard } from '@/components/dashboard/AttendanceDashboard';
import { UpcomingTrainings } from '@/components/dashboard/UpcomingTrainings';
import { AttentionRequired } from '@/components/dashboard/AttentionRequired';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { DashboardFilterBar } from '@/components/dashboard/DashboardFilterBar';
import { getRolePermissions } from '@/lib/auth/session';
import { Sparkles, MapPin, AlertCircle, Pencil, Check, X } from 'lucide-react';
import Link from 'next/link';

// Dynamically import PapuaMap to avoid SSR issues with Leaflet
const PapuaMap = dynamic(
  () => import('@/components/dashboard/PapuaMap').then(mod => mod.PapuaMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[440px] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm animate-pulse border border-slate-200">
        Memuat Peta Interaktif Papua Barat...
      </div>
    ),
  }
);

interface DashboardClientProps {
  initialSummary: any;
  initialRegencies: any[];
  initialUpcoming: any[];
  initialAttention: any[];
  initialLogs: any[];
  initialAttendance: any;
}

export default function DashboardClient({
  initialSummary,
  initialRegencies,
  initialUpcoming,
  initialAttention,
  initialLogs,
  initialAttendance,
}: DashboardClientProps) {
  const { currentUser, setCurrentUser, showToast, globalFilter, setGlobalFilter } = useApp();
  const perms = getRolePermissions(currentUser.role);

  const [summary, setSummary] = useState(initialSummary);
  const [regencies, setRegencies] = useState(initialRegencies);
  const [attendanceStats, setAttendanceStats] = useState(initialAttendance);

  // Edit User Name State (#1)
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.full_name || '');

  // Keep nameInput in sync if currentUser changes (e.g. role switch)
  React.useEffect(() => {
    setNameInput(currentUser.full_name || '');
  }, [currentUser.full_name]);

  // When globalFilter changes in header or filter bar, fetch updated data
  React.useEffect(() => {
    fetchProgramSummary(globalFilter).then(setSummary);
    fetchRegencies(globalFilter).then(setRegencies);
    fetchAttendanceStats(globalFilter).then(setAttendanceStats);
  }, [globalFilter]);

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nameInput.trim()) {
      showToast('Nama tidak boleh kosong', 'error');
      return;
    }
    setCurrentUser({
      ...currentUser,
      full_name: nameInput.trim(),
    });
    setIsEditingName(false);
    showToast(`Nama berhasil diubah menjadi: ${nameInput.trim()}`);
  };

  const handleResetFilter = () => {
    setGlobalFilter({
      fiscal_year: 2026,
      month: null,
      regency_id: null,
    });
  };

  const hasData = summary.training_count > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Executive Header with Editable Name (#1) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Pemerintah Provinsi Papua Barat
            </span>
          </div>

          {/* Editable Welcome Name */}
          <div className="mt-1.5 flex items-center gap-3">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">Selamat Datang,</span>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  autoFocus
                  placeholder="Masukkan nama Anda..."
                  className="px-3 py-1 text-xl font-bold bg-slate-50 border-2 border-emerald-600 rounded-xl focus:outline-hidden focus:bg-white text-slate-900 shadow-inner"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-xs"
                  title="Simpan Nama"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(currentUser.full_name);
                    setIsEditingName(false);
                  }}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
                  title="Batal"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Selamat Datang, <span className="text-emerald-800 underline decoration-emerald-400 decoration-wavy underline-offset-4">{currentUser.full_name}</span>
                </h1>
                {currentUser.role !== 'viewer' && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                    title="Klik untuk mengubah nama Anda"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 mt-1">
            Monitoring Program Pandai Berhitung dengan Metode GASING — Provinsi Papua Barat
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/ai-assistant"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0B2545] to-[#1E5E3A] hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Program Assistant</span>
          </Link>
        </div>
      </div>

      {/* Global Filter Bar (#10) */}
      <DashboardFilterBar
        filter={globalFilter}
        regencies={regencies}
        onChange={setGlobalFilter}
        onReset={handleResetFilter}
      />

      {/* Empty State if filter returns no items (#71) */}
      {!hasData ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Data Kegiatan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ditemukan kegiatan pelatihan untuk filter tahun, bulan, atau kabupaten yang dipilih. Silakan reset filter untuk melihat data keseluruhan.
          </p>
          <button
            onClick={handleResetFilter}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <>
          {/* Section 1: KPI Cards Grid (#8, #60, #66) */}
          <KpiCards summary={summary} showFinancial={perms.canViewFinancialBreakdown} />

          {/* Section 2: Interactive Papua Barat Map (#9, #67) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-700" />
                  <span>Peta Sebaran Kegiatan & Status Wilayah Papua Barat</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribusi pelaksanaan di 7 Kabupaten (Manokwari, Mansel, Pegaf, Bintuni, Wondama, Fakfak, Kaimana)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" /> Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Ongoing
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Ready
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Planning
                </span>
              </div>
            </div>

            <PapuaMap regencies={regencies} />
          </div>

          {/* Section 3: Visual Analytical Charts (Status Donut with % and Target vs Actual) (#3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Breakdown Donut Chart with explicit percentages (#3) */}
            <div className="lg:col-span-1">
              <StatusChart statusCounts={summary.status_counts} />
            </div>

            {/* Target vs Actual Participants Chart */}
            <div className="lg:col-span-2">
              <ParticipantChart regencies={regencies} />
            </div>
          </div>

          {/* Section 4: Tabel & Grafik Absensi Guru dan Siswa (#2) */}
          {attendanceStats && (
            <AttendanceDashboard analytics={attendanceStats} />
          )}

          {/* Section 5: Financial RAB vs Realization Chart (Protected for Finance & Super Admin) */}
          {perms.canViewFinancialBreakdown && (
            <BudgetComparisonChart regencies={regencies} />
          )}

          {/* Section 6: Operational Action Feeds (Upcoming, Attention, Audit) (#11, #12, #13) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UpcomingTrainings trainings={initialUpcoming} />
            <AttentionRequired items={initialAttention} />
            <RecentActivity logs={initialLogs} />
          </div>
        </>
      )}
    </div>
  );
}
