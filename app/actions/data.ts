'use server';

import * as queries from '@/lib/db/queries';
import { DashboardFilter, Training, Participant, Budget, Realization } from '@/lib/types';

export async function fetchProgramSummary(filter?: Partial<DashboardFilter>) {
  return queries.getProgramSummary(filter);
}

export async function fetchRegencies(filter?: Partial<DashboardFilter> & { search?: string }) {
  return queries.getRegencies(filter);
}

export async function fetchRegencyById(id: string) {
  return queries.getRegencyById(id);
}

export async function fetchDistricts(regency_id?: string) {
  return queries.getDistricts(regency_id);
}

export async function fetchSchools(filter?: { regency_id?: string; district_id?: string; search?: string }) {
  return queries.getSchools(filter);
}

export async function fetchTrainings(filter?: { regency_id?: string; status?: string; search?: string; fiscal_year?: number; month?: number }) {
  return queries.getTrainings(filter);
}

export async function fetchTrainingById(id: string) {
  return queries.getTrainingById(id);
}

export async function fetchParticipants(filter?: { training_id?: string; participant_type?: 'guru' | 'siswa'; school_id?: string; search?: string }) {
  return queries.getParticipants(filter);
}

export async function fetchBudgetCategories() {
  return queries.getBudgetCategories();
}

export async function fetchUpcomingTrainings(limit?: number) {
  return queries.getUpcomingTrainings(limit);
}

export async function fetchAttentionItems() {
  return queries.getAttentionItems();
}

export async function fetchAuditLogs(limit?: number) {
  return queries.getAuditLogs(limit);
}

export async function fetchSystemSettings() {
  return queries.getSystemSettings();
}

export async function fetchDocuments(filter?: { regency_id?: string; training_id?: string; document_type?: string; search?: string }) {
  return queries.getDocuments(filter);
}

// Server Action Mutations
export async function actionCreateTraining(data: {
  regency_id: string;
  district_id: string;
  venue: string;
  location: string;
  start_date: string;
  end_date: string;
  pic: string;
  target_teachers?: number;
  target_students?: number;
  status?: 'Planning' | 'Ready' | 'Ongoing' | 'Completed';
  notes?: string;
}) {
  return queries.createTraining({
    ...data,
    target_teachers: data.target_teachers ?? 30,
    target_students: data.target_students ?? 90,
    status: data.status ?? 'Planning',
  });
}

export async function actionUpdateTraining(id: string, data: Partial<Training>) {
  return queries.updateTraining(id, data);
}

export async function actionDeleteTraining(id: string) {
  return queries.deleteTraining(id);
}

export async function actionCreateBudget(data: {
  training_id: string;
  fiscal_year?: number;
  category_id: string;
  description: string;
  volume: number;
  unit: string;
  unit_price: number;
  notes?: string;
}) {
  return queries.createBudget(data);
}

export async function actionDeleteBudget(id: string) {
  return queries.deleteBudget(id);
}

export async function actionCreateRealization(data: {
  training_id: string;
  transaction_date: string;
  category_id: string;
  budget_id?: string;
  description: string;
  vendor: string;
  volume: number;
  unit: string;
  unit_price: number;
  invoice_number?: string;
  notes?: string;
  created_by?: string;
}) {
  return queries.createRealization(data);
}

export async function actionDeleteRealization(id: string) {
  return queries.deleteRealization(id);
}

export async function actionToggleLpjChecklist(id: string, is_complete: boolean) {
  return queries.toggleLpjChecklist(id, is_complete);
}

export async function actionCreateParticipant(data: {
  training_id: string;
  school_id: string;
  participant_type: 'guru' | 'siswa';
  full_name: string;
  gender: 'L' | 'P';
  class_name?: string;
  attendance_status?: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  notes?: string;
}) {
  return queries.createParticipant(data);
}

export async function actionBatchCreateParticipants(
  items: Array<{
    training_id: string;
    school_id: string;
    participant_type: 'guru' | 'siswa';
    full_name: string;
    gender: 'L' | 'P';
    class_name?: string;
    attendance_status?: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
    notes?: string;
  }>
) {
  return queries.batchCreateParticipants(items);
}

export async function actionUpdateSystemSettings(settings: {
  system_name?: string;
  program_name?: string;
  institution_name?: string;
  province_name?: string;
  report_signatory_name?: string;
  report_signatory_title?: string;
  report_footer?: string;
  reminders_enabled?: boolean;
}) {
  return queries.updateSystemSettings(settings);
}

export async function actionCreateDistrict(data: {
  regency_id: string;
  name: string;
  code: string;
  coordinator: string;
  target_teachers?: number;
  target_students?: number;
  status?: 'Planning' | 'Ready' | 'Ongoing' | 'Completed';
  notes?: string;
}) {
  return queries.createDistrict(data);
}

export async function actionCreateSchool(data: {
  regency_id: string;
  district_id: string;
  name: string;
  school_level?: string;
  address?: string;
  principal?: string;
  teacher_participants?: number;
  student_participants?: number;
  notes?: string;
}) {
  return queries.createSchool(data);
}

export async function actionUpdateDistrict(id: string, data: any) {
  return queries.updateDistrict(id, data);
}

export async function actionDeleteDistrict(id: string) {
  return queries.deleteDistrict(id);
}

export async function actionUpdateSchool(id: string, data: any) {
  return queries.updateSchool(id, data);
}

export async function actionDeleteSchool(id: string) {
  return queries.deleteSchool(id);
}

export async function actionUpdateParticipant(id: string, data: any) {
  return queries.updateParticipant(id, data);
}

export async function actionDeleteParticipant(id: string) {
  return queries.deleteParticipant(id);
}

export async function actionUpdateBudget(id: string, data: any) {
  return queries.updateBudget(id, data);
}

export async function actionUpdateRealization(id: string, data: any) {
  return queries.updateRealization(id, data);
}
