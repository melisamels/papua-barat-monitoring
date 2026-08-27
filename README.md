# Papua Barat Monitoring System

### Program Pandai Berhitung dengan Metode GASING
**Pemerintah Provinsi Papua Barat — Tahun Anggaran 2026**

Aplikasi web production-ready untuk memonitor pelaksanaan **Program Pandai Berhitung dengan Metode GASING** di seluruh wilayah **Provinsi Papua Barat**, dari tingkat:

**Provinsi → Kabupaten → Distrik → Sekolah → Kegiatan Pelatihan**

---

## 1. Fitur Utama

- **Otentikasi 4 Role Pengguna**:
  - **Super Admin**: Akses penuh, manajemen user, pengaturan sistem, audit log.
  - **Finance (Keuangan)**: Input RAB, realisasi biaya, upload kuitansi/invoice, variance, sisa anggaran, LPJ.
  - **Pimpinan**: Dashboard strategis, monitoring progress, anggaran, peta, AI Assistant.
  - **Viewer (Kepala Dinas Pendidikan Provinsi)**: Read-only progress, peta wilayah, peserta, dokumentasi, laporan dinas.
- **Peta Interaktif Papua Barat (Leaflet)**:
  - 7 Kabupaten: Manokwari, Manokwari Selatan, Pegunungan Arfak, Teluk Bintuni, Teluk Wondama, Fakfak, Kaimana.
  - Marker status (Planning, Ready, Ongoing, Completed) dengan popup ringkasan lengkap.
- **Central Workspace Detail Kegiatan (9 Tab)**:
  - Overview (Jadwal, Durasi, Lokasi, Compliance score, Quality index)
  - Peserta (Guru & Siswa)
  - Sekolah (Sekolah terdaftar di distrik)
  - RAB (Volume × Harga Satuan = Total, subtotal kategori, grand total otomatis)
  - Realisasi (Pencatatan transaksi, selisih anggaran, deteksi over budget)
  - LPJ (14 checklist baku kelengkapan berkas LPJ dengan progress bar %)
  - Dokumentasi (Galeri foto 17 kategori dengan Lightbox)
  - Dokumen Resmi (Document Library: Surat Tugas, SP2D, BKU, Berita Acara)
  - Riwayat (Audit trail timeline per kegiatan)
- **AI Assistant ("Papua Barat Program Assistant")**:
  - Menjawab 18 pertanyaan rekomendasi dan pertanyaan bebas langsung dari database aktual.
  - Tombol **Generate Executive Summary** terstruktur (Overview, Progress, Participants, Financial, Issues, Prioritas).
  - Dilengkapi timestamp audit: *"Berdasarkan data terakhir di sistem - Data diperbarui: [timestamp]"*.
- **Pusat Laporan & Format Cetak / PDF**:
  - 5 Jenis Laporan: Per Kegiatan, Per Kabupaten, Bulanan, Tahunan, Keseluruhan Program.
  - Layout cetak A4 ramah print (tanpa sidebar/navbar), header resmi, stempel, dan tanda tangan kepala dinas.
- **Import Peserta dari CSV/Excel** dengan modal pratinjau data sebelum commit ke database.
- **Pusat Notifikasi**: Deteksi otomatis H-30, H-14, H-7, keterlambatan, dan peringatan over budget.

---

## 2. Arsitektur Database & Penyimpanan

Sistem dirancang dengan arsitektur database ganda yang sangat tangguh:

1. **Local Persistent Database Engine (`node:sqlite`)**:
   - Berjalan langsung di Node.js 24 tanpa perlu setup server database eksternal tambahan.
   - File database tersimpan persisten di `papua_barat.db`.
   - Mengisi otomatis data awal 7 kabupaten, 23 distrik, sekolah, kegiatan, anggaran, realisasi, dan LPJ saat aplikasi pertama kali dijalankan.
2. **Supabase PostgreSQL & Cloud Storage Ready**:
   - Skrip migrasi resmi di `supabase/migrations/01_initial_schema.sql` dan `supabase/migrations/02_rls_policies.sql` lengkap dengan Row Level Security (RLS) policies untuk 4 role.
   - Seed data resmi di `supabase/seed.sql`.
   - Konfigurasi bucket storage (`program-documents`, `documentation`, `finance-documents`).

---

## 3. Persyaratan Sistem

- **Node.js**: v20.x atau v22.x atau v24.x (Direkomendasikan v24.19.0+)
- **NPM**: v10.x atau v11.x
- **Browser**: Google Chrome, Mozilla Firefox, Microsoft Edge, Safari

---

## 4. Instalasi & Menjalankan Aplikasi

### Langkah 1: Masuk ke Direktori Project
```bash
cd papua-barat-monitoring
```

### Langkah 2: Instalasi Dependensi
```bash
npm install
```

### Langkah 3: Konfigurasi Environment Variables (Opsional)
Salin berkas `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
*Catatan: Tanpa mengisi kredensial eksternal pun, sistem otomatis berjalan 100% menggunakan database lokal dan rule-based intelligence engine.*

### Langkah 4: Menjalankan Server Development
```bash
npm run dev
```
Aplikasi dapat diakses melalui peramban web di: `http://localhost:3000`

### Langkah 5: Membangun Versi Produksi (Production Build)
```bash
npm run build
npm run start
```

---

## 5. Akun Pengguna Demo

Tersedia tombol satu-klik pada halaman login (`/login`) untuk berpindah peran:

| Role | Nama Pengguna | Email | Akses Utama |
|---|---|---|---|
| **Super Admin** | Dr. Yan Pieterson, S.Kom., M.T. | admin@papuabarat.go.id | Akses penuh CRUD, Manajemen Pengguna, Audit Trail, Pengaturan |
| **Finance** | Maria Magdalena Mandacan, S.E., Ak. | keuangan@papuabarat.go.id | RAB, Realisasi, LPJ, Bukti Transaksi, Cetak Laporan |
| **Pimpinan** | Ir. Dominggus Mandacan, M.Si. | pimpinan@papuabarat.go.id | Dashboard strategis, Progress wilayah, Anggaran, AI Assistant |
| **Viewer** | Barnabas Dowansiba, S.Pd., M.Pd. | kadisdik@papuabarat.go.id | Read-only progress, Peta Papua Barat, Peserta, Dokumentasi |

Kata sandi default demo: `password123`

---

## 6. Standar Format & Bahasa

- **Bahasa**: Bahasa Indonesia untuk seluruh antarmuka, status, laporan, dan AI Assistant.
- **Mata Uang**: Rupiah Indonesia (`Rp 1.300.000.000`).
- **Tanggal**: Format baku Indonesia (`17 Agustus 2026`).
- **Zona Waktu**: Waktu Indonesia Timur (`WIT / Asia/Jayapura`).
