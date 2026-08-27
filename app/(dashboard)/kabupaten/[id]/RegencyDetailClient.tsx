'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useApp } from '@/components/providers/AppProvider';
import { getRolePermissions } from '@/lib/auth/session';
import { formatRupiah, formatDateIndo, getStatusBadgeClass } from '@/lib/utils/formatters';
import { actionCreateDistrict, actionCreateSchool } from '@/app/actions/data';
import { District, School, TrainingStatus } from '@/lib/types';
import {
  MapPin,
  Building2,
  GraduationCap,
  CalendarDays,
  Users,
  Wallet,
  Receipt,
  Camera,
  FileText,
  ArrowLeft,
  Plus,
  X,
  School as SchoolIcon,
  CheckCircle2,
} from 'lucide-react';

interface RegencyDetailClientProps {
  regency: any;
}

export default function RegencyDetailClient({ regency }: RegencyDetailClientProps) {
  const { currentUser, showToast } = useApp();
  const perms = getRolePermissions(currentUser.role);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'distrik' | 'sekolah' | 'kegiatan' | 'peserta' | 'rab' | 'realisasi' | 'dokumentasi' | 'laporan'
  >('overview');

  // Local state for districts and schools
  const [districts, setDistricts] = useState<District[]>(regency?.districts || []);
  const [schools, setSchools] = useState<School[]>(regency?.schools || []);
  const trainings = regency?.trainings || [];
  const documentation = regency?.documentation || [];

  // Modal states
  const [showAddDistrictModal, setShowAddDistrictModal] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states: Tambah Distrik
  const [districtName, setDistrictName] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [districtCoordinator, setDistrictCoordinator] = useState('');
  const [districtTargetTeachers, setDistrictTargetTeachers] = useState(30);
  const [districtTargetStudents, setDistrictTargetStudents] = useState(90);
  const [districtStatus, setDistrictStatus] = useState<TrainingStatus>('Planning');
  const [districtNotes, setDistrictNotes] = useState('');

  // Form states: Tambah Sekolah
  const [schoolName, setSchoolName] = useState('');
  const [schoolDistrictId, setSchoolDistrictId] = useState(districts[0]?.id || '');
  const [schoolLevel, setSchoolLevel] = useState('SD');
  const [schoolPrincipal, setSchoolPrincipal] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolStudentCount, setSchoolStudentCount] = useState(45);
  const [schoolTeacherCount, setSchoolTeacherCount] = useState(15);
  const [schoolNotes, setSchoolNotes] = useState('');

  if (!regency) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Kabupaten Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mt-1">Data kabupaten dengan ID tersebut tidak tersedia.</p>
        <Link
          href="/kabupaten"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Kabupaten</span>
        </Link>
      </div>
    );
  }

  const badge = getStatusBadgeClass(regency.status || 'Planning');

  // Submit Handler: Tambah Distrik
  const handleAddDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!districtName.trim()) {
      showToast('Nama distrik wajib diisi', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const newDist = await actionCreateDistrict({
        regency_id: regency.id,
        name: districtName.trim(),
        code: districtCode.trim() || districtName.substring(0, 3).toUpperCase(),
        coordinator: districtCoordinator.trim() || 'Koordinator Distrik',
        target_teachers: Number(districtTargetTeachers),
        target_students: Number(districtTargetStudents),
        status: districtStatus,
        notes: districtNotes.trim() || undefined,
      });

      setDistricts(prev => [newDist, ...prev]);
      setShowAddDistrictModal(false);
      setDistrictName('');
      setDistrictCode('');
      setDistrictCoordinator('');
      setDistrictNotes('');
      showToast(`Distrik ${newDist.name} berhasil ditambahkan!`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menambahkan distrik', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler: Tambah Sekolah
  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      showToast('Nama sekolah wajib diisi', 'error');
      return;
    }
    const targetDistrictId = schoolDistrictId || districts[0]?.id;
    if (!targetDistrictId) {
      showToast('Harap pilih distrik terlebih dahulu', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const newSch = await actionCreateSchool({
        regency_id: regency.id,
        district_id: targetDistrictId,
        name: schoolName.trim(),
        school_level: schoolLevel,
        principal: schoolPrincipal.trim() || undefined,
        address: schoolAddress.trim() || undefined,
        teacher_participants: Number(schoolTeacherCount),
        student_participants: Number(schoolStudentCount),
        notes: schoolNotes.trim() || undefined,
      });

      setSchools(prev => [newSch, ...prev]);
      setShowAddSchoolModal(false);
      setSchoolName('');
      setSchoolPrincipal('');
      setSchoolAddress('');
      setSchoolNotes('');
      showToast(`Sekolah ${newSch.name} berhasil ditambahkan!`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menambahkan sekolah', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Master Kabupaten', href: '/kabupaten' },
          { label: regency.name },
        ]}
      />

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-black text-xl shrink-0">
            {regency.code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{regency.name}</h1>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                {regency.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ibukota: <strong className="text-slate-800">{regency.notes?.split(',')[0] || '-'}</strong> • Progress Program: <strong className="text-emerald-700">{regency.progress || 0}%</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddDistrictModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Distrik</span>
          </button>
          <button
            onClick={() => setShowAddSchoolModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Sekolah</span>
          </button>
          <Link
            href={`/laporan/cetak?kabupaten=${regency.id}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            <span>Cetak Rekap</span>
          </Link>
          <Link
            href="/kabupaten"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </Link>
        </div>
      </div>

      {/* 9 Tabs Detail Kabupaten */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/70 p-1.5 gap-1 text-xs font-bold">
          {[
            { key: 'overview', label: '1. Overview', icon: MapPin },
            { key: 'distrik', label: `2. Distrik (${districts.length})`, icon: Building2 },
            { key: 'sekolah', label: `3. Sekolah (${schools.length})`, icon: GraduationCap },
            { key: 'kegiatan', label: `4. Kegiatan (${trainings.length})`, icon: CalendarDays },
            { key: 'peserta', label: '5. Rekap Peserta', icon: Users },
            { key: 'rab', label: '6. RAB', icon: Wallet, hidden: !perms.canViewFinancialBreakdown },
            { key: 'realisasi', label: '7. Realisasi', icon: Receipt, hidden: !perms.canViewFinancialBreakdown },
            { key: 'dokumentasi', label: `8. Dokumentasi (${documentation.length})`, icon: Camera },
            { key: 'laporan', label: '9. Laporan', icon: FileText },
          ]
            .filter(t => !t.hidden)
            .map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200 font-black'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
        </div>

        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Distrik</span>
                  <div className="text-xl font-black text-slate-800">{districts.length} Distrik</div>
                  <span className="text-xs text-emerald-700 font-semibold">{trainings.length} Kegiatan Terjadwal</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Sekolah</span>
                  <div className="text-xl font-black text-slate-800">{schools.length} Sekolah</div>
                  <span className="text-xs text-slate-500">SD, SMP, & Sederajat</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Guru</span>
                  <div className="text-xl font-black text-slate-800">
                    {regency.actual_teachers || 0} <span className="text-xs font-normal text-slate-500">/ {regency.target_teachers || 0}</span>
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold">
                    {regency.target_teachers > 0 ? Math.round(((regency.actual_teachers || 0) / regency.target_teachers) * 100) : 0}% Tercapai
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Siswa</span>
                  <div className="text-xl font-black text-slate-800">
                    {regency.actual_students || 0} <span className="text-xs font-normal text-slate-500">/ {regency.target_students || 0}</span>
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold">
                    {regency.target_students > 0 ? Math.round(((regency.actual_students || 0) / regency.target_students) * 100) : 0}% Tercapai
                  </span>
                </div>
              </div>

              {perms.canViewFinancialBreakdown && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0B2545] text-white space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Ringkasan Keuangan {regency.name}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Alokasi RAB</span>
                      <strong className="text-base">{formatRupiah(regency.total_rab || 0)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Realisasi</span>
                      <strong className="text-base text-emerald-400">{formatRupiah(regency.total_realization || 0)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sisa Anggaran</span>
                      <strong className="text-base text-amber-300">
                        {formatRupiah((regency.total_rab || 0) - (regency.total_realization || 0))}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tingkat Penyerapan</span>
                      <strong className="text-base">
                        {regency.total_rab > 0 ? Math.round(((regency.total_realization || 0) / regency.total_rab) * 100) : 0}%
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DISTRIK */}
          {activeTab === 'distrik' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Daftar Distrik di {regency.name} ({districts.length})
                  </h4>
                  <p className="text-xs text-slate-500">Kelola master data distrik, koordinator, dan target peserta</p>
                </div>
                <button
                  onClick={() => setShowAddDistrictModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Distrik</span>
                </button>
              </div>

              {districts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Belum ada data distrik di kabupaten ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {districts.map(d => (
                    <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="text-sm">Distrik {d.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">Kode: {d.code}</span>
                      </div>
                      <div className="text-slate-600">Koordinator: <strong className="text-slate-800">{d.coordinator}</strong></div>
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                        <span>Target Guru: <strong className="text-slate-800">{d.target_teachers}</strong> Org</span>
                        <span>Target Siswa: <strong className="text-slate-800">{d.target_students}</strong> Siswa</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SEKOLAH (MASTER DATA SEKOLAH & JUMLAH SISWA) */}
          {activeTab === 'sekolah' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Daftar Sekolah & Master Siswa ({schools.length})
                  </h4>
                  <p className="text-xs text-slate-500">Kelola data sekolah sasaran, nama sekolah, kepala sekolah, dan jumlah siswa</p>
                </div>
                <button
                  onClick={() => setShowAddSchoolModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Sekolah</span>
                </button>
              </div>

              {schools.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Belum ada sekolah terdaftar di kabupaten ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schools.map(s => (
                    <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="text-sm">{s.name}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-100">{s.school_level}</span>
                      </div>
                      <div className="text-slate-600">Distrik: <strong className="text-slate-800">{s.district_name || '-'}</strong></div>
                      <div className="text-slate-600">Kepala Sekolah: <strong className="text-slate-800">{s.principal || '-'}</strong></div>
                      {s.address && <div className="text-slate-500 text-[11px] truncate">Alamat: {s.address}</div>}
                      
                      {/* Siswa & Guru Badges (#13) */}
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-[11px]">
                        <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg font-semibold">
                          <span>Siswa: </span>
                          <strong className="text-xs font-black">{s.student_participants || 0} Siswa</strong>
                        </div>
                        <div className="p-1.5 bg-amber-50 text-amber-800 rounded-lg font-semibold">
                          <span>Guru: </span>
                          <strong className="text-xs font-black">{s.teacher_participants || 0} Guru</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: KEGIATAN */}
          {activeTab === 'kegiatan' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Kegiatan Pelatihan di Wilayah Ini ({trainings.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {trainings.map((t: any) => (
                  <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{t.venue}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100">{t.status}</span>
                    </div>
                    <div className="text-slate-600">Distrik: <strong>{t.district_name}</strong></div>
                    <div className="text-slate-600">Jadwal: {formatDateIndo(t.start_date)} - {formatDateIndo(t.end_date)}</div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-emerald-700 font-bold">{formatRupiah(t.total_realization)}</span>
                      <Link href={`/kegiatan/${t.id}`} className="text-emerald-700 font-bold hover:underline">
                        Buka Workspace →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PESERTA */}
          {activeTab === 'peserta' && (
            <div className="text-xs space-y-3">
              <h4 className="font-bold text-slate-900 uppercase">Rekapitulasi Sasaran Peserta</h4>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div>Total Guru Mengikuti: <strong>{regency.actual_teachers || 0} Orang</strong></div>
                <div>Total Siswa Mengikuti: <strong>{regency.actual_students || 0} Siswa</strong></div>
              </div>
            </div>
          )}

          {/* TAB 6 & 7: RAB & REALISASI */}
          {(activeTab === 'rab' || activeTab === 'realisasi') && (
            <div className="text-xs space-y-3">
              <h4 className="font-bold text-slate-900 uppercase">Rincian Anggaran Tingkat Kabupaten</h4>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div>Alokasi RAB Kabupaten: <strong>{formatRupiah(regency.total_rab || 0)}</strong></div>
                <div>Realisasi Biaya: <strong className="text-emerald-800">{formatRupiah(regency.total_realization || 0)}</strong></div>
                <div>Sisa Anggaran: <strong>{formatRupiah((regency.total_rab || 0) - (regency.total_realization || 0))}</strong></div>
              </div>
            </div>
          )}

          {/* TAB 8: DOKUMENTASI */}
          {activeTab === 'dokumentasi' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Dokumentasi Kegiatan ({documentation.length} Foto)
              </h4>
              {documentation.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Belum ada dokumentasi foto yang diunggah untuk wilayah ini.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {documentation.map((doc: any) => (
                    <div key={doc.id} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={doc.file_url} alt={doc.caption} className="w-full h-32 object-cover" />
                      <div className="p-2 text-[11px] font-medium text-slate-800 truncate">{doc.caption}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: LAPORAN */}
          {activeTab === 'laporan' && (
            <div className="text-xs space-y-3">
              <h4 className="font-bold text-slate-900 uppercase">Laporan Pelaksanaan Tingkat Kabupaten</h4>
              <p className="text-slate-600">Unduh atau cetak laporan resmi pelaksanaan di {regency.name}.</p>
              <Link
                href={`/laporan/cetak?type=kabupaten&regency=${regency.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold"
              >
                <FileText className="w-4 h-4" />
                <span>Buka Dokumen Cetak / PDF</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: TAMBAH DISTRIK */}
      {showAddDistrictModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>Tambah Distrik Baru ({regency.name})</span>
              </h3>
              <button
                onClick={() => setShowAddDistrictModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDistrict} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Distrik *</label>
                <input
                  type="text"
                  value={districtName}
                  onChange={e => setDistrictName(e.target.value)}
                  placeholder="Contoh: Manokwari Utara"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Distrik</label>
                  <input
                    type="text"
                    value={districtCode}
                    onChange={e => setDistrictCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: MNU"
                    maxLength={5}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Pelatihan</label>
                  <select
                    value={districtStatus}
                    onChange={e => setDistrictStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Ready">Ready</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Koordinator Distrik</label>
                <input
                  type="text"
                  value={districtCoordinator}
                  onChange={e => setDistrictCoordinator(e.target.value)}
                  placeholder="Contoh: Marthen Rumayom, S.Pd."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Guru</label>
                  <input
                    type="number"
                    value={districtTargetTeachers}
                    onChange={e => setDistrictTargetTeachers(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Siswa</label>
                  <input
                    type="number"
                    value={districtTargetStudents}
                    onChange={e => setDistrictTargetStudents(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan / Geografis</label>
                <input
                  type="text"
                  value={districtNotes}
                  onChange={e => setDistrictNotes(e.target.value)}
                  placeholder="Akses transportasi, kondisi wilayah..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDistrictModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-all"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Distrik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH SEKOLAH (MASTER DATA SEKOLAH & JUMLAH SISWA) */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Tambah Sekolah Baru ({regency.name})</span>
              </h3>
              <button
                onClick={() => setShowAddSchoolModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSchool} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Sekolah *</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="Contoh: SD Inpres 02 Amban"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Distrik *</label>
                  <select
                    value={schoolDistrictId}
                    onChange={e => setSchoolDistrictId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>Distrik {d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenjang</label>
                  <select
                    value={schoolLevel}
                    onChange={e => setSchoolLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="SD">SD (Sekolah Dasar)</option>
                    <option value="SMP">SMP (Menengah Pertama)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={schoolPrincipal}
                  onChange={e => setSchoolPrincipal(e.target.value)}
                  placeholder="Contoh: Markus Rumbrawer, S.Pd."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Sekolah</label>
                <input
                  type="text"
                  value={schoolAddress}
                  onChange={e => setSchoolAddress(e.target.value)}
                  placeholder="Jl. Raya Utama No..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <div>
                  <label className="font-bold text-blue-900 block mb-1">Jumlah Siswa Sasaran *</label>
                  <input
                    type="number"
                    value={schoolStudentCount}
                    onChange={e => setSchoolStudentCount(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-blue-900 block mb-1">Jumlah Guru Sasaran *</label>
                  <input
                    type="number"
                    value={schoolTeacherCount}
                    onChange={e => setSchoolTeacherCount(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={schoolNotes}
                  onChange={e => setSchoolNotes(e.target.value)}
                  placeholder="Akreditasi, rujukan kota, dll."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-all"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Sekolah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
