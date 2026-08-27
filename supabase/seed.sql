-- Papua Barat Monitoring System - Seed Data SQL
-- Initial 2026 Dataset: 7 Regencies, 23 Districts, Schools, Trainings, Budgets, Realizations

-- Provinces
INSERT INTO public.provinces (id, name, code) VALUES ('prov-pb', 'Papua Barat', 'PB') ON CONFLICT (id) DO NOTHING;

-- 7 Regencies
INSERT INTO public.regencies (id, province_id, name, code, latitude, longitude, notes) VALUES
  ('reg-mkw', 'prov-pb', 'Manokwari', 'MKW', -0.8615, 134.0620, 'Ibukota Provinsi Papua Barat'),
  ('reg-mansel', 'prov-pb', 'Manokwari Selatan', 'MSL', -1.3323, 134.1205, 'Wilayah Ransiki dan dataran pesisir'),
  ('reg-pegarfak', 'prov-pb', 'Pegunungan Arfak', 'PGF', -1.3853, 133.8785, 'Kawasan pegunungan dan danau Anggi'),
  ('reg-bintuni', 'prov-pb', 'Teluk Bintuni', 'TBN', -2.1287, 133.5186, 'Kawasan pesisir dan industri'),
  ('reg-wondama', 'prov-pb', 'Teluk Wondama', 'TWD', -2.7145, 134.4983, 'Wilayah Wasior dan kepulauan Wondama'),
  ('reg-fakfak', 'prov-pb', 'Fakfak', 'FFK', -2.9264, 132.2965, 'Kota pala bersejarah'),
  ('reg-kaimana', 'prov-pb', 'Kaimana', 'KMN', -3.6598, 133.7712, 'Kota senja pesisir selatan')
ON CONFLICT (id) DO NOTHING;

