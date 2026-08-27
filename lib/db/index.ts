// Papua Barat Monitoring System - Database Engine
// Persistent Storage using Node.js DatabaseSync (node:sqlite) + Supabase support

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

// Database file path: supports local dev & Vercel serverless (/tmp)
function getDatabasePath(): string {
  if (process.env.VERCEL) {
    const tmpDbPath = path.join('/tmp', 'papua_barat.db');
    const sourceDbPath = path.join(process.cwd(), 'papua_barat.db');
    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(sourceDbPath)) {
        try {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        } catch (err) {
          console.error('Failed to copy db to /tmp:', err);
        }
      }
    }
    return tmpDbPath;
  }
  return path.join(process.cwd(), 'papua_barat.db');
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    const dbPath = getDatabasePath();
    const isNew = !fs.existsSync(dbPath);
    dbInstance = new DatabaseSync(dbPath);
    
    // Enable WAL mode & foreign keys for performance and data integrity
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    
    initTables(dbInstance);
    if (isNew || isTableEmpty(dbInstance, 'provinces')) {
      seedDatabase(dbInstance);
    }
  }
  return dbInstance;
}

function isTableEmpty(db: DatabaseSync, tableName: string): boolean {
  try {
    const stmt = db.prepare(`SELECT count(*) as count FROM ${tableName}`);
    const res = stmt.get() as { count: number } | undefined;
    return !res || res.count === 0;
  } catch {
    return true;
  }
}

