-- Papua Barat Monitoring System - PostgreSQL Migration 01
-- Initial Schema Definition for Supabase Cloud

-- Create extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'finance', 'pimpinan', 'viewer')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Provinces
CREATE TABLE IF NOT EXISTS public.provinces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL
);

-- 3. Regencies
CREATE TABLE IF NOT EXISTS public.regencies (
  id TEXT PRIMARY KEY,
  province_id TEXT NOT NULL REFERENCES public.provinces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Districts
CREATE TABLE IF NOT EXISTS public.districts (
  id TEXT PRIMARY KEY,
  regency_id TEXT NOT NULL REFERENCES public.regencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  coordinator TEXT NOT NULL,
  target_teachers INT DEFAULT 0,
  target_students INT DEFAULT 0,
  status TEXT DEFAULT 'Planning' CHECK (status IN ('Planning', 'Ready', 'Ongoing', 'Completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Schools
CREATE TABLE IF NOT EXISTS public.schools (
  id TEXT PRIMARY KEY,
  regency_id TEXT NOT NULL REFERENCES public.regencies(id) ON DELETE CASCADE,
  district_id TEXT NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  school_level TEXT NOT NULL CHECK (school_level IN ('SD', 'SMP', 'SMA', 'SMK', 'Lainnya')),
  address TEXT NOT NULL,
  principal TEXT NOT NULL,
  teacher_participants INT DEFAULT 0,
  student_participants INT DEFAULT 0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Trainings (Unique constraint on district_id as requested in #114)
CREATE TABLE IF NOT EXISTS public.trainings (
  id TEXT PRIMARY KEY,
  program_name TEXT NOT NULL DEFAULT 'Program Pandai Berhitung dengan Metode GASING',
  regency_id TEXT NOT NULL REFERENCES public.regencies(id) ON DELETE CASCADE,
  district_id TEXT UNIQUE NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  venue TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pic TEXT NOT NULL,
  target_teachers INT DEFAULT 0,
  actual_teachers INT DEFAULT 0,
  target_students INT DEFAULT 0,
  actual_students INT DEFAULT 0,
  status TEXT DEFAULT 'Planning' CHECK (status IN ('Planning', 'Ready', 'Ongoing', 'Completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_training_dates CHECK (end_date >= start_date)
);

-- 7. Participants
CREATE TABLE IF NOT EXISTS public.participants (
  id TEXT PRIMARY KEY,
  training_id TEXT NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  participant_type TEXT NOT NULL CHECK (participant_type IN ('guru', 'siswa')),
  full_name TEXT NOT NULL,
  gender CHAR(1) NOT NULL CHECK (gender IN ('L', 'P')),
  class_name TEXT,
  attendance_status TEXT DEFAULT 'Hadir' CHECK (attendance_status IN ('Hadir', 'Izin', 'Sakit', 'Alpa')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Budget Categories
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- 9. Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id TEXT PRIMARY KEY,
  training_id TEXT NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  fiscal_year INT DEFAULT 2026,
  category_id TEXT NOT NULL REFERENCES public.budget_categories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  volume NUMERIC(12, 2) NOT NULL CHECK (volume >= 0),
  unit TEXT NOT NULL,
  unit_price NUMERIC(14, 2) NOT NULL CHECK (unit_price >= 0),
  total NUMERIC(16, 2) NOT NULL CHECK (total >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Realizations
CREATE TABLE IF NOT EXISTS public.realizations (
  id TEXT PRIMARY KEY,
  training_id TEXT NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  budget_id TEXT REFERENCES public.budgets(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.budget_categories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  vendor TEXT NOT NULL,
  volume NUMERIC(12, 2) NOT NULL CHECK (volume >= 0),
  unit TEXT NOT NULL,
  unit_price NUMERIC(14, 2) NOT NULL CHECK (unit_price >= 0),
  total NUMERIC(16, 2) NOT NULL CHECK (total >= 0),
  invoice_number TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Realization Documents
CREATE TABLE IF NOT EXISTS public.realization_documents (
  id TEXT PRIMARY KEY,
  realization_id TEXT NOT NULL REFERENCES public.realizations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Documentation
CREATE TABLE IF NOT EXISTS public.documentation (
  id TEXT PRIMARY KEY,
  training_id TEXT NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  documentation_date DATE NOT NULL,
  file_size INT,
  mime_type TEXT,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Documents (Document Library)
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  training_id TEXT REFERENCES public.trainings(id) ON DELETE CASCADE,
  regency_id TEXT REFERENCES public.regencies(id) ON DELETE CASCADE,
  district_id TEXT REFERENCES public.districts(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INT,
  mime_type TEXT,
  document_date DATE NOT NULL,
  notes TEXT,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. LPJ Checklists
CREATE TABLE IF NOT EXISTS public.lpj_checklists (
  id TEXT PRIMARY KEY,
  training_id TEXT NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  checklist_type TEXT NOT NULL,
  is_complete BOOLEAN DEFAULT FALSE,
  document_id TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  training_id TEXT REFERENCES public.trainings(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  action TEXT NOT NULL CHECK (action IN ('Create', 'Update', 'Delete', 'Upload')),
  module TEXT NOT NULL,
  record_id TEXT NOT NULL,
  old_values TEXT,
  new_values TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);

-- Essential Performance Indexes (Section #80)
CREATE INDEX IF NOT EXISTS idx_regencies_prov ON public.regencies(province_id);
CREATE INDEX IF NOT EXISTS idx_districts_reg ON public.districts(regency_id);
CREATE INDEX IF NOT EXISTS idx_schools_dist ON public.schools(district_id);
CREATE INDEX IF NOT EXISTS idx_trainings_reg ON public.trainings(regency_id);
CREATE INDEX IF NOT EXISTS idx_trainings_dist ON public.trainings(district_id);
CREATE INDEX IF NOT EXISTS idx_trainings_status ON public.trainings(status);
CREATE INDEX IF NOT EXISTS idx_trainings_start ON public.trainings(start_date);
CREATE INDEX IF NOT EXISTS idx_budgets_training ON public.budgets(training_id);
CREATE INDEX IF NOT EXISTS idx_realizations_training ON public.realizations(training_id);
CREATE INDEX IF NOT EXISTS idx_participants_training ON public.participants(training_id);