-- 16 Budget Categories (#25)
INSERT INTO public.budget_categories (id, name, is_active) VALUES
  ('cat-1', 'Transportasi', true), ('cat-2', 'Tiket', true), ('cat-3', 'Penginapan', true),
  ('cat-4', 'Konsumsi', true), ('cat-5', 'Snack', true), ('cat-6', 'Honor', true),
  ('cat-7', 'Trainer', true), ('cat-8', 'Modul', true), ('cat-9', 'ATK', true),
  ('cat-10', 'Kaos', true), ('cat-11', 'Perlengkapan', true), ('cat-12', 'Venue', true),
  ('cat-13', 'Dokumentasi', true), ('cat-14', 'Transport Lokal', true),
  ('cat-15', 'Operasional', true), ('cat-16', 'Lain-lain', true)
ON CONFLICT (id) DO NOTHING;

-- Districts
INSERT INTO public.districts (id, regency_id, name, code, coordinator, target_teachers, target_students, status, notes) VALUES
  ('dis-twd-01', 'reg-wondama', 'Wasior', 'WSR', 'Korneles Rumadas, S.Pd.', 30, 90, 'Completed', 'Distrik utama Wasior'),
  ('dis-twd-02', 'reg-wondama', 'Rasiei', 'RSI', 'Markus Torey, S.Pd.', 25, 75, 'Completed', 'Pesisir Rasiei'),
  ('dis-twd-03', 'reg-wondama', 'Wamesa', 'WMS', 'Yohana Kereway, S.Pd.', 20, 60, 'Completed', 'Akses laut'),
  ('dis-tbn-01', 'reg-bintuni', 'Bintuni Kota', 'BTK', 'Hendrik Fimbay, M.Pd.', 40, 120, 'Completed', 'Pusat pemerintahan Bintuni'),
  ('dis-tbn-02', 'reg-bintuni', 'Manimeri', 'MNM', 'Sarah Iba, S.Pd.', 30, 90, 'Completed', 'Kawasan penyangga kota'),
  ('dis-tbn-03', 'reg-bintuni', 'Babo', 'BBO', 'Agustinus Orocomna, S.Pd.', 25, 75, 'Completed', 'Pesisir teluk Babo'),
  ('dis-pgf-01', 'reg-pegarfak', 'Anggi', 'ANG', 'Yance Dowansiba, S.Pd.', 35, 105, 'Ongoing', 'Ibukota Pegaf dekat danau Anggi'),
  ('dis-pgf-02', 'reg-pegarfak', 'Anggi Gida', 'AGD', 'Petrus Sayori, S.Pd.', 25, 75, 'Ongoing', 'Danau Anggi Gida'),
  ('dis-pgf-03', 'reg-pegarfak', 'Meyambouw', 'MYB', 'Lukas Mandacan, S.Pd.', 20, 60, 'Ongoing', 'Dataran tinggi lembah Arfak'),
  ('dis-mkw-01', 'reg-mkw', 'Manokwari Barat', 'MWB', 'Drs. Piter Rumbruren', 45, 135, 'Ready', 'Pusat kota Manokwari'),
  ('dis-mkw-02', 'reg-mkw', 'Manokwari Timur', 'MWT', 'Ester Mansawan, S.Pd.', 35, 105, 'Ready', 'Kawasan pesisir Pasir Putih'),
  ('dis-mkw-03', 'reg-mkw', 'Manokwari Selatan Distrik', 'MWS', 'Daniel Wonggor, S.Pd.', 30, 90, 'Ready', 'Kawasan Sanggeng dan Maruni'),
  ('dis-mkw-04', 'reg-mkw', 'Warmare', 'WRM', 'Yulianus Meidodga, S.Pd.', 25, 75, 'Ready', 'Dataran Warmare'),
  ('dis-msl-01', 'reg-mansel', 'Ransiki', 'RSK', 'Semuel Inden, S.Pd.', 35, 105, 'Ready', 'Ibukota Ransiki'),
  ('dis-msl-02', 'reg-mansel', 'Oransbari', 'ORB', 'Mariana Waror, S.Pd.', 30, 90, 'Ready', 'Kawasan Oransbari'),
  ('dis-msl-03', 'reg-mansel', 'Neney', 'NNY', 'Kaleb Ahoren, S.Pd.', 20, 60, 'Ready', 'Wilayah pedalaman'),
  ('dis-ffk-01', 'reg-fakfak', 'Fakfak Kota', 'FFC', 'Hasanudin Uswanas, M.Pd.', 40, 120, 'Planning', 'Pusat ibukota Fakfak'),
  ('dis-ffk-02', 'reg-fakfak', 'Pariwari', 'PRW', 'Siti Rohani Patiran, S.Pd.', 30, 90, 'Planning', 'Pesisir perbukitan'),
  ('dis-ffk-03', 'reg-fakfak', 'Kokas', 'KKS', 'Abdul Rahman Kramandondo, S.Pd.', 25, 75, 'Planning', 'Kawasan teluk bersejarah Kokas'),
  ('dis-ffk-04', 'reg-fakfak', 'Karas', 'KRS', 'Ibrahim Weripang, S.Pd.', 20, 60, 'Planning', 'Kepulauan Karas'),
  ('dis-kmn-01', 'reg-kaimana', 'Kaimana Kota', 'KMC', 'Fransiskus Werfete, M.Pd.', 35, 105, 'Planning', 'Pusat ibukota Kaimana'),
  ('dis-kmn-02', 'reg-kaimana', 'Teluk Etna', 'ETN', 'Martha Brawery, S.Pd.', 25, 75, 'Planning', 'Wilayah teluk Etna'),
  ('dis-kmn-03', 'reg-kaimana', 'Buruway', 'BRW', 'Dominikus Omba, S.Pd.', 20, 60, 'Planning', 'Wilayah Buruway')
ON CONFLICT (id) DO NOTHING;

-- Trainings
INSERT INTO public.trainings (id, program_name, regency_id, district_id, venue, location, start_date, end_date, pic, target_teachers, actual_teachers, target_students, actual_students, status, notes) VALUES
  ('TRN-TWD-001', 'Program Pandai Berhitung dengan Metode GASING', 'reg-wondama', 'dis-twd-01', 'Aula Dinas Pendidikan Teluk Wondama', 'Wasior', '2026-03-02', '2026-03-16', 'Korneles Rumadas, S.Pd.', 30, 30, 90, 90, 'Completed', 'Tuntas 100% dengan hasil peningkatan nilai luar biasa'),
  ('TRN-TBN-001', 'Program Pandai Berhitung dengan Metode GASING', 'reg-bintuni', 'dis-tbn-01', 'Gedung Sasana Karya Bintuni', 'Bintuni Kota', '2026-05-11', '2026-05-25', 'Hendrik Fimbay, M.Pd.', 40, 40, 120, 120, 'Completed', 'Tuntas 100% dan LPJ disahkan'),
  ('TRN-PGF-001', 'Program Pandai Berhitung dengan Metode GASING', 'reg-pegarfak', 'dis-pgf-01', 'Aula Pemda Pegunungan Arfak', 'Ullong, Anggi', '2026-08-18', '2026-09-01', 'Yance Dowansiba, S.Pd.', 35, 34, 105, 102, 'Ongoing', 'Pelatihan hari ke-10 berjalan dinamis'),
  ('TRN-MKW-001', 'Program Pandai Berhitung dengan Metode GASING', 'reg-mkw', 'dis-mkw-01', 'Gedung PKK Provinsi Papua Barat', 'Manokwari Barat', '2026-09-07', '2026-09-21', 'Drs. Piter Rumbruren', 45, 0, 135, 0, 'Ready', 'Persiapan venue dan akomodasi tuntas')
ON CONFLICT (id) DO NOTHING;
