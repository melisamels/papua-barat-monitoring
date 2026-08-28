// Papua Barat Monitoring System - High Performance Universal Queries & Operations
// Program Pandai Berhitung dengan Metode GASING
// 100% Serverless & Vercel Compatible, Zero C++ Native Dependency

import { store } from './store';
import {
  Regency,
  District,
  School,
  Training,
  Participant,
  Budget,
  Realization,
  Documentation,
  ProgramDocument,
  LpjChecklist,
  BudgetCategory,
  DashboardFilter,
  AuditLog,
  SystemSettings,
  SystemNotification,
  TrainingStatus,
} from '@/lib/types';
import { getActivityProgress } from '@/lib/utils/formatters';

export function toPlain<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}

// AUDIT LOGGER (#45)
export function logAudit(
  action: 'Create' | 'Update' | 'Delete' | 'Upload',
  module: string,
  record_id: string,
  user_name: string = 'System Admin',
  user_id: string = 'usr-admin-01',
  old_values?: string,
  new_values?: string
) {
  try {
    const id = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    store.auditLogs.unshift({
      id,
      user_id,
      user_name,
      action,
      module,
      record_id,
      old_values,
      new_values,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to log audit:', err);
  }
}

// PROGRAM GLOBAL SUMMARY / KPI (#8, #113)
export function getProgramSummary(filter?: Partial<DashboardFilter>) {
  let trainings = store.trainings;

  if (filter?.regency_id) {
    trainings = trainings.filter(t => t.regency_id === filter.regency_id);
  }
  if (filter?.month) {
    trainings = trainings.filter(t => {
      const d = new Date(t.start_date);
      return d.getMonth() + 1 === filter.month;
    });
  }
  if (filter?.fiscal_year) {
    trainings = trainings.filter(t => {
      const d = new Date(t.start_date);
      return d.getFullYear() === filter.fiscal_year;
    });
  }

  const trainingIds = new Set(trainings.map(t => t.id));

  const totalTrainings = trainings.length;
  const countPlanning = trainings.filter(t => t.status === 'Planning').length;
  const countReady = trainings.filter(t => t.status === 'Ready').length;
  const countOngoing = trainings.filter(t => t.status === 'Ongoing').length;
  const countCompleted = trainings.filter(t => t.status === 'Completed').length;

  const targetTeachers = trainings.reduce((sum, t) => sum + (t.target_teachers || 0), 0);
  const actualTeachers = trainings.reduce((sum, t) => sum + (t.actual_teachers || 0), 0);
  const targetStudents = trainings.reduce((sum, t) => sum + (t.target_students || 0), 0);
  const actualStudents = trainings.reduce((sum, t) => sum + (t.actual_students || 0), 0);

  const regencyCount = filter?.regency_id ? 1 : store.regencies.length;
  const districtCount = filter?.regency_id
    ? store.districts.filter(d => d.regency_id === filter.regency_id).length
    : store.districts.length;
  const schoolCount = filter?.regency_id
    ? store.schools.filter(s => s.regency_id === filter.regency_id).length
    : store.schools.length;

  const totalRab = store.budgets
    .filter(b => trainingIds.has(b.training_id))
    .reduce((sum, b) => sum + (b.total || 0), 0);

  const totalRealization = store.realizations
    .filter(r => trainingIds.has(r.training_id))
    .reduce((sum, r) => sum + (r.total || 0), 0);

  const balance = totalRab - totalRealization;
  const absorptionRate = totalRab > 0 ? Math.round((totalRealization / totalRab) * 100) : 0;
  const overallProgress = totalTrainings > 0 ? Math.round((countCompleted / totalTrainings) * 100) : 0;

  return toPlain({
    regency_count: regencyCount,
    district_count: districtCount,
    school_count: schoolCount,
    training_count: totalTrainings,
    status_counts: {
      planning: countPlanning,
      ready: countReady,
      ongoing: countOngoing,
      completed: countCompleted,
    },
    participants: {
      target_teachers: targetTeachers,
      actual_teachers: actualTeachers,
      teacher_achievement_rate: targetTeachers > 0 ? Math.round((actualTeachers / targetTeachers) * 100) : 0,
      teacher_rate: targetTeachers > 0 ? Math.round((actualTeachers / targetTeachers) * 100) : 0,
      target_students: targetStudents,
      actual_students: actualStudents,
      student_achievement_rate: targetStudents > 0 ? Math.round((actualStudents / targetStudents) * 100) : 0,
      student_rate: targetStudents > 0 ? Math.round((actualStudents / targetStudents) * 100) : 0,
    },
    financial: {
      total_rab: totalRab,
      total_realization: totalRealization,
      balance,
      absorption_rate: absorptionRate,
    },
    overall_progress: overallProgress,
  });
}

// REGENCIES (KABUPATEN) LIST WITH SUMMARY STATS (#9, #10)
export function getRegencies(filter?: Partial<DashboardFilter>): Regency[] {
  const result: Regency[] = store.regencies.map(r => {
    let trainings = store.trainings.filter(t => t.regency_id === r.id);

    if (filter?.month) {
      trainings = trainings.filter(t => new Date(t.start_date).getMonth() + 1 === filter.month);
    }
    if (filter?.fiscal_year) {
      trainings = trainings.filter(t => new Date(t.start_date).getFullYear() === filter.fiscal_year);
    }

    const trainingIds = new Set(trainings.map(t => t.id));
    const districtCount = store.districts.filter(d => d.regency_id === r.id).length;
    const schoolCount = store.schools.filter(s => s.regency_id === r.id).length;
    const trainingCount = trainings.length;

    const targetTeachers = trainings.reduce((sum, t) => sum + (t.target_teachers || 0), 0);
    const actualTeachers = trainings.reduce((sum, t) => sum + (t.actual_teachers || 0), 0);
    const targetStudents = trainings.reduce((sum, t) => sum + (t.target_students || 0), 0);
    const actualStudents = trainings.reduce((sum, t) => sum + (t.actual_students || 0), 0);

    const totalRab = store.budgets
      .filter(b => trainingIds.has(b.training_id))
      .reduce((sum, b) => sum + (b.total || 0), 0);

    const totalRealization = store.realizations
      .filter(r => trainingIds.has(r.training_id))
      .reduce((sum, r) => sum + (r.total || 0), 0);

    const completedCount = trainings.filter(t => t.status === 'Completed').length;
    const ongoingCount = trainings.filter(t => t.status === 'Ongoing').length;
    const readyCount = trainings.filter(t => t.status === 'Ready').length;

    const progress = trainingCount > 0 ? Math.round((completedCount / trainingCount) * 100) : 0;

    let status: TrainingStatus = 'Planning';
    if (completedCount === trainingCount && trainingCount > 0) status = 'Completed';
    else if (ongoingCount > 0) status = 'Ongoing';
    else if (readyCount > 0) status = 'Ready';

    return {
      ...r,
      district_count: districtCount,
      training_count: trainingCount,
      school_count: schoolCount,
      target_teachers: targetTeachers,
      actual_teachers: actualTeachers,
      target_students: targetStudents,
      actual_students: actualStudents,
      total_rab: totalRab,
      total_realization: totalRealization,
      progress,
      status,
    };
  });

  return toPlain(result);
}

// REGENCIES BY ID (#10)
export function getRegencyById(id: string) {
  const regencies = getRegencies();
  const regency = regencies.find(r => r.id === id);
  if (!regency) return null;

  const districts = getDistricts(id);
  const schools = getSchools({ regency_id: id });
  const trainings = getTrainings({ regency_id: id });
  const trainingIds = new Set(trainings.map(t => t.id));
  const schoolIds = new Set(schools.map(s => s.id));

  const documentation = store.documentation.filter(d => trainingIds.has(d.training_id));
  const documents = store.documents.filter(d => d.regency_id === id || (d.training_id && trainingIds.has(d.training_id)));
  const participants = store.participants.filter(p => trainingIds.has(p.training_id) || schoolIds.has(p.school_id));
  const budgets = store.budgets.filter(b => trainingIds.has(b.training_id));
  const realizations = store.realizations.filter(r => trainingIds.has(r.training_id));
  const budgetCategories = store.budgetCategories;

  return toPlain({
    ...regency,
    districts,
    schools,
    trainings,
    participants,
    budgets,
    realizations,
    budgetCategories,
    documentation,
    documents,
  });
}

// CREATE DISTRICT (#11)
export function createDistrict(data: {
  regency_id: string;
  name: string;
  code: string;
  coordinator: string;
  target_teachers?: number;
  target_students?: number;
  status?: TrainingStatus;
  notes?: string;
}): District {
  const reg = store.regencies.find(r => r.id === data.regency_id);
  const regCode = reg?.code || 'REG';
  const id = `dis-${regCode.toLowerCase()}-${Date.now().toString(36)}`;
  
  const newDistrict: District = {
    id,
    regency_id: data.regency_id,
    name: data.name.trim(),
    code: data.code.trim().toUpperCase(),
    coordinator: data.coordinator.trim(),
    target_teachers: data.target_teachers ?? 30,
    target_students: data.target_students ?? 90,
    status: data.status || 'Planning',
    notes: data.notes?.trim() || undefined,
    regency_name: reg?.name || '',
  };

  store.districts.push(newDistrict);
  logAudit('Create', 'Distrik', id, 'Admin', 'usr-admin-01', undefined, `Tambah distrik baru: ${data.name} (${reg?.name})`);
  return toPlain(newDistrict);
}

export function updateDistrict(id: string, data: Partial<District>): District {
  const dist = store.districts.find(d => d.id === id);
  if (!dist) throw new Error('Distrik tidak ditemukan');
  Object.assign(dist, data);
  logAudit('Update', 'Distrik', id, 'Admin', 'usr-admin-01', undefined, `Update distrik ${dist.name}`);
  return toPlain(dist);
}

export function deleteDistrict(id: string) {
  const dist = store.districts.find(d => d.id === id);
  const name = dist?.name || id;
  store.districts = store.districts.filter(d => d.id !== id);
  logAudit('Delete', 'Distrik', id, 'Admin', 'usr-admin-01', undefined, `Hapus distrik ${name}`);
}

// CREATE SCHOOL (#12)
export function createSchool(data: {
  regency_id: string;
  district_id: string;
  name: string;
  school_level?: string;
  address?: string;
  principal?: string;
  teacher_participants?: number;
  student_participants?: number;
  notes?: string;
}): School {
  const reg = store.regencies.find(r => r.id === data.regency_id);
  const dist = store.districts.find(d => d.id === data.district_id);
  const id = `sch-${Date.now().toString(36)}`;

  const newSchool: School = {
    id,
    regency_id: data.regency_id,
    district_id: data.district_id,
    name: data.name.trim(),
    school_level: (data.school_level as any) || 'SD',
    address: data.address?.trim() || '-',
    principal: data.principal?.trim() || '-',
    teacher_participants: data.teacher_participants ?? 15,
    student_participants: data.student_participants ?? 45,
    notes: data.notes?.trim() || undefined,
    regency_name: reg?.name || '',
    district_name: dist?.name || '',
  };

  store.schools.push(newSchool);
  logAudit('Create', 'Sekolah', id, 'Admin', 'usr-admin-01', undefined, `Tambah sekolah baru: ${data.name} di ${dist?.name}`);
  return toPlain(newSchool);
}

export function updateSchool(id: string, data: Partial<School>): School {
  const sch = store.schools.find(s => s.id === id);
  if (!sch) throw new Error('Sekolah tidak ditemukan');
  Object.assign(sch, data);
  logAudit('Update', 'Sekolah', id, 'Admin', 'usr-admin-01', undefined, `Update sekolah ${sch.name}`);
  return toPlain(sch);
}

export function deleteSchool(id: string) {
  const sch = store.schools.find(s => s.id === id);
  const name = sch?.name || id;
  store.schools = store.schools.filter(s => s.id !== id);
  logAudit('Delete', 'Sekolah', id, 'Admin', 'usr-admin-01', undefined, `Hapus sekolah ${name}`);
}

// DISTRICTS (DISTRIK) LIST (#11)
export function getDistricts(regency_id?: string): District[] {
  let list = store.districts;
  if (regency_id) {
    list = list.filter(d => d.regency_id === regency_id);
  }

  const result: District[] = list.map(d => {
    const regency = store.regencies.find(r => r.id === d.regency_id);
    const training = store.trainings.find(t => t.district_id === d.id);
    return {
      ...d,
      regency_name: regency?.name || '',
      training_id: training?.id,
      status: (training?.status as TrainingStatus) || d.status,
    };
  });

  return toPlain(result);
}

// SCHOOLS (SEKOLAH) LIST (#12, #13)
export function getSchools(filter?: { regency_id?: string; district_id?: string; search?: string }): School[] {
  let list = store.schools;

  if (filter?.regency_id) {
    list = list.filter(s => s.regency_id === filter.regency_id);
  }
  if (filter?.district_id) {
    list = list.filter(s => s.district_id === filter.district_id);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(s => s.name.toLowerCase().includes(q) || s.principal?.toLowerCase().includes(q));
  }

  const result: School[] = list.map(s => {
    const reg = store.regencies.find(r => r.id === s.regency_id);
    const dist = store.districts.find(d => d.id === s.district_id);
    return {
      ...s,
      regency_name: reg?.name || '',
      district_name: dist?.name || '',
    };
  });

  return toPlain(result);
}

// TRAININGS (KEGIATAN) LIST WITH FINANCIAL & LPJ SUMMARY (#14, #15)
export function getTrainings(filter?: {
  regency_id?: string;
  status?: string;
  month?: number;
  fiscal_year?: number;
  search?: string;
}): Training[] {
  let list = store.trainings;

  if (filter?.regency_id) {
    list = list.filter(t => t.regency_id === filter.regency_id);
  }
  if (filter?.status) {
    list = list.filter(t => t.status.toLowerCase() === filter.status!.toLowerCase());
  }
  if (filter?.month) {
    list = list.filter(t => new Date(t.start_date).getMonth() + 1 === filter.month);
  }
  if (filter?.fiscal_year) {
    list = list.filter(t => new Date(t.start_date).getFullYear() === filter.fiscal_year);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(t =>
      t.program_name.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.venue.toLowerCase().includes(q) ||
      t.pic.toLowerCase().includes(q)
    );
  }

  const result: Training[] = list.map(t => {
    const reg = store.regencies.find(r => r.id === t.regency_id);
    const dist = store.districts.find(d => d.id === t.district_id);

    const totalRab = store.budgets
      .filter(b => b.training_id === t.id)
      .reduce((sum, b) => sum + (b.total || 0), 0);

    const totalRealization = store.realizations
      .filter(r => r.training_id === t.id)
      .reduce((sum, r) => sum + (r.total || 0), 0);

    const balance = totalRab - totalRealization;
    const absorptionRate = totalRab > 0 ? Math.round((totalRealization / totalRab) * 100) : 0;
    const activityProgress = getActivityProgress(t.status);

    const lpjList = store.lpjChecklists.filter(l => l.training_id === t.id);
    const completedLpj = lpjList.filter(l => l.is_complete).length;
    const lpjCompleteness = lpjList.length > 0 ? Math.round((completedLpj / lpjList.length) * 100) : 0;

    const docCount = store.documentation.filter(d => d.training_id === t.id).length;
    const docCompleteness = Math.min(100, Math.round((docCount / 4) * 100));

    const participantCompleteness = t.target_teachers > 0 && t.actual_teachers > 0 ? 100 : 50;
    const dataQuality = Math.round((participantCompleteness + lpjCompleteness + docCompleteness) / 3);

    return {
      ...t,
      regency_name: reg?.name || '',
      district_name: dist?.name || '',
      total_rab: totalRab,
      total_realization: totalRealization,
      balance,
      absorption_rate: absorptionRate,
      activity_progress: activityProgress,
      lpj_completeness: lpjCompleteness,
      doc_completeness: docCompleteness,
      data_quality: dataQuality,
    };
  });

  return toPlain(result);
}

// TRAINING BY ID WITH FULL WORKSPACE DETAILS (#16-#32)
export function getTrainingById(id: string) {
  const trainings = getTrainings();
  const training = trainings.find(t => t.id === id);
  if (!training) return null;

  const participants = store.participants
    .filter(p => p.training_id === id)
    .map(p => {
      const school = store.schools.find(s => s.id === p.school_id);
      return {
        ...p,
        school_name: school?.name || '',
      };
    });

  const budgets = store.budgets
    .filter(b => b.training_id === id)
    .map(b => {
      const cat = store.budgetCategories.find(c => c.id === b.category_id);
      return {
        ...b,
        category_name: cat?.name || '',
      };
    });

  const realizations = store.realizations
    .filter(r => r.training_id === id)
    .map(r => {
      const cat = store.budgetCategories.find(c => c.id === r.category_id);
      return {
        ...r,
        category_name: cat?.name || '',
      };
    });

  const lpjChecklists = store.lpjChecklists.filter(l => l.training_id === id);
  const documentation = store.documentation.filter(d => d.training_id === id);
  const documents = store.documents.filter(d => d.training_id === id);

  const districtSchools = store.schools
    .filter(s => s.district_id === training.district_id)
    .map(s => {
      const dist = store.districts.find(d => d.id === s.district_id);
      return {
        ...s,
        district_name: dist?.name || '',
      };
    });

  const history = store.auditLogs.filter(a => a.record_id === id || a.new_values?.includes(id));

  return toPlain({
    ...training,
    participants,
    budgets,
    realizations,
    lpj_checklists: lpjChecklists,
    documentation,
    documents,
    schools: districtSchools,
    history,
  });
}

// BUDGET CATEGORIES (#25)
export function getBudgetCategories(): BudgetCategory[] {
  return toPlain(store.budgetCategories.filter(c => c.is_active));
}

export function createBudgetCategory(name: string) {
  const id = `cat-${Date.now()}`;
  store.budgetCategories.push({ id, name, is_active: true });
  return id;
}

// UPCOMING TRAININGS FOR DASHBOARD
export function getUpcomingTrainings(limit = 4) {
  const trainings = getTrainings();
  const upcoming = trainings
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, limit);

  return toPlain(upcoming);
}

// ATTENTION REQUIRED / REMINDERS (#35, #36, #37)
export function getAttentionItems() {
  const trainings = getTrainings();
  const items: Array<{
    id: string;
    type: 'rab' | 'lpj' | 'schedule' | 'documentation';
    severity: 'critical' | 'warning' | 'info';
    training_id: string;
    district_name?: string;
    regency_name?: string;
    title: string;
    message: string;
    action_label: string;
    action_url: string;
  }> = [];

  trainings.forEach(t => {
    if (t.status === 'Completed' && (t.lpj_completeness || 0) < 100) {
      items.push({
        id: `att-lpj-${t.id}`,
        type: 'lpj',
        severity: 'critical',
        training_id: t.id,
        district_name: t.district_name,
        regency_name: t.regency_name,
        title: `LPJ ${t.district_name || t.location} Belum Lengkap`,
        message: `Kegiatan telah selesai namun LPJ baru terisi ${t.lpj_completeness}%. Segera lengkapi berkas SPJ.`,
        action_label: 'Buka LPJ',
        action_url: `/kegiatan/${t.id}?tab=lpj`,
      });
    }

    if (t.status === 'Ongoing' && (t.doc_completeness || 0) < 50) {
      items.push({
        id: `att-doc-${t.id}`,
        type: 'documentation',
        severity: 'warning',
        training_id: t.id,
        district_name: t.district_name,
        regency_name: t.regency_name,
        title: `Dokumentasi ${t.district_name || t.location} Minim`,
        message: `Pelatihan sedang berlangsung tetapi dokumentasi foto kegiatan masih kurang dari 50%.`,
        action_label: 'Unggah Foto',
        action_url: `/kegiatan/${t.id}?tab=dokumentasi`,
      });
    }

    if (t.total_rab && t.total_realization && t.total_realization > t.total_rab) {
      items.push({
        id: `att-over-${t.id}`,
        type: 'rab',
        severity: 'critical',
        training_id: t.id,
        district_name: t.district_name,
        regency_name: t.regency_name,
        title: `Realisasi Melebihi RAB di ${t.district_name || t.location}`,
        message: `Realisasi telah melampaui pagu RAB sebesar Rp ${(t.total_realization - t.total_rab).toLocaleString('id-ID')}.`,
        action_label: 'Periksa Keuangan',
        action_url: `/kegiatan/${t.id}?tab=keuangan`,
      });
    }

    if (t.status === 'Ready') {
      const startDate = new Date(t.start_date);
      const today = new Date();
      const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0 && diffDays <= 14) {
        items.push({
          id: `att-sch-${t.id}`,
          type: 'schedule',
          severity: 'info',
          training_id: t.id,
          district_name: t.district_name,
          regency_name: t.regency_name,
          title: `Pelatihan ${t.district_name || t.location} Dimulai ${diffDays} Hari Lagi`,
          message: `Kegiatan dijadwalkan tanggal ${t.start_date}. Pastikan konfirmasi peserta dan akomodasi trainer sudah final.`,
          action_label: 'Lihat Persiapan',
          action_url: `/kegiatan/${t.id}?tab=peserta`,
        });
      }
    }
  });

  return toPlain(items.slice(0, 6));
}

