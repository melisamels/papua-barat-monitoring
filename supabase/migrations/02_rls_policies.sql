-- Papua Barat Monitoring System - PostgreSQL Migration 02
-- Row Level Security (RLS) Policies & Storage Buckets (#50, #51)

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realization_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lpj_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()::text;
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Read Policies for all authenticated users
CREATE POLICY "Allow read access for authenticated users" ON public.provinces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.regencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.districts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.schools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.trainings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.documentation FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.lpj_checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.budget_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.system_settings FOR SELECT TO authenticated USING (true);

-- 2. Financial tables read policies (Restricted for Viewer #4, #50)
CREATE POLICY "Allow financial read for non-viewers" ON public.budgets
  FOR SELECT TO authenticated
  USING (public.get_auth_user_role() IN ('super_admin', 'finance', 'pimpinan'));

CREATE POLICY "Allow realization read for non-viewers" ON public.realizations
  FOR SELECT TO authenticated
  USING (public.get_auth_user_role() IN ('super_admin', 'finance', 'pimpinan'));

CREATE POLICY "Allow realization docs read for non-viewers" ON public.realization_documents
  FOR SELECT TO authenticated
  USING (public.get_auth_user_role() IN ('super_admin', 'finance', 'pimpinan'));

-- 3. Super Admin Full Access Policy
CREATE POLICY "Super admin full CRUD access profiles" ON public.profiles FOR ALL TO authenticated USING (public.get_auth_user_role() = 'super_admin');
CREATE POLICY "Super admin full CRUD access regencies" ON public.regencies FOR ALL TO authenticated USING (public.get_auth_user_role() = 'super_admin');
CREATE POLICY "Super admin full CRUD access districts" ON public.districts FOR ALL TO authenticated USING (public.get_auth_user_role() = 'super_admin');
CREATE POLICY "Super admin full CRUD access schools" ON public.schools FOR ALL TO authenticated USING (public.get_auth_user_role() = 'super_admin');
CREATE POLICY "Super admin full CRUD access trainings" ON public.trainings FOR ALL TO authenticated USING (public.get_auth_user_role() = 'super_admin');
CREATE POLICY "Super admin full CRUD access participants" ON public.participants FOR ALL TO authenticated USING (public.get_auth_user_role() = 'super_admin');
CREATE POLICY "Super admin full CRUD access settings" ON public.system_settings FOR ALL TO authenticated USING (public.get_auth_user_role() = 'super_admin');
CREATE POLICY "Super admin full access audit_logs" ON public.audit_logs FOR ALL TO authenticated USING (public.get_auth_user_role() = 'super_admin');

-- 4. Finance Role Policies (RAB, Realisasi, LPJ, Bukti)
CREATE POLICY "Finance manage budgets" ON public.budgets
  FOR ALL TO authenticated
  USING (public.get_auth_user_role() IN ('super_admin', 'finance'));

CREATE POLICY "Finance manage realizations" ON public.realizations
  FOR ALL TO authenticated
  USING (public.get_auth_user_role() IN ('super_admin', 'finance'));

CREATE POLICY "Finance manage realization_documents" ON public.realization_documents
  FOR ALL TO authenticated
  USING (public.get_auth_user_role() IN ('super_admin', 'finance'));

CREATE POLICY "Finance & Admin manage lpj_checklists" ON public.lpj_checklists
  FOR ALL TO authenticated
  USING (public.get_auth_user_role() IN ('super_admin', 'finance'));

-- 5. Storage Buckets Setup (Section #51)
-- Insert buckets into storage.buckets if using Supabase Storage
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('program-documents', 'program-documents', true),
  ('documentation', 'documentation', true),
  ('finance-documents', 'finance-documents', false),
  ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;
