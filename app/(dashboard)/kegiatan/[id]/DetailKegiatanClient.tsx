'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  actionUpdateTraining,
  actionCreateBudget,
  actionDeleteBudget,
  actionCreateRealization,
  actionDeleteRealization,
  actionToggleLpjChecklist,
  fetchTrainingById,
} from '@/app/actions/data';
import { useApp } from '@/components/providers/AppProvider';
import { getRolePermissions } from '@/lib/auth/session';
import {
  formatRupiah,
  formatDateIndo,
  formatDateTimeIndo,
  getStatusBadgeClass,
  calculateDays,
} from '@/lib/utils/formatters';
import {
  CalendarDays,
  MapPin,
  Building2,
  Users,
  Wallet,
  Receipt,
  FileCheck2,
  Camera,
  FileText,
  History,
  AlertTriangle,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
  X,
  FileDown,
} from 'lucide-react';

interface DetailKegiatanClientProps {
  initialTraining: any;
  categories: any[];
}

export default function DetailKegiatanClient({ initialTraining, categories }: DetailKegiatanClientProps) {
  const { currentUser, showToast } = useApp();
  const perms = getRolePermissions(currentUser.role);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'peserta' | 'sekolah' | 'rab' | 'realisasi' | 'lpj' | 'dokumentasi' | 'dokumen' | 'riwayat'
  >('overview');

  const [training, setTraining] = useState<any>(initialTraining);

  // Modals & form state
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [budgetCatId, setBudgetCatId] = useState(categories[0]?.id || 'cat-1');
  const [budgetDesc, setBudgetDesc] = useState('');
  const [budgetVol, setBudgetVol] = useState(1);
  const [budgetUnit, setBudgetUnit] = useState('Paket');
  const [budgetPrice, setBudgetPrice] = useState(0);

  const [showAddRealization, setShowAddRealization] = useState(false);
  const [realDate, setRealDate] = useState(new Date().toISOString().split('T')[0]);
  const [realCatId, setRealCatId] = useState(categories[0]?.id || 'cat-1');
  const [realDesc, setRealDesc] = useState('');
  const [realVendor, setRealVendor] = useState('');
  const [realVol, setRealVol] = useState(1);
  const [realUnit, setRealUnit] = useState('Porsi');
  const [realPrice, setRealPrice] = useState(0);
  const [realInvoice, setRealInvoice] = useState('');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('Pelatihan');
  const [uploadCaption, setUploadCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Lightbox modal state (#31)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!training) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Kegiatan Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mt-1">ID Pelatihan tidak terdaftar dalam database.</p>
        <Link
          href="/kegiatan"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg"
        >
          <span>Kembali ke Daftar Kegiatan</span>
        </Link>
      </div>
    );
  }

  const badge = getStatusBadgeClass(training.status);
  const duration = calculateDays(training.start_date, training.end_date);
  const variance = (training.total_rab || 0) - (training.total_realization || 0);
  const isOverBudget = variance < 0 && (training.total_rab || 0) > 0;

  const reloadTraining = async () => {
    const updated = await fetchTrainingById(training.id);
    if (updated) setTraining(updated);
  };

  // Handlers
  const handleStatusChange = async (newStatus: any) => {
    try {
      await actionUpdateTraining(training.id, { status: newStatus });
      await reloadTraining();
      showToast(`Status kegiatan diubah menjadi: ${newStatus}`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetDesc.trim() || budgetVol <= 0 || budgetPrice <= 0) {
      showToast('Mohon lengkapi data item RAB dengan benar', 'error');
      return;
    }

    try {
      await actionCreateBudget({
        training_id: training.id,
        category_id: budgetCatId,
        description: budgetDesc.trim(),
        volume: Number(budgetVol),
        unit: budgetUnit.trim(),
        unit_price: Number(budgetPrice),
      });

      setShowAddBudget(false);
      setBudgetDesc('');
      setBudgetPrice(0);
      await reloadTraining();
      showToast('Item RAB berhasil ditambahkan');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteBudget = async (bId: string) => {
    if (confirm('Hapus item RAB ini?')) {
      await actionDeleteBudget(bId);
      await reloadTraining();
      showToast('Item RAB dihapus', 'info');
    }
  };

  const handleAddRealization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realDesc.trim() || realVol <= 0 || realPrice <= 0) {
      showToast('Mohon isi uraian dan nominal realisasi', 'error');
      return;
    }

    try {
      await actionCreateRealization({
        training_id: training.id,
        transaction_date: realDate,
        category_id: realCatId,
        description: realDesc.trim(),
        vendor: realVendor.trim() || 'Vendor Lokal',
        volume: Number(realVol),
        unit: realUnit.trim(),
        unit_price: Number(realPrice),
        invoice_number: realInvoice.trim() || undefined,
        created_by: currentUser.full_name,
      });

      setShowAddRealization(false);
      setRealDesc('');
      setRealVendor('');
      setRealPrice(0);
      await reloadTraining();
      showToast('Realisasi pengeluaran berhasil disimpan');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteRealization = async (rId: string) => {
    if (confirm('Hapus bukti realisasi ini?')) {
      await actionDeleteRealization(rId);
      await reloadTraining();
      showToast('Realisasi dihapus', 'info');
    }
  };

  const handleToggleLpj = async (lpjId: string, currentStatus: boolean) => {
    await actionToggleLpjChecklist(lpjId, !currentStatus);
    await reloadTraining();
    showToast(`Status berkas LPJ diperbarui`);
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Pilih file foto terlebih dahulu', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('module', 'documentation');
    formData.append('training_id', training.id);
    formData.append('regency_id', training.regency_id);
    formData.append('district_id', training.district_id);
    formData.append('category', uploadCategory);
    formData.append('caption', uploadCaption.trim() || selectedFile.name);
    formData.append('uploaded_by', currentUser.full_name);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload gagal');

      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadCaption('');
      await reloadTraining();
      showToast('Dokumentasi foto berhasil diunggah!');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Kegiatan Pelatihan', href: '/kegiatan' },
          { label: `${training.district_name} (${training.regency_name})` },
        ]}
      />

      {/* Central Workspace Header (#68) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {training.regency_name} • Distrik {training.district_name}
              </span>
              <span className="text-[11px] font-mono text-slate-400">({training.id})</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {training.venue}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Program Pandai Berhitung dengan Metode GASING — Penanggung Jawab: <strong className="text-slate-800">{training.pic}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Status Selector (#20) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Status:</span>
              <select
                value={training.status}
                disabled={!perms.canEditTrainings}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer ${badge.bg} ${badge.text} ${badge.border}`}
              >
                <option value="Planning">Planning (25%)</option>
                <option value="Ready">Ready (50%)</option>
                <option value="Ongoing">Ongoing (75%)</option>
                <option value="Completed">Completed (100%)</option>
              </select>
            </div>

            <Link
              href={`/laporan/cetak?kegiatan=${training.id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
            >
              <FileDown className="w-4 h-4 text-emerald-700" />
              <span>Cetak / PDF</span>
            </Link>
          </div>
        </div>

        {/* Warning Banner if Over Budget (#27) */}
        {isOverBudget && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-800 font-medium">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>
              <strong>Peringatan Anggaran:</strong> Realisasi pengeluaran telah melebihi alokasi RAB sebesar{' '}
              <strong className="underline">{formatRupiah(Math.abs(variance))}</strong>.
            </span>
          </div>
        )}
      </div>

      {/* 9 Workspace Tabs (#68) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/70 p-1.5 gap-1 text-xs font-bold">
          {[
            { key: 'overview', label: '1. Overview', icon: CalendarDays },
            { key: 'peserta', label: `2. Peserta (${(training.participants || []).length})`, icon: Users },
            { key: 'sekolah', label: `3. Sekolah (${(training.schools || []).length})`, icon: Building2 },
            { key: 'rab', label: '4. RAB Anggaran', icon: Wallet, hidden: !perms.canViewFinancialBreakdown },
            { key: 'realisasi', label: '5. Realisasi Biaya', icon: Receipt, hidden: !perms.canViewFinancialBreakdown },
            { key: 'lpj', label: `6. LPJ Checklist (${training.lpj_completeness}%)`, icon: FileCheck2 },
            { key: 'dokumentasi', label: `7. Dokumentasi (${(training.documentation || []).length})`, icon: Camera },
            { key: 'dokumen', label: `8. Dokumen Resmi (${(training.documents || []).length})`, icon: FileText },
            { key: 'riwayat', label: '9. Riwayat', icon: History },
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
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
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
          {/* TAB 1: OVERVIEW (#69) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                    Jadwal & Lokasi
                  </span>
                  <div>Venue: <strong className="text-slate-900">{training.venue}</strong></div>
                  <div>Lokasi: <span className="text-slate-700">{training.location}</span></div>
                  <div>Waktu: <strong className="text-slate-900">{formatDateIndo(training.start_date)} - {formatDateIndo(training.end_date)}</strong> ({duration} Hari)</div>
                  <div>PIC: <strong className="text-slate-900">{training.pic}</strong></div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                    Peserta Pelatihan
                  </span>
                  <div>
                    Guru: <strong className="text-slate-900">{training.actual_teachers}</strong> / {training.target_teachers} Orang
                  </div>
                  <div>
                    Siswa: <strong className="text-slate-900">{training.actual_students}</strong> / {training.target_students} Siswa
                  </div>
                  <div className="pt-1 text-[11px] text-emerald-700 font-semibold">
                    Capaian Guru: {training.target_teachers > 0 ? Math.round((training.actual_teachers / training.target_teachers) * 100) : 0}% • Siswa: {training.target_students > 0 ? Math.round((training.actual_students / training.target_students) * 100) : 0}%
                  </div>
                </div>

                {perms.canViewFinancialBreakdown ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                      Keuangan & Kepatuhan
                    </span>
                    <div>Total RAB: <strong className="text-slate-900">{formatRupiah(training.total_rab)}</strong></div>
                    <div>Realisasi: <strong className="text-emerald-700">{formatRupiah(training.total_realization)}</strong></div>
                    <div>Sisa Saldo: <strong className={variance < 0 ? 'text-red-600' : 'text-slate-900'}>{formatRupiah(variance)}</strong></div>
                    <div>Penyerapan: <strong className="text-emerald-700">{training.absorption_rate}%</strong></div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs flex items-center justify-center">
                    Data Keuangan Terbatas
                  </div>
                )}
              </div>

              {/* Data Quality & Compliance Indicators (#73, #106) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-600">Kelengkapan Data Sistem (#73)</span>
                    <span className="text-emerald-700">{training.data_quality}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${training.data_quality}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-600">Kelengkapan LPJ (#106)</span>
                    <span className="text-emerald-700">{training.lpj_completeness}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${training.lpj_completeness}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-600">Kelengkapan Dokumentasi (#106)</span>
                    <span className="text-emerald-700">{training.doc_completeness}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${training.doc_completeness}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PESERTA (#22) */}
          {activeTab === 'peserta' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Daftar Peserta di Kegiatan Ini ({(training.participants || []).length} Orang)
                </h4>
                <Link href="/peserta" className="text-xs font-bold text-emerald-700 hover:underline">
                  Buka Modul Peserta Lengkap →
                </Link>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <tr>
                      <th className="p-3">Nama</th>
                      <th className="p-3 text-center">Tipe</th>
                      <th className="p-3 text-center">L/P</th>
                      <th className="p-3">Asal Sekolah</th>
                      <th className="p-3 text-center">Kehadiran</th>
                      <th className="p-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(training.participants || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          Belum ada peserta yang didaftarkan pada pelatihan ini.
                        </td>
                      </tr>
                    ) : (
                      training.participants.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{p.full_name}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100">
                              {p.participant_type}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold">{p.gender}</td>
                          <td className="p-3">{p.school_name}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {p.attendance_status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{p.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SEKOLAH */}
          {activeTab === 'sekolah' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Sekolah yang Berada di Distrik {training.district_name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(training.schools || []).map((s: any) => (
                  <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                      <span>{s.name}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">{s.school_level}</span>
                    </div>
                    <div className="text-slate-600">Alamat: {s.address}</div>
                    <div className="text-slate-600">Kepala Sekolah: <strong>{s.principal}</strong></div>
                    <div className="pt-2 border-t border-slate-200 text-slate-700 flex justify-between">
                      <span>Guru Peserta: <strong>{s.teacher_participants}</strong></span>
                      <span>Siswa Peserta: <strong>{s.student_participants}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RAB (#23, #24, #25) */}
          {activeTab === 'rab' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Rencana Anggaran Biaya (RAB) Pelatihan
                  </h4>
                  <p className="text-xs text-slate-500">
                    Formula otomatis: <code>Jumlah = Volume × Harga Satuan</code> (#24)
                  </p>
                </div>

                {perms.canEditBudget && (
                  <button
                    onClick={() => setShowAddBudget(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Item RAB</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[11px]">
                    <tr>
                      <th className="p-3 text-center">No</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Uraian Kebutuhan</th>
                      <th className="p-3 text-center">Volume</th>
                      <th className="p-3 text-center">Satuan</th>
                      <th className="p-3 text-right">Harga Satuan</th>
                      <th className="p-3 text-right">Total Biaya</th>
                      {perms.canEditBudget && <th className="p-3 text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {(training.budgets || []).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          Belum ada item anggaran RAB terdaftar.
                        </td>
                      </tr>
                    ) : (
                      training.budgets.map((b: any, idx: number) => (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-semibold text-slate-800">{b.category_name}</td>
                          <td className="p-3 font-medium text-slate-900">{b.description}</td>
                          <td className="p-3 text-center font-bold">{b.volume}</td>
                          <td className="p-3 text-center text-slate-500">{b.unit}</td>
                          <td className="p-3 text-right">{formatRupiah(b.unit_price)}</td>
                          <td className="p-3 text-right font-bold text-slate-900">{formatRupiah(b.total)}</td>
                          {perms.canEditBudget && (
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleDeleteBudget(b.id)}
                                className="text-slate-400 hover:text-red-600 p-1"
                                title="Hapus Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                  {(training.budgets || []).length > 0 && (
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-black text-slate-900 text-xs">
                      <tr>
                        <td colSpan={6} className="p-3 text-right">Grand Total RAB:</td>
                        <td className="p-3 text-right text-emerald-800 text-sm">
                          {formatRupiah(training.total_rab)}
                        </td>
                        {perms.canEditBudget && <td></td>}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: REALISASI (#26, #27) */}
          {activeTab === 'realisasi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Realisasi Anggaran & Bukti Transaksi
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pencatatan nota, kuitansi, invoice, dan bukti transfer untuk pertanggungjawaban LPJ
                  </p>
                </div>

                {perms.canEditRealization && (
                  <button
                    onClick={() => setShowAddRealization(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Catat Realisasi Baru</span>
                  </button>
                )}
              </div>

              {/* Variance Comparison Strip (#27) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total RAB</span>
                  <strong className="text-slate-900 text-sm">{formatRupiah(training.total_rab)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Realisasi</span>
                  <strong className="text-emerald-800 text-sm">{formatRupiah(training.total_realization)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Selisih (Variance)</span>
                  <strong className={`text-sm ${variance < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatRupiah(variance)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Penyerapan</span>
                  <strong className="text-emerald-800 text-sm">{training.absorption_rate}%</strong>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Uraian Transaksi</th>
                      <th className="p-3">Vendor / Penerima</th>
                      <th className="p-3">No Kuitansi</th>
                      <th className="p-3 text-right">Total Biaya</th>
                      {perms.canEditRealization && <th className="p-3 text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {(training.realizations || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Belum ada catatan realisasi transaksi.
                        </td>
                      </tr>
                    ) : (
                      training.realizations.map((r: any) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-800">{formatDateIndo(r.transaction_date)}</td>
                          <td className="p-3">{r.category_name}</td>
                          <td className="p-3 font-bold text-slate-900">{r.description}</td>
                          <td className="p-3 text-slate-600">{r.vendor}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-500">{r.invoice_number || '-'}</td>
                          <td className="p-3 text-right font-bold text-emerald-800">{formatRupiah(r.total)}</td>
                          {perms.canEditRealization && (
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleDeleteRealization(r.id)}
                                className="text-slate-400 hover:text-red-600 p-1"
                                title="Hapus Transaksi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: LPJ (#28, #29) */}
          {activeTab === 'lpj' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Checklist Kelengkapan Berkas LPJ (14 Dokumen Baku)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Status kelengkapan administrasi pertanggungjawaban kegiatan pelatihan
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700">Tingkat Kelengkapan: </span>
                  <span className="text-sm font-black text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded-lg">
                    {training.lpj_completeness}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(training.lpj_checklists || []).map((chk: any, idx: number) => (
                  <div
                    key={chk.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      chk.is_complete
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-xs">{chk.checklist_type}</div>
                        <div className="text-[10px] text-slate-500">{chk.notes || (chk.is_complete ? 'Lengkap & Sah' : 'Menunggu berkas')}</div>
                      </div>
                    </div>

                    {perms.canEditLpj ? (
                      <button
                        onClick={() => handleToggleLpj(chk.id, chk.is_complete)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          chk.is_complete
                            ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {chk.is_complete ? 'Lengkap ✓' : 'Tandai Lengkap'}
                      </button>
                    ) : (
                      <span className={`text-[11px] font-bold ${chk.is_complete ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {chk.is_complete ? 'Lengkap ✓' : 'Belum Lengkap'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: DOKUMENTASI (#30, #31) */}
          {activeTab === 'dokumentasi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Galeri Foto Kegiatan ({(training.documentation || []).length} Foto)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Dokumentasi aktivitas kelas, pelatihan guru, siswa, konsumsi, dan penutupan
                  </p>
                </div>

                {perms.canUploadDocumentation && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Foto Dokumentasi</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(training.documentation || []).length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                    Belum ada foto dokumentasi diunggah untuk kegiatan ini.
                  </div>
                ) : (
                  training.documentation.map((doc: any) => (
                    <div
                      key={doc.id}
                      onClick={() => setLightboxImage(doc.file_url)}
                      className="group bg-slate-50 rounded-xl overflow-hidden border border-slate-200 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="h-44 w-full bg-slate-200 relative overflow-hidden">
                        <img
                          src={doc.file_url}
                          alt={doc.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                          {doc.category}
                        </span>
                      </div>
                      <div className="p-3 text-xs">
                        <div className="font-bold text-slate-900 truncate">{doc.caption}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {formatDateIndo(doc.documentation_date)} • {doc.uploaded_by}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 8: DOKUMEN RESMI (#32) */}
          {activeTab === 'dokumen' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Document Library & Arsip Resmi
                  </h4>
                  <p className="text-xs text-slate-500">
                    Surat tugas, SP2D, BKU, Berita Acara, dan Berkas LPJ Resmi
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <tr>
                      <th className="p-3">Jenis Dokumen</th>
                      <th className="p-3">Judul Berkas</th>
                      <th className="p-3">Tanggal Dokumen</th>
                      <th className="p-3">Pengunggah</th>
                      <th className="p-3 text-center">Unduh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {(training.documents || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          Belum ada arsip dokumen resmi yang diunggah.
                        </td>
                      </tr>
                    ) : (
                      training.documents.map((d: any) => (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-emerald-800">{d.document_type}</td>
                          <td className="p-3 font-semibold text-slate-900">{d.title}</td>
                          <td className="p-3">{formatDateIndo(d.document_date)}</td>
                          <td className="p-3 text-slate-500">{d.uploaded_by}</td>
                          <td className="p-3 text-center">
                            <a
                              href={d.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                            >
                              <span>Buka</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: RIWAYAT / AUDIT (#118) */}
          {activeTab === 'riwayat' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Timeline Riwayat Perubahan Kegiatan Ini
              </h4>

              <div className="space-y-3">
                {(training.history || []).length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Belum ada riwayat tercatat untuk kegiatan ini.
                  </div>
                ) : (
                  training.history.map((h: any) => (
                    <div key={h.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 text-xs bg-slate-50/50">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold shrink-0 mt-0.5">
                        {h.action}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{h.module}</span>
                          <span className="text-[10px] text-slate-400">{formatDateTimeIndo(h.created_at)}</span>
                        </div>
                        <div className="text-slate-600 mt-0.5">{h.new_values || h.old_values || 'Operasi sistem'}</div>
                        <div className="text-[10px] text-slate-400 mt-1">Oleh: {h.user_name || 'System'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Tambah Item RAB (#23) */}
      {showAddBudget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Tambah Item Anggaran RAB</h3>
              <button onClick={() => setShowAddBudget(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBudget} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori Anggaran *</label>
                <select
                  value={budgetCatId}
                  onChange={(e) => setBudgetCatId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Uraian Kebutuhan *</label>
                <input
                  type="text"
                  value={budgetDesc}
                  onChange={(e) => setBudgetDesc(e.target.value)}
                  placeholder="Contoh: Honor Trainer 14 Hari"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Volume</label>
                  <input
                    type="number"
                    min="1"
                    value={budgetVol}
                    onChange={(e) => setBudgetVol(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    value={budgetUnit}
                    onChange={(e) => setBudgetUnit(e.target.value)}
                    placeholder="Porsi, Hari, Kotak"
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Harga Satuan (Rp) *</label>
                <input
                  type="number"
                  min="0"
                  value={budgetPrice}
                  onChange={(e) => setBudgetPrice(Number(e.target.value))}
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
                <p className="text-[11px] text-emerald-700 font-bold mt-1">
                  Subtotal: {formatRupiah(budgetVol * budgetPrice)}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBudget(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Simpan Item RAB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Catat Realisasi Baru (#26) */}
      {showAddRealization && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Catat Realisasi Pengeluaran Baru</h3>
              <button onClick={() => setShowAddRealization(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRealization} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    value={realDate}
                    onChange={(e) => setRealDate(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={realCatId}
                    onChange={(e) => setRealCatId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Uraian Pembayaran *</label>
                <input
                  type="text"
                  value={realDesc}
                  onChange={(e) => setRealDesc(e.target.value)}
                  placeholder="Contoh: Katering konsumsi makan siang termin 1"
                  required
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Penerima / Vendor</label>
                  <input
                    type="text"
                    value={realVendor}
                    onChange={(e) => setRealVendor(e.target.value)}
                    placeholder="CV / Toko / Nama"
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No Kuitansi / Invoice</label>
                  <input
                    type="text"
                    value={realInvoice}
                    onChange={(e) => setRealInvoice(e.target.value)}
                    placeholder="KW-001/2026"
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Volume</label>
                  <input
                    type="number"
                    min="1"
                    value={realVol}
                    onChange={(e) => setRealVol(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    value={realUnit}
                    onChange={(e) => setRealUnit(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={realPrice}
                    onChange={(e) => setRealPrice(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl font-bold text-emerald-800">
                Total Realisasi: {formatRupiah(realVol * realPrice)}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRealization(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Upload Dokumentasi Foto (#31) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Upload Foto Dokumentasi</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadPhoto} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori Dokumentasi</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                >
                  <option value="Persiapan">Persiapan</option>
                  <option value="Pembukaan">Pembukaan</option>
                  <option value="Pelatihan">Pelatihan</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Guru">Guru</option>
                  <option value="Siswa">Siswa</option>
                  <option value="Aktivitas Kelas">Aktivitas Kelas</option>
                  <option value="Konsumsi">Konsumsi</option>
                  <option value="Penutupan">Penutupan</option>
                  <option value="Serah Terima">Serah Terima</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi / Keterangan Foto</label>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Contoh: Siswa sedang berlatih mencongak cepat"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Berkas Foto (JPG, PNG, WEBP)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Unggah Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Lightbox Modal (#31) */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Preview Lightbox"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