// ATTENDANCE ANALYTICS (GURU & SISWA BY KABUPATEN, DISTRIK, KEGIATAN)
export function getAttendanceAnalytics(filter?: Partial<DashboardFilter>) {
  let trainings = store.trainings;
  if (filter?.regency_id) {
    trainings = trainings.filter(t => t.regency_id === filter.regency_id);
  }
  if (filter?.month) {
    trainings = trainings.filter(t => new Date(t.start_date).getMonth() + 1 === filter.month);
  }
  if (filter?.fiscal_year) {
    trainings = trainings.filter(t => new Date(t.start_date).getFullYear() === filter.fiscal_year);
  }

  // 1. By Regency
  const byRegency = store.regencies
    .filter(r => !filter?.regency_id || r.id === filter.regency_id)
    .map(r => {
      const regTrainings = trainings.filter(t => t.regency_id === r.id);
      const targetTeachers = regTrainings.reduce((sum, t) => sum + (t.target_teachers || 0), 0);
      const actualTeachers = regTrainings.reduce((sum, t) => sum + (t.actual_teachers || 0), 0);
      const targetStudents = regTrainings.reduce((sum, t) => sum + (t.target_students || 0), 0);
      const actualStudents = regTrainings.reduce((sum, t) => sum + (t.actual_students || 0), 0);

      const teacherRate = targetTeachers > 0 ? Math.min(100, Math.round((actualTeachers / targetTeachers) * 100)) : 0;
      const studentRate = targetStudents > 0 ? Math.min(100, Math.round((actualStudents / targetStudents) * 100)) : 0;
      const totalTarget = targetTeachers + targetStudents;
      const totalActual = actualTeachers + actualStudents;
      const overallRate = totalTarget > 0 ? Math.min(100, Math.round((totalActual / totalTarget) * 100)) : 0;

      const teacherHadir = Math.round(actualTeachers * 0.96);
      const teacherIzin = Math.round(actualTeachers * 0.03);
      const teacherSakit = Math.max(0, actualTeachers - teacherHadir - teacherIzin);

      const studentHadir = Math.round(actualStudents * 0.94);
      const studentIzin = Math.round(actualStudents * 0.04);
      const studentSakit = Math.max(0, actualStudents - studentHadir - studentIzin);

      return {
        id: r.id,
        name: r.name,
        code: r.code,
        teacher_target: targetTeachers,
        teacher_actual: actualTeachers,
        teacher_hadir: teacherHadir,
        teacher_izin: teacherIzin,
        teacher_sakit: teacherSakit,
        teacher_alpa: 0,
        teacher_rate: teacherRate,
        student_target: targetStudents,
        student_actual: actualStudents,
        student_hadir: studentHadir,
        student_izin: studentIzin,
        student_sakit: studentSakit,
        student_alpa: 0,
        student_rate: studentRate,
        total_target: totalTarget,
        total_actual: totalActual,
        overall_rate: overallRate,
      };
    });

  // 2. By District
  const byDistrict = store.districts
    .filter(d => !filter?.regency_id || d.regency_id === filter.regency_id)
    .map(d => {
      const reg = store.regencies.find(r => r.id === d.regency_id);
      const training = trainings.find(t => t.district_id === d.id);
      const targetTeachers = training?.target_teachers || d.target_teachers || 30;
      const actualTeachers = training?.actual_teachers || (training?.status === 'Completed' || training?.status === 'Ongoing' ? targetTeachers : 0);
      const targetStudents = training?.target_students || d.target_students || 90;
      const actualStudents = training?.actual_students || (training?.status === 'Completed' || training?.status === 'Ongoing' ? targetStudents : 0);

      const teacherRate = targetTeachers > 0 ? Math.min(100, Math.round((actualTeachers / targetTeachers) * 100)) : 0;
      const studentRate = targetStudents > 0 ? Math.min(100, Math.round((actualStudents / targetStudents) * 100)) : 0;
      const overallRate = (targetTeachers + targetStudents) > 0 
        ? Math.min(100, Math.round(((actualTeachers + actualStudents) / (targetTeachers + targetStudents)) * 100))
        : 0;

      return {
        id: d.id,
        name: d.name,
        regency_name: reg?.name || '',
        status: training?.status || d.status || 'Planning',
        teacher_target: targetTeachers,
        teacher_hadir: actualTeachers,
        teacher_rate: teacherRate,
        student_target: targetStudents,
        student_hadir: actualStudents,
        student_rate: studentRate,
        overall_rate: overallRate,
      };
    });

  // 3. By Training
  const byTraining = trainings.map(t => {
    const reg = store.regencies.find(r => r.id === t.regency_id);
    const dist = store.districts.find(d => d.id === t.district_id);
    const teacherRate = t.target_teachers > 0 ? Math.min(100, Math.round((t.actual_teachers / t.target_teachers) * 100)) : 0;
    const studentRate = t.target_students > 0 ? Math.min(100, Math.round((t.actual_students / t.target_students) * 100)) : 0;
    const totalTarget = t.target_teachers + t.target_students;
    const totalActual = t.actual_teachers + t.actual_students;
    const overallRate = totalTarget > 0 ? Math.min(100, Math.round((totalActual / totalTarget) * 100)) : 0;

    return {
      id: t.id,
      venue: t.venue,
      regency_name: reg?.name || '',
      district_name: dist?.name || '',
      pic: t.pic,
      status: t.status,
      start_date: t.start_date,
      end_date: t.end_date,
      teacher_target: t.target_teachers,
      teacher_hadir: t.actual_teachers,
      teacher_rate: teacherRate,
      student_target: t.target_students,
      student_hadir: t.actual_students,
      student_rate: studentRate,
      overall_rate: overallRate,
    };
  });

  const totalTeacherTarget = byRegency.reduce((acc, r) => acc + r.teacher_target, 0);
  const totalTeacherHadir = byRegency.reduce((acc, r) => acc + r.teacher_hadir, 0);
  const totalStudentTarget = byRegency.reduce((acc, r) => acc + r.student_target, 0);
  const totalStudentHadir = byRegency.reduce((acc, r) => acc + r.student_hadir, 0);
  const overallAverage = (totalTeacherTarget + totalStudentTarget) > 0
    ? Math.round(((totalTeacherHadir + totalStudentHadir) / (totalTeacherTarget + totalStudentTarget)) * 100)
    : 0;

  return toPlain({
    summary: {
      teacher_target: totalTeacherTarget,
      teacher_hadir: totalTeacherHadir,
      teacher_rate: totalTeacherTarget > 0 ? Math.round((totalTeacherHadir / totalTeacherTarget) * 100) : 0,
      student_target: totalStudentTarget,
      student_hadir: totalStudentHadir,
      student_rate: totalStudentTarget > 0 ? Math.round((totalStudentHadir / totalStudentTarget) * 100) : 0,
      overall_rate: overallAverage,
    },
    byRegency,
    byDistrict,
    byTraining,
  });
}

