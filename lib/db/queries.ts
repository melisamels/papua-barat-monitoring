// Papua Barat Monitoring System - High Performance Analytical Queries & CRUD Operations
// Program Pandai Berhitung dengan Metode GASING

import { getDb } from './index';
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
    const db = getDb();
    const id = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, action, module, record_id, old_values, new_values, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, user_id, user_name, action, module, record_id, old_values || null, new_values || null);
  } catch (err) {
    console.error('Failed to log audit:', err);
  }
}

// PROGRAM GLOBAL SUMMARY / KPI (#8, #113)
export function getProgramSummary(filter?: Partial<DashboardFilter>) {
  const db = getDb();

  let trainingWhere = '1=1';
  const params: any[] = [];

  if (filter?.regency_id) {
    trainingWhere += ' AND t.regency_id = ?';
    params.push(filter.regency_id);
  }

  if (filter?.month) {
    trainingWhere += ` AND cast(strftime('%m', t.start_date) as integer) = ?`;
    params.push(filter.month);
  }

  if (filter?.fiscal_year) {
    trainingWhere += ` AND cast(strftime('%Y', t.start_date) as integer) = ?`;
    params.push(filter.fiscal_year);
  }

  // Aggregate training stats
  const trainingStats = db.prepare(`
    SELECT 
      COUNT(*) as total_trainings,
      SUM(CASE WHEN t.status = 'Planning' THEN 1 ELSE 0 END) as count_planning,
      SUM(CASE WHEN t.status = 'Ready' THEN 1 ELSE 0 END) as count_ready,
      SUM(CASE WHEN t.status = 'Ongoing' THEN 1 ELSE 0 END) as count_ongoing,
      SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as count_completed,
      SUM(t.target_teachers) as target_teachers,
      SUM(t.actual_teachers) as actual_teachers,
      SUM(t.target_students) as target_students,
      SUM(t.actual_students) as actual_students
    FROM trainings t
    WHERE ${trainingWhere}
  `).get(...params) as any;

  // Counts of Regencies, Districts, Schools
  const regencyCount = (db.prepare(`SELECT count(*) as count FROM regencies`).get() as any)?.count || 0;
  const districtCount = filter?.regency_id 
    ? ((db.prepare(`SELECT count(*) as count FROM districts WHERE regency_id = ?`).get(filter.regency_id) as any)?.count || 0)
    : ((db.prepare(`SELECT count(*) as count FROM districts`).get() as any)?.count || 0);
  const schoolCount = filter?.regency_id
    ? ((db.prepare(`SELECT count(*) as count FROM schools WHERE regency_id = ?`).get(filter.regency_id) as any)?.count || 0)
    : ((db.prepare(`SELECT count(*) as count FROM schools`).get() as any)?.count || 0);

  // Financial aggregation
  const budgetQuery = `
    SELECT coalesce(SUM(b.total), 0) as total_rab
    FROM budgets b
    JOIN trainings t ON b.training_id = t.id
    WHERE ${trainingWhere}
  `;
  const totalRab = (db.prepare(budgetQuery).get(...params) as any)?.total_rab || 0;

  const realizationQuery = `
    SELECT coalesce(SUM(r.total), 0) as total_realization
    FROM realizations r
    JOIN trainings t ON r.training_id = t.id
    WHERE ${trainingWhere}
  `;
  const totalRealization = (db.prepare(realizationQuery).get(...params) as any)?.total_realization || 0;

  const balance = totalRab - totalRealization;
  const absorptionRate = totalRab > 0 ? Math.round((totalRealization / totalRab) * 100) : 0;

  // Overall Program Progress (#70: completed activities / total activities * 100%)
  const totalTrainings = trainingStats?.total_trainings || 0;
  const completedTrainings = trainingStats?.count_completed || 0;
  const overallProgress = totalTrainings > 0 ? Math.round((completedTrainings / totalTrainings) * 100) : 0;

  return {
    regency_count: regencyCount,
    district_count: districtCount,
    school_count: schoolCount,
    training_count: totalTrainings,
    status_counts: {
      planning: trainingStats?.count_planning || 0,
      ready: trainingStats?.count_ready || 0,
      ongoing: trainingStats?.count_ongoing || 0,
      completed: completedTrainings,
    },
    participants: {
      target_teachers: trainingStats?.target_teachers || 0,
      actual_teachers: trainingStats?.actual_teachers || 0,
      target_students: trainingStats?.target_students || 0,
      actual_students: trainingStats?.actual_students || 0,
      teacher_rate: (trainingStats?.target_teachers || 0) > 0 ? Math.round(((trainingStats?.actual_teachers || 0) / trainingStats.target_teachers) * 100) : 0,
      student_rate: (trainingStats?.target_students || 0) > 0 ? Math.round(((trainingStats?.actual_students || 0) / trainingStats.target_students) * 100) : 0,
    },
    financial: {
      total_rab: totalRab,
      total_realization: totalRealization,
      balance,
      absorption_rate: absorptionRate,
    },
    overall_progress: overallProgress,
  };
}

