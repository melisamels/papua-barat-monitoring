'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/components/providers/AppProvider';
import { fetchProgramSummary, fetchRegencies } from '@/app/actions/data';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { BudgetComparisonChart } from '@/components/dashboard/BudgetComparisonChart';
import { ParticipantChart } from '@/components/dashboard/ParticipantChart';
import { UpcomingTrainings } from '@/components/dashboard/UpcomingTrainings';
import { AttentionRequired } from '@/components/dashboard/AttentionRequired';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { DashboardFilterBar } from '@/components/dashboard/DashboardFilterBar';
import { getRolePermissions } from '@/lib/auth/session';
import { Sparkles, MapPin, AlertCircle } from 'lucide-react';
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
}

export default function DashboardClient({
  initialSummary,
  initialRegencies,
  initialUpcoming,
  initialAttention,
  initialLogs,
}: DashboardClientProps) {
  const { currentUser, globalFilter, setGlobalFilter } = useApp();
  const perms = getRolePermissions(currentUser.role);

  const [summary, setSummary] = useState(initialSummary);
  const [regencies, setRegencies] = useState(initialRegencies);

  // When globalFilter changes in header or filter bar, fetch updated data
  React.useEffect(() => {
    fetchProgramSummary(globalFilter).then(setSummary);
    fetchRegencies(globalFilter).then(setRegencies);
  }, [globalFilter]);

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
      {/* Welcome & Executive Header (#7, #85) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Pemerintah Provinsi Papua Barat
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Selamat Datang, {currentUser.full_name}
          </h1>
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
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Ongoing
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Ready
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Planning
                </span>
              </div>
            </div>

            <PapuaMap regencies={regencies} />
          </div>

          {/* Section 3: Visual Analytical Charts (#66) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Breakdown Donut Chart */}
            <div className="lg:col-span-1">
              <StatusChart statusCounts={summary.status_counts} />
            </div>

            {/* Target vs Actual Participants Chart */}
            <div className="lg:col-span-2">
              <ParticipantChart regencies={regencies} />
            </div>
          </div>

          {/* Section 4: Financial RAB vs Realization Chart (Protected for Finance & Super Admin) */}
          {perms.canViewFinancialBreakdown && (
            <BudgetComparisonChart regencies={regencies} />
          )}

          {/* Section 5: Operational Action Feeds (Upcoming, Attention, Audit) (#11, #12, #13) */}
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