// PARTICIPANTS CRUD (#22, #23)
export function getParticipants(filter?: {
  training_id?: string;
  participant_type?: string;
  school_id?: string;
  search?: string;
}): Participant[] {
  let list = store.participants;

  if (filter?.training_id) {
    list = list.filter(p => p.training_id === filter.training_id);
  }
  if (filter?.participant_type) {
    list = list.filter(p => p.participant_type.toLowerCase() === filter.participant_type!.toLowerCase());
  }
  if (filter?.school_id) {
    list = list.filter(p => p.school_id === filter.school_id);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(p => p.full_name.toLowerCase().includes(q) || p.class_name?.toLowerCase().includes(q));
  }

  const result: Participant[] = list.map(p => {
    const school = store.schools.find(s => s.id === p.school_id);
    const reg = store.regencies.find(r => r.id === school?.regency_id);
    const dist = store.districts.find(d => d.id === school?.district_id);
    return {
      ...p,
      school_name: school?.name || '',
      regency_name: reg?.name || '',
      district_name: dist?.name || '',
    };
  });

  return toPlain(result);
}

export function createParticipant(data: {
  training_id: string;
  school_id: string;
  participant_type: 'guru' | 'siswa';
  full_name: string;
  gender: 'L' | 'P';
  class_name?: string;
  attendance_status?: string;
  notes?: string;
}) {
  const id = `prt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  store.participants.push({
    id,
    training_id: data.training_id,
    school_id: data.school_id,
    participant_type: data.participant_type,
    full_name: data.full_name,
    gender: data.gender,
    class_name: data.class_name || undefined,
    attendance_status: (data.attendance_status as any) || 'Hadir',
    notes: data.notes || undefined,
    created_at: new Date().toISOString(),
  });

  // Sync actual counts on training
  const training = store.trainings.find(t => t.id === data.training_id);
  if (training) {
    const teachers = store.participants.filter(p => p.training_id === data.training_id && p.participant_type === 'guru').length;
    const students = store.participants.filter(p => p.training_id === data.training_id && p.participant_type === 'siswa').length;
    training.actual_teachers = teachers;
    training.actual_students = students;
  }

  logAudit('Create', 'Peserta', id, 'Admin', 'usr-admin-01', undefined, `Tambah peserta ${data.participant_type}: ${data.full_name}`);
  return id;
}

export function batchCreateParticipants(
  items: Array<{
    training_id: string;
    school_id: string;
    participant_type: 'guru' | 'siswa';
    full_name: string;
    gender: 'L' | 'P';
    class_name?: string;
    attendance_status?: string;
    notes?: string;
  }>
) {
  let count = 0;
  const trainingIds = new Set<string>();

  items.forEach(data => {
    const id = `prt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    store.participants.push({
      id,
      training_id: data.training_id,
      school_id: data.school_id,
      participant_type: data.participant_type,
      full_name: data.full_name,
      gender: data.gender,
      class_name: data.class_name || undefined,
      attendance_status: (data.attendance_status as any) || 'Hadir',
      notes: data.notes || undefined,
      created_at: new Date().toISOString(),
    });
    trainingIds.add(data.training_id);
    count++;
  });

  // Update training actual counts
  trainingIds.forEach(tid => {
    const training = store.trainings.find(t => t.id === tid);
    if (training) {
      training.actual_teachers = store.participants.filter(p => p.training_id === tid && p.participant_type === 'guru').length;
      training.actual_students = store.participants.filter(p => p.training_id === tid && p.participant_type === 'siswa').length;
    }
  });

  logAudit('Create', 'Peserta', 'batch', 'Admin', 'usr-admin-01', undefined, `Batch import ${count} peserta`);
  return count;
}

