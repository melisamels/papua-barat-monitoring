import fs from 'node:fs';
import path from 'node:path';

import {
  UserProfile,
  Province,
  Regency,
  District,
  School,
  Training,
  Participant,
  BudgetCategory,
  Budget,
  Realization,
  LpjChecklist,
  Documentation,
  ProgramDocument,
  SystemNotification,
  AuditLog,
  SystemSettings,
  TrainingStatus,
} from '@/lib/types';

export interface DataStoreState {
  profiles: UserProfile[];
  provinces: Province[];
  regencies: Regency[];
  districts: District[];
  schools: School[];
  trainings: Training[];
  participants: Participant[];
  budgetCategories: BudgetCategory[];
  budgets: Budget[];
  realizations: Realization[];
  lpjChecklists: LpjChecklist[];
  documentation: Documentation[];
  documents: ProgramDocument[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  systemSettings: SystemSettings;
}

function getInitialState(): DataStoreState {
  const profiles: UserProfile[] = [
    {
      id: 'usr-admin-01',
      full_name: 'Melisa',
      email: 'melisa@papuabarat.go.id',
      username: 'melisa',
      password: 'admin123',
      role: 'super_admin',
      avatar_url: '/assets/avatars/admin.png',
      is_active: true,
      last_login: '2026-08-28T08:30:00+09:00',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-28T08:30:00Z',
    },
    {
      id: 'usr-finance-01',
      full_name: 'Rechi Muhammad',
      email: 'rechi@papuabarat.go.id',
      username: 'rechi',
      password: 'finance123',
      role: 'finance',
      avatar_url: '/assets/avatars/finance.png',
      is_active: true,
      last_login: '2026-08-28T09:15:00+09:00',
      created_at: '2026-01-05T00:00:00Z',
      updated_at: '2026-08-28T09:15:00Z',
    },
    {
      id: 'usr-viewer-01',
      full_name: 'Viewer',
      email: 'viewer@papuabarat.go.id',
      username: 'viewer',
      password: 'viewer123',
      role: 'viewer',
      avatar_url: '/assets/avatars/viewer.png',
      is_active: true,
      last_login: '2026-08-28T07:20:00+09:00',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-08-28T07:20:00Z',
    },
  ];

  const provinces: Province[] = [
    { id: 'prov-pb', name: 'Papua Barat', code: 'PB' },
  ];

  const regencies: Regency[] = [
    { id: 'reg-mkw', province_id: 'prov-pb', name: 'Manokwari', code: 'MKW', latitude: -0.8615, longitude: 134.0620, notes: 'Ibukota Provinsi Papua Barat, pusat koordinasi wilayah utara' },
    { id: 'reg-mansel', province_id: 'prov-pb', name: 'Manokwari Selatan', code: 'MSL', latitude: -1.3323, longitude: 134.1205, notes: 'Wilayah pesisir Ransiki dan dataran pertanian' },
    { id: 'reg-pegarfak', province_id: 'prov-pb', name: 'Pegunungan Arfak', code: 'PGF', latitude: -1.3853, longitude: 133.8785, notes: 'Kawasan pegunungan dengan tantangan akses dan logistik' },
    { id: 'reg-bintuni', province_id: 'prov-pb', name: 'Teluk Bintuni', code: 'TBN', latitude: -2.1287, longitude: 133.5186, notes: 'Kawasan pesisir dan industri dengan sebaran distrik terluas' },
    { id: 'reg-wondama', province_id: 'prov-pb', name: 'Teluk Wondama', code: 'TWD', latitude: -2.7145, longitude: 134.4983, notes: 'Wilayah kepulauan dan pesisir Wasior' },
    { id: 'reg-fakfak', province_id: 'prov-pb', name: 'Fakfak', code: 'FFK', latitude: -2.9264, longitude: 132.2965, notes: 'Kota pala bersejarah di jazirah selatan Papua Barat' },
    { id: 'reg-kaimana', province_id: 'prov-pb', name: 'Kaimana', code: 'KMN', latitude: -3.6598, longitude: 133.7712, notes: 'Kota senja indah di pesisir selatan Papua Barat' },
  ];

  const budgetCategories: BudgetCategory[] = [
    { id: 'cat-1', name: 'Transportasi', is_active: true },
    { id: 'cat-2', name: 'Tiket', is_active: true },
    { id: 'cat-3', name: 'Penginapan', is_active: true },
    { id: 'cat-4', name: 'Konsumsi', is_active: true },
    { id: 'cat-5', name: 'Snack', is_active: true },
    { id: 'cat-6', name: 'Honor', is_active: true },
    { id: 'cat-7', name: 'Trainer', is_active: true },
    { id: 'cat-8', name: 'Modul', is_active: true },
    { id: 'cat-9', name: 'ATK', is_active: true },
    { id: 'cat-10', name: 'Kaos', is_active: true },
    { id: 'cat-11', name: 'Perlengkapan', is_active: true },
    { id: 'cat-12', name: 'Venue', is_active: true },
    { id: 'cat-13', name: 'Dokumentasi', is_active: true },
    { id: 'cat-14', name: 'Transport Lokal', is_active: true },
    { id: 'cat-15', name: 'Operasional', is_active: true },
    { id: 'cat-16', name: 'Lain-lain', is_active: true },
  ];

  const districts: District[] = [
    { id: 'dis-twd-01', regency_id: 'reg-wondama', name: 'Wasior', code: 'WSR', coordinator: 'Korneles Rumadas, S.Pd.', target_teachers: 30, target_students: 90, status: 'Completed', notes: 'Distrik utama kepulauan Wondama' },
    { id: 'dis-twd-02', regency_id: 'reg-wondama', name: 'Rasiei', code: 'RSI', coordinator: 'Markus Torey, S.Pd.', target_teachers: 25, target_students: 75, status: 'Completed', notes: 'Wilayah pesisir timur' },
    { id: 'dis-twd-03', regency_id: 'reg-wondama', name: 'Wamesa', code: 'WMS', coordinator: 'Yohana Kereway, S.Pd.', target_teachers: 20, target_students: 60, status: 'Completed', notes: 'Akses transportasi laut' },

    { id: 'dis-tbn-01', regency_id: 'reg-bintuni', name: 'Bintuni Kota', code: 'BTK', coordinator: 'Hendrik Fimbay, M.Pd.', target_teachers: 40, target_students: 120, status: 'Completed', notes: 'Pusat pemerintahan Bintuni' },
    { id: 'dis-tbn-02', regency_id: 'reg-bintuni', name: 'Manimeri', code: 'MNM', coordinator: 'Sarah Iba, S.Pd.', target_teachers: 30, target_students: 90, status: 'Completed', notes: 'Kawasan penyangga kota' },
    { id: 'dis-tbn-03', regency_id: 'reg-bintuni', name: 'Babo', code: 'BBO', coordinator: 'Agustinus Orocomna, S.Pd.', target_teachers: 25, target_students: 75, status: 'Completed', notes: 'Pesisir teluk' },

    { id: 'dis-pgf-01', regency_id: 'reg-pegarfak', name: 'Anggi', code: 'ANG', coordinator: 'Yance Dowansiba, S.Pd.', target_teachers: 35, target_students: 105, status: 'Ongoing', notes: 'Ibukota Pegaf dekat danau Anggi' },
    { id: 'dis-pgf-02', regency_id: 'reg-pegarfak', name: 'Anggi Gida', code: 'AGD', coordinator: 'Petrus Sayori, S.Pd.', target_teachers: 25, target_students: 75, status: 'Ongoing', notes: 'Wilayah danau Anggi Gida' },
    { id: 'dis-pgf-03', regency_id: 'reg-pegarfak', name: 'Meyambouw', code: 'MYB', coordinator: 'Lukas Mandacan, S.Pd.', target_teachers: 20, target_students: 60, status: 'Ongoing', notes: 'Dataran tinggi lembah Arfak' },

    { id: 'dis-mkw-01', regency_id: 'reg-mkw', name: 'Manokwari Barat', code: 'MWB', coordinator: 'Drs. Piter Rumbruren', target_teachers: 45, target_students: 135, status: 'Ready', notes: 'Pusat kota Manokwari' },
    { id: 'dis-mkw-02', regency_id: 'reg-mkw', name: 'Manokwari Timur', code: 'MWT', coordinator: 'Ester Mansawan, S.Pd.', target_teachers: 35, target_students: 105, status: 'Ready', notes: 'Kawasan pesisir Pasir Putih' },
    { id: 'dis-mkw-03', regency_id: 'reg-mkw', name: 'Manokwari Selatan Distrik', code: 'MWS', coordinator: 'Daniel Wonggor, S.Pd.', target_teachers: 30, target_students: 90, status: 'Ready', notes: 'Kawasan Sanggeng dan Maruni' },
    { id: 'dis-mkw-04', regency_id: 'reg-mkw', name: 'Warmare', code: 'WRM', coordinator: 'Yulianus Meidodga, S.Pd.', target_teachers: 25, target_students: 75, status: 'Ready', notes: 'Kawasan agraris dataran Warmare' },

    { id: 'dis-msl-01', regency_id: 'reg-mansel', name: 'Ransiki', code: 'RSK', coordinator: 'Semuel Inden, S.Pd.', target_teachers: 35, target_students: 105, status: 'Ready', notes: 'Ibukota Manokwari Selatan' },
    { id: 'dis-msl-02', regency_id: 'reg-mansel', name: 'Oransbari', code: 'ORB', coordinator: 'Mariana Waror, S.Pd.', target_teachers: 30, target_students: 90, status: 'Ready', notes: 'Wilayah persawahan dan transmigrasi' },
    { id: 'dis-msl-03', regency_id: 'reg-mansel', name: 'Neney', code: 'NNY', coordinator: 'Kaleb Ahoren, S.Pd.', target_teachers: 20, target_students: 60, status: 'Ready', notes: 'Wilayah pedalaman' },

    { id: 'dis-ffk-01', regency_id: 'reg-fakfak', name: 'Fakfak Kota', code: 'FFC', coordinator: 'Hasanudin Uswanas, M.Pd.', target_teachers: 40, target_students: 120, status: 'Planning', notes: 'Pusat kota Fakfak' },
    { id: 'dis-ffk-02', regency_id: 'reg-fakfak', name: 'Pariwari', code: 'PRW', coordinator: 'Siti Rohani Patiran, S.Pd.', target_teachers: 30, target_students: 90, status: 'Planning', notes: 'Wilayah pesisir perbukitan' },
    { id: 'dis-ffk-03', regency_id: 'reg-fakfak', name: 'Kokas', code: 'KKS', coordinator: 'Abdul Rahman Kramandondo, S.Pd.', target_teachers: 25, target_students: 75, status: 'Planning', notes: 'Kawasan teluk bersejarah' },
    { id: 'dis-ffk-04', regency_id: 'reg-fakfak', name: 'Karas', code: 'KRS', coordinator: 'Ibrahim Weripang, S.Pd.', target_teachers: 20, target_students: 60, status: 'Planning', notes: 'Wilayah kepulauan selatan' },

    { id: 'dis-kmn-01', regency_id: 'reg-kaimana', name: 'Kaimana Kota', code: 'KMC', coordinator: 'Fransiskus Werfete, M.Pd.', target_teachers: 35, target_students: 105, status: 'Planning', notes: 'Pusat ibukota senja Kaimana' },
    { id: 'dis-kmn-02', regency_id: 'reg-kaimana', name: 'Teluk Etna', code: 'ETN', coordinator: 'Martha Brawery, S.Pd.', target_teachers: 25, target_students: 75, status: 'Planning', notes: 'Wilayah teluk Etna' },
    { id: 'dis-kmn-03', regency_id: 'reg-kaimana', name: 'Buruway', code: 'BRW', coordinator: 'Dominikus Omba, S.Pd.', target_teachers: 20, target_students: 60, status: 'Planning', notes: 'Wilayah pesisir Buruway' },
  ];

  const schools: School[] = [
    { id: 'sch-01', regency_id: 'reg-mkw', district_id: 'dis-mkw-01', name: 'SD Negeri 01 Manokwari', school_level: 'SD', address: 'Jl. Percetakan Negara No. 12', principal: 'Yohanes Mandacan, S.Pd.', teacher_participants: 15, student_participants: 45, latitude: -0.8620, longitude: 134.0630, notes: 'Sekolah rujukan kota' },
    { id: 'sch-02', regency_id: 'reg-mkw', district_id: 'dis-mkw-01', name: 'SD YPPK Santa Monika Manokwari', school_level: 'SD', address: 'Jl. Brawijaya No. 8', principal: 'Sr. Theresia, PBHK', teacher_participants: 15, student_participants: 45, latitude: -0.8645, longitude: 134.0670, notes: 'Sekolah yayasan katolik terakreditasi A' },
    { id: 'sch-03', regency_id: 'reg-mkw', district_id: 'dis-mkw-01', name: 'SD YPK 02 Manokwari', school_level: 'SD', address: 'Jl. Merdeka No. 4', principal: 'Ebenheizer Rumadas, S.Pd.', teacher_participants: 15, student_participants: 45, latitude: -0.8590, longitude: 134.0610, notes: 'Sekolah yayasan kristen tertua' },
    { id: 'sch-04', regency_id: 'reg-wondama', district_id: 'dis-twd-01', name: 'SD Inpres Wasior 01', school_level: 'SD', address: 'Jl. Raya Wasior I', principal: 'Paulus Manupapami, S.Pd.', teacher_participants: 15, student_participants: 45, latitude: -2.7150, longitude: 134.4990, notes: 'Lokasi utama pelatihan batch 1' },
    { id: 'sch-05', regency_id: 'reg-wondama', district_id: 'dis-twd-01', name: 'SD Negeri Wasior II', school_level: 'SD', address: 'Jl. Dotir Wasior', principal: 'Damaris Karubaba, S.Pd.', teacher_participants: 15, student_participants: 45, latitude: -2.7180, longitude: 134.5010, notes: 'Partisipasi penuh' },
    { id: 'sch-06', regency_id: 'reg-bintuni', district_id: 'dis-tbn-01', name: 'SD Inpres Bintuni Kota', school_level: 'SD', address: 'Jl. Kali Kodok No. 5', principal: 'Soleman Bauw, S.Pd.', teacher_participants: 20, student_participants: 60, latitude: -2.1300, longitude: 133.5200, notes: 'Pusat pelatihan Gasing Bintuni' },
    { id: 'sch-07', regency_id: 'reg-bintuni', district_id: 'dis-tbn-01', name: 'SD Negeri 02 Bintuni', school_level: 'SD', address: 'Jl. Raya Bumi Sani', principal: 'Nurul Hidayati, M.Pd.', teacher_participants: 20, student_participants: 60, latitude: -2.1260, longitude: 133.5150, notes: 'Peserta antusias' },
    { id: 'sch-08', regency_id: 'reg-pegarfak', district_id: 'dis-pgf-01', name: 'SD Negeri 01 Anggi', school_level: 'SD', address: 'Jl. Danau Anggi No. 3', principal: 'Mois Mandacan, S.Pd.', teacher_participants: 20, student_participants: 60, latitude: -1.3860, longitude: 133.8800, notes: 'Sedang berlangsung pelatihan kelas 4-6' },
    { id: 'sch-09', regency_id: 'reg-pegarfak', district_id: 'dis-pgf-01', name: 'SD Inpres Ullong', school_level: 'SD', address: 'Kampung Ullong Anggi', principal: 'Yakobus Dowansiba, S.Pd.', teacher_participants: 15, student_participants: 45, latitude: -1.3820, longitude: 133.8750, notes: 'Akses jalan setapak menuju venue' },
    { id: 'sch-10', regency_id: 'reg-mansel', district_id: 'dis-msl-01', name: 'SD Negeri 01 Ransiki', school_level: 'SD', address: 'Jl. Pertanian Ransiki', principal: 'Bastian Meidodga, S.Pd.', teacher_participants: 20, student_participants: 60, latitude: -1.3340, longitude: 134.1220, notes: 'Persiapan venue siap' },
    { id: 'sch-11', regency_id: 'reg-fakfak', district_id: 'dis-ffk-01', name: 'SD Negeri 01 Fakfak', school_level: 'SD', address: 'Jl. Mayjen DI Panjaitan', principal: 'Dra. Halimah Hindom', teacher_participants: 20, student_participants: 60, latitude: -2.9270, longitude: 132.2980, notes: 'Tahap perencanaan koordinasi komite' },
    { id: 'sch-12', regency_id: 'reg-kaimana', district_id: 'dis-kmn-01', name: 'SD Inpres Kaimana Kota', school_level: 'SD', address: 'Jl. Utarum No. 15', principal: 'Karel Werfete, S.Pd.', teacher_participants: 20, student_participants: 60, latitude: -3.6610, longitude: 133.7730, notes: 'Tahap perencanaan pembentukan panitia' },
  ];

  const trainings: Training[] = [
    {
      id: 'TRN-TWD-001',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-wondama',
      district_id: 'dis-twd-01',
      venue: 'Aula Dinas Pendidikan Teluk Wondama',
      location: 'Wasior',
      start_date: '2026-03-02',
      end_date: '2026-03-16',
      pic: 'Korneles Rumadas, S.Pd.',
      target_teachers: 30,
      actual_teachers: 30,
      target_students: 90,
      actual_students: 90,
      status: 'Completed',
      notes: 'Pelatihan berhasil 100%. Peningkatan nilai berhitung numerasi dasar siswa dari rerata 32 menjadi 88.',
      created_at: '2026-02-15 08:00:00',
      updated_at: '2026-03-20 15:00:00',
    },
    {
      id: 'TRN-TWD-002',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-wondama',
      district_id: 'dis-twd-02',
      venue: 'Gedung Serbaguna Rasiei',
      location: 'Rasiei',
      start_date: '2026-04-06',
      end_date: '2026-04-20',
      pic: 'Markus Torey, S.Pd.',
      target_teachers: 25,
      actual_teachers: 25,
      target_students: 75,
      actual_students: 75,
      status: 'Completed',
      notes: 'Selesai dengan hasil memuaskan, seluruh guru dan siswa tuntas materi penjumlahan, perkalian, dan pembagian cepat.',
      created_at: '2026-03-10 08:00:00',
      updated_at: '2026-04-25 14:00:00',
    },
    {
      id: 'TRN-TWD-003',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-wondama',
      district_id: 'dis-twd-03',
      venue: 'Aula SMP Negeri Wamesa',
      location: 'Wamesa',
      start_date: '2026-05-04',
      end_date: '2026-05-18',
      pic: 'Yohana Kereway, S.Pd.',
      target_teachers: 20,
      actual_teachers: 20,
      target_students: 60,
      actual_students: 60,
      status: 'Completed',
      notes: 'Tuntas 100%, seluruh dokumen LPJ telah disahkan.',
      created_at: '2026-04-12 09:00:00',
      updated_at: '2026-05-22 16:00:00',
    },
    {
      id: 'TRN-TBN-001',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-bintuni',
      district_id: 'dis-tbn-01',
      venue: 'Gedung Sasana Karya Bintuni',
      location: 'Bintuni Kota',
      start_date: '2026-05-11',
      end_date: '2026-05-25',
      pic: 'Hendrik Fimbay, M.Pd.',
      target_teachers: 40,
      actual_teachers: 40,
      target_students: 120,
      actual_students: 120,
      status: 'Completed',
      notes: 'Peserta sangat antusias, dihadiri oleh Wakil Bupati saat penutupan.',
      created_at: '2026-04-20 08:00:00',
      updated_at: '2026-06-01 10:00:00',
    },
    {
      id: 'TRN-TBN-002',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-bintuni',
      district_id: 'dis-tbn-02',
      venue: 'Aula Balai Latihan Kerja Manimeri',
      location: 'Manimeri',
      start_date: '2026-06-08',
      end_date: '2026-06-22',
      pic: 'Sarah Iba, S.Pd.',
      target_teachers: 30,
      actual_teachers: 30,
      target_students: 90,
      actual_students: 90,
      status: 'Completed',
      notes: 'Tuntas sesuai jadwal dengan kelengkapan LPJ 100%.',
      created_at: '2026-05-15 08:00:00',
      updated_at: '2026-06-28 11:00:00',
    },
    {
      id: 'TRN-TBN-003',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-bintuni',
      district_id: 'dis-tbn-03',
      venue: 'Aula Distrik Babo',
      location: 'Babo',
      start_date: '2026-07-06',
      end_date: '2026-07-20',
      pic: 'Agustinus Orocomna, S.Pd.',
      target_teachers: 25,
      actual_teachers: 25,
      target_students: 75,
      actual_students: 75,
      status: 'Completed',
      notes: 'Tuntas dengan realisasi anggaran sesuai target RAB.',
      created_at: '2026-06-10 09:00:00',
      updated_at: '2026-07-25 15:00:00',
    },
    {
      id: 'TRN-PGF-001',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-pegarfak',
      district_id: 'dis-pgf-01',
      venue: 'Aula Pemda Pegunungan Arfak',
      location: 'Ullong, Anggi',
      start_date: '2026-08-18',
      end_date: '2026-09-01',
      pic: 'Yance Dowansiba, S.Pd.',
      target_teachers: 35,
      actual_teachers: 34,
      target_students: 105,
      actual_students: 102,
      status: 'Ongoing',
      notes: 'Pelatihan hari ke-10, siswa telah menguasai konsep perkalian 1 digit dan 2 digit.',
      created_at: '2026-07-20 08:00:00',
      updated_at: '2026-08-27 10:00:00',
    },
    {
      id: 'TRN-PGF-002',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-pegarfak',
      district_id: 'dis-pgf-02',
      venue: 'Gedung Pertemuan Anggi Gida',
      location: 'Anggi Gida',
      start_date: '2026-08-20',
      end_date: '2026-09-03',
      pic: 'Petrus Sayori, S.Pd.',
      target_teachers: 25,
      actual_teachers: 25,
      target_students: 75,
      actual_students: 72,
      status: 'Ongoing',
      notes: 'Pelatihan berjalan kondusif, cuaca dingin tidak menyurutkan semangat anak-anak.',
      created_at: '2026-07-25 08:00:00',
      updated_at: '2026-08-27 10:00:00',
    },
    {
      id: 'TRN-PGF-003',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-pegarfak',
      district_id: 'dis-pgf-03',
      venue: 'Aula Kantor Distrik Meyambouw',
      location: 'Meyambouw',
      start_date: '2026-08-22',
      end_date: '2026-09-05',
      pic: 'Lukas Mandacan, S.Pd.',
      target_teachers: 20,
      actual_teachers: 20,
      target_students: 60,
      actual_students: 58,
      status: 'Ongoing',
      notes: 'Pelatihan sedang memasuki materi pembagian mencongak.',
      created_at: '2026-08-01 08:00:00',
      updated_at: '2026-08-27 10:00:00',
    },
    {
      id: 'TRN-MKW-001',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-mkw',
      district_id: 'dis-mkw-01',
      venue: 'Gedung PKK Provinsi Papua Barat',
      location: 'Manokwari Barat',
      start_date: '2026-09-07',
      end_date: '2026-09-21',
      pic: 'Drs. Piter Rumbruren',
      target_teachers: 45,
      actual_teachers: 0,
      target_students: 135,
      actual_students: 0,
      status: 'Ready',
      notes: 'Venue dan akomodasi trainer sudah dikonfirmasi. Undangan peserta telah disebarkan.',
      created_at: '2026-08-10 08:00:00',
      updated_at: '2026-08-26 16:00:00',
    },
    {
      id: 'TRN-MKW-002',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-mkw',
      district_id: 'dis-mkw-02',
      venue: 'Aula SMK Negeri 2 Manokwari',
      location: 'Manokwari Timur',
      start_date: '2026-09-14',
      end_date: '2026-09-28',
      pic: 'Ester Mansawan, S.Pd.',
      target_teachers: 35,
      actual_teachers: 0,
      target_students: 105,
      actual_students: 0,
      status: 'Ready',
      notes: 'Kesiapan modul dan konsumsi telah selesai ditender.',
      created_at: '2026-08-12 09:00:00',
      updated_at: '2026-08-26 17:00:00',
    },
    {
      id: 'TRN-MKW-003',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-mkw',
      district_id: 'dis-mkw-03',
      venue: 'Aula Balai Diklat Keagamaan',
      location: 'Sanggeng, Manokwari',
      start_date: '2026-09-21',
      end_date: '2026-10-05',
      pic: 'Daniel Wonggor, S.Pd.',
      target_teachers: 30,
      actual_teachers: 0,
      target_students: 90,
      actual_students: 0,
      status: 'Ready',
      notes: 'SK penetapan panitia lokal telah terbit.',
      created_at: '2026-08-15 08:00:00',
      updated_at: '2026-08-26 17:00:00',
    },
    {
      id: 'TRN-MKW-004',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-mkw',
      district_id: 'dis-mkw-04',
      venue: 'Aula Kantor Distrik Warmare',
      location: 'Warmare',
      start_date: '2026-09-28',
      end_date: '2026-10-12',
      pic: 'Yulianus Meidodga, S.Pd.',
      target_teachers: 25,
      actual_teachers: 0,
      target_students: 75,
      actual_students: 0,
      status: 'Ready',
      notes: 'Koordinasi dengan kepala kampung dan tokoh adat telah tuntas.',
      created_at: '2026-08-18 09:00:00',
      updated_at: '2026-08-26 17:00:00',
    },
    {
      id: 'TRN-MSL-001',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-mansel',
      district_id: 'dis-msl-01',
      venue: 'Gedung Pertemuan Ransiki',
      location: 'Ransiki',
      start_date: '2026-09-08',
      end_date: '2026-09-22',
      pic: 'Semuel Inden, S.Pd.',
      target_teachers: 35,
      actual_teachers: 0,
      target_students: 105,
      actual_students: 0,
      status: 'Ready',
      notes: 'RAB telah disetujui dinas, SP2D uang muka telah cair.',
      created_at: '2026-08-10 08:00:00',
      updated_at: '2026-08-26 14:00:00',
    },
    {
      id: 'TRN-MSL-002',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-mansel',
      district_id: 'dis-msl-02',
      venue: 'Aula Balai Desa Oransbari',
      location: 'Oransbari',
      start_date: '2026-09-15',
      end_date: '2026-09-29',
      pic: 'Mariana Waror, S.Pd.',
      target_teachers: 30,
      actual_teachers: 0,
      target_students: 90,
      actual_students: 0,
      status: 'Ready',
      notes: 'Kesiapan akomodasi penginapan guru dari kampung pesisir telah diatur.',
      created_at: '2026-08-12 09:00:00',
      updated_at: '2026-08-26 15:00:00',
    },
    {
      id: 'TRN-MSL-003',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-mansel',
      district_id: 'dis-msl-03',
      venue: 'Aula Distrik Neney',
      location: 'Neney',
      start_date: '2026-09-22',
      end_date: '2026-10-06',
      pic: 'Kaleb Ahoren, S.Pd.',
      target_teachers: 20,
      actual_teachers: 0,
      target_students: 60,
      actual_students: 0,
      status: 'Ready',
      notes: 'Persiapan pengangkutan modul dan ATK.',
      created_at: '2026-08-15 08:00:00',
      updated_at: '2026-08-26 16:00:00',
    },
    {
      id: 'TRN-FFK-001',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-fakfak',
      district_id: 'dis-ffk-01',
      venue: 'Gedung KONI Fakfak',
      location: 'Fakfak Kota',
      start_date: '2026-10-05',
      end_date: '2026-10-19',
      pic: 'Hasanudin Uswanas, M.Pd.',
      target_teachers: 40,
      actual_teachers: 0,
      target_students: 120,
      actual_students: 0,
      status: 'Planning',
      notes: 'Menunggu finalisasi verifikasi RAB oleh tim keuangan provinsi.',
      created_at: '2026-08-15 08:00:00',
      updated_at: '2026-08-26 16:00:00',
    },
    {
      id: 'TRN-FFK-002',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-fakfak',
      district_id: 'dis-ffk-02',
      venue: 'Aula SMP Negeri 1 Pariwari',
      location: 'Pariwari',
      start_date: '2026-10-12',
      end_date: '2026-10-26',
      pic: 'Siti Rohani Patiran, S.Pd.',
      target_teachers: 30,
      actual_teachers: 0,
      target_students: 90,
      actual_students: 0,
      status: 'Planning',
      notes: 'Daftar nominatif sekolah dan guru peserta sedang diverifikasi.',
      created_at: '2026-08-16 09:00:00',
      updated_at: '2026-08-26 16:00:00',
    },
    {
      id: 'TRN-FFK-003',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-fakfak',
      district_id: 'dis-ffk-03',
      venue: 'Aula Pelabuhan Kokas',
      location: 'Kokas',
      start_date: '2026-10-19',
      end_date: '2026-11-02',
      pic: 'Abdul Rahman Kramandondo, S.Pd.',
      target_teachers: 25,
      actual_teachers: 0,
      target_students: 75,
      actual_students: 0,
      status: 'Planning',
      notes: 'Perencanaan logistik bahan dan konsumsi lokal.',
      created_at: '2026-08-18 08:00:00',
      updated_at: '2026-08-26 16:00:00',
    },
    {
      id: 'TRN-FFK-004',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-fakfak',
      district_id: 'dis-ffk-04',
      venue: 'Gedung Balai Warga Karas',
      location: 'Karas',
      start_date: '2026-10-26',
      end_date: '2026-11-09',
      pic: 'Ibrahim Weripang, S.Pd.',
      target_teachers: 20,
      actual_teachers: 0,
      target_students: 60,
      actual_students: 0,
      status: 'Planning',
      notes: 'Akses transportasi laut masih dalam penjadwalan.',
      created_at: '2026-08-20 09:00:00',
      updated_at: '2026-08-26 16:00:00',
    },
    {
      id: 'TRN-KMN-001',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-kaimana',
      district_id: 'dis-kmn-01',
      venue: 'Gedung Pertemuan Krooy',
      location: 'Kaimana Kota',
      start_date: '2026-11-02',
      end_date: '2026-11-16',
      pic: 'Fransiskus Werfete, M.Pd.',
      target_teachers: 35,
      actual_teachers: 0,
      target_students: 105,
      actual_students: 0,
      status: 'Planning',
      notes: 'Tahap penyiapan SK panitia daerah dan koordinasi dengan Dinas Pendidikan Kaimana.',
      created_at: '2026-08-15 08:00:00',
      updated_at: '2026-08-26 16:00:00',
    },
    {
      id: 'TRN-KMN-002',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-kaimana',
      district_id: 'dis-kmn-02',
      venue: 'Aula Distrik Teluk Etna',
      location: 'Teluk Etna',
      start_date: '2026-11-09',
      end_date: '2026-11-23',
      pic: 'Martha Brawery, S.Pd.',
      target_teachers: 25,
      actual_teachers: 0,
      target_students: 75,
      actual_students: 0,
      status: 'Planning',
      notes: 'Pendataan murid dan guru sasaran jenjang SD.',
      created_at: '2026-08-18 09:00:00',
      updated_at: '2026-08-26 16:00:00',
    },
    {
      id: 'TRN-KMN-003',
      program_name: 'Program Pandai Berhitung dengan Metode GASING',
      regency_id: 'reg-kaimana',
      district_id: 'dis-kmn-03',
      venue: 'Balai Pertemuan Buruway',
      location: 'Buruway',
      start_date: '2026-11-16',
      end_date: '2026-11-30',
      pic: 'Dominikus Omba, S.Pd.',
      target_teachers: 20,
      actual_teachers: 0,
      target_students: 60,
      actual_students: 0,
      status: 'Planning',
      notes: 'Penetapan jadwal pelatihan menunggu persetujuan dinas.',
      created_at: '2026-08-20 08:00:00',
      updated_at: '2026-08-26 16:00:00',
    },
  ];

  const budgets: Budget[] = [
    { id: 'bgt-twd-01', training_id: 'TRN-TWD-001', fiscal_year: 2026, category_id: 'cat-1', category_name: 'Transportasi', description: 'Transportasi Tim Trainer Jakarta - Wasior PP', volume: 4, unit: 'Tiket/Orang', unit_price: 7500000, total: 30000000, notes: 'Pesawat + Speedboat', created_at: '2026-02-15 08:00:00' },
    { id: 'bgt-twd-02', training_id: 'TRN-TWD-001', fiscal_year: 2026, category_id: 'cat-3', category_name: 'Penginapan', description: 'Akomodasi Penginapan Trainer & Panitia (14 Hari)', volume: 4, unit: 'Kamar/14 Hari', unit_price: 7000000, total: 28000000, notes: 'Hotel Wasior Indah', created_at: '2026-02-15 08:00:00' },
    { id: 'bgt-twd-03', training_id: 'TRN-TWD-001', fiscal_year: 2026, category_id: 'cat-4', category_name: 'Konsumsi', description: 'Konsumsi Makan Siang Peserta & Trainer (120 Orang x 14 Hari)', volume: 1680, unit: 'Porsi', unit_price: 35000, total: 58800000, notes: 'Katering lokal', created_at: '2026-02-15 08:00:00' },
    { id: 'bgt-twd-04', training_id: 'TRN-TWD-001', fiscal_year: 2026, category_id: 'cat-5', category_name: 'Snack', description: 'Snack Pagi & Sore (120 Orang x 14 Hari)', volume: 1680, unit: 'Kotak', unit_price: 15000, total: 25200000, notes: 'Kue tradisional & teh/kopi', created_at: '2026-02-15 08:00:00' },
    { id: 'bgt-twd-05', training_id: 'TRN-TWD-001', fiscal_year: 2026, category_id: 'cat-8', category_name: 'Modul', description: 'Modul Pandai Berhitung GASING & Buku Latihan', volume: 120, unit: 'Paket', unit_price: 100000, total: 12000000, notes: 'Buku panduan cetak warna', created_at: '2026-02-15 08:00:00' },
    { id: 'bgt-twd-06', training_id: 'TRN-TWD-001', fiscal_year: 2026, category_id: 'cat-9', category_name: 'ATK', description: 'ATK, Spidol, Papan Tulis, & Penghapus', volume: 1, unit: 'Paket Kegiatan', unit_price: 4500000, total: 4500000, notes: 'Perlengkapan kelas', created_at: '2026-02-15 08:00:00' },
    { id: 'bgt-twd-07', training_id: 'TRN-TWD-001', fiscal_year: 2026, category_id: 'cat-10', category_name: 'Kaos', description: 'Kaos Seragam Pelatihan GASING Guru & Siswa', volume: 120, unit: 'Pcs', unit_price: 85000, total: 10200000, notes: 'Bahan katun adem', created_at: '2026-02-15 08:00:00' },

    { id: 'bgt-tbn-01', training_id: 'TRN-TBN-001', fiscal_year: 2026, category_id: 'cat-1', category_name: 'Transportasi', description: 'Transportasi Darat & Udara Tim Trainer', volume: 5, unit: 'Orang', unit_price: 6000000, total: 30000000, notes: 'Tiket PP', created_at: '2026-04-20 08:00:00' },
    { id: 'bgt-tbn-02', training_id: 'TRN-TBN-001', fiscal_year: 2026, category_id: 'cat-3', category_name: 'Penginapan', description: 'Penginapan Trainer di Bintuni (14 Hari)', volume: 5, unit: 'Kamar', unit_price: 8400000, total: 42000000, notes: 'Hotel Bintuni', created_at: '2026-04-20 08:00:00' },
    { id: 'bgt-tbn-03', training_id: 'TRN-TBN-001', fiscal_year: 2026, category_id: 'cat-4', category_name: 'Konsumsi', description: 'Konsumsi Peserta 160 Orang x 14 Hari', volume: 2240, unit: 'Porsi', unit_price: 35000, total: 78400000, notes: 'Katering', created_at: '2026-04-20 08:00:00' },
    { id: 'bgt-tbn-04', training_id: 'TRN-TBN-001', fiscal_year: 2026, category_id: 'cat-8', category_name: 'Modul', description: 'Modul & Buku Kerja GASING', volume: 160, unit: 'Paket', unit_price: 100000, total: 16000000, notes: 'Cetak buku lengkap', created_at: '2026-04-20 08:00:00' },
    { id: 'bgt-tbn-05', training_id: 'TRN-TBN-001', fiscal_year: 2026, category_id: 'cat-10', category_name: 'Kaos', description: 'Kaos Pelatihan Peserta', volume: 160, unit: 'Pcs', unit_price: 85000, total: 13600000, notes: 'Seragam kegiatan', created_at: '2026-04-20 08:00:00' },

    { id: 'bgt-pgf-01', training_id: 'TRN-PGF-001', fiscal_year: 2026, category_id: 'cat-1', category_name: 'Transportasi', description: 'Sewa Kendaraan 4WD Manokwari - Anggi PP', volume: 4, unit: 'Unit', unit_price: 8000000, total: 32000000, notes: 'Mobil gardan ganda medan berat', created_at: '2026-07-20 08:00:00' },
    { id: 'bgt-pgf-02', training_id: 'TRN-PGF-001', fiscal_year: 2026, category_id: 'cat-3', category_name: 'Penginapan', description: 'Akomodasi Home Stay Tim Pelatih (14 Hari)', volume: 4, unit: 'Kamar', unit_price: 6000000, total: 24000000, notes: 'Penginapan Anggi', created_at: '2026-07-20 08:00:00' },
    { id: 'bgt-pgf-03', training_id: 'TRN-PGF-001', fiscal_year: 2026, category_id: 'cat-4', category_name: 'Konsumsi', description: 'Konsumsi Makan 140 Orang x 14 Hari', volume: 1960, unit: 'Porsi', unit_price: 38000, total: 74480000, notes: 'Bahan pangan lokal & sayur segar', created_at: '2026-07-20 08:00:00' },
    { id: 'bgt-pgf-04', training_id: 'TRN-PGF-001', fiscal_year: 2026, category_id: 'cat-8', category_name: 'Modul', description: 'Modul Pelatihan GASING', volume: 140, unit: 'Paket', unit_price: 100000, total: 14000000, notes: 'Buku paket peserta', created_at: '2026-07-20 08:00:00' },
    { id: 'bgt-pgf-05', training_id: 'TRN-PGF-001', fiscal_year: 2026, category_id: 'cat-10', category_name: 'Kaos', description: 'Kaos Pelatihan & Rompi Dingin', volume: 140, unit: 'Pcs', unit_price: 95000, total: 13300000, notes: 'Bahan hangat dataran tinggi', created_at: '2026-07-20 08:00:00' },

    { id: 'bgt-mkw-01', training_id: 'TRN-MKW-001', fiscal_year: 2026, category_id: 'cat-1', category_name: 'Transportasi', description: 'Tiket Pesawat Tim Trainer Jakarta - Manokwari PP', volume: 6, unit: 'Tiket', unit_price: 6500000, total: 39000000, notes: 'Garuda/Batik', created_at: '2026-08-10 08:00:00' },
    { id: 'bgt-mkw-02', training_id: 'TRN-MKW-001', fiscal_year: 2026, category_id: 'cat-3', category_name: 'Penginapan', description: 'Penginapan Hotel Trainer (14 Hari)', volume: 6, unit: 'Kamar', unit_price: 9100000, total: 54600000, notes: 'Hotel Aston Manokwari', created_at: '2026-08-10 08:00:00' },
    { id: 'bgt-mkw-03', training_id: 'TRN-MKW-001', fiscal_year: 2026, category_id: 'cat-4', category_name: 'Konsumsi', description: 'Konsumsi 180 Orang x 14 Hari', volume: 2520, unit: 'Porsi', unit_price: 35000, total: 88200000, notes: 'Katering kota', created_at: '2026-08-10 08:00:00' },
    { id: 'bgt-mkw-04', training_id: 'TRN-MKW-001', fiscal_year: 2026, category_id: 'cat-8', category_name: 'Modul', description: 'Modul GASING & Alat Peraga', volume: 180, unit: 'Paket', unit_price: 100000, total: 18000000, notes: 'Modul & gasing kit', created_at: '2026-08-10 08:00:00' },
  ];

  const realizations: Realization[] = [
    { id: 'rlz-twd-01', training_id: 'TRN-TWD-001', budget_id: 'bgt-twd-01', transaction_date: '2026-03-01', category_id: 'cat-1', category_name: 'Transportasi', description: 'Pembelian Tiket Pesawat & Speedboat Trainer', vendor: 'PT Papua Tour & Travel', volume: 4, unit: 'Tiket/Orang', unit_price: 7400000, total: 29600000, invoice_number: 'INV/TRV/2026/0301', notes: 'Sesuai manifest tiket', created_by: 'Maria Magdalena, S.E.', created_at: '2026-03-01' },
    { id: 'rlz-twd-02', training_id: 'TRN-TWD-001', budget_id: 'bgt-twd-02', transaction_date: '2026-03-16', category_id: 'cat-3', category_name: 'Penginapan', description: 'Pelunasan Penginapan Hotel Wasior Indah', vendor: 'Hotel Wasior Indah', volume: 4, unit: 'Kamar/14 Hari', unit_price: 6900000, total: 27600000, invoice_number: 'KW-089/HWI/2026', notes: 'Diskon grup 14 hari', created_by: 'Maria Magdalena, S.E.', created_at: '2026-03-16' },
    { id: 'rlz-twd-03', training_id: 'TRN-TWD-001', budget_id: 'bgt-twd-03', transaction_date: '2026-03-16', category_id: 'cat-4', category_name: 'Konsumsi', description: 'Pembayaran Katering Makan Siang Peserta & Trainer', vendor: 'CV Wondama Berkah Katering', volume: 1680, unit: 'Porsi', unit_price: 35000, total: 58800000, invoice_number: 'INV-KT/03/2026', notes: 'Lunas lengkap kuitansi bermaterai', created_by: 'Maria Magdalena, S.E.', created_at: '2026-03-16' },
    { id: 'rlz-twd-04', training_id: 'TRN-TWD-001', budget_id: 'bgt-twd-04', transaction_date: '2026-03-16', category_id: 'cat-5', category_name: 'Snack', description: 'Pembayaran Snack Pagi & Sore', vendor: 'UD Mandiri Snack Wasior', volume: 1680, unit: 'Kotak', unit_price: 14500, total: 24360000, invoice_number: 'KW-SNK/2026/041', notes: 'Hemat Rp 500 per kotak', created_by: 'Maria Magdalena, S.E.', created_at: '2026-03-16' },
    { id: 'rlz-twd-05', training_id: 'TRN-TWD-001', budget_id: 'bgt-twd-05', transaction_date: '2026-02-28', category_id: 'cat-8', category_name: 'Modul', description: 'Pengadaan Modul Berhitung GASING', vendor: 'Percetakan Surya Manokwari', volume: 120, unit: 'Paket', unit_price: 100000, total: 12000000, invoice_number: 'INV/PRC/0228', notes: 'Buku telah diterima lengkap', created_by: 'Maria Magdalena, S.E.', created_at: '2026-02-28' },

    { id: 'rlz-tbn-01', training_id: 'TRN-TBN-001', budget_id: 'bgt-tbn-01', transaction_date: '2026-05-10', category_id: 'cat-1', category_name: 'Transportasi', description: 'Tiket Pesawat & Sewa Mobil Bintuni', vendor: 'Travel Bintuni Jaya', volume: 5, unit: 'Orang', unit_price: 5900000, total: 29500000, invoice_number: 'INV-TBJ-2026-112', notes: 'Lunas', created_by: 'Maria Magdalena, S.E.', created_at: '2026-05-10' },
    { id: 'rlz-tbn-02', training_id: 'TRN-TBN-001', budget_id: 'bgt-tbn-02', transaction_date: '2026-05-25', category_id: 'cat-3', category_name: 'Penginapan', description: 'Pembayaran Penginapan Hotel Bintuni', vendor: 'Grand Bintuni Hotel', volume: 5, unit: 'Kamar', unit_price: 8300000, total: 41500000, invoice_number: 'KW-GBH-0525', notes: 'Lunas', created_by: 'Maria Magdalena, S.E.', created_at: '2026-05-25' },
    { id: 'rlz-tbn-03', training_id: 'TRN-TBN-001', budget_id: 'bgt-tbn-03', transaction_date: '2026-05-25', category_id: 'cat-4', category_name: 'Konsumsi', description: 'Konsumsi 160 Orang Peserta & Panitia', vendor: 'Catering Berkat Bintuni', volume: 2240, unit: 'Porsi', unit_price: 35000, total: 78400000, invoice_number: 'INV-CBB-2026-05', notes: 'Lunas', created_by: 'Maria Magdalena, S.E.', created_at: '2026-05-25' },
    { id: 'rlz-tbn-04', training_id: 'TRN-TBN-001', budget_id: 'bgt-tbn-04', transaction_date: '2026-05-08', category_id: 'cat-8', category_name: 'Modul', description: 'Pengadaan Modul GASING', vendor: 'Percetakan Bintuni Jaya', volume: 160, unit: 'Paket', unit_price: 99000, total: 15840000, invoice_number: 'INV-PBJ-0508', notes: 'Lunas', created_by: 'Maria Magdalena, S.E.', created_at: '2026-05-08' },

    { id: 'rlz-pgf-01', training_id: 'TRN-PGF-001', budget_id: 'bgt-pgf-01', transaction_date: '2026-08-17', category_id: 'cat-1', category_name: 'Transportasi', description: 'Sewa 4 Unit Double Cabin Manokwari-Anggi PP', vendor: 'CV Arfak Rent Car', volume: 4, unit: 'Unit', unit_price: 8000000, total: 32000000, invoice_number: 'INV-ARC-2026-081', notes: 'Uang jalan dan sewa mobil 4WD', created_by: 'Maria Magdalena, S.E.', created_at: '2026-08-17' },
    { id: 'rlz-pgf-02', training_id: 'TRN-PGF-001', budget_id: 'bgt-pgf-02', transaction_date: '2026-08-18', category_id: 'cat-3', category_name: 'Penginapan', description: 'Uang Muka Penginapan Home Stay Anggi', vendor: 'Home Stay Danau Anggi', volume: 4, unit: 'Kamar', unit_price: 4000000, total: 16000000, invoice_number: 'KW-DP-0818', notes: 'DP 66%, pelunasan saat penutupan', created_by: 'Maria Magdalena, S.E.', created_at: '2026-08-18' },
    { id: 'rlz-pgf-03', training_id: 'TRN-PGF-001', budget_id: 'bgt-pgf-04', transaction_date: '2026-08-16', category_id: 'cat-8', category_name: 'Modul', description: 'Pengadaan Modul GASING Pegaf', vendor: 'Percetakan Surya Manokwari', volume: 140, unit: 'Paket', unit_price: 100000, total: 14000000, invoice_number: 'INV-PSM-0816', notes: 'Lunas', created_by: 'Maria Magdalena, S.E.', created_at: '2026-08-16' },
  ];

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

  const lpjChecklists: LpjChecklist[] = [];
  // Wasior 14/14
  defaultLpjTypes.forEach((type, idx) => {
    lpjChecklists.push({ id: `lpj-twd-${idx + 1}`, training_id: 'TRN-TWD-001', checklist_type: type, is_complete: true, notes: 'Tervalidasi & Ditandatangani', updated_at: '2026-03-20' });
  });
  // Bintuni 14/14
  defaultLpjTypes.forEach((type, idx) => {
    lpjChecklists.push({ id: `lpj-tbn-${idx + 1}`, training_id: 'TRN-TBN-001', checklist_type: type, is_complete: true, notes: 'Lengkap & Terverifikasi', updated_at: '2026-06-01' });
  });
  // Pegaf 8/14
  defaultLpjTypes.forEach((type, idx) => {
    const isComp = idx < 8;
    lpjChecklists.push({ id: `lpj-pgf-${idx + 1}`, training_id: 'TRN-PGF-001', checklist_type: type, is_complete: isComp, notes: isComp ? 'Tersedia draft/berkas berjalan' : 'Menunggu kegiatan selesai', updated_at: '2026-08-27' });
  });
  // Manokwari 3/14
  defaultLpjTypes.forEach((type, idx) => {
    const isComp = idx < 3;
    lpjChecklists.push({ id: `lpj-mkw-${idx + 1}`, training_id: 'TRN-MKW-001', checklist_type: type, is_complete: isComp, notes: isComp ? 'RAB & SK Tugas tersedia' : 'Belum terlaksana', updated_at: '2026-08-26' });
  });

  const documentation: Documentation[] = [
    { id: 'doc-01', training_id: 'TRN-TWD-001', category: 'Pembukaan', file_name: 'pembukaan_wasior.jpg', file_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80', caption: 'Acara Pembukaan Program GASING oleh Kepala Dinas Pendidikan Wondama', documentation_date: '2026-03-02', file_size: 1450000, mime_type: 'image/jpeg', uploaded_by: 'Korneles Rumadas', uploaded_at: '2026-03-02' },
    { id: 'doc-02', training_id: 'TRN-TWD-001', category: 'Pelatihan', file_name: 'suasana_kelas_wasior.jpg', file_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80', caption: 'Aktivitas belajar penjumlahan gembira metode GASING', documentation_date: '2026-03-05', file_size: 1820000, mime_type: 'image/jpeg', uploaded_by: 'Korneles Rumadas', uploaded_at: '2026-03-05' },
    { id: 'doc-03', training_id: 'TRN-TWD-001', category: 'Guru', file_name: 'guru_wasior.jpg', file_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80', caption: 'Guru-guru SD se-Wasior mempraktikkan metode jari mencongak', documentation_date: '2026-03-08', file_size: 2100000, mime_type: 'image/jpeg', uploaded_by: 'Korneles Rumadas', uploaded_at: '2026-03-08' },
    { id: 'doc-04', training_id: 'TRN-TWD-001', category: 'Penutupan', file_name: 'penutupan_wasior.jpg', file_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', caption: 'Penyerahan sertifikat kelulusan kepada perwakilan guru & siswa', documentation_date: '2026-03-16', file_size: 1980000, mime_type: 'image/jpeg', uploaded_by: 'Korneles Rumadas', uploaded_at: '2026-03-16' },
    { id: 'doc-05', training_id: 'TRN-TBN-001', category: 'Pelatihan', file_name: 'kelas_bintuni.jpg', file_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80', caption: 'Suasana riang gembira siswa Bintuni bermain gasing berhitung', documentation_date: '2026-05-15', file_size: 2300000, mime_type: 'image/jpeg', uploaded_by: 'Hendrik Fimbay', uploaded_at: '2026-05-15' },
    { id: 'doc-06', training_id: 'TRN-PGF-001', category: 'Aktivitas Kelas', file_name: 'kelas_anggi_pegaf.jpg', file_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80', caption: 'Pelatihan berhitung perkalian cepat di Ullong Anggi Pegaf', documentation_date: '2026-08-22', file_size: 1750000, mime_type: 'image/jpeg', uploaded_by: 'Yance Dowansiba', uploaded_at: '2026-08-22' },
  ];

  const documents: ProgramDocument[] = [
    { id: 'off-01', training_id: 'TRN-TWD-001', regency_id: 'reg-wondama', district_id: 'dis-twd-01', document_type: 'LPJ', title: 'Laporan Pertanggungjawaban Lengkap Program GASING Wasior 2026', file_url: '/uploads/2026/reg-wondama/dis-twd-01/LPJ_Wasior_Signed.pdf', file_name: 'LPJ_Wasior_Signed.pdf', file_size: 8450000, mime_type: 'application/pdf', document_date: '2026-03-20', notes: 'Dokumen final disahkan', uploaded_by: 'Korneles Rumadas', uploaded_at: '2026-03-20' },
    { id: 'off-02', training_id: 'TRN-TBN-001', regency_id: 'reg-bintuni', district_id: 'dis-tbn-01', document_type: 'LPJ', title: 'LPJ Resmi dan Bukti Pertanggungjawaban Bintuni Kota', file_url: '/uploads/2026/reg-bintuni/dis-tbn-01/LPJ_Bintuni_Final.pdf', file_name: 'LPJ_Bintuni_Final.pdf', file_size: 9200000, mime_type: 'application/pdf', document_date: '2026-06-01', notes: 'Selesai audit inspektorat', uploaded_by: 'Hendrik Fimbay', uploaded_at: '2026-06-01' },
    { id: 'off-03', training_id: 'TRN-PGF-001', regency_id: 'reg-pegarfak', district_id: 'dis-pgf-01', document_type: 'Surat Tugas', title: 'Surat Tugas Instruktur GASING Kabupaten Pegunungan Arfak', file_url: '/uploads/2026/reg-pegarfak/dis-pgf-01/Surat_Tugas_Pegaf.pdf', file_name: 'Surat_Tugas_Pegaf.pdf', file_size: 1250000, mime_type: 'application/pdf', document_date: '2026-08-10', notes: 'SK Kepala Dinas Prov PB', uploaded_by: 'Dinas Pendidikan Prov PB', uploaded_at: '2026-08-10' },
    { id: 'off-04', training_id: 'TRN-MKW-001', regency_id: 'reg-mkw', district_id: 'dis-mkw-01', document_type: 'SP2D', title: 'Surat Perintah Pencairan Dana (SP2D) Pelatihan GASING Manokwari Barat', file_url: '/uploads/2026/reg-mkw/dis-mkw-01/SP2D_MKW_Barat.pdf', file_name: 'SP2D_MKW_Barat.pdf', file_size: 980000, mime_type: 'application/pdf', document_date: '2026-08-20', notes: 'Uang muka 50%', uploaded_by: 'BPKAD Papua Barat', uploaded_at: '2026-08-20' },
  ];

  const participants: Participant[] = [
    { id: 'prt-01', training_id: 'TRN-TWD-001', school_id: 'sch-04', participant_type: 'guru', full_name: 'Dominggus Kereway, S.Pd.', gender: 'L', attendance_status: 'Hadir', notes: 'Guru Kelas 4', created_at: '2026-03-02' },
    { id: 'prt-02', training_id: 'TRN-TWD-001', school_id: 'sch-04', participant_type: 'guru', full_name: 'Maria Sayori, S.Pd.', gender: 'P', attendance_status: 'Hadir', notes: 'Guru Kelas 5', created_at: '2026-03-02' },
    { id: 'prt-03', training_id: 'TRN-TWD-001', school_id: 'sch-04', participant_type: 'siswa', full_name: 'Alfon Mandacan', gender: 'L', class_name: 'Kelas 4', attendance_status: 'Hadir', notes: 'Peningkatan nilai: 30 -> 95', created_at: '2026-03-02' },
    { id: 'prt-04', training_id: 'TRN-TWD-001', school_id: 'sch-04', participant_type: 'siswa', full_name: 'Nelce Torey', gender: 'P', class_name: 'Kelas 5', attendance_status: 'Hadir', notes: 'Peningkatan nilai: 40 -> 90', created_at: '2026-03-02' },
    { id: 'prt-05', training_id: 'TRN-TWD-001', school_id: 'sch-05', participant_type: 'guru', full_name: 'Yohanes Karubaba, S.Pd.', gender: 'L', attendance_status: 'Hadir', notes: 'Guru Matematika', created_at: '2026-03-02' },
    { id: 'prt-06', training_id: 'TRN-TWD-001', school_id: 'sch-05', participant_type: 'siswa', full_name: 'Septer Rumadas', gender: 'L', class_name: 'Kelas 4', attendance_status: 'Hadir', notes: 'Juara mencongak cepat', created_at: '2026-03-02' },

    { id: 'prt-07', training_id: 'TRN-PGF-001', school_id: 'sch-08', participant_type: 'guru', full_name: 'Elias Dowansiba, S.Pd.', gender: 'L', attendance_status: 'Hadir', notes: 'Guru Kelas 3', created_at: '2026-08-18' },
    { id: 'prt-08', training_id: 'TRN-PGF-001', school_id: 'sch-08', participant_type: 'guru', full_name: 'Martha Ullo, S.Pd.', gender: 'P', attendance_status: 'Hadir', notes: 'Guru Kelas 4', created_at: '2026-08-18' },
    { id: 'prt-09', training_id: 'TRN-PGF-001', school_id: 'sch-08', participant_type: 'siswa', full_name: 'Kaleb Mandacan', gender: 'L', class_name: 'Kelas 4', attendance_status: 'Hadir', notes: 'Sangat cepat menghitung jari', created_at: '2026-08-18' },
    { id: 'prt-10', training_id: 'TRN-PGF-001', school_id: 'sch-08', participant_type: 'siswa', full_name: 'Dorkas Ahoren', gender: 'P', class_name: 'Kelas 4', attendance_status: 'Hadir', notes: 'Aktif di kelas', created_at: '2026-08-18' },
    { id: 'prt-11', training_id: 'TRN-PGF-001', school_id: 'sch-09', participant_type: 'guru', full_name: 'Stefanus Meyoma, S.Pd.', gender: 'L', attendance_status: 'Hadir', notes: 'Guru PJOK bantu numerasi', created_at: '2026-08-18' },
    { id: 'prt-12', training_id: 'TRN-PGF-001', school_id: 'sch-09', participant_type: 'siswa', full_name: 'Markus Sayori', gender: 'L', class_name: 'Kelas 5', attendance_status: 'Hadir', notes: 'Antusias', created_at: '2026-08-18' },

    { id: 'prt-13', training_id: 'TRN-MKW-001', school_id: 'sch-01', participant_type: 'guru', full_name: 'Agustina Waror, S.Pd.', gender: 'P', attendance_status: 'Hadir', notes: 'Calon Trainer Inti', created_at: '2026-08-25' },
    { id: 'prt-14', training_id: 'TRN-MKW-001', school_id: 'sch-01', participant_type: 'guru', full_name: 'Karel Rumbruren, S.Pd.', gender: 'L', attendance_status: 'Hadir', notes: 'Koordinator Guru Gugus', created_at: '2026-08-25' },
    { id: 'prt-15', training_id: 'TRN-MKW-001', school_id: 'sch-02', participant_type: 'guru', full_name: 'Fransiska Borlak, S.Pd.', gender: 'P', attendance_status: 'Hadir', notes: 'Guru Kelas 3', created_at: '2026-08-25' },
    { id: 'prt-16', training_id: 'TRN-MKW-001', school_id: 'sch-03', participant_type: 'guru', full_name: 'Paulus Mansawan, S.Pd.', gender: 'L', attendance_status: 'Hadir', notes: 'Guru Kelas 4', created_at: '2026-08-25' },
  ];

  const notifications: SystemNotification[] = [
    { id: 'notif-01', user_id: 'usr-admin-01', training_id: 'TRN-MKW-001', type: 'Jadwal', title: 'Kegiatan Manokwari Barat akan dimulai dalam 11 hari', message: 'Pelatihan dijadwalkan mulai 07 September 2026 di Gedung PKK Provinsi. Pastikan modul dan akomodasi trainer telah terkonfirmasi.', severity: 'info', is_read: false, created_at: '2026-08-27T08:00:00Z' },
    { id: 'notif-02', user_id: 'usr-finance-01', training_id: 'TRN-FFK-001', type: 'RAB', title: 'RAB Fakfak Kota belum diverifikasi', message: 'Usulan RAB untuk kegiatan Fakfak Kota masih membutuhkan verifikasi rincian transportasi laut dan katering.', severity: 'warning', is_read: false, created_at: '2026-08-27T08:00:00Z' },
    { id: 'notif-03', user_id: 'usr-admin-01', training_id: 'TRN-PGF-001', type: 'Dokumentasi', title: 'Update dokumentasi harian Pegunungan Arfak', message: 'Pelatihan Anggi hari ke-10 sedang berlangsung. Unggah dokumentasi materi pembagian untuk pemantauan pimpinan.', severity: 'info', is_read: false, created_at: '2026-08-27T08:00:00Z' },
    { id: 'notif-04', user_id: 'usr-finance-01', training_id: 'TRN-PGF-001', type: 'Realisasi', title: 'Sisa pembayaran termin kedua Pegaf', message: 'Kegiatan berlangsung melewati 50% jadwal, segera siapkan pencairan termin kedua konsumsi.', severity: 'warning', is_read: false, created_at: '2026-08-27T08:00:00Z' },
  ];

  const auditLogs: AuditLog[] = [
    { id: 'aud-01', user_id: 'usr-admin-01', user_name: 'Dr. Yan Pieterson', action: 'Create', module: 'Kegiatan', record_id: 'TRN-MKW-001', old_values: undefined, new_values: 'Inisiasi jadwal pelatihan Manokwari Barat', created_at: '2026-08-10 08:00:00' },
    { id: 'aud-02', user_id: 'usr-finance-01', user_name: 'Maria Magdalena Mandacan', action: 'Create', module: 'RAB', record_id: 'bgt-mkw-01', old_values: undefined, new_values: 'Input RAB Transportasi & Akomodasi Manokwari Barat Rp 192.500.000', created_at: '2026-08-10 09:00:00' },
    { id: 'aud-03', user_id: 'usr-admin-01', user_name: 'Dr. Yan Pieterson', action: 'Update', module: 'Kegiatan', record_id: 'TRN-PGF-001', old_values: 'Ready', new_values: 'Status diubah Ready -> Ongoing', created_at: '2026-08-18 08:00:00' },
    { id: 'aud-04', user_id: 'usr-admin-01', user_name: 'Dr. Yan Pieterson', action: 'Update', module: 'Kegiatan', record_id: 'TRN-TWD-001', old_values: 'Ongoing', new_values: 'Status diubah Ongoing -> Completed', created_at: '2026-03-16 16:00:00' },
    { id: 'aud-05', user_id: 'usr-finance-01', user_name: 'Maria Magdalena Mandacan', action: 'Upload', module: 'Dokumen', record_id: 'off-01', old_values: undefined, new_values: 'Upload Berkas LPJ Lengkap Wasior 100%', created_at: '2026-03-20 10:00:00' },
  ];

  const systemSettings: SystemSettings = {
    system_name: 'Papua Barat Monitoring System',
    program_name: 'Program Pandai Berhitung dengan Metode GASING',
    institution_name: 'Dinas Pendidikan Provinsi Papua Barat',
    logo_url: '/assets/logo-papua-barat.png',
    province_name: 'Papua Barat',
    report_signatory_name: 'Barnabas Dowansiba, S.Pd., M.Pd.',
    report_signatory_title: 'Kepala Dinas Pendidikan Provinsi Papua Barat',
    report_footer: 'Papua Barat Monitoring System - GASING 2026 | Dokumen Resmi Pemerintah Provinsi Papua Barat',
    reminders_enabled: true,
  };

  return {
    profiles,
    provinces,
    regencies,
    districts,
    schools,
    trainings,
    participants,
    budgetCategories,
    budgets,
    realizations,
    lpjChecklists,
    documentation,
    documents,
    notifications,
    auditLogs,
    systemSettings,
  };
}

function getStorageFilePath(): string {
  if (process.env.VERCEL) {
    return path.join('/tmp', 'papua_store.json');
  }
  return path.join(process.cwd(), 'data', 'papua_store.json');
}

function loadInitialStore(): DataStoreState {
  const filePath = getStorageFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.districts) && Array.isArray(parsed.schools)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read persistent store from disk, falling back to initial state:', err);
  }

  const initial = getInitialState();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write initial store to disk:', err);
  }
  return initial;
}

// Global persistent instance for serverless lifecycle
const globalData = globalThis as unknown as { __papuaBaratDataStore?: DataStoreState };
if (!globalData.__papuaBaratDataStore) {
  globalData.__papuaBaratDataStore = loadInitialStore();
}

export const store = globalData.__papuaBaratDataStore;

export function persistStore(): void {
  try {
    const filePath = getStorageFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write store to disk:', err);
  }
}

export function resetStoreToDefault(): DataStoreState {
  const fresh = getInitialState();
  Object.keys(store).forEach(k => delete (store as any)[k]);
  Object.assign(store, fresh);
  persistStore();
  return store;
}