// REGENCIES WITH STATS & MAP COORDINATES (#14, #15)
export function getRegencies(filter?: Partial<DashboardFilter>): Regency[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT 
      r.id, r.province_id, r.name, r.code, r.latitude, r.longitude, r.notes, r.created_at,
      (SELECT count(*) FROM districts d WHERE d.regency_id = r.id) as district_count,
      (SELECT count(*) FROM schools s WHERE s.regency_id = r.id) as school_count,
      (SELECT count(*) FROM trainings t WHERE t.regency_id = r.id) as training_count,
      COUNT(DISTINCT d.id) as district_count,
      COUNT(DISTINCT s.id) as school_count,
      SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_count,
      SUM(CASE WHEN t.status = 'Ongoing' THEN 1 ELSE 0 END) as ongoing_count,
      SUM(CASE WHEN t.status = 'Ready' THEN 1 ELSE 0 END) as ready_count,
      SUM(CASE WHEN t.status = 'Planning' THEN 1 ELSE 0 END) as planning_count,
      COUNT(DISTINCT t.id) as training_count,
      COALESCE(SUM(t.target_teachers), 0) as target_teachers,
      COALESCE(SUM(t.actual_teachers), 0) as actual_teachers,
      COALESCE(SUM(t.target_students), 0) as target_students,
      COALESCE(SUM(t.actual_students), 0) as actual_students,
      COALESCE((SELECT SUM(b.total) FROM budgets b JOIN trainings tr ON b.training_id = tr.id WHERE tr.regency_id = r.id), 0) as total_rab,
      COALESCE((SELECT SUM(rz.total) FROM realizations rz JOIN trainings tr ON rz.training_id = tr.id WHERE tr.regency_id = r.id), 0) as total_realization
    FROM regencies r
    LEFT JOIN districts d ON r.id = d.regency_id
    LEFT JOIN schools s ON r.id = s.regency_id
    LEFT JOIN trainings t ON r.id = t.regency_id
    GROUP BY r.id
    ORDER BY r.name ASC
  `).all() as any[];

  return toPlain(rows.map(row => {
    const tCount = row.training_count || 0;
    const cCount = row.completed_count || 0;
    const progress = tCount > 0 ? Math.round((cCount / tCount) * 100) : 0;
    
    // Dominant/active status for map coloring
    let status: 'Completed' | 'Ongoing' | 'Ready' | 'Planning' = 'Planning';
    if (cCount === tCount && tCount > 0) {
      status = 'Completed';
    } else if (row.ongoing_count > 0) {
      status = 'Ongoing';
    } else if (row.ready_count > 0) {
      status = 'Ready';
    }

    return {
      id: row.id,
      province_id: row.province_id,
      name: row.name,
      code: row.code,
      latitude: row.latitude,
      longitude: row.longitude,
      notes: row.notes,
      created_at: row.created_at,
      district_count: row.district_count,
      school_count: row.school_count,
      training_count: tCount,
      target_teachers: row.target_teachers,
      actual_teachers: row.actual_teachers,
      target_students: row.target_students,
      actual_students: row.actual_students,
      total_rab: row.total_rab,
      total_realization: row.total_realization,
      progress,
      status,
    };
  }));
}

// GET SINGLE REGENCY BY ID (#16)
export function getRegencyById(id: string) {
  const regencies = getRegencies();
  const regency = regencies.find(r => r.id === id);
  if (!regency) return null;

  const db = getDb();
  const districts = getDistricts(id);
  const schools = getSchools({ regency_id: id });
  const trainings = getTrainings({ regency_id: id });

  return toPlain({
    ...regency,
    districts,
    schools,
    trainings,
  });
}

// DISTRICTS (#17)
export function getDistricts(regency_id?: string): District[] {
  const db = getDb();
  let query = `
    SELECT 
      d.id, d.regency_id, r.name as regency_name, d.name, d.code, d.coordinator,
      d.target_teachers, d.target_students, d.status, d.notes, d.created_at,
      (SELECT t.id FROM trainings t WHERE t.district_id = d.id LIMIT 1) as training_id,
      (SELECT count(*) FROM schools s WHERE s.district_id = d.id) as school_count
    FROM districts d
    JOIN regencies r ON d.regency_id = r.id
  `;
  const params: any[] = [];
  if (regency_id) {
    query += ' WHERE d.regency_id = ?';
    params.push(regency_id);
  }
  query += ' ORDER BY d.name ASC';
  return toPlain((db.prepare(query).all(...params) as any) as District[]);
}

// SCHOOLS (#18)
export function getSchools(filter?: { regency_id?: string; district_id?: string; search?: string }): School[] {
  const db = getDb();
  let query = `
    SELECT 
      s.id, s.regency_id, r.name as regency_name, s.district_id, d.name as district_name,
      s.name, s.school_level, s.address, s.principal, s.teacher_participants,
      s.student_participants, s.latitude, s.longitude, s.notes, s.created_at
    FROM schools s
    JOIN regencies r ON s.regency_id = r.id
    JOIN districts d ON s.district_id = d.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (filter?.regency_id) {
    query += ' AND s.regency_id = ?';
    params.push(filter.regency_id);
  }
  if (filter?.district_id) {
    query += ' AND s.district_id = ?';
    params.push(filter.district_id);
  }
  if (filter?.search) {
    query += ' AND (s.name LIKE ? OR s.principal LIKE ? OR s.address LIKE ?)';
    const term = `%${filter.search}%`;
    params.push(term, term, term);
  }
  query += ' ORDER BY s.name ASC';
  return toPlain((db.prepare(query).all(...params) as any) as School[]);
}