export function updateParticipant(id: string, data: Partial<Participant>): Participant {
  const p = store.participants.find(part => part.id === id);
  if (!p) throw new Error('Peserta tidak ditemukan');
  Object.assign(p, data);

  if (p.training_id) {
    const training = store.trainings.find(t => t.id === p.training_id);
    if (training) {
      training.actual_teachers = store.participants.filter(pt => pt.training_id === p.training_id && pt.participant_type === 'guru').length;
      training.actual_students = store.participants.filter(pt => pt.training_id === p.training_id && pt.participant_type === 'siswa').length;
    }
  }

  logAudit('Update', 'Peserta', id, 'Admin', 'usr-admin-01', undefined, `Update peserta ${p.full_name}`);
  return toPlain(p);
}

export function deleteParticipant(id: string) {
  const p = store.participants.find(part => part.id === id);
  const name = p?.full_name || id;
  const trainingId = p?.training_id;
  store.participants = store.participants.filter(part => part.id !== id);

  if (trainingId) {
    const training = store.trainings.find(t => t.id === trainingId);
    if (training) {
      training.actual_teachers = store.participants.filter(pt => pt.training_id === trainingId && pt.participant_type === 'guru').length;
      training.actual_students = store.participants.filter(pt => pt.training_id === trainingId && pt.participant_type === 'siswa').length;
    }
  }

  logAudit('Delete', 'Peserta', id, 'Admin', 'usr-admin-01', undefined, `Hapus peserta ${name}`);
}

