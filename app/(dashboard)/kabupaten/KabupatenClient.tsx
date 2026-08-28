'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useApp } from '@/components/providers/AppProvider';
import { getRolePermissions } from '@/lib/auth/session';
import { formatRupiah, getStatusBadgeClass } from '@/lib/utils/formatters';
import { actionCreateDistrict, actionCreateSchool } from '@/app/actions/data';
import { Regency, TrainingStatus } from '@/lib/types';
import {
  MapPin,
  Search,
  Plus,
  ArrowRight,
  Eye,
  Building,
  GraduationCap,
  X,
} from 'lucide-react';

interface KabupatenClientProps {
  initialRegencies: Regency[];
}

export default function KabupatenClient({ initialRegencies }: KabupatenClientProps) {
  const { currentUser, showToast } = useApp();
  const perms = getRolePermissions(currentUser.role);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regencies, setRegencies] = useState(initialRegencies);

  // Modal states
  const [showAddDistrictModal, setShowAddDistrictModal] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states: Tambah Distrik
  const [selectedRegencyId, setSelectedRegencyId] = useState(initialRegencies[0]?.id || '');
  const [districtName, setDistrictName] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [districtCoordinator, setDistrictCoordinator] = useState('');
  const [districtTargetTeachers, setDistrictTargetTeachers] = useState(30);
  const [districtTargetStudents, setDistrictTargetStudents] = useState(90);
  const [districtStatus, setDistrictStatus] = useState<TrainingStatus>('Planning');

  // Form states: Tambah Sekolah
  const [schoolRegencyId, setSchoolRegencyId] = useState(initialRegencies[0]?.id || '');
  const [schoolName, setSchoolName] = useState('');
  const [schoolLevel, setSchoolLevel] = useState('SD');
  const [schoolPrincipal, setSchoolPrincipal] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolStudentCount, setSchoolStudentCount] = useState(45);
  const [schoolTeacherCount, setSchoolTeacherCount] = useState(15);

  const filtered = regencies.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAddDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!districtName.trim()) {
      showToast('Nama distrik wajib diisi', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      const regId = selectedRegencyId || initialRegencies[0]?.id;
      const newDist = await actionCreateDistrict({
        regency_id: regId,
        name: districtName.trim(),
        code: districtCode.trim() || districtName.substring(0, 3).toUpperCase(),
        coordinator: districtCoordinator.trim() || 'Koordinator Distrik',
        target_teachers: Number(districtTargetTeachers),
        target_students: Number(districtTargetStudents),
        status: districtStatus,
      });

      // Update card count
      setRegencies(prev => prev.map(r => r.id === regId ? { ...r, district_count: (r.district_count || 0) + 1 } : r));
      setShowAddDistrictModal(false);
      setDistrictName('');
      setDistrictCode('');
      setDistrictCoordinator('');
      showToast(`Distrik ${newDist.name} berhasil ditambahkan!`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menambahkan distrik', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      showToast('Nama sekolah wajib diisi', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      const regId = schoolRegencyId || initialRegencies[0]?.id;
      const newSch = await actionCreateSchool({
        regency_id: regId,
        district_id: `dis-${regId}-01`,
        name: schoolName.trim(),
        school_level: schoolLevel,
        principal: schoolPrincipal.trim() || undefined,
        address: schoolAddress.trim() || undefined,
        teacher_participants: Number(schoolTeacherCount),
        student_participants: Number(schoolStudentCount),
      });

      // Update card count
      setRegencies(prev => prev.map(r => r.id === regId ? { ...r, school_count: (r.school_count || 0) + 1 } : r));
      setShowAddSchoolModal(false);
      setSchoolName('');
      setSchoolPrincipal('');
      setSchoolAddress('');
      showToast(`Sekolah ${newSch.name} berhasil ditambahkan!`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menambahkan sekolah', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Master Wilayah Kabupaten' }]} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-700" />
            <span>Master Data Kabupaten</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar kabupaten sasaran Program Pandai Berhitung dengan Metode GASING di Provinsi Papua Barat
          </p>
        </div>

        {perms.canEditMasterData && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kabupaten atau kode..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-3 py-2 cursor-pointer focus:bg-white"
        >
          <option value="">Semua Status</option>
          <option value="Completed">Completed (Selesai)</option>
          <option value="Ongoing">Ongoing (Berjalan)</option>
          <option value="Ready">Ready (Siap)</option>
          <option value="Planning">Planning (Perencanaan)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(r => {
          const badge = getStatusBadgeClass(r.status || 'Planning');
          return (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      KODE: {r.code}
                    </span>
                    <h3 className="font-black text-lg text-slate-900 mt-0.5">{r.name}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {r.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block flex items-center gap-1">
                      <Building className="w-3 h-3 text-emerald-700" /> Distrik
                    </span>
                    <span className="text-base font-black text-slate-800 mt-1 block">{r.district_count}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-emerald-700" /> Sekolah
                    </span>
                    <span className="text-base font-black text-slate-800 mt-1 block">{r.school_count}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Guru:</span>
                    <span className="font-bold text-slate-800">{r.actual_teachers} / {r.target_teachers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Siswa:</span>
                    <span className="font-bold text-slate-800">{r.actual_students} / {r.target_students}</span>
                  </div>
                  {perms.canViewFinancialBreakdown && (
                    <div className="flex justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-500">Realisasi Anggaran:</span>
                      <span className="font-bold text-emerald-800">{formatRupiah(r.total_realization)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Progress: <strong className="text-emerald-700">{r.progress}%</strong>
                </span>
                <Link
                  href={`/kabupaten/${r.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-slate-200 hover:border-emerald-200 transition-all shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail Wilayah</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: TAMBAH DISTRIK */}
      {showAddDistrictModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-700" />
                <span>Tambah Distrik Baru</span>
              </h3>
              <button onClick={() => setShowAddDistrictModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDistrict} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kabupaten *</label>
                <select
                  value={selectedRegencyId}
                  onChange={e => setSelectedRegencyId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {regencies.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Distrik *</label>
                <input
                  type="text"
                  value={districtName}
                  onChange={e => setDistrictName(e.target.value)}
                  placeholder="Contoh: Manokwari Timur"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Distrik</label>
                  <input
                    type="text"
                    value={districtCode}
                    onChange={e => setDistrictCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: MTI"
                    maxLength={5}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
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
                <label className="font-bold text-slate-700 block mb-1">Koordinator Distrik</label>
                <input
                  type="text"
                  value={districtCoordinator}
                  onChange={e => setDistrictCoordinator(e.target.value)}
                  placeholder="Nama koordinator distrik..."
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

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddDistrictModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-xs">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Distrik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH SEKOLAH */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Tambah Sekolah Baru</span>
              </h3>
              <button onClick={() => setShowAddSchoolModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSchool} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kabupaten *</label>
                <select
                  value={schoolRegencyId}
                  onChange={e => setSchoolRegencyId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {regencies.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Sekolah *</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="Contoh: SD Negeri 05 Manokwari"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenjang</label>
                  <select
                    value={schoolLevel}
                    onChange={e => setSchoolLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kepala Sekolah</label>
                  <input
                    type="text"
                    value={schoolPrincipal}
                    onChange={e => setSchoolPrincipal(e.target.value)}
                    placeholder="Nama Kepsek..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <div>
                  <label className="font-bold text-blue-900 block mb-1">Jumlah Siswa *</label>
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
                  <label className="font-bold text-blue-900 block mb-1">Jumlah Guru *</label>
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

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddSchoolModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-xs">
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