// TRAININGS (CORE MODULE) (#19, #20, #68, #69, #70)
export function getTrainings(filter?: { regency_id?: string; status?: string; search?: string; fiscal_year?: number; month?: number }): Training[] {
  const db = getDb();
  let query = `
    SELECT 
      t.id, t.program_name, t.regency_id, r.name as regency_name,
      t.district_id, d.name as district_name, t.venue, t.location,
      t.start_date, t.end_date, t.pic, t.target_teachers, t.actual_teachers,
      t.target_students, t.actual_students, t.status, t.notes, t.created_at, t.updated_at,
      (SELECT coalesce(sum(b.total), 0) FROM budgets b WHERE b.training_id = t.id) as total_rab,
      (SELECT coalesce(sum(rz.total), 0) FROM realizations rz WHERE rz.training_id = t.id) as total_realization,
      (SELECT count(*) FROM lpj_checklists lpj WHERE lpj.training_id = t.id AND lpj.is_complete = 1) as lpj_complete_count,
      (SELECT count(*) FROM lpj_checklists lpj WHERE lpj.training_id = t.id) as lpj_total_count,
      (SELECT count(*) FROM documentation doc WHERE doc.training_id = t.id) as doc_count
    FROM trainings t
    JOIN regencies r ON t.regency_id = r.id
    JOIN districts d ON t.district_id = d.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filter?.regency_id) {
    query += ' AND t.regency_id = ?';
    params.push(filter.regency_id);
  }
  if (filter?.status) {
    query += ' AND t.status = ?';
    params.push(filter.status);
  }
  if (filter?.fiscal_year) {
    query += ` AND cast(strftime('%Y', t.start_date) as integer) = ?`;
    params.push(filter.fiscal_year);
  }
  if (filter?.month) {
    query += ` AND cast(strftime('%m', t.start_date) as integer) = ?`;
    params.push(filter.month);
  }
  if (filter?.search) {
    query += ' AND (t.venue LIKE ? OR t.location LIKE ? OR d.name LIKE ? OR r.name LIKE ? OR t.pic LIKE ?)';
    const term = `%${filter.search}%`;
    params.push(term, term, term, term, term);
  }

  query += ' ORDER BY t.start_date ASC';

  const rows = db.prepare(query).all(...params) as any[];

  return toPlain(rows.map(row => {
    const totalRab = row.total_rab || 0;
    const totalRealization = row.total_realization || 0;
    const balance = totalRab - totalRealization;
    const absorptionRate = totalRab > 0 ? Math.round((totalRealization / totalRab) * 100) : 0;
    const activityProgress = getActivityProgress(row.status);
    
    // LPJ completeness percentage (14 default items)
    const lpjTotal = row.lpj_total_count > 0 ? row.lpj_total_count : 14;
    const lpjCompleteness = Math.round(((row.lpj_complete_count || 0) / lpjTotal) * 100);

    // Documentation completeness (e.g. 5 photos baseline = 100%)
    const docCompleteness = Math.min(100, Math.round(((row.doc_count || 0) / 5) * 100));

    // Data Quality Indicator (#73)
    let qualityPoints = 0;
    if (row.start_date && row.end_date) qualityPoints += 15;
    if (row.venue) qualityPoints += 15;
    if (row.target_teachers > 0) qualityPoints += 15;
    if (totalRab > 0) qualityPoints += 20;
    if (totalRealization > 0) qualityPoints += 15;
    if (docCompleteness > 0) qualityPoints += 10;
    if (lpjCompleteness > 0) qualityPoints += 10;

    return {
      id: row.id,
      program_name: row.program_name,
      regency_id: row.regency_id,
      regency_name: row.regency_name,
      district_id: row.district_id,
      district_name: row.district_name,
      venue: row.venue,
      location: row.location,
      start_date: row.start_date,
      end_date: row.end_date,
      pic: row.pic,
      target_teachers: row.target_teachers,
      actual_teachers: row.actual_teachers,
      target_students: row.target_students,
      actual_students: row.actual_students,
      status: row.status,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      total_rab: totalRab,
      total_realization: totalRealization,
      balance,
      absorption_rate: absorptionRate,
      activity_progress: activityProgress,
      lpj_completeness: lpjCompleteness,
      doc_completeness: docCompleteness,
      data_quality: qualityPoints,
    };
  }));
}

// GET SINGLE TRAINING FULL WORKSPACE DETAIL (#68)
export function getTrainingById(id: string) {
  const db = getDb();
  const trainings = getTrainings();
  const training = trainings.find(t => t.id === id);
  if (!training) return null;

  // Participants
  const participants = (db.prepare(`
    SELECT p.*, s.name as school_name, r.name as regency_name, d.name as district_name
    FROM participants p
    JOIN schools s ON p.school_id = s.id
    JOIN regencies r ON s.regency_id = r.id
    JOIN districts d ON s.district_id = d.id
    WHERE p.training_id = ?
    ORDER BY p.full_name ASC
  `).all(id) as any) as Participant[];

  // Budgets
  const budgets = (db.prepare(`
    SELECT b.*, c.name as category_name
    FROM budgets b
    JOIN budget_categories c ON b.category_id = c.id
    WHERE b.training_id = ?
    ORDER BY b.created_at ASC
  `).all(id) as any) as Budget[];

  // Realizations
  const realizations = (db.prepare(`
    SELECT r.*, c.name as category_name, b.description as budget_description
    FROM realizations r
    JOIN budget_categories c ON r.category_id = c.id
    LEFT JOIN budgets b ON r.budget_id = b.id
    WHERE r.training_id = ?
    ORDER BY r.transaction_date DESC
  `).all(id) as any) as Realization[];

  // LPJ Checklists (#29)
  const lpjChecklists = (db.prepare(`
    SELECT * FROM lpj_checklists WHERE training_id = ? ORDER BY id ASC
  `).all(id) as any) as LpjChecklist[];

  // Documentation photos
  const documentation = (db.prepare(`
    SELECT * FROM documentation WHERE training_id = ? ORDER BY documentation_date DESC
  `).all(id) as any) as Documentation[];

  // Official Documents
  const documents = (db.prepare(`
    SELECT * FROM documents WHERE training_id = ? ORDER BY document_date DESC
  `).all(id) as any) as ProgramDocument[];

  // Schools in this district
  const districtSchools = (db.prepare(`
    SELECT s.*, r.name as regency_name, d.name as district_name
    FROM schools s
    JOIN regencies r ON s.regency_id = r.id
    JOIN districts d ON s.district_id = d.id
    WHERE s.district_id = ?
  `).all(training.district_id) as any) as School[];

  // History / Audit trail for this training (#118)
  const history = (db.prepare(`
    SELECT * FROM audit_logs 
    WHERE (record_id = ? OR old_values LIKE ? OR new_values LIKE ?)
    ORDER BY created_at DESC
  `).all(id, `%${id}%`, `%${id}%`) as any) as AuditLog[];

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
  const db = getDb();
  return toPlain((db.prepare(`SELECT * FROM budget_categories WHERE is_active = 1 ORDER BY name ASC`).all() as any) as BudgetCategory[]);
}

export function addBudgetCategory(name: string): BudgetCategory {
  const db = getDb();
  const id = `cat-${Date.now()}`;
  db.prepare(`INSERT INTO budget_categories (id, name, is_active) VALUES (?, ?, 1)`).run(id, name);
  return { id, name, is_active: true };
}

// UPCOMING TRAININGS (#12)
export function getUpcomingTrainings(limit: number = 5): Training[] {
  const allTrainings = getTrainings();
  const now = new Date();
  
  // Sort by closest start date
  return allTrainings
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, limit);
}

// ATTENTION REQUIRED ITEMS (#13, #34)
export function getAttentionItems() {
  const db = getDb();
  const allTrainings = getTrainings();
  const today = new Date('2026-08-27'); // Current system local date
  const items: {
    id: string;
    training_id: string;
    training_name: string;
    regency_name: string;
    district_name: string;
    type: string;
    title: string;
    description: string;
    severity: 'warning' | 'critical';
  }[] = [];

  for (const t of allTrainings) {
    const startDate = new Date(t.start_date);
    const endDate = new Date(t.end_date);
    const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysOverdue = Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

    // 1. Kegiatan sudah dekat (< 7 hari) tetapi status masih Planning
    if (daysUntilStart > 0 && daysUntilStart <= 14 && t.status === 'Planning') {
      items.push({
        id: `att-plan-${t.id}`,
        training_id: t.id,
        training_name: t.venue,
        regency_name: t.regency_name || '',
        district_name: t.district_name || '',
        type: 'Status Perencanaan',
        title: `Jadwal tinggal ${daysUntilStart} hari tetapi masih berstatus Planning`,
        description: `Pelatihan di Distrik ${t.district_name} dijadwalkan tanggal ${t.start_date}. Segera lengkapi kebutuhan venue dan ubah status menjadi Ready.`,
        severity: 'critical',
      });
    }

    // 2. Kegiatan melewati jadwal tetapi belum completed
    if (daysOverdue > 0 && t.status !== 'Completed') {
      items.push({
        id: `att-overdue-${t.id}`,
        training_id: t.id,
        training_name: t.venue,
        regency_name: t.regency_name || '',
        district_name: t.district_name || '',
        type: 'Keterlambatan',
        title: `Melewati jadwal ${daysOverdue} hari tetapi belum berstatus Completed`,
        description: `Pelatihan di Distrik ${t.district_name} selesai dijadwalkan pada ${t.end_date}. Mohon perbarui status kegiatan atau sesuaikan jadwal pelaksanaan.`,
        severity: 'critical',
      });
    }

    // 3. Realisasi melebihi RAB (Over budget) (#27)
    if ((t.total_realization || 0) > (t.total_rab || 0) && (t.total_rab || 0) > 0) {
      const overAmount = (t.total_realization || 0) - (t.total_rab || 0);
      items.push({
        id: `att-overbudget-${t.id}`,
        training_id: t.id,
        training_name: t.venue,
        regency_name: t.regency_name || '',
        district_name: t.district_name || '',
        type: 'Anggaran Melebihi RAB',
        title: `Realisasi melebihi RAB sebesar Rp ${overAmount.toLocaleString('id-ID')}`,
        description: `Pengeluaran di Distrik ${t.district_name} telah melebihi alokasi anggaran awal. Butuh penyesuaian RAB atau konfirmasi tim keuangan.`,
        severity: 'critical',
      });
    }

    // 4. Kegiatan Completed tetapi LPJ belum lengkap (< 100%)
    if (t.status === 'Completed' && (t.lpj_completeness || 0) < 100) {
      items.push({
        id: `att-lpj-${t.id}`,
        training_id: t.id,
        training_name: t.venue,
        regency_name: t.regency_name || '',
        district_name: t.district_name || '',
        type: 'Kelengkapan LPJ',
        title: `Kegiatan telah selesai tetapi LPJ baru ${t.lpj_completeness}% lengkap`,
        description: `Distrik ${t.district_name} belum melengkapi berkas administrasi dan bukti kuitansi pertanggungjawaban kegiatan.`,
        severity: 'warning',
      });
    }

    // 5. Dokumentasi belum lengkap
    if ((t.status === 'Completed' || t.status === 'Ongoing') && (t.doc_completeness || 0) < 50) {
      items.push({
        id: `att-doc-${t.id}`,
        training_id: t.id,
        training_name: t.venue,
        regency_name: t.regency_name || '',
        district_name: t.district_name || '',
        type: 'Dokumentasi Kurang',
        title: `Dokumentasi foto kegiatan di ${t.district_name} masih minim`,
        description: `Harap unggah foto aktivitas kelas, konsumsi, dan serah terima untuk kelengkapan pelaporan dinas.`,
        severity: 'warning',
      });
    }
  }

  return toPlain(items);
}

// PARTICIPANTS CRUD & IMPORT (#22)
export function getParticipants(filter?: { training_id?: string; participant_type?: string; school_id?: string; search?: string }): Participant[] {
  const db = getDb();
  let query = `
    SELECT 
      p.id, p.training_id, p.school_id, s.name as school_name,
      r.name as regency_name, d.name as district_name,
      p.participant_type, p.full_name, p.gender, p.class_name,
      p.attendance_status, p.notes, p.created_at
    FROM participants p
    JOIN schools s ON p.school_id = s.id
    JOIN regencies r ON s.regency_id = r.id
    JOIN districts d ON s.district_id = d.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (filter?.training_id) {
    query += ' AND p.training_id = ?';
    params.push(filter.training_id);
  }
  if (filter?.participant_type) {
    query += ' AND p.participant_type = ?';
    params.push(filter.participant_type);
  }
  if (filter?.school_id) {
    query += ' AND p.school_id = ?';
    params.push(filter.school_id);
  }
  if (filter?.search) {
    query += ' AND (p.full_name LIKE ? OR s.name LIKE ?)';
    const term = `%${filter.search}%`;
    params.push(term, term);
  }
  query += ' ORDER BY p.full_name ASC';
  return toPlain((db.prepare(query).all(...params) as any) as Participant[]);
}