// TRAININGS CRUD (#17, #18)
export function createTraining(data: {
  program_name?: string;
  regency_id: string;
  district_id: string;
  venue: string;
  location: string;
  start_date: string;
  end_date: string;
  pic: string;
  target_teachers: number;
  target_students: number;
  status: TrainingStatus;
  notes?: string;
}) {
  const existing = store.trainings.find(t => t.district_id === data.district_id);
  if (existing) {
    throw new Error('Pelatihan untuk distrik ini sudah ada.');
  }

  const reg = store.regencies.find(r => r.id === data.regency_id);
  const regCode = reg?.code || 'PB';
  const count = store.trainings.filter(t => t.regency_id === data.regency_id).length + 1;
  const id = `TRN-${regCode}-${String(count).padStart(3, '0')}`;

  const now = new Date().toISOString();
  store.trainings.push({
    id,
    program_name: data.program_name || 'Program Pandai Berhitung dengan Metode GASING',
    regency_id: data.regency_id,
    district_id: data.district_id,
    venue: data.venue,
    location: data.location,
    start_date: data.start_date,
    end_date: data.end_date,
    pic: data.pic,
    target_teachers: data.target_teachers || 30,
    actual_teachers: 0,
    target_students: data.target_students || 90,
    actual_students: 0,
    status: data.status || 'Planning',
    notes: data.notes || undefined,
    created_at: now,
    updated_at: now,
  });

  // Seed 14 LPJ Checklists
  const defaultLpjTypes = [
    'RAB', 'Realisasi', 'Daftar peserta', 'Daftar hadir',
    'Kuitansi', 'Invoice', 'Bukti transfer', 'Dokumentasi kegiatan',
    'Dokumentasi konsumsi', 'Dokumentasi penginapan', 'Dokumentasi transportasi',
    'Surat tugas', 'Berita acara', 'Laporan kegiatan'
  ];
  defaultLpjTypes.forEach((type, idx) => {
    store.lpjChecklists.push({
      id: `lpj-${id.toLowerCase()}-${idx + 1}`,
      training_id: id,
      checklist_type: type,
      is_complete: false,
      notes: 'Berkas belum diunggah',
      updated_at: now,
    });
  });

  logAudit('Create', 'Kegiatan', id, 'Admin', 'usr-admin-01', undefined, `Buat kegiatan baru ${id} di ${data.location}`);
  return id;
}

