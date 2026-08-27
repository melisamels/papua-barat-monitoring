// Papua Barat Monitoring System - Core Type Definitions
// Program Pandai Berhitung dengan Metode GASING

export type UserRole = 'super_admin' | 'finance' | 'pimpinan' | 'viewer';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Province {
  id: string;
  name: string;
  code: string;
}

export interface Regency {
  id: string;
  province_id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  notes?: string;
  created_at?: string;
  // Computed / aggregated
  district_count?: number;
  training_count?: number;
  school_count?: number;
  target_teachers?: number;
  actual_teachers?: number;
  target_students?: number;
  actual_students?: number;
  total_rab?: number;
  total_realization?: number;
  progress?: number;
  status?: TrainingStatus;
}

export interface District {
  id: string;
  regency_id: string;
  regency_name?: string;
  name: string;
  code: string;
  coordinator: string;
  target_teachers: number;
  target_students: number;
  status: TrainingStatus;
  notes?: string;
  created_at?: string;
  // Associated training id if exists
  training_id?: string;
  school_count?: number;
}

export type SchoolLevel = 'SD' | 'SMP' | 'SMA' | 'SMK' | 'Lainnya';

export interface School {
  id: string;
  regency_id: string;
  regency_name?: string;
  district_id: string;
  district_name?: string;
  name: string;
  school_level: SchoolLevel;
  address: string;
  principal: string;
  teacher_participants: number;
  student_participants: number;
  latitude?: number;
  longitude?: number;
  notes?: string;
  created_at?: string;
}

export type TrainingStatus = 'Planning' | 'Ready' | 'Ongoing' | 'Completed';

export interface Training {
  id: string;
  program_name: string;
  regency_id: string;
  regency_name?: string;
  district_id: string;
  district_name?: string;
  venue: string;
  location: string;
  start_date: string;
  end_date: string;
  duration_days?: number;
  pic: string;
  target_teachers: number;
  actual_teachers: number;
  target_students: number;
  actual_students: number;
  status: TrainingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Computed financial & progress metrics
  total_rab?: number;
  total_realization?: number;
  balance?: number;
  absorption_rate?: number;
  activity_progress?: number;
  lpj_completeness?: number;
  doc_completeness?: number;
  data_quality?: number;
}

export type ParticipantType = 'guru' | 'siswa';
export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export interface Participant {
  id: string;
  training_id: string;
  school_id: string;
  school_name?: string;
  regency_name?: string;
  district_name?: string;
  participant_type: ParticipantType;
  full_name: string;
  gender: 'L' | 'P';
  class_name?: string; // For students
  attendance_status: AttendanceStatus;
  notes?: string;
  created_at?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  is_active: boolean;
}

export interface Budget {
  id: string;
  training_id: string;
  fiscal_year: number;
  category_id: string;
  category_name?: string;
  description: string;
  volume: number;
  unit: string;
  unit_price: number;
  total: number;
  notes?: string;
  created_at?: string;
}

export interface Realization {
  id: string;
  training_id: string;
  budget_id?: string;
  budget_description?: string;
  transaction_date: string;
  category_id: string;
  category_name?: string;
  description: string;
  vendor: string;
  volume: number;
  unit: string;
  unit_price: number;
  total: number;
  invoice_number: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  documents?: RealizationDocument[];
}

export interface RealizationDocument {
  id: string;
  realization_id: string;
  file_name: string;
  file_url: string;
  document_type: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface Documentation {
  id: string;
  training_id: string;
  training_name?: string;
  regency_name?: string;
  district_name?: string;
  category: string;
  file_name: string;
  file_url: string;
  caption: string;
  documentation_date: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface ProgramDocument {
  id: string;
  training_id?: string;
  training_name?: string;
  regency_id?: string;
  regency_name?: string;
  district_id?: string;
  district_name?: string;
  document_type: string;
  title: string;
  file_url: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  document_date: string;
  notes?: string;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface LpjChecklist {
  id: string;
  training_id: string;
  checklist_type: string;
  is_complete: boolean;
  document_id?: string;
  notes?: string;
  updated_at?: string;
}

export type NotificationSeverity = 'info' | 'warning' | 'critical';

export interface SystemNotification {
  id: string;
  user_id?: string;
  training_id?: string;
  training_name?: string;
  regency_name?: string;
  district_name?: string;
  type: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: 'Create' | 'Update' | 'Delete' | 'Upload';
  module: string;
  record_id: string;
  old_values?: string;
  new_values?: string;
  created_at: string;
}

// Global Filter Interface
export interface DashboardFilter {
  fiscal_year: number; // e.g. 2026
  month: number | null; // 1-12, null = all
  regency_id: string | null; // null = all
}

// System Settings
export interface SystemSettings {
  system_name: string;
  program_name: string;
  institution_name: string;
  logo_url: string;
  province_name: string;
  report_signatory_name: string;
  report_signatory_title: string;
  report_footer: string;
  reminders_enabled: boolean;
}

// AI Message Types
export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context_time?: string;
  sources?: string[];
}