export function createParticipant(data: {
  training_id: string;
  school_id: string;
  participant_type: 'guru' | 'siswa';
  full_name: string;
  gender: 'L' | 'P';
  class_name?: string;
  attendance_status?: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  notes?: string;
}): Participant {
  const db = getDb();
  const id = `prt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  db.prepare(`
    INSERT INTO participants (id, training_id, school_id, participant_type, full_name, gender, class_name, attendance_status, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    id,
    data.training_id,
    data.school_id,
    data.participant_type,
    data.full_name,
    data.gender,
    data.class_name || null,
    data.attendance_status || 'Hadir',
    data.notes || null
  );

  // Update actual participants count in training
  updateTrainingActualCounts(data.training_id);
  logAudit('Create', 'Peserta', id, 'User', 'usr-admin-01', undefined, `Tambah peserta: ${data.full_name} (${data.participant_type})`);

  const list = getParticipants({ search: data.full_name });
  return list.find(p => p.id === id) || ({} as any);
}

export function batchCreateParticipants(items: Array<{
  training_id: string;
  school_id: string;
  participant_type: 'guru' | 'siswa';
  full_name: string;
  gender: 'L' | 'P';
  class_name?: string;
  attendance_status?: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  notes?: string;
}>): number {
  const db = getDb();
  let count = 0;
  for (const item of items) {
    const id = `prt-${Date.now()}-${count}-${Math.random().toString(36).substring(2, 5)}`;
    db.prepare(`
      INSERT INTO participants (id, training_id, school_id, participant_type, full_name, gender, class_name, attendance_status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      id,
      item.training_id,
      item.school_id,
      item.participant_type,
      item.full_name,
      item.gender,
      item.class_name || null,
      item.attendance_status || 'Hadir',
      item.notes || null
    );
    count++;
  }
  if (items.length > 0) {
    updateTrainingActualCounts(items[0].training_id);
    logAudit('Create', 'Peserta', `batch-${count}`, 'User', 'usr-admin-01', undefined, `Import batch ${count} peserta`);
  }
  return count;
}

function updateTrainingActualCounts(training_id: string) {
  const db = getDb();
  const counts = db.prepare(`
    SELECT 
      SUM(CASE WHEN participant_type = 'guru' AND attendance_status = 'Hadir' THEN 1 ELSE 0 END) as actual_teachers,
      SUM(CASE WHEN participant_type = 'siswa' AND attendance_status = 'Hadir' THEN 1 ELSE 0 END) as actual_students
    FROM participants
    WHERE training_id = ?
  `).get(training_id) as any;

  db.prepare(`
    UPDATE trainings 
    SET actual_teachers = ?, actual_students = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(counts?.actual_teachers || 0, counts?.actual_students || 0, training_id);
}

// TRAINING CRUD (#19, #20, #114)
export function createTraining(data: {
  regency_id: string;
  district_id: string;
  venue: string;
  location: string;
  start_date: string;
  end_date: string;
  pic: string;
  target_teachers: number;
  target_students: number;
  status: 'Planning' | 'Ready' | 'Ongoing' | 'Completed';
  notes?: string;
}): Training {
  const db = getDb();

  // Unique constraint check per district (#114)
  const existing = db.prepare(`SELECT id FROM trainings WHERE district_id = ?`).get(data.district_id);
  if (existing) {
    throw new Error('Kegiatan untuk distrik ini sudah terdaftar.');
  }

  // Get regency code for ID prefix
  const reg = db.prepare(`SELECT code FROM regencies WHERE id = ?`).get(data.regency_id) as { code: string } | undefined;
  const prefix = reg?.code || 'TRN';
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const id = `TRN-${prefix}-${randomSuffix}`;

  db.prepare(`
    INSERT INTO trainings (
      id, program_name, regency_id, district_id, venue, location,
      start_date, end_date, pic, target_teachers, actual_teachers,
      target_students, actual_students, status, notes, created_at, updated_at
    ) VALUES (?, 'Program Pandai Berhitung dengan Metode GASING', ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, ?, ?, datetime('now'), datetime('now'))
  `).run(
    id,
    data.regency_id,
    data.district_id,
    data.venue,
    data.location,
    data.start_date,
    data.end_date,
    data.pic,
    data.target_teachers,
    data.target_students,
    data.status,
    data.notes || null
  );

  // Initialize 14 LPJ Checklists for this training
  const defaultLpjTypes = [
    'RAB', 'Realisasi', 'Daftar peserta', 'Daftar hadir', 'Kuitansi',
    'Invoice', 'Bukti transfer', 'Dokumentasi kegiatan', 'Dokumentasi konsumsi',
    'Dokumentasi penginapan', 'Dokumentasi transportasi', 'Surat tugas',
    'Berita acara', 'Laporan kegiatan'
  ];
  const insertLpj = db.prepare(`
    INSERT INTO lpj_checklists (id, training_id, checklist_type, is_complete, notes, updated_at)
    VALUES (?, ?, ?, 0, 'Belum lengkap', datetime('now'))
  `);
  defaultLpjTypes.forEach((type, idx) => {
    insertLpj.run(`lpj-${id}-${idx + 1}`, id, type);
  });

  logAudit('Create', 'Kegiatan', id, 'Super Admin', 'usr-admin-01', undefined, `Tambah kegiatan pelatihan: ${data.venue}`);
  return getTrainingById(id)!;
}

export function updateTraining(id: string, data: Partial<Training>): Training {
  const db = getDb();
  const current = getTrainingById(id);
  if (!current) throw new Error('Kegiatan tidak ditemukan');

  const fields: string[] = [];
  const params: any[] = [];

  if (data.venue !== undefined) { fields.push('venue = ?'); params.push(data.venue); }
  if (data.location !== undefined) { fields.push('location = ?'); params.push(data.location); }
  if (data.start_date !== undefined) { fields.push('start_date = ?'); params.push(data.start_date); }
  if (data.end_date !== undefined) { fields.push('end_date = ?'); params.push(data.end_date); }
  if (data.pic !== undefined) { fields.push('pic = ?'); params.push(data.pic); }
  if (data.target_teachers !== undefined) { fields.push('target_teachers = ?'); params.push(data.target_teachers); }
  if (data.actual_teachers !== undefined) { fields.push('actual_teachers = ?'); params.push(data.actual_teachers); }
  if (data.target_students !== undefined) { fields.push('target_students = ?'); params.push(data.target_students); }
  if (data.actual_students !== undefined) { fields.push('actual_students = ?'); params.push(data.actual_students); }
  if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }
  if (data.notes !== undefined) { fields.push('notes = ?'); params.push(data.notes); }

  fields.push(`updated_at = datetime('now')`);
  params.push(id);

  db.prepare(`UPDATE trainings SET ${fields.join(', ')} WHERE id = ?`).run(...params);

  logAudit('Update', 'Kegiatan', id, 'User', 'usr-admin-01', JSON.stringify({ status: current.status }), JSON.stringify({ status: data.status || current.status }));
  return getTrainingById(id)!;
}

export function deleteTraining(id: string): boolean {
  const db = getDb();
  const current = getTrainingById(id);
  if (!current) return false;

  // Cascade delete related records
  db.prepare(`DELETE FROM lpj_checklists WHERE training_id = ?`).run(id);
  db.prepare(`DELETE FROM documentation WHERE training_id = ?`).run(id);
  db.prepare(`DELETE FROM documents WHERE training_id = ?`).run(id);
  db.prepare(`DELETE FROM realizations WHERE training_id = ?`).run(id);
  db.prepare(`DELETE FROM budgets WHERE training_id = ?`).run(id);
  db.prepare(`DELETE FROM participants WHERE training_id = ?`).run(id);
  db.prepare(`DELETE FROM notifications WHERE training_id = ?`).run(id);
  db.prepare(`DELETE FROM trainings WHERE id = ?`).run(id);

  logAudit('Delete', 'Kegiatan', id, 'Super Admin', 'usr-admin-01', JSON.stringify({ venue: current.venue }), undefined);
  return true;
}

// RAB / BUDGET CRUD (#23, #24)
export function createBudget(data: {
  training_id: string;
  category_id: string;
  description: string;
  volume: number;
  unit: string;
  unit_price: number;
  notes?: string;
}): Budget {
  const db = getDb();
  const id = `bgt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const total = data.volume * data.unit_price;

  db.prepare(`
    INSERT INTO budgets (id, training_id, fiscal_year, category_id, description, volume, unit, unit_price, total, notes, created_at)
    VALUES (?, ?, 2026, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    id,
    data.training_id,
    data.category_id,
    data.description,
    data.volume,
    data.unit,
    data.unit_price,
    total,
    data.notes || null
  );

  logAudit('Create', 'RAB', id, 'Finance User', 'usr-finance-01', undefined, `Item RAB: ${data.description} (Rp ${total})`);
  return {
    id,
    training_id: data.training_id,
    fiscal_year: 2026,
    category_id: data.category_id,
    description: data.description,
    volume: data.volume,
    unit: data.unit,
    unit_price: data.unit_price,
    total,
    notes: data.notes,
  };
}

export function deleteBudget(id: string): boolean {
  const db = getDb();
  db.prepare(`DELETE FROM budgets WHERE id = ?`).run(id);
  logAudit('Delete', 'RAB', id, 'Finance User', 'usr-finance-01');
  return true;
}

// REALIZATION CRUD (#26)
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
  invoice_number?: string;
  notes?: string;
  created_by?: string;
}): Realization {
  const db = getDb();
  const id = `rlz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const total = data.volume * data.unit_price;

  db.prepare(`
    INSERT INTO realizations (
      id, training_id, budget_id, transaction_date, category_id,
      description, vendor, volume, unit, unit_price, total,
      invoice_number, notes, created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    id,
    data.training_id,
    data.budget_id || null,
    data.transaction_date,
    data.category_id,
    data.description,
    data.vendor,
    data.volume,
    data.unit,
    data.unit_price,
    total,
    data.invoice_number || null,
    data.notes || null,
    data.created_by || 'Finance Team'
  );

  logAudit('Create', 'Realisasi', id, 'Finance User', 'usr-finance-01', undefined, `Realisasi: ${data.description} (Rp ${total})`);
  return {
    id,
    training_id: data.training_id,
    budget_id: data.budget_id,
    transaction_date: data.transaction_date,
    category_id: data.category_id,
    description: data.description,
    vendor: data.vendor,
    volume: data.volume,
    unit: data.unit,
    unit_price: data.unit_price,
    total,
    invoice_number: data.invoice_number || '',
    notes: data.notes,
    created_by: data.created_by,
  };
}