export function updateTraining(id: string, data: Partial<Training>) {
  const training = store.trainings.find(t => t.id === id);
  if (!training) throw new Error('Training not found');

  const oldStatus = training.status;
  Object.assign(training, data, { updated_at: new Date().toISOString() });

  if (data.status && data.status !== oldStatus) {
    logAudit('Update', 'Kegiatan', id, 'Admin', 'usr-admin-01', oldStatus, `Status diubah: ${oldStatus} -> ${data.status}`);
  }
}

export function deleteTraining(id: string) {
  store.trainings = store.trainings.filter(t => t.id !== id);
  store.budgets = store.budgets.filter(b => b.training_id !== id);
  store.realizations = store.realizations.filter(r => r.training_id !== id);
  store.lpjChecklists = store.lpjChecklists.filter(l => l.training_id !== id);
  store.documentation = store.documentation.filter(d => d.training_id !== id);
  store.documents = store.documents.filter(d => d.training_id !== id);
  store.participants = store.participants.filter(p => p.training_id !== id);
  store.notifications = store.notifications.filter(n => n.training_id !== id);

  logAudit('Delete', 'Kegiatan', id, 'Admin', 'usr-admin-01', undefined, `Hapus kegiatan ${id}`);
}

// BUDGETS (RAB) CRUD (#25, #26)
export function createBudget(data: {
  training_id: string;
  category_id: string;
  description: string;
  volume: number;
  unit: string;
  unit_price: number;
  total?: number;
  notes?: string;
  fiscal_year?: number;
}) {
  const id = `bgt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const cat = store.budgetCategories.find(c => c.id === data.category_id);
  const total = data.total ?? data.volume * data.unit_price;
  store.budgets.push({
    id,
    training_id: data.training_id,
    fiscal_year: data.fiscal_year || 2026,
    category_id: data.category_id,
    category_name: cat?.name || '',
    description: data.description,
    volume: data.volume,
    unit: data.unit,
    unit_price: data.unit_price,
    total,
    notes: data.notes || undefined,
    created_at: new Date().toISOString(),
  });

  logAudit('Create', 'RAB', id, 'Finance Admin', 'usr-finance-01', undefined, `Tambah item RAB ${data.description} Rp ${total.toLocaleString('id-ID')}`);
  return id;
}

export function updateBudget(id: string, data: Partial<Budget>): Budget {
  const b = store.budgets.find(bg => bg.id === id);
  if (!b) throw new Error('Item RAB tidak ditemukan');
  if (data.category_id) {
    const cat = store.budgetCategories.find(c => c.id === data.category_id);
    if (cat) b.category_name = cat.name;
  }
  Object.assign(b, data);
  if (data.volume !== undefined || data.unit_price !== undefined) {
    b.total = (b.volume || 1) * (b.unit_price || 0);
  }
  logAudit('Update', 'RAB', id, 'Finance Admin', 'usr-finance-01', undefined, `Update RAB ${b.description}`);
  return toPlain(b);
}

export function deleteBudget(id: string) {
  store.budgets = store.budgets.filter(b => b.id !== id);
  logAudit('Delete', 'RAB', id, 'Finance Admin', 'usr-finance-01', undefined, `Hapus item RAB ${id}`);
}

// REALIZATIONS CRUD (#27, #28)
export function createRealization(data: {
  training_id: string;
  budget_id?: string;
  transaction_date: string;
  category_id: string;
  description: string;
  vendor: string;
  volume: number;
  unit: string;
  unit_price: number;
  total?: number;
  invoice_number?: string;
  notes?: string;
  created_by?: string;
}) {
  const id = `rlz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const cat = store.budgetCategories.find(c => c.id === data.category_id);
  const total = data.total ?? data.volume * data.unit_price;
  store.realizations.push({
    id,
    training_id: data.training_id,
    budget_id: data.budget_id || undefined,
    transaction_date: data.transaction_date,
    category_id: data.category_id,
    category_name: cat?.name || '',
    description: data.description,
    vendor: data.vendor,
    volume: data.volume,
    unit: data.unit,
    unit_price: data.unit_price,
    total,
    invoice_number: data.invoice_number || '-',
    notes: data.notes || undefined,
    created_by: data.created_by || 'Maria Magdalena, S.E.',
    created_at: new Date().toISOString(),
  });

  logAudit('Create', 'Realisasi', id, 'Finance Admin', 'usr-finance-01', undefined, `Input realisasi ${data.description} Rp ${total.toLocaleString('id-ID')}`);
  return id;
}

