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
  const [upcomingTrainings, setUpcomingTrainings] = useState(initialUpcoming);
  const [attentionItems, setAttentionItems] = useState(initialAttention);

  // Edit User Name State (#1)
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.full_name || '');

  // Keep nameInput in sync if currentUser changes (e.g. role switch)
  React.useEffect(() => {
    setNameInput(currentUser.full_name || '');
  }, [currentUser.full_name]);

  // Synchronize dashboard states with any customized regency data in localStorage
  const syncDashboardWithCustomData = React.useCallback((baseRegencies = initialRegencies, baseSummary = initialSummary, baseAttendance = initialAttendance) => {
    try {
      const regencyIds = ['reg-mkw', 'reg-mansel', 'reg-pegarfak', 'reg-bintuni', 'reg-wondama', 'reg-fakfak', 'reg-kaimana'];
      const customDataMap: Record<string, any> = {};
      let hasAnyCustom = false;

      for (const id of regencyIds) {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(`papua_regency_custom_v1_${id}`) : null;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.is_customized) {
              customDataMap[id] = parsed;
              hasAnyCustom = true;
            }
          } catch {
            // ignore
          }
        }
      }

      if (!hasAnyCustom) {
        setRegencies(baseRegencies);
        setSummary(baseSummary);
        setAttendanceStats(baseAttendance);
        setUpcomingTrainings(initialUpcoming);
        setAttentionItems(initialAttention);
        return;
      }

      // 1. Recalculate regencies
      const updatedRegencies = baseRegencies.map((r: any) => {
        const custom = customDataMap[r.id];
        if (!custom) return r;

        const districtList = Array.isArray(custom.districts) ? custom.districts : [];
        const schoolList = Array.isArray(custom.schools) ? custom.schools : [];
        const trainingList = Array.isArray(custom.trainings) ? custom.trainings : [];
        const participantList = Array.isArray(custom.participants) ? custom.participants : [];
        const budgetList = Array.isArray(custom.budgets) ? custom.budgets : [];
        const realizationList = Array.isArray(custom.realizations) ? custom.realizations : [];

        const totalRab = budgetList.reduce((acc: number, b: any) => acc + (Number(b.total) || 0), 0);
        const totalRealization = realizationList.reduce((acc: number, item: any) => acc + (Number(item.total) || 0), 0);
        const actualTeachers = participantList.filter((p: any) => p.participant_type === 'guru').length;
        const actualStudents = participantList.filter((p: any) => p.participant_type === 'siswa').length;
        const targetTeachers = districtList.reduce((acc: number, d: any) => acc + (Number(d.target_teachers) || 0), 0);
        const targetStudents = districtList.reduce((acc: number, d: any) => acc + (Number(d.target_students) || 0), 0);

        const completedCount = trainingList.filter((t: any) => t.status === 'Completed').length;
        const ongoingCount = trainingList.filter((t: any) => t.status === 'Ongoing').length;
        const readyCount = trainingList.filter((t: any) => t.status === 'Ready').length;

        const progress = trainingList.length > 0 ? Math.round((completedCount / trainingList.length) * 100) : 0;
        let status: any = 'Planning';
        if (completedCount === trainingList.length && trainingList.length > 0) status = 'Completed';
        else if (ongoingCount > 0) status = 'Ongoing';
        else if (readyCount > 0) status = 'Ready';

        return {
          ...r,
          district_count: districtList.length,
          school_count: schoolList.length,
          training_count: trainingList.length,
          actual_teachers: actualTeachers,
          actual_students: actualStudents,
          target_teachers: targetTeachers,
          target_students: targetStudents,
          total_rab: totalRab,
          total_realization: totalRealization,
          status,
          progress,
        };
      });

      setRegencies(updatedRegencies);

      // 2. Recalculate summary metrics
      let totalDistricts = 0;
      let totalSchools = 0;
      let totalTrainings = 0;
      let countPlanning = 0;
      let countReady = 0;
      let countOngoing = 0;
      let countCompleted = 0;
      let totalTargetTeachers = 0;
      let totalActualTeachers = 0;
      let totalTargetStudents = 0;
      let totalActualStudents = 0;
      let totalGlobalRab = 0;
      let totalGlobalRealization = 0;

      updatedRegencies.forEach((r: any) => {
        totalDistricts += r.district_count;
        totalSchools += r.school_count;
        totalTrainings += r.training_count;
        totalTargetTeachers += r.target_teachers;
        totalActualTeachers += r.actual_teachers;
        totalTargetStudents += r.target_students;
        totalActualStudents += r.actual_students;
        totalGlobalRab += r.total_rab;
        totalGlobalRealization += r.total_realization;

        const custom = customDataMap[r.id];
        if (custom) {
          const tList = Array.isArray(custom.trainings) ? custom.trainings : [];
          countPlanning += tList.filter((t: any) => t.status === 'Planning').length;
          countReady += tList.filter((t: any) => t.status === 'Ready').length;
          countOngoing += tList.filter((t: any) => t.status === 'Ongoing').length;
          countCompleted += tList.filter((t: any) => t.status === 'Completed').length;
        } else {
          if (r.status === 'Completed') countCompleted += r.training_count;
          else if (r.status === 'Ongoing') countOngoing += r.training_count;
          else if (r.status === 'Ready') countReady += r.training_count;
          else countPlanning += r.training_count;
        }
      });

      const totalBalance = totalGlobalRab - totalGlobalRealization;
      const globalAbsorptionRate = totalGlobalRab > 0 ? Math.round((totalGlobalRealization / totalGlobalRab) * 100) : 0;
      const globalProgress = totalTrainings > 0 ? Math.round((countCompleted / totalTrainings) * 100) : 0;

      setSummary({
        regency_count: updatedRegencies.length,
        district_count: totalDistricts,
        school_count: totalSchools,
        training_count: totalTrainings,
        status_counts: {
          planning: countPlanning,
          ready: countReady,
          ongoing: countOngoing,
          completed: countCompleted,
        },
        participants: {
          target_teachers: totalTargetTeachers,
          actual_teachers: totalActualTeachers,
          teacher_rate: totalTargetTeachers > 0 ? Math.round((totalActualTeachers / totalTargetTeachers) * 100) : 0,
          teacher_achievement_rate: totalTargetTeachers > 0 ? Math.round((totalActualTeachers / totalTargetTeachers) * 100) : 0,
          target_students: totalTargetStudents,
          actual_students: totalActualStudents,
          student_rate: totalTargetStudents > 0 ? Math.round((totalActualStudents / totalTargetStudents) * 100) : 0,
          student_achievement_rate: totalTargetStudents > 0 ? Math.round((totalActualStudents / totalTargetStudents) * 100) : 0,
        },
        financial: {
          total_rab: totalGlobalRab,
          total_realization: totalGlobalRealization,
          balance: totalBalance,
          absorption_rate: globalAbsorptionRate,
        },
        overall_progress: globalProgress,
      });

      // 3. Recalculate Attendance analytics
      if (baseAttendance) {
        const updatedByRegency = (baseAttendance.byRegency || []).map((br: any) => {
          const custom = customDataMap[br.id];
          if (!custom) return br;

          const pList = Array.isArray(custom.participants) ? custom.participants : [];
          const dList = Array.isArray(custom.districts) ? custom.districts : [];
          const tTarget = dList.reduce((acc: number, d: any) => acc + (Number(d.target_teachers) || 0), 0);
          const sTarget = dList.reduce((acc: number, d: any) => acc + (Number(d.target_students) || 0), 0);
          const tActual = pList.filter((p: any) => p.participant_type === 'guru').length;
          const sActual = pList.filter((p: any) => p.participant_type === 'siswa').length;
          const tHadir = pList.filter((p: any) => p.participant_type === 'guru' && p.attendance_status === 'Hadir').length;
          const sHadir = pList.filter((p: any) => p.participant_type === 'siswa' && p.attendance_status === 'Hadir').length;

          return {
            ...br,
            teacher_target: tTarget,
            teacher_actual: tActual,
            teacher_hadir: tHadir,
            teacher_rate: tTarget > 0 ? Math.round((tHadir / tTarget) * 100) : 0,
            student_target: sTarget,
            student_actual: sActual,
            student_hadir: sHadir,
            student_rate: sTarget > 0 ? Math.round((sHadir / sTarget) * 100) : 0,
            overall_rate: (tTarget + sTarget) > 0 ? Math.round(((tHadir + sHadir) / (tTarget + sTarget)) * 100) : 0,
          };
        });

        const clearedRegencyNames = new Set(
          updatedRegencies.filter((r: any) => customDataMap[r.id] && (!customDataMap[r.id].districts || customDataMap[r.id].districts.length === 0)).map((r: any) => r.name)
        );

        const updatedByDistrict = (baseAttendance.byDistrict || []).filter((bd: any) => !clearedRegencyNames.has(bd.regency_name));

        const sumTeacherTarget = updatedByRegency.reduce((acc: number, r: any) => acc + r.teacher_target, 0);
        const sumTeacherHadir = updatedByRegency.reduce((acc: number, r: any) => acc + r.teacher_hadir, 0);
        const sumStudentTarget = updatedByRegency.reduce((acc: number, r: any) => acc + r.student_target, 0);
        const sumStudentHadir = updatedByRegency.reduce((acc: number, r: any) => acc + r.student_hadir, 0);

        setAttendanceStats({
          summary: {
            teacher_target: sumTeacherTarget,
            teacher_hadir: sumTeacherHadir,
            teacher_rate: sumTeacherTarget > 0 ? Math.round((sumTeacherHadir / sumTeacherTarget) * 100) : 0,
            student_target: sumStudentTarget,
            student_hadir: sumStudentHadir,
            student_rate: sumStudentTarget > 0 ? Math.round((sumStudentHadir / sumStudentTarget) * 100) : 0,
            overall_rate: (sumTeacherTarget + sumStudentTarget) > 0 ? Math.round(((sumTeacherHadir + sumStudentHadir) / (sumTeacherTarget + sumStudentTarget)) * 100) : 0,
          },
          byRegency: updatedByRegency,
          byDistrict: updatedByDistrict,
        });
      }

      // 4. Update upcoming & attention items
      const clearedRegencyIds = new Set(
        updatedRegencies.filter((r: any) => customDataMap[r.id] && (!customDataMap[r.id].trainings || customDataMap[r.id].trainings.length === 0)).map((r: any) => r.id)
      );
      setUpcomingTrainings((initialUpcoming || []).filter((u: any) => !clearedRegencyIds.has(u.regency_id)));
      setAttentionItems((initialAttention || []).filter((a: any) => !clearedRegencyIds.has(a.regency_id)));

    } catch (err) {
      console.warn('Dashboard sync error:', err);
    }
  }, [initialRegencies, initialSummary, initialAttendance, initialUpcoming, initialAttention]);

  // Initial and reactive effect on mount, window focus, and storage event
  React.useEffect(() => {
    syncDashboardWithCustomData();

    const handleSync = () => syncDashboardWithCustomData();
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [syncDashboardWithCustomData]);

  // When globalFilter changes in header or filter bar, fetch updated data and re-sync
  React.useEffect(() => {
    Promise.all([
      fetchProgramSummary(globalFilter),
      fetchRegencies(globalFilter),
      fetchAttendanceStats(globalFilter),
    ]).then(([newSummary, newRegencies, newAttendance]) => {
      syncDashboardWithCustomData(newRegencies, newSummary, newAttendance);
    });
  }, [globalFilter, syncDashboardWithCustomData]);

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
            <UpcomingTrainings trainings={upcomingTrainings} />
            <AttentionRequired items={attentionItems} />
            <RecentActivity logs={initialLogs} />
          </div>
        </>
      )}
    </div>
  );
}