export function deleteRealization(id: string): boolean {
  const db = getDb();
  db.prepare(`DELETE FROM realizations WHERE id = ?`).run(id);
  logAudit('Delete', 'Realisasi', id, 'Finance User', 'usr-finance-01');
  return true;
}

// LPJ CHECKLIST TOGGLE (#29)
export function toggleLpjChecklist(id: string, is_complete: boolean, notes?: string): boolean {
  const db = getDb();
  db.prepare(`
    UPDATE lpj_checklists 
    SET is_complete = ?, notes = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(is_complete ? 1 : 0, notes || (is_complete ? 'Lengkap & Terverifikasi' : 'Belum lengkap'), id);

  logAudit('Update', 'LPJ', id, 'User', 'usr-admin-01', undefined, `Status checklist diubah ke ${is_complete ? 'Lengkap' : 'Belum'}`);
  return true;
}

// DOCUMENTATION PHOTO UPLOAD (#30, #31)
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
}): Documentation {
  const db = getDb();
  const id = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  db.prepare(`
    INSERT INTO documentation (
      id, training_id, category, file_name, file_url, caption,
      documentation_date, file_size, mime_type, uploaded_by, uploaded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    id,
    data.training_id,
    data.category,
    data.file_name,
    data.file_url,
    data.caption,
    data.documentation_date,
    data.file_size || null,
    data.mime_type || 'image/jpeg',
    data.uploaded_by || 'Dokumentasi Team'
  );

  logAudit('Upload', 'Dokumentasi', id, 'User', 'usr-admin-01', undefined, `Foto: ${data.file_name} (${data.category})`);
  return {
    id,
    ...data,
    uploaded_at: new Date().toISOString(),
  };
}

// DOCUMENT LIBRARY (#32)
export function getDocuments(filter?: { regency_id?: string; training_id?: string; document_type?: string; search?: string }): ProgramDocument[] {
  const db = getDb();
  let query = `
    SELECT 
      d.*, t.venue as training_name, r.name as regency_name, dt.name as district_name
    FROM documents d
    LEFT JOIN trainings t ON d.training_id = t.id
    LEFT JOIN regencies r ON d.regency_id = r.id
    LEFT JOIN districts dt ON d.district_id = dt.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (filter?.regency_id) {
    query += ' AND d.regency_id = ?';
    params.push(filter.regency_id);
  }
  if (filter?.training_id) {
    query += ' AND d.training_id = ?';
    params.push(filter.training_id);
  }
  if (filter?.document_type) {
    query += ' AND d.document_type = ?';
    params.push(filter.document_type);
  }
  if (filter?.search) {
    query += ' AND (d.title LIKE ? OR d.file_name LIKE ?)';
    const term = `%${filter.search}%`;
    params.push(term, term);
  }
  query += ' ORDER BY d.document_date DESC';

  return toPlain((db.prepare(query).all(...params) as any) as ProgramDocument[]);
}

export function addDocument(data: {
  training_id?: string;
  regency_id?: string;
  district_id?: string;
  document_type: string;
  title: string;
  file_url: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  document_date: string;
  notes?: string;
  uploaded_by?: string;
}): ProgramDocument {
  const db = getDb();
  const id = `off-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  db.prepare(`
    INSERT INTO documents (
      id, training_id, regency_id, district_id, document_type,
      title, file_url, file_name, file_size, mime_type,
      document_date, notes, uploaded_by, uploaded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    id,
    data.training_id || null,
    data.regency_id || null,
    data.district_id || null,
    data.document_type,
    data.title,
    data.file_url,
    data.file_name || null,
    data.file_size || null,
    data.mime_type || 'application/pdf',
    data.document_date,
    data.notes || null,
    data.uploaded_by || 'Admin'
  );

  logAudit('Upload', 'Dokumen Resmi', id, 'User', 'usr-admin-01', undefined, `Dokumen: ${data.title} (${data.document_type})`);
  return {
    id,
    ...data,
    uploaded_at: new Date().toISOString(),
  };
}

// NOTIFICATIONS (#33, #34)
export function getNotifications(user_id?: string): SystemNotification[] {
  const db = getDb();
  return toPlain((db.prepare(`
    SELECT n.*, t.venue as training_name, r.name as regency_name, d.name as district_name
    FROM notifications n
    LEFT JOIN trainings t ON n.training_id = t.id
    LEFT JOIN regencies r ON t.regency_id = r.id
    LEFT JOIN districts d ON t.district_id = d.id
    ORDER BY n.created_at DESC
  `).all() as any) as SystemNotification[]);
}

export function markNotificationAsRead(id: string): boolean {
  const db = getDb();
  db.prepare(`UPDATE notifications SET is_read = 1 WHERE id = ?`).run(id);
  return true;
}

export function markAllNotificationsAsRead(): boolean {
  const db = getDb();
  db.prepare(`UPDATE notifications SET is_read = 1`).run();
  return true;
}

// AUDIT LOGS (#45)
export function getAuditLogs(limit: number = 50): AuditLog[] {
  const db = getDb();
  return toPlain((db.prepare(`
    SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?
  `).all(limit) as any) as AuditLog[]);
}

// SYSTEM SETTINGS (#84)
export function getSystemSettings(): SystemSettings {
  const db = getDb();
  const rows = db.prepare(`SELECT key, value FROM system_settings`).all() as { key: string; value: string }[];
  const map: Record<string, string> = {};
  rows.forEach(r => { map[r.key] = r.value; });

  return toPlain({
    system_name: map['system_name'] || 'Papua Barat Monitoring System',
    program_name: map['program_name'] || 'Program Pandai Berhitung dengan Metode GASING',
    institution_name: map['institution_name'] || 'Dinas Pendidikan Provinsi Papua Barat',
    logo_url: map['logo_url'] || '/assets/logo-papua-barat.png',
    province_name: map['province_name'] || 'Papua Barat',
    report_signatory_name: map['report_signatory_name'] || 'Barnabas Dowansiba, S.Pd., M.Pd.',
    report_signatory_title: map['report_signatory_title'] || 'Kepala Dinas Pendidikan Provinsi Papua Barat',
    report_footer: map['report_footer'] || 'Papua Barat Monitoring System - GASING 2026',
    reminders_enabled: map['reminders_enabled'] === 'true',
  });
}

export function updateSystemSettings(settings: Partial<SystemSettings>): boolean {
  const db = getDb();
  const updateStmt = db.prepare(`INSERT OR REPLACE INTO system_settings (id, key, value) VALUES (?, ?, ?)`);

  if (settings.system_name !== undefined) updateStmt.run('set-1', 'system_name', settings.system_name);
  if (settings.program_name !== undefined) updateStmt.run('set-2', 'program_name', settings.program_name);
  if (settings.institution_name !== undefined) updateStmt.run('set-3', 'institution_name', settings.institution_name);
  if (settings.logo_url !== undefined) updateStmt.run('set-4', 'logo_url', settings.logo_url);
  if (settings.province_name !== undefined) updateStmt.run('set-5', 'province_name', settings.province_name);
  if (settings.report_signatory_name !== undefined) updateStmt.run('set-6', 'report_signatory_name', settings.report_signatory_name);
  if (settings.report_signatory_title !== undefined) updateStmt.run('set-7', 'report_signatory_title', settings.report_signatory_title);
  if (settings.report_footer !== undefined) updateStmt.run('set-8', 'report_footer', settings.report_footer);
  if (settings.reminders_enabled !== undefined) updateStmt.run('set-9', 'reminders_enabled', settings.reminders_enabled ? 'true' : 'false');

  logAudit('Update', 'Pengaturan Sistem', 'settings', 'Super Admin', 'usr-admin-01', undefined, 'Update pengaturan sistem dan pelaporan');
  return true;
}