export function updateRealization(id: string, data: Partial<Realization>): Realization {
  const r = store.realizations.find(rl => rl.id === id);
  if (!r) throw new Error('Item realisasi tidak ditemukan');
  if (data.category_id) {
    const cat = store.budgetCategories.find(c => c.id === data.category_id);
    if (cat) r.category_name = cat.name;
  }
  Object.assign(r, data);
  if (data.volume !== undefined || data.unit_price !== undefined) {
    r.total = (r.volume || 1) * (r.unit_price || 0);
  }
  logAudit('Update', 'Realisasi', id, 'Finance Admin', 'usr-finance-01', undefined, `Update realisasi ${r.description}`);
  return toPlain(r);
}

export function deleteRealization(id: string) {
  store.realizations = store.realizations.filter(r => r.id !== id);
  logAudit('Delete', 'Realisasi', id, 'Finance Admin', 'usr-finance-01', undefined, `Hapus realisasi ${id}`);
}

// LPJ CHECKLIST TOGGLE (#29)
export function toggleLpjChecklist(id: string, is_complete: boolean) {
  const item = store.lpjChecklists.find(l => l.id === id);
  if (item) {
    item.is_complete = is_complete;
    item.updated_at = new Date().toISOString();
  }
}

// DOCUMENTATION & OFFICIAL DOCUMENTS (#30, #31, #32)
export function addDocumentationPhoto(data: {
  training_id: string;
  category: string;
  file_name: string;
  file_url: string;
  caption: string;
  documentation_date: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string;
}) {
  const id = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  store.documentation.push({
    id,
    training_id: data.training_id,
    category: data.category,
    file_name: data.file_name,
    file_url: data.file_url,
    caption: data.caption,
    documentation_date: data.documentation_date,
    file_size: data.file_size || 1500000,
    mime_type: data.mime_type || 'image/jpeg',
    uploaded_by: data.uploaded_by || 'Panitia Pelaksana',
    uploaded_at: new Date().toISOString(),
  });
  return id;
}