function initTables(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      avatar_url TEXT,
      is_active INTEGER DEFAULT 1,
      last_login TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS provinces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS regencies (
      id TEXT PRIMARY KEY,
      province_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (province_id) REFERENCES provinces(id)
    );

    CREATE TABLE IF NOT EXISTS districts (
      id TEXT PRIMARY KEY,
      regency_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      coordinator TEXT NOT NULL,
      target_teachers INTEGER DEFAULT 0,
      target_students INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Planning',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (regency_id) REFERENCES regencies(id)
    );

    CREATE TABLE IF NOT EXISTS schools (
      id TEXT PRIMARY KEY,
      regency_id TEXT NOT NULL,
      district_id TEXT NOT NULL,
      name TEXT NOT NULL,
      school_level TEXT NOT NULL,
      address TEXT NOT NULL,
      principal TEXT NOT NULL,
      teacher_participants INTEGER DEFAULT 0,
      student_participants INTEGER DEFAULT 0,
      latitude REAL,
      longitude REAL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (regency_id) REFERENCES regencies(id),
      FOREIGN KEY (district_id) REFERENCES districts(id)
    );

    CREATE TABLE IF NOT EXISTS trainings (
      id TEXT PRIMARY KEY,
      program_name TEXT NOT NULL,
      regency_id TEXT NOT NULL,
      district_id TEXT UNIQUE NOT NULL,
      venue TEXT NOT NULL,
      location TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      pic TEXT NOT NULL,
      target_teachers INTEGER DEFAULT 0,
      actual_teachers INTEGER DEFAULT 0,
      target_students INTEGER DEFAULT 0,
      actual_students INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Planning',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (regency_id) REFERENCES regencies(id),
      FOREIGN KEY (district_id) REFERENCES districts(id)
    );

    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      training_id TEXT NOT NULL,
      school_id TEXT NOT NULL,
      participant_type TEXT NOT NULL,
      full_name TEXT NOT NULL,
      gender TEXT NOT NULL,
      class_name TEXT,
      attendance_status TEXT DEFAULT 'Hadir',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (training_id) REFERENCES trainings(id),
      FOREIGN KEY (school_id) REFERENCES schools(id)
    );

    CREATE TABLE IF NOT EXISTS budget_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      training_id TEXT NOT NULL,
      fiscal_year INTEGER DEFAULT 2026,
      category_id TEXT NOT NULL,
      description TEXT NOT NULL,
      volume REAL NOT NULL,
      unit TEXT NOT NULL,
      unit_price REAL NOT NULL,
      total REAL NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (training_id) REFERENCES trainings(id),
      FOREIGN KEY (category_id) REFERENCES budget_categories(id)
    );

    CREATE TABLE IF NOT EXISTS realizations (
      id TEXT PRIMARY KEY,
      training_id TEXT NOT NULL,
      budget_id TEXT,
      transaction_date TEXT NOT NULL,
      category_id TEXT NOT NULL,
      description TEXT NOT NULL,
      vendor TEXT NOT NULL,
      volume REAL NOT NULL,
      unit TEXT NOT NULL,
      unit_price REAL NOT NULL,
      total REAL NOT NULL,
      invoice_number TEXT,
      notes TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (training_id) REFERENCES trainings(id),
      FOREIGN KEY (category_id) REFERENCES budget_categories(id)
    );

    CREATE TABLE IF NOT EXISTS realization_documents (
      id TEXT PRIMARY KEY,
      realization_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      document_type TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      uploaded_by TEXT,
      uploaded_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (realization_id) REFERENCES realizations(id)
    );

    CREATE TABLE IF NOT EXISTS documentation (
      id TEXT PRIMARY KEY,
      training_id TEXT NOT NULL,
      category TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      caption TEXT NOT NULL,
      documentation_date TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      uploaded_by TEXT,
      uploaded_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (training_id) REFERENCES trainings(id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      training_id TEXT,
      regency_id TEXT,
      district_id TEXT,
      document_type TEXT NOT NULL,
      title TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_name TEXT,
      file_size INTEGER,
      mime_type TEXT,
      document_date TEXT NOT NULL,
      notes TEXT,
      uploaded_by TEXT,
      uploaded_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lpj_checklists (
      id TEXT PRIMARY KEY,
      training_id TEXT NOT NULL,
      checklist_type TEXT NOT NULL,
      is_complete INTEGER DEFAULT 0,
      document_id TEXT,
      notes TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (training_id) REFERENCES trainings(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      training_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT DEFAULT 'warning',
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      record_id TEXT NOT NULL,
      old_values TEXT,
      new_values TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );

    -- Minimal Indexes for Performance (Section #80)
    CREATE INDEX IF NOT EXISTS idx_regencies_prov ON regencies(province_id);
    CREATE INDEX IF NOT EXISTS idx_districts_reg ON districts(regency_id);
    CREATE INDEX IF NOT EXISTS idx_trainings_reg ON trainings(regency_id);
    CREATE INDEX IF NOT EXISTS idx_trainings_dist ON trainings(district_id);
    CREATE INDEX IF NOT EXISTS idx_trainings_status ON trainings(status);
    CREATE INDEX IF NOT EXISTS idx_trainings_start ON trainings(start_date);
    CREATE INDEX IF NOT EXISTS idx_budgets_training ON budgets(training_id);
    CREATE INDEX IF NOT EXISTS idx_realizations_training ON realizations(training_id);
  `);
}

function seedDatabase(db: DatabaseSync) {
  // Profiles
  const insertProfile = db.prepare(`
    INSERT INTO profiles (id, full_name, email, role, avatar_url, is_active, last_login, created_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, datetime('now'))
  `);

  insertProfile.run('usr-admin-01', 'Dr. Yan Pieterson, S.Kom., M.T.', 'admin@papuabarat.go.id', 'super_admin', '/assets/avatars/admin.png', '2026-08-27T08:30:00+09:00');
  insertProfile.run('usr-finance-01', 'Maria Magdalena Mandacan, S.E., Ak.', 'keuangan@papuabarat.go.id', 'finance', '/assets/avatars/finance.png', '2026-08-27T09:15:00+09:00');
  insertProfile.run('usr-pimpinan-01', 'Ir. Dominggus Mandacan, M.Si.', 'pimpinan@papuabarat.go.id', 'pimpinan', '/assets/avatars/pimpinan.png', '2026-08-26T16:45:00+09:00');
  insertProfile.run('usr-viewer-01', 'Barnabas Dowansiba, S.Pd., M.Pd. (Kadisdik Prov)', 'kadisdik@papuabarat.go.id', 'viewer', '/assets/avatars/kadisdik.png', '2026-08-27T07:20:00+09:00');

  // Province
  db.prepare(`INSERT INTO provinces (id, name, code) VALUES ('prov-pb', 'Papua Barat', 'PB')`).run();

  // 7 Regencies (Kabupaten) with real geographic coordinates
  const insertRegency = db.prepare(`
    INSERT INTO regencies (id, province_id, name, code, latitude, longitude, notes)
    VALUES (?, 'prov-pb', ?, ?, ?, ?, ?)
  `);

  insertRegency.run('reg-mkw', 'Manokwari', 'MKW', -0.8615, 134.0620, 'Ibukota Provinsi Papua Barat, pusat koordinasi wilayah utara');
  insertRegency.run('reg-mansel', 'Manokwari Selatan', 'MSL', -1.3323, 134.1205, 'Wilayah pesisir Ransiki dan dataran pertanian');
  insertRegency.run('reg-pegarfak', 'Pegunungan Arfak', 'PGF', -1.3853, 133.8785, 'Kawasan pegunungan dengan tantangan akses dan logistik');
  insertRegency.run('reg-bintuni', 'Teluk Bintuni', 'TBN', -2.1287, 133.5186, 'Kawasan pesisir dan industri dengan sebaran distrik terluas');
  insertRegency.run('reg-wondama', 'Teluk Wondama', 'TWD', -2.7145, 134.4983, 'Wilayah kepulauan dan pesisir Wasior');
  insertRegency.run('reg-fakfak', 'Fakfak', 'FFK', -2.9264, 132.2965, 'Kota pala bersejarah di jazirah selatan Papua Barat');
  insertRegency.run('reg-kaimana', 'Kaimana', 'KMN', -3.6598, 133.7712, 'Kota senja indah di pesisir selatan Papua Barat');

  // 16 Budget Categories (#25)
  const defaultCategories = [
    'Transportasi', 'Tiket', 'Penginapan', 'Konsumsi', 'Snack',
    'Honor', 'Trainer', 'Modul', 'ATK', 'Kaos',
    'Perlengkapan', 'Venue', 'Dokumentasi', 'Transport Lokal',
    'Operasional', 'Lain-lain'
  ];
  const insertCat = db.prepare(`INSERT INTO budget_categories (id, name, is_active) VALUES (?, ?, 1)`);
  defaultCategories.forEach((cat, idx) => {
    insertCat.run(`cat-${idx + 1}`, cat);
  });

  // Districts (Distrik) across Regencies
  const insertDistrict = db.prepare(`
    INSERT INTO districts (id, regency_id, name, code, coordinator, target_teachers, target_students, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const districtsData = [
    // Teluk Wondama (Completed)
    ['dis-twd-01', 'reg-wondama', 'Wasior', 'WSR', 'Korneles Rumadas, S.Pd.', 30, 90, 'Completed', 'Distrik utama kepulauan Wondama'],
    ['dis-twd-02', 'reg-wondama', 'Rasiei', 'RSI', 'Markus Torey, S.Pd.', 25, 75, 'Completed', 'Wilayah pesisir timur'],
    ['dis-twd-03', 'reg-wondama', 'Wamesa', 'WMS', 'Yohana Kereway, S.Pd.', 20, 60, 'Completed', 'Akses transportasi laut'],

    // Teluk Bintuni (Completed)
    ['dis-tbn-01', 'reg-bintuni', 'Bintuni Kota', 'BTK', 'Hendrik Fimbay, M.Pd.', 40, 120, 'Completed', 'Pusat pemerintahan Bintuni'],
    ['dis-tbn-02', 'reg-bintuni', 'Manimeri', 'MNM', 'Sarah Iba, S.Pd.', 30, 90, 'Completed', 'Kawasan penyangga kota'],
    ['dis-tbn-03', 'reg-bintuni', 'Babo', 'BBO', 'Agustinus Orocomna, S.Pd.', 25, 75, 'Completed', 'Pesisir teluk'],

    // Pegunungan Arfak (Ongoing)
    ['dis-pgf-01', 'reg-pegarfak', 'Anggi', 'ANG', 'Yance Dowansiba, S.Pd.', 35, 105, 'Ongoing', 'Ibukota Pegaf dekat danau Anggi'],
    ['dis-pgf-02', 'reg-pegarfak', 'Anggi Gida', 'AGD', 'Petrus Sayori, S.Pd.', 25, 75, 'Ongoing', 'Wilayah danau Anggi Gida'],
    ['dis-pgf-03', 'reg-pegarfak', 'Meyambouw', 'MYB', 'Lukas Mandacan, S.Pd.', 20, 60, 'Ongoing', 'Dataran tinggi lembah Arfak'],

    // Manokwari (Ready)
    ['dis-mkw-01', 'reg-mkw', 'Manokwari Barat', 'MWB', 'Drs. Piter Rumbruren', 45, 135, 'Ready', 'Pusat kota Manokwari'],
    ['dis-mkw-02', 'reg-mkw', 'Manokwari Timur', 'MWT', 'Ester Mansawan, S.Pd.', 35, 105, 'Ready', 'Kawasan pesisir Pasir Putih'],
    ['dis-mkw-03', 'reg-mkw', 'Manokwari Selatan Distrik', 'MWS', 'Daniel Wonggor, S.Pd.', 30, 90, 'Ready', 'Kawasan Sanggeng dan Maruni'],
    ['dis-mkw-04', 'reg-mkw', 'Warmare', 'WRM', 'Yulianus Meidodga, S.Pd.', 25, 75, 'Ready', 'Kawasan agraris dataran Warmare'],

    // Manokwari Selatan (Ready)
    ['dis-msl-01', 'reg-mansel', 'Ransiki', 'RSK', 'Semuel Inden, S.Pd.', 35, 105, 'Ready', 'Ibukota Manokwari Selatan'],
    ['dis-msl-02', 'reg-mansel', 'Oransbari', 'ORB', 'Mariana Waror, S.Pd.', 30, 90, 'Ready', 'Wilayah persawahan dan transmigrasi'],
    ['dis-msl-03', 'reg-mansel', 'Neney', 'NNY', 'Kaleb Ahoren, S.Pd.', 20, 60, 'Ready', 'Wilayah pedalaman'],

    // Fakfak (Planning)
    ['dis-ffk-01', 'reg-fakfak', 'Fakfak Kota', 'FFC', 'Hasanudin Uswanas, M.Pd.', 40, 120, 'Planning', 'Pusat kota Fakfak'],
    ['dis-ffk-02', 'reg-fakfak', 'Pariwari', 'PRW', 'Siti Rohani Patiran, S.Pd.', 30, 90, 'Planning', 'Wilayah pesisir perbukitan'],
    ['dis-ffk-03', 'reg-fakfak', 'Kokas', 'KKS', 'Abdul Rahman Kramandondo, S.Pd.', 25, 75, 'Planning', 'Kawasan teluk bersejarah'],
    ['dis-ffk-04', 'reg-fakfak', 'Karas', 'KRS', 'Ibrahim Weripang, S.Pd.', 20, 60, 'Planning', 'Wilayah kepulauan selatan'],

    // Kaimana (Planning)
    ['dis-kmn-01', 'reg-kaimana', 'Kaimana Kota', 'KMC', 'Fransiskus Werfete, M.Pd.', 35, 105, 'Planning', 'Pusat ibukota senja Kaimana'],
    ['dis-kmn-02', 'reg-kaimana', 'Teluk Etna', 'ETN', 'Martha Brawery, S.Pd.', 25, 75, 'Planning', 'Wilayah teluk Etna'],
    ['dis-kmn-03', 'reg-kaimana', 'Buruway', 'BRW', 'Dominikus Omba, S.Pd.', 20, 60, 'Planning', 'Wilayah pesisir Buruway'],
  ];

  districtsData.forEach(d => {
    insertDistrict.run(d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8]);
  });

  // Schools (Sekolah)
  const insertSchool = db.prepare(`
    INSERT INTO schools (id, regency_id, district_id, name, school_level, address, principal, teacher_participants, student_participants, latitude, longitude, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const schoolsData = [
    ['sch-01', 'reg-mkw', 'dis-mkw-01', 'SD Negeri 01 Manokwari', 'SD', 'Jl. Percetakan Negara No. 12', 'Yohanes Mandacan, S.Pd.', 15, 45, -0.8620, 134.0630, 'Sekolah rujukan kota'],
    ['sch-02', 'reg-mkw', 'dis-mkw-01', 'SD YPPK Santa Monika Manokwari', 'SD', 'Jl. Brawijaya No. 8', 'Sr. Theresia, PBHK', 15, 45, -0.8645, 134.0670, 'Sekolah yayasan katolik terakreditasi A'],
    ['sch-03', 'reg-mkw', 'dis-mkw-01', 'SD YPK 02 Manokwari', 'SD', 'Jl. Merdeka No. 4', 'Ebenheizer Rumadas, S.Pd.', 15, 45, -0.8590, 134.0610, 'Sekolah yayasan kristen tertua'],
    ['sch-04', 'reg-wondama', 'dis-twd-01', 'SD Inpres Wasior 01', 'SD', 'Jl. Raya Wasior I', 'Paulus Manupapami, S.Pd.', 15, 45, -2.7150, 134.4990, 'Lokasi utama pelatihan batch 1'],
    ['sch-05', 'reg-wondama', 'dis-twd-01', 'SD Negeri Wasior II', 'SD', 'Jl. Dotir Wasior', 'Damaris Karubaba, S.Pd.', 15, 45, -2.7180, 134.5010, 'Partisipasi penuh'],
    ['sch-06', 'reg-bintuni', 'dis-tbn-01', 'SD Inpres Bintuni Kota', 'SD', 'Jl. Kali Kodok No. 5', 'Soleman Bauw, S.Pd.', 20, 60, -2.1300, 133.5200, 'Pusat pelatihan Gasing Bintuni'],
    ['sch-07', 'reg-bintuni', 'dis-tbn-01', 'SD Negeri 02 Bintuni', 'SD', 'Jl. Raya Bumi Sani', 'Nurul Hidayati, M.Pd.', 20, 60, -2.1260, 133.5150, 'Peserta antusias'],
    ['sch-08', 'reg-pegarfak', 'dis-pgf-01', 'SD Negeri 01 Anggi', 'SD', 'Jl. Danau Anggi No. 3', 'Mois Mandacan, S.Pd.', 20, 60, -1.3860, 133.8800, 'Sedang berlangsung pelatihan kelas 4-6'],
    ['sch-09', 'reg-pegarfak', 'dis-pgf-01', 'SD Inpres Ullong', 'SD', 'Kampung Ullong Anggi', 'Yakobus Dowansiba, S.Pd.', 15, 45, -1.3820, 133.8750, 'Akses jalan setapak menuju venue'],
    ['sch-10', 'reg-mansel', 'dis-msl-01', 'SD Negeri 01 Ransiki', 'SD', 'Jl. Pertanian Ransiki', 'Bastian Meidodga, S.Pd.', 20, 60, -1.3340, 134.1220, 'Persiapan venue siap'],
    ['sch-11', 'reg-fakfak', 'dis-ffk-01', 'SD Negeri 01 Fakfak', 'SD', 'Jl. Mayjen DI Panjaitan', 'Dra. Halimah Hindom', 20, 60, -2.9270, 132.2980, 'Tahap perencanaan koordinasi komite'],
    ['sch-12', 'reg-kaimana', 'dis-kmn-01', 'SD Inpres Kaimana Kota', 'SD', 'Jl. Utarum No. 15', 'Karel Werfete, S.Pd.', 20, 60, -3.6610, 133.7730, 'Tahap perencanaan pembentukan panitia'],
  ];

  schoolsData.forEach(s => {
    try {
      insertSchool.run(s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[8], s[9], s[10], s[11]);
    } catch (err) {
      console.error('Failed school:', s, err);
      throw err;
    }
  });

  // Trainings (Kegiatan Pelatihan Gasing per Distrik)
  const insertTraining = db.prepare(`
    INSERT INTO trainings (
      id, program_name, regency_id, district_id, venue, location,
      start_date, end_date, pic, target_teachers, actual_teachers,
      target_students, actual_students, status, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const trainingsData = [
    // Teluk Wondama - Completed
    [
      'TRN-TWD-001', 'Program Pandai Berhitung dengan Metode GASING', 'reg-wondama', 'dis-twd-01',
      'Aula Dinas Pendidikan Teluk Wondama', 'Wasior', '2026-03-02', '2026-03-16',
      'Korneles Rumadas, S.Pd.', 30, 30, 90, 90, 'Completed',
      'Pelatihan berhasil 100%. Peningkatan nilai berhitung numerasi dasar siswa dari rerata 32 menjadi 88.',
      '2026-02-15 08:00:00', '2026-03-20 15:00:00'
    ],
    [
      'TRN-TWD-002', 'Program Pandai Berhitung dengan Metode GASING', 'reg-wondama', 'dis-twd-02',
      'Gedung Serbaguna Rasiei', 'Rasiei', '2026-04-06', '2026-04-20',
      'Markus Torey, S.Pd.', 25, 25, 75, 75, 'Completed',
      'Selesai dengan hasil memuaskan, seluruh guru dan siswa tuntas materi penjumlahan, perkalian, dan pembagian cepat.',
      '2026-03-10 08:00:00', '2026-04-25 14:00:00'
    ],
    [
      'TRN-TWD-003', 'Program Pandai Berhitung dengan Metode GASING', 'reg-wondama', 'dis-twd-03',
      'Aula SMP Negeri Wamesa', 'Wamesa', '2026-05-04', '2026-05-18',
      'Yohana Kereway, S.Pd.', 20, 20, 60, 60, 'Completed',
      'Tuntas 100%, seluruh dokumen LPJ telah disahkan.',
      '2026-04-12 09:00:00', '2026-05-22 16:00:00'
    ],

    // Teluk Bintuni - Completed
    [
      'TRN-TBN-001', 'Program Pandai Berhitung dengan Metode GASING', 'reg-bintuni', 'dis-tbn-01',
      'Gedung Sasana Karya Bintuni', 'Bintuni Kota', '2026-05-11', '2026-05-25',
      'Hendrik Fimbay, M.Pd.', 40, 40, 120, 120, 'Completed',
      'Peserta sangat antusias, dihadiri oleh Wakil Bupati saat penutupan.',
      '2026-04-20 08:00:00', '2026-06-01 10:00:00'
    ],
    [
      'TRN-TBN-002', 'Program Pandai Berhitung dengan Metode GASING', 'reg-bintuni', 'dis-tbn-02',
      'Aula Balai Latihan Kerja Manimeri', 'Manimeri', '2026-06-08', '2026-06-22',
      'Sarah Iba, S.Pd.', 30, 30, 90, 90, 'Completed',
      'Tuntas sesuai jadwal dengan kelengkapan LPJ 100%.',
      '2026-05-15 08:00:00', '2026-06-28 11:00:00'
    ],
    [
      'TRN-TBN-003', 'Program Pandai Berhitung dengan Metode GASING', 'reg-bintuni', 'dis-tbn-03',
      'Aula Distrik Babo', 'Babo', '2026-07-06', '2026-07-20',
      'Agustinus Orocomna, S.Pd.', 25, 25, 75, 75, 'Completed',
      'Tuntas dengan realisasi anggaran sesuai target RAB.',
      '2026-06-10 09:00:00', '2026-07-25 15:00:00'
    ],

    // Pegunungan Arfak - Ongoing
    [
      'TRN-PGF-001', 'Program Pandai Berhitung dengan Metode GASING', 'reg-pegarfak', 'dis-pgf-01',
      'Aula Pemda Pegunungan Arfak', 'Ullong, Anggi', '2026-08-18', '2026-09-01',
      'Yance Dowansiba, S.Pd.', 35, 34, 105, 102, 'Ongoing',
      'Pelatihan hari ke-10, siswa telah menguasai konsep perkalian 1 digit dan 2 digit.',
      '2026-07-20 08:00:00', '2026-08-27 10:00:00'
    ],
    [
      'TRN-PGF-002', 'Program Pandai Berhitung dengan Metode GASING', 'reg-pegarfak', 'dis-pgf-02',
      'Gedung Pertemuan Anggi Gida', 'Anggi Gida', '2026-08-20', '2026-09-03',
      'Petrus Sayori, S.Pd.', 25, 25, 75, 72, 'Ongoing',
      'Pelatihan berjalan kondusif, cuaca dingin tidak menyurutkan semangat anak-anak.',
      '2026-07-25 08:00:00', '2026-08-27 10:00:00'
    ],
    [
      'TRN-PGF-003', 'Program Pandai Berhitung dengan Metode GASING', 'reg-pegarfak', 'dis-pgf-03',
      'Aula Kantor Distrik Meyambouw', 'Meyambouw', '2026-08-22', '2026-09-05',
      'Lukas Mandacan, S.Pd.', 20, 20, 60, 58, 'Ongoing',
      'Pelatihan sedang memasuki materi pembagian mencongak.',
      '2026-08-01 08:00:00', '2026-08-27 10:00:00'
    ],

    // Manokwari - Ready
    [
      'TRN-MKW-001', 'Program Pandai Berhitung dengan Metode GASING', 'reg-mkw', 'dis-mkw-01',
      'Gedung PKK Provinsi Papua Barat', 'Manokwari Barat', '2026-09-07', '2026-09-21',
      'Drs. Piter Rumbruren', 45, 0, 135, 0, 'Ready',
      'Venue dan akomodasi trainer sudah dikonfirmasi. Undangan peserta telah disebarkan.',
      '2026-08-10 08:00:00', '2026-08-26 16:00:00'
    ],
    [
      'TRN-MKW-002', 'Program Pandai Berhitung dengan Metode GASING', 'reg-mkw', 'dis-mkw-02',
      'Aula SMK Negeri 2 Manokwari', 'Manokwari Timur', '2026-09-14', '2026-09-28',
      'Ester Mansawan, S.Pd.', 35, 0, 105, 0, 'Ready',
      'Kesiapan modul dan konsumsi telah selesai ditender.',
      '2026-08-12 09:00:00', '2026-08-26 17:00:00'
    ],
    [
      'TRN-MKW-003', 'Program Pandai Berhitung dengan Metode GASING', 'reg-mkw', 'dis-mkw-03',
      'Aula Balai Diklat Keagamaan', 'Sanggeng, Manokwari', '2026-09-21', '2026-10-05',
      'Daniel Wonggor, S.Pd.', 30, 0, 90, 0, 'Ready',
      'SK penetapan panitia lokal telah terbit.',
      '2026-08-15 08:00:00', '2026-08-26 17:00:00'
    ],
    [
      'TRN-MKW-004', 'Program Pandai Berhitung dengan Metode GASING', 'reg-mkw', 'dis-mkw-04',
      'Aula Kantor Distrik Warmare', 'Warmare', '2026-09-28', '2026-10-12',
      'Yulianus Meidodga, S.Pd.', 25, 0, 75, 0, 'Ready',
      'Koordinasi dengan kepala kampung dan tokoh adat telah tuntas.',
      '2026-08-18 09:00:00', '2026-08-26 17:00:00'
    ],

    // Manokwari Selatan - Ready
    [
      'TRN-MSL-001', 'Program Pandai Berhitung dengan Metode GASING', 'reg-mansel', 'dis-msl-01',
      'Gedung Pertemuan Ransiki', 'Ransiki', '2026-09-08', '2026-09-22',
      'Semuel Inden, S.Pd.', 35, 0, 105, 0, 'Ready',
      'RAB telah disetujui dinas, SP2D uang muka telah cair.',
      '2026-08-10 08:00:00', '2026-08-26 14:00:00'
    ],
    [
      'TRN-MSL-002', 'Program Pandai Berhitung dengan Metode GASING', 'reg-mansel', 'dis-msl-02',
      'Aula Balai Desa Oransbari', 'Oransbari', '2026-09-15', '2026-09-29',
      'Mariana Waror, S.Pd.', 30, 0, 90, 0, 'Ready',
      'Kesiapan akomodasi penginapan guru dari kampung pesisir telah diatur.',
      '2026-08-12 09:00:00', '2026-08-26 15:00:00'
    ],
    [
      'TRN-MSL-003', 'Program Pandai Berhitung dengan Metode GASING', 'reg-mansel', 'dis-msl-03',
      'Aula Distrik Neney', 'Neney', '2026-09-22', '2026-10-06',
      'Kaleb Ahoren, S.Pd.', 20, 0, 60, 0, 'Ready',
      'Persiapan pengangkutan modul dan ATK.',
      '2026-08-15 08:00:00', '2026-08-26 16:00:00'
    ],

    // Fakfak - Planning
    [
      'TRN-FFK-001', 'Program Pandai Berhitung dengan Metode GASING', 'reg-fakfak', 'dis-ffk-01',
      'Gedung KONI Fakfak', 'Fakfak Kota', '2026-10-05', '2026-10-19',
      'Hasanudin Uswanas, M.Pd.', 40, 0, 120, 0, 'Planning',
      'Menunggu finalisasi verifikasi RAB oleh tim keuangan provinsi.',
      '2026-08-15 08:00:00', '2026-08-26 16:00:00'
    ],
    [
      'TRN-FFK-002', 'Program Pandai Berhitung dengan Metode GASING', 'reg-fakfak', 'dis-ffk-02',
      'Aula SMP Negeri 1 Pariwari', 'Pariwari', '2026-10-12', '2026-10-26',
      'Siti Rohani Patiran, S.Pd.', 30, 0, 90, 0, 'Planning',
      'Daftar nominatif sekolah dan guru peserta sedang diverifikasi.',
      '2026-08-16 09:00:00', '2026-08-26 16:00:00'
    ],
    [
      'TRN-FFK-003', 'Program Pandai Berhitung dengan Metode GASING', 'reg-fakfak', 'dis-ffk-03',
      'Aula Pelabuhan Kokas', 'Kokas', '2026-10-19', '2026-11-02',
      'Abdul Rahman Kramandondo, S.Pd.', 25, 0, 75, 0, 'Planning',
      'Perencanaan logistik bahan dan konsumsi lokal.',
      '2026-08-18 08:00:00', '2026-08-26 16:00:00'
    ],
    [
      'TRN-FFK-004', 'Program Pandai Berhitung dengan Metode GASING', 'reg-fakfak', 'dis-ffk-04',
      'Gedung Balai Warga Karas', 'Karas', '2026-10-26', '2026-11-09',
      'Ibrahim Weripang, S.Pd.', 20, 0, 60, 0, 'Planning',
      'Akses transportasi laut masih dalam penjadwalan.',
      '2026-08-20 09:00:00', '2026-08-26 16:00:00'
    ],

    // Kaimana - Planning
    [
      'TRN-KMN-001', 'Program Pandai Berhitung dengan Metode GASING', 'reg-kaimana', 'dis-kmn-01',
      'Gedung Pertemuan Krooy', 'Kaimana Kota', '2026-11-02', '2026-11-16',
      'Fransiskus Werfete, M.Pd.', 35, 0, 105, 0, 'Planning',
      'Tahap penyiapan SK panitia daerah dan koordinasi dengan Dinas Pendidikan Kaimana.',
      '2026-08-15 08:00:00', '2026-08-26 16:00:00'
    ],
    [
      'TRN-KMN-002', 'Program Pandai Berhitung dengan Metode GASING', 'reg-kaimana', 'dis-kmn-02',
      'Aula Distrik Teluk Etna', 'Teluk Etna', '2026-11-09', '2026-11-23',
      'Martha Brawery, S.Pd.', 25, 0, 75, 0, 'Planning',
      'Pendataan murid dan guru sasaran jenjang SD.',
      '2026-08-18 09:00:00', '2026-08-26 16:00:00'
    ],
    [
      'TRN-KMN-003', 'Program Pandai Berhitung dengan Metode GASING', 'reg-kaimana', 'dis-kmn-03',
      'Balai Pertemuan Buruway', 'Buruway', '2026-11-16', '2026-11-30',
      'Dominikus Omba, S.Pd.', 20, 0, 60, 0, 'Planning',
      'Penetapan jadwal pelatihan menunggu persetujuan dinas.',
      '2026-08-20 08:00:00', '2026-08-26 16:00:00'
    ]
  ];

  trainingsData.forEach(t => {
    insertTraining.run(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15], t[16]);
  });

  // Seed Budgets (RAB) for Trainings
  const insertBudget = db.prepare(`
    INSERT INTO budgets (
      id, training_id, fiscal_year, category_id, description,
      volume, unit, unit_price, total, notes, created_at
    ) VALUES (?, ?, 2026, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  // Sample standard budget items template for trainings
  const sampleBudgets = [
    // Wasior (TRN-TWD-001) - Grand Total Rp 142.500.000
    ['bgt-twd-01', 'TRN-TWD-001', 'cat-1', 'Transportasi Tim Trainer Jakarta - Wasior PP', 4, 'Tiket/Orang', 7500000, 30000000, 'Pesawat + Speedboat'],
    ['bgt-twd-02', 'TRN-TWD-001', 'cat-3', 'Akomodasi Penginapan Trainer & Panitia (14 Hari)', 4, 'Kamar/14 Hari', 7000000, 28000000, 'Hotel Wasior Indah'],
    ['bgt-twd-03', 'TRN-TWD-001', 'cat-4', 'Konsumsi Makan Siang Peserta & Trainer (120 Orang x 14 Hari)', 1680, 'Porsi', 35000, 58800000, 'Katering lokal'],
    ['bgt-twd-04', 'TRN-TWD-001', 'cat-5', 'Snack Pagi & Sore (120 Orang x 14 Hari)', 1680, 'Kotak', 15000, 25200000, 'Kue tradisional & teh/kopi'],
    ['bgt-twd-05', 'TRN-TWD-001', 'cat-8', 'Modul Pandai Berhitung GASING & Buku Latihan', 120, 'Paket', 100000, 12000000, 'Buku panduan cetak warna'],
    ['bgt-twd-06', 'TRN-TWD-001', 'cat-9', 'ATK, Spidol, Papan Tulis, & Penghapus', 1, 'Paket Kegiatan', 4500000, 4500000, 'Perlengkapan kelas'],
    ['bgt-twd-07', 'TRN-TWD-001', 'cat-10', 'Kaos Seragam Pelatihan GASING Guru & Siswa', 120, 'Pcs', 85000, 10200000, 'Bahan katun adem'],

    // Bintuni Kota (TRN-TBN-001) - Grand Total Rp 175.800.000
    ['bgt-tbn-01', 'TRN-TBN-001', 'cat-1', 'Transportasi Darat & Udara Tim Trainer', 5, 'Orang', 6000000, 30000000, 'Tiket PP'],
    ['bgt-tbn-02', 'TRN-TBN-001', 'cat-3', 'Penginapan Trainer di Bintuni (14 Hari)', 5, 'Kamar', 8400000, 42000000, 'Hotel Bintuni'],
    ['bgt-tbn-03', 'TRN-TBN-001', 'cat-4', 'Konsumsi Peserta 160 Orang x 14 Hari', 2240, 'Porsi', 35000, 78400000, 'Katering'],
    ['bgt-tbn-04', 'TRN-TBN-001', 'cat-8', 'Modul & Buku Kerja GASING', 160, 'Paket', 100000, 16000000, 'Cetak buku lengkap'],
    ['bgt-tbn-05', 'TRN-TBN-001', 'cat-10', 'Kaos Pelatihan Peserta', 160, 'Pcs', 85000, 13600000, 'Seragam kegiatan'],

    // Anggi Pegaf (TRN-PGF-001) - Total Rp 158.000.000
    ['bgt-pgf-01', 'TRN-PGF-001', 'cat-1', 'Sewa Kendaraan 4WD Manokwari - Anggi PP', 4, 'Unit', 8000000, 32000000, 'Mobil gardan ganda medan berat'],
    ['bgt-pgf-02', 'TRN-PGF-001', 'cat-3', 'Akomodasi Home Stay Tim Pelatih (14 Hari)', 4, 'Kamar', 6000000, 24000000, 'Penginapan Anggi'],
    ['bgt-pgf-03', 'TRN-PGF-001', 'cat-4', 'Konsumsi Makan 140 Orang x 14 Hari', 1960, 'Porsi', 38000, 74480000, 'Bahan pangan lokal & sayur segar'],
    ['bgt-pgf-04', 'TRN-PGF-001', 'cat-8', 'Modul Pelatihan GASING', 140, 'Paket', 100000, 14000000, 'Buku paket peserta'],
    ['bgt-pgf-05', 'TRN-PGF-001', 'cat-10', 'Kaos Pelatihan & Rompi Dingin', 140, 'Pcs', 95000, 13300000, 'Bahan hangat dataran tinggi'],

    // Manokwari Barat (TRN-MKW-001) - Total Rp 192.500.000
    ['bgt-mkw-01', 'TRN-MKW-001', 'cat-1', 'Tiket Pesawat Tim Trainer Jakarta - Manokwari PP', 6, 'Tiket', 6500000, 39000000, 'Garuda/Batik'],
    ['bgt-mkw-02', 'TRN-MKW-001', 'cat-3', 'Penginapan Hotel Trainer (14 Hari)', 6, 'Kamar', 9100000, 54600000, 'Hotel Aston Manokwari'],
    ['bgt-mkw-03', 'TRN-MKW-001', 'cat-4', 'Konsumsi 180 Orang x 14 Hari', 2520, 'Porsi', 35000, 88200000, 'Katering kota'],
    ['bgt-mkw-04', 'TRN-MKW-001', 'cat-8', 'Modul GASING & Alat Peraga', 180, 'Paket', 100000, 18000000, 'Modul & gasing kit'],
  ];

  sampleBudgets.forEach(b => {
    insertBudget.run(b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], b[8]);
  });

  // Seed Realizations (Realisasi Anggaran)
  const insertRealization = db.prepare(`
    INSERT INTO realizations (
      id, training_id, budget_id, transaction_date, category_id,
      description, vendor, volume, unit, unit_price, total,
      invoice_number, notes, created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const sampleRealizations = [
    // Wasior (Completed) - Realisasi Rp 140.200.000 (RAB 142.500.000 => Under Budget Rp 2.300.000)
    ['rlz-twd-01', 'TRN-TWD-001', 'bgt-twd-01', '2026-03-01', 'cat-1', 'Pembelian Tiket Pesawat & Speedboat Trainer', 'PT Papua Tour & Travel', 4, 'Tiket/Orang', 7400000, 29600000, 'INV/TRV/2026/0301', 'Sesuai manifest tiket', 'Maria Magdalena, S.E.'],
    ['rlz-twd-02', 'TRN-TWD-001', 'bgt-twd-02', '2026-03-16', 'cat-3', 'Pelunasan Penginapan Hotel Wasior Indah', 'Hotel Wasior Indah', 4, 'Kamar/14 Hari', 6900000, 27600000, 'KW-089/HWI/2026', 'Diskon grup 14 hari', 'Maria Magdalena, S.E.'],
    ['rlz-twd-03', 'TRN-TWD-001', 'bgt-twd-03', '2026-03-16', 'cat-4', 'Pembayaran Katering Makan Siang Peserta & Trainer', 'CV Wondama Berkah Katering', 1680, 'Porsi', 35000, 58800000, 'INV-KT/03/2026', 'Lunas lengkap kuitansi bermaterai', 'Maria Magdalena, S.E.'],
    ['rlz-twd-04', 'TRN-TWD-001', 'bgt-twd-04', '2026-03-16', 'cat-5', 'Pembayaran Snack Pagi & Sore', 'UD Mandiri Snack Wasior', 1680, 'Kotak', 14500, 24360000, 'KW-SNK/2026/041', 'Hemat Rp 500 per kotak', 'Maria Magdalena, S.E.'],
    ['rlz-twd-05', 'TRN-TWD-001', 'bgt-twd-05', '2026-02-28', 'cat-8', 'Pengadaan Modul Berhitung GASING', 'Percetakan Surya Manokwari', 120, 'Paket', 100000, 12000000, 'INV/PRC/0228', 'Buku telah diterima lengkap', 'Maria Magdalena, S.E.'],

    // Bintuni Kota (Completed) - Realisasi Rp 173.200.000 (RAB 175.800.000)
    ['rlz-tbn-01', 'TRN-TBN-001', 'bgt-tbn-01', '2026-05-10', 'cat-1', 'Tiket Pesawat & Sewa Mobil Bintuni', 'Travel Bintuni Jaya', 5, 'Orang', 5900000, 29500000, 'INV-TBJ-2026-112', 'Lunas', 'Maria Magdalena, S.E.'],
    ['rlz-tbn-02', 'TRN-TBN-001', 'bgt-tbn-02', '2026-05-25', 'cat-3', 'Pembayaran Penginapan Hotel Bintuni', 'Grand Bintuni Hotel', 5, 'Kamar', 8300000, 41500000, 'KW-GBH-0525', 'Lunas', 'Maria Magdalena, S.E.'],
    ['rlz-tbn-03', 'TRN-TBN-001', 'bgt-tbn-03', '2026-05-25', 'cat-4', 'Konsumsi 160 Orang Peserta & Panitia', 'Catering Berkat Bintuni', 2240, 'Porsi', 35000, 78400000, 'INV-CBB-2026-05', 'Lunas', 'Maria Magdalena, S.E.'],
    ['rlz-tbn-04', 'TRN-TBN-001', 'bgt-tbn-04', '2026-05-08', 'cat-8', 'Pengadaan Modul GASING', 'Percetakan Bintuni Jaya', 160, 'Paket', 99000, 15840000, 'INV-PBJ-0508', 'Lunas', 'Maria Magdalena, S.E.'],

    // Pegaf (Ongoing) - Realisasi sebagian Rp 92.500.000
    ['rlz-pgf-01', 'TRN-PGF-001', 'bgt-pgf-01', '2026-08-17', 'cat-1', 'Sewa 4 Unit Double Cabin Manokwari-Anggi PP', 'CV Arfak Rent Car', 4, 'Unit', 8000000, 32000000, 'INV-ARC-2026-081', 'Uang jalan dan sewa mobil 4WD', 'Maria Magdalena, S.E.'],
    ['rlz-pgf-02', 'TRN-PGF-001', 'bgt-pgf-02', '2026-08-18', 'cat-3', 'Uang Muka Penginapan Home Stay Anggi', 'Home Stay Danau Anggi', 4, 'Kamar', 4000000, 16000000, 'KW-DP-0818', 'DP 66%, pelunasan saat penutupan', 'Maria Magdalena, S.E.'],
    ['rlz-pgf-03', 'TRN-PGF-001', 'bgt-pgf-04', '2026-08-16', 'cat-8', 'Pengadaan Modul GASING Pegaf', 'Percetakan Surya Manokwari', 140, 'Paket', 100000, 14000000, 'INV-PSM-0816', 'Lunas', 'Maria Magdalena, S.E.'],
  ];

  sampleRealizations.forEach(r => {
    insertRealization.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13]);
  });

  // Seed 14 LPJ Checklists (#29)
  const defaultLpjTypes = [
    'RAB',
    'Realisasi',
    'Daftar peserta',
    'Daftar hadir',
    'Kuitansi',
    'Invoice',
    'Bukti transfer',
    'Dokumentasi kegiatan',
    'Dokumentasi konsumsi',
    'Dokumentasi penginapan',
    'Dokumentasi transportasi',
    'Surat tugas',
    'Berita acara',
    'Laporan kegiatan',
  ];

  const insertLpj = db.prepare(`
    INSERT INTO lpj_checklists (id, training_id, checklist_type, is_complete, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);

  // Wasior (TRN-TWD-001): 14/14 Lengkap (100%)
  defaultLpjTypes.forEach((type, idx) => {
    insertLpj.run(`lpj-twd-${idx + 1}`, 'TRN-TWD-001', type, 1, 'Tervalidasi & Ditandatangani');
  });

  // Bintuni (TRN-TBN-001): 14/14 Lengkap (100%)
  defaultLpjTypes.forEach((type, idx) => {
    insertLpj.run(`lpj-tbn-${idx + 1}`, 'TRN-TBN-001', type, 1, 'Lengkap & Terverifikasi');
  });

  // Pegaf (TRN-PGF-001): 8/14 Lengkap (57%)
  defaultLpjTypes.forEach((type, idx) => {
    const isComp = idx < 8 ? 1 : 0;
    const notes = isComp ? 'Tersedia draft/berkas berjalan' : 'Menunggu kegiatan selesai';
    insertLpj.run(`lpj-pgf-${idx + 1}`, 'TRN-PGF-001', type, isComp, notes);
  });

  // Manokwari (TRN-MKW-001): 3/14 Lengkap (21%)
  defaultLpjTypes.forEach((type, idx) => {
    const isComp = idx < 3 ? 1 : 0;
    const notes = isComp ? 'RAB & SK Tugas tersedia' : 'Belum terlaksana';
    insertLpj.run(`lpj-mkw-${idx + 1}`, 'TRN-MKW-001', type, isComp, notes);
  });

  // Seed Documentation Photos (#30, #31)
  const insertDoc = db.prepare(`
    INSERT INTO documentation (
      id, training_id, category, file_name, file_url, caption,
      documentation_date, file_size, mime_type, uploaded_by, uploaded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const sampleDocs = [
    ['doc-01', 'TRN-TWD-001', 'Pembukaan', 'pembukaan_wasior.jpg', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80', 'Acara Pembukaan Program GASING oleh Kepala Dinas Pendidikan Wondama', '2026-03-02', 1450000, 'image/jpeg', 'Korneles Rumadas'],
    ['doc-02', 'TRN-TWD-001', 'Pelatihan', 'suasana_kelas_wasior.jpg', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80', 'Aktivitas belajar penjumlahan gembira metode GASING', '2026-03-05', 1820000, 'image/jpeg', 'Korneles Rumadas'],
    ['doc-03', 'TRN-TWD-001', 'Guru', 'guru_wasior.jpg', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80', 'Guru-guru SD se-Wasior mempraktikkan metode jari mencongak', '2026-03-08', 2100000, 'image/jpeg', 'Korneles Rumadas'],
    ['doc-04', 'TRN-TWD-001', 'Penutupan', 'penutupan_wasior.jpg', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', 'Penyerahan sertifikat kelulusan kepada perwakilan guru & siswa', '2026-03-16', 1980000, 'image/jpeg', 'Korneles Rumadas'],
    ['doc-05', 'TRN-TBN-001', 'Pelatihan', 'kelas_bintuni.jpg', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80', 'Suasana riang gembira siswa Bintuni bermain gasing berhitung', '2026-05-15', 2300000, 'image/jpeg', 'Hendrik Fimbay'],
    ['doc-06', 'TRN-PGF-001', 'Aktivitas Kelas', 'kelas_anggi_pegaf.jpg', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80', 'Pelatihan berhitung perkalian cepat di Ullong Anggi Pegaf', '2026-08-22', 1750000, 'image/jpeg', 'Yance Dowansiba'],
  ];

  sampleDocs.forEach(d => {
    insertDoc.run(d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8], d[9]);
  });

  // Seed Official Documents (Document Library #32)
  const insertDocument = db.prepare(`
    INSERT INTO documents (
      id, training_id, regency_id, district_id, document_type,
      title, file_url, file_name, file_size, mime_type,
      document_date, notes, uploaded_by, uploaded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const sampleOfficialDocs = [
    ['off-01', 'TRN-TWD-001', 'reg-wondama', 'dis-twd-01', 'LPJ', 'Laporan Pertanggungjawaban Lengkap Program GASING Wasior 2026', '/uploads/2026/reg-wondama/dis-twd-01/LPJ_Wasior_Signed.pdf', 'LPJ_Wasior_Signed.pdf', 8450000, 'application/pdf', '2026-03-20', 'Dokumen final disahkan', 'Korneles Rumadas'],
    ['off-02', 'TRN-TBN-001', 'reg-bintuni', 'dis-tbn-01', 'LPJ', 'LPJ Resmi dan Bukti Pertanggungjawaban Bintuni Kota', '/uploads/2026/reg-bintuni/dis-tbn-01/LPJ_Bintuni_Final.pdf', 'LPJ_Bintuni_Final.pdf', 9200000, 'application/pdf', '2026-06-01', 'Selesai audit inspektorat', 'Hendrik Fimbay'],
    ['off-03', 'TRN-PGF-001', 'reg-pegarfak', 'dis-pgf-01', 'Surat Tugas', 'Surat Tugas Instruktur GASING Kabupaten Pegunungan Arfak', '/uploads/2026/reg-pegarfak/dis-pgf-01/Surat_Tugas_Pegaf.pdf', 'Surat_Tugas_Pegaf.pdf', 1250000, 'application/pdf', '2026-08-10', 'SK Kepala Dinas Prov PB', 'Dinas Pendidikan Prov PB'],
    ['off-04', 'TRN-MKW-001', 'reg-mkw', 'dis-mkw-01', 'SP2D', 'Surat Perintah Pencairan Dana (SP2D) Pelatihan GASING Manokwari Barat', '/uploads/2026/reg-mkw/dis-mkw-01/SP2D_MKW_Barat.pdf', 'SP2D_MKW_Barat.pdf', 980000, 'application/pdf', '2026-08-20', 'Uang muka 50%', 'BPKAD Papua Barat'],
  ];

  sampleOfficialDocs.forEach(d => {
    insertDocument.run(d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8], d[9], d[10], d[11], d[12]);
  });

  // Seed Sample Participants (Guru & Siswa #22)
  const insertParticipant = db.prepare(`
    INSERT INTO participants (
      id, training_id, school_id, participant_type, full_name,
      gender, class_name, attendance_status, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const sampleParticipants = [
    // Wasior (TRN-TWD-001)
    ['prt-01', 'TRN-TWD-001', 'sch-04', 'guru', 'Dominggus Kereway, S.Pd.', 'L', null, 'Hadir', 'Guru Kelas 4'],
    ['prt-02', 'TRN-TWD-001', 'sch-04', 'guru', 'Maria Sayori, S.Pd.', 'P', null, 'Hadir', 'Guru Kelas 5'],
    ['prt-03', 'TRN-TWD-001', 'sch-04', 'siswa', 'Alfon Mandacan', 'L', 'Kelas 4', 'Hadir', 'Peningkatan nilai: 30 -> 95'],
    ['prt-04', 'TRN-TWD-001', 'sch-04', 'siswa', 'Nelce Torey', 'P', 'Kelas 5', 'Hadir', 'Peningkatan nilai: 40 -> 90'],
    ['prt-05', 'TRN-TWD-001', 'sch-05', 'guru', 'Yohanes Karubaba, S.Pd.', 'L', null, 'Hadir', 'Guru Matematika'],
    ['prt-06', 'TRN-TWD-001', 'sch-05', 'siswa', 'Septer Rumadas', 'L', 'Kelas 4', 'Hadir', 'Juara mencongak cepat'],

    // Anggi Pegaf (TRN-PGF-001)
    ['prt-07', 'TRN-PGF-001', 'sch-08', 'guru', 'Elias Dowansiba, S.Pd.', 'L', null, 'Hadir', 'Guru Kelas 3'],
    ['prt-08', 'TRN-PGF-001', 'sch-08', 'guru', 'Martha Ullo, S.Pd.', 'P', null, 'Hadir', 'Guru Kelas 4'],
    ['prt-09', 'TRN-PGF-001', 'sch-08', 'siswa', 'Kaleb Mandacan', 'L', 'Kelas 4', 'Hadir', 'Sangat cepat menghitung jari'],
    ['prt-10', 'TRN-PGF-001', 'sch-08', 'siswa', 'Dorkas Ahoren', 'P', 'Kelas 4', 'Hadir', 'Aktif di kelas'],
    ['prt-11', 'TRN-PGF-001', 'sch-09', 'guru', 'Stefanus Meyoma, S.Pd.', 'L', null, 'Hadir', 'Guru PJOK bantu numerasi'],
    ['prt-12', 'TRN-PGF-001', 'sch-09', 'siswa', 'Markus Sayori', 'L', 'Kelas 5', 'Hadir', 'Antusias'],

    // Manokwari (TRN-MKW-001)
    ['prt-13', 'TRN-MKW-001', 'sch-01', 'guru', 'Agustina Waror, S.Pd.', 'P', null, 'Hadir', 'Calon Trainer Inti'],
    ['prt-14', 'TRN-MKW-001', 'sch-01', 'guru', 'Karel Rumbruren, S.Pd.', 'L', null, 'Hadir', 'Koordinator Guru Gugus'],
    ['prt-15', 'TRN-MKW-001', 'sch-02', 'guru', 'Fransiska Borlak, S.Pd.', 'P', null, 'Hadir', 'Guru Kelas 3'],
    ['prt-16', 'TRN-MKW-001', 'sch-03', 'guru', 'Paulus Mansawan, S.Pd.', 'L', null, 'Hadir', 'Guru Kelas 4'],
  ];

  sampleParticipants.forEach(p => {
    insertParticipant.run(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8]);
  });

  // Seed Notifications (#33, #34)
  const insertNotif = db.prepare(`
    INSERT INTO notifications (
      id, user_id, training_id, type, title, message, severity, is_read, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const sampleNotifs = [
    ['notif-01', 'usr-admin-01', 'TRN-MKW-001', 'Jadwal', 'Kegiatan Manokwari Barat akan dimulai dalam 11 hari', 'Pelatihan dijadwalkan mulai 07 September 2026 di Gedung PKK Provinsi. Pastikan modul dan akomodasi trainer telah terkonfirmasi.', 'info', 0],
    ['notif-02', 'usr-finance-01', 'TRN-FFK-001', 'RAB', 'RAB Fakfak Kota belum diverifikasi', 'Usulan RAB untuk kegiatan Fakfak Kota masih membutuhkan verifikasi rincian transportasi laut dan katering.', 'warning', 0],
    ['notif-03', 'usr-admin-01', 'TRN-PGF-001', 'Dokumentasi', 'Update dokumentasi harian Pegunungan Arfak', 'Pelatihan Anggi hari ke-10 sedang berlangsung. Unggah dokumentasi materi pembagian untuk pemantauan pimpinan.', 'info', 0],
    ['notif-04', 'usr-finance-01', 'TRN-PGF-001', 'Realisasi', 'Sisa pembayaran termin kedua Pegaf', 'Kegiatan berlangsung melewati 50% jadwal, segera siapkan pencairan termin kedua konsumsi.', 'warning', 0],
  ];

  sampleNotifs.forEach(n => {
    insertNotif.run(n[0], n[1], n[2], n[3], n[4], n[5], n[6], n[7]);
  });

  // Seed System Settings (#84)
  const insertSetting = db.prepare(`INSERT INTO system_settings (id, key, value) VALUES (?, ?, ?)`);
  insertSetting.run('set-1', 'system_name', 'Papua Barat Monitoring System');
  insertSetting.run('set-2', 'program_name', 'Program Pandai Berhitung dengan Metode GASING');
  insertSetting.run('set-3', 'institution_name', 'Dinas Pendidikan Provinsi Papua Barat');
  insertSetting.run('set-4', 'logo_url', '/assets/logo-papua-barat.png');
  insertSetting.run('set-5', 'province_name', 'Papua Barat');
  insertSetting.run('set-6', 'report_signatory_name', 'Barnabas Dowansiba, S.Pd., M.Pd.');
  insertSetting.run('set-7', 'report_signatory_title', 'Kepala Dinas Pendidikan Provinsi Papua Barat');
  insertSetting.run('set-8', 'report_footer', 'Papua Barat Monitoring System - GASING 2026 | Dokumen Resmi Pemerintah Provinsi Papua Barat');
  insertSetting.run('set-9', 'reminders_enabled', 'true');

  // Seed Initial Audit Log (#45)
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, action, module, record_id, old_values, new_values, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  insertAudit.run('aud-01', 'usr-admin-01', 'Dr. Yan Pieterson', 'Create', 'Kegiatan', 'TRN-MKW-001', null, 'Inisiasi jadwal pelatihan Manokwari Barat');
  insertAudit.run('aud-02', 'usr-finance-01', 'Maria Magdalena Mandacan', 'Create', 'RAB', 'bgt-mkw-01', null, 'Input RAB Transportasi & Akomodasi Manokwari Barat Rp 192.500.000');
  insertAudit.run('aud-03', 'usr-admin-01', 'Dr. Yan Pieterson', 'Update', 'Kegiatan', 'TRN-PGF-001', 'Ready', 'Status diubah Ready -> Ongoing');
  insertAudit.run('aud-04', 'usr-admin-01', 'Dr. Yan Pieterson', 'Update', 'Kegiatan', 'TRN-TWD-001', 'Ongoing', 'Status diubah Ongoing -> Completed');
  insertAudit.run('aud-05', 'usr-finance-01', 'Maria Magdalena Mandacan', 'Upload', 'Dokumen', 'off-01', null, 'Upload Berkas LPJ Lengkap Wasior 100%');
}