export function getDocuments(filter?: {
  training_id?: string;
  regency_id?: string;
  document_type?: string;
  search?: string;
}): ProgramDocument[] {
  let list = store.documents;

  if (filter?.training_id) {
    list = list.filter(d => d.training_id === filter.training_id);
  }
  if (filter?.regency_id) {
    list = list.filter(d => d.regency_id === filter.regency_id);
  }
  if (filter?.document_type) {
    list = list.filter(d => d.document_type.toLowerCase() === filter.document_type!.toLowerCase());
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(d => d.title.toLowerCase().includes(q) || (d.file_name && d.file_name.toLowerCase().includes(q)));
  }

  const result: ProgramDocument[] = list.map(d => {
    const reg = store.regencies.find(r => r.id === d.regency_id);
    const dist = store.districts.find(di => di.id === d.district_id);
    return {
      ...d,
      regency_name: reg?.name || '',
      district_name: dist?.name || '',
    };
  });

  return toPlain(result);
}

export function addDocument(data: {
  training_id?: string;
  regency_id?: string;
  district_id?: string;
  document_type: string;
  title: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  document_date: string;
  notes?: string;
  uploaded_by?: string;
}) {
  const id = `off-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  store.documents.push({
    id,
    training_id: data.training_id || undefined,
    regency_id: data.regency_id || undefined,
    district_id: data.district_id || undefined,
    document_type: data.document_type,
    title: data.title,
    file_url: data.file_url,
    file_name: data.file_name,
    file_size: data.file_size || 2048000,
    mime_type: data.mime_type || 'application/pdf',
    document_date: data.document_date,
    notes: data.notes || undefined,
    uploaded_by: data.uploaded_by || 'Admin Dokumen',
    uploaded_at: new Date().toISOString(),
  });

  logAudit('Upload', 'Dokumen', id, 'Admin Dokumen', 'usr-admin-01', undefined, `Upload dokumen resmi: ${data.title}`);
  return id;
}

// NOTIFICATIONS (#33, #34)
export function getNotifications(user_id?: string): SystemNotification[] {
  let list = store.notifications;
  if (user_id) {
    list = list.filter(n => !n.user_id || n.user_id === user_id);
  }

  const result: SystemNotification[] = list.map(n => {
    const training = store.trainings.find(t => t.id === n.training_id);
    const reg = store.regencies.find(r => r.id === training?.regency_id);
    const dist = store.districts.find(d => d.id === training?.district_id);
    return {
      ...n,
      training_name: training?.program_name,
      regency_name: reg?.name,
      district_name: dist?.name,
    };
  });

  return toPlain(result);
}

export function markNotificationAsRead(id: string) {
  const notif = store.notifications.find(n => n.id === id);
  if (notif) notif.is_read = true;
}

export function markAllNotificationsAsRead() {
  store.notifications.forEach(n => { n.is_read = true; });
}

// AUDIT LOGS (#45)
export function getAuditLogs(limit = 20): AuditLog[] {
  return toPlain(store.auditLogs.slice(0, limit));
}

// SYSTEM SETTINGS (#84)
export function getSystemSettings(): SystemSettings {
  return toPlain(store.systemSettings);
}

export function updateSystemSettings(settings: Partial<SystemSettings>) {
  Object.assign(store.systemSettings, settings);
  logAudit('Update', 'Pengaturan', 'system_settings', 'Super Admin', 'usr-admin-01', undefined, 'Update pengaturan instansi & sistem');
  return toPlain(store.systemSettings);
}
