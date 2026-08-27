'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useApp } from '@/components/providers/AppProvider';
import { getRolePermissions } from '@/lib/auth/session';
import { formatRupiah, formatDateIndo, getStatusBadgeClass } from '@/lib/utils/formatters';
import {
  actionCreateDistrict,
  actionUpdateDistrict,
  actionDeleteDistrict,
  actionCreateSchool,
  actionUpdateSchool,
  actionDeleteSchool,
  actionUpdateTraining,
  actionDeleteTraining,
  actionCreateParticipant,
  actionUpdateParticipant,
  actionDeleteParticipant,
  actionCreateBudget,
  actionUpdateBudget,
  actionDeleteBudget,
  actionCreateRealization,
  actionUpdateRealization,
  actionDeleteRealization,
} from '@/app/actions/data';
import { District, School, Training, Participant, Budget, Realization, BudgetCategory, TrainingStatus } from '@/lib/types';
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
  Pencil,
  Trash2,
  Search,
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

  // Master Data Local States
  const [districts, setDistricts] = useState<District[]>(regency?.districts || []);
  const [schools, setSchools] = useState<School[]>(regency?.schools || []);
  const [trainings, setTrainings] = useState<Training[]>(regency?.trainings || []);
  const [participants, setParticipants] = useState<Participant[]>(regency?.participants || []);
  const [budgets, setBudgets] = useState<Budget[]>(regency?.budgets || []);
  const [realizations, setRealizations] = useState<Realization[]>(regency?.realizations || []);
  const budgetCategories: BudgetCategory[] = regency?.budgetCategories || [];
  const documentation = regency?.documentation || [];

  // Filter & Search states
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantTypeFilter, setParticipantTypeFilter] = useState('');

  // Modals & Editing states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Distrik Modals
  const [showAddDistrictModal, setShowAddDistrictModal] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [districtForm, setDistrictForm] = useState({
    name: '',
    code: '',
    coordinator: '',
    target_teachers: 30,
    target_students: 90,
    status: 'Planning' as TrainingStatus,
    notes: '',
  });

  // 2. Sekolah Modals
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [schoolForm, setSchoolForm] = useState({
    district_id: districts[0]?.id || '',
    name: '',
    school_level: 'SD',
    principal: '',
    address: '',
    teacher_participants: 15,
    student_participants: 45,
    notes: '',
  });

  // 3. Kegiatan Modals
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [trainingForm, setTrainingForm] = useState({
    venue: '',
    location: '',
    start_date: '',
    end_date: '',
    pic: '',
    target_teachers: 30,
    target_students: 90,
    status: 'Planning' as TrainingStatus,
    notes: '',
  });

  // 4. Peserta Modals
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [participantForm, setParticipantForm] = useState({
    training_id: trainings[0]?.id || '',
    school_id: schools[0]?.id || '',
    participant_type: 'guru' as 'guru' | 'siswa',
    full_name: '',
    gender: 'L' as 'L' | 'P',
    class_name: '',
    attendance_status: 'Hadir' as 'Hadir' | 'Izin' | 'Sakit' | 'Alpa',
    notes: '',
  });

  // 5. RAB Modals
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetForm, setBudgetForm] = useState({
    training_id: trainings[0]?.id || '',
    category_id: budgetCategories[0]?.id || 'cat-1',
    description: '',
    volume: 1,
    unit: 'Paket',
    unit_price: 1000000,
    notes: '',
  });

  // 6. Realisasi Modals
  const [showAddRealizationModal, setShowAddRealizationModal] = useState(false);
  const [editingRealization, setEditingRealization] = useState<Realization | null>(null);
  const [realizationForm, setRealizationForm] = useState({
    training_id: trainings[0]?.id || '',
    transaction_date: new Date().toISOString().split('T')[0],
    category_id: budgetCategories[0]?.id || 'cat-1',
    description: '',
    vendor: '',
    invoice_number: '',
    volume: 1,
    unit: 'Paket',
    unit_price: 1000000,
    notes: '',
  });

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
  const currentTotalRab = budgets.reduce((acc, b) => acc + (b.total || 0), 0);
  const currentTotalRealization = realizations.reduce((acc, r) => acc + (r.total || 0), 0);

  // ==========================================
  // 1. HANDLERS: DISTRIK (Add, Edit, Delete)
  // ==========================================
  const handleSaveDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!districtForm.name.trim()) return showToast('Nama distrik wajib diisi', 'error');

    try {
      setIsSubmitting(true);
      if (editingDistrict) {
        const updated = await actionUpdateDistrict(editingDistrict.id, {
          name: districtForm.name.trim(),
          code: districtForm.code.trim().toUpperCase(),
          coordinator: districtForm.coordinator.trim(),
          target_teachers: Number(districtForm.target_teachers),
          target_students: Number(districtForm.target_students),
          status: districtForm.status,
          notes: districtForm.notes.trim() || undefined,
        });
        setDistricts(prev => prev.map(d => d.id === editingDistrict.id ? { ...d, ...updated } : d));
        setEditingDistrict(null);
        showToast(`Distrik ${districtForm.name} berhasil diperbarui!`);
      } else {
        const created = await actionCreateDistrict({
          regency_id: regency.id,
          name: districtForm.name.trim(),
          code: districtForm.code.trim() || districtForm.name.substring(0, 3).toUpperCase(),
          coordinator: districtForm.coordinator.trim() || 'Koordinator Distrik',
          target_teachers: Number(districtForm.target_teachers),
          target_students: Number(districtForm.target_students),
          status: districtForm.status,
          notes: districtForm.notes.trim() || undefined,
        });
        setDistricts(prev => [created, ...prev]);
        setShowAddDistrictModal(false);
        showToast(`Distrik ${created.name} berhasil ditambahkan!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan distrik', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDistrict = async (d: District) => {
    if (!confirm(`Hapus distrik "${d.name}"? Seluruh data yang terkait akan terhapus.`)) return;
    try {
      await actionDeleteDistrict(d.id);
      setDistricts(prev => prev.filter(item => item.id !== d.id));
      showToast(`Distrik ${d.name} berhasil dihapus.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus distrik', 'error');
    }
  };

  // ==========================================
  // 2. HANDLERS: SEKOLAH (Add, Edit, Delete)
  // ==========================================
  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name.trim()) return showToast('Nama sekolah wajib diisi', 'error');
    const targetDistrictId = schoolForm.district_id || districts[0]?.id;
    if (!targetDistrictId) return showToast('Pilih distrik terlebih dahulu', 'error');

    try {
      setIsSubmitting(true);
      if (editingSchool) {
        const updated = await actionUpdateSchool(editingSchool.id, {
          district_id: targetDistrictId,
          name: schoolForm.name.trim(),
          school_level: schoolForm.school_level,
          principal: schoolForm.principal.trim() || '-',
          address: schoolForm.address.trim() || '-',
          teacher_participants: Number(schoolForm.teacher_participants),
          student_participants: Number(schoolForm.student_participants),
          notes: schoolForm.notes.trim() || undefined,
        });
        setSchools(prev => prev.map(s => s.id === editingSchool.id ? { ...s, ...updated } : s));
        setEditingSchool(null);
        showToast(`Sekolah ${schoolForm.name} berhasil diperbarui!`);
      } else {
        const created = await actionCreateSchool({
          regency_id: regency.id,
          district_id: targetDistrictId,
          name: schoolForm.name.trim(),
          school_level: schoolForm.school_level,
          principal: schoolForm.principal.trim() || undefined,
          address: schoolForm.address.trim() || undefined,
          teacher_participants: Number(schoolForm.teacher_participants),
          student_participants: Number(schoolForm.student_participants),
          notes: schoolForm.notes.trim() || undefined,
        });
        setSchools(prev => [created, ...prev]);
        setShowAddSchoolModal(false);
        showToast(`Sekolah ${created.name} berhasil ditambahkan!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan sekolah', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchool = async (s: School) => {
    if (!confirm(`Hapus sekolah "${s.name}"?`)) return;
    try {
      await actionDeleteSchool(s.id);
      setSchools(prev => prev.filter(item => item.id !== s.id));
      showToast(`Sekolah ${s.name} berhasil dihapus.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus sekolah', 'error');
    }
  };

  // ==========================================
  // 3. HANDLERS: KEGIATAN (Edit, Delete)
  // ==========================================
  const handleSaveTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTraining) return;
    try {
      setIsSubmitting(true);
      await actionUpdateTraining(editingTraining.id, {
        venue: trainingForm.venue.trim(),
        location: trainingForm.location.trim() || trainingForm.venue.trim(),
        start_date: trainingForm.start_date,
        end_date: trainingForm.end_date,
        pic: trainingForm.pic.trim(),
        target_teachers: Number(trainingForm.target_teachers),
        target_students: Number(trainingForm.target_students),
        status: trainingForm.status,
        notes: trainingForm.notes.trim() || undefined,
      });
      setTrainings(prev => prev.map(t => t.id === editingTraining.id ? { ...t, ...trainingForm } : t));
      setEditingTraining(null);
      showToast(`Kegiatan ${trainingForm.venue} berhasil diperbarui!`);
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui kegiatan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTraining = async (t: Training) => {
    if (!confirm(`Hapus kegiatan di "${t.venue}"? Seluruh RAB, realisasi, dan data LPJ terkait akan dihapus.`)) return;
    try {
      await actionDeleteTraining(t.id);
      setTrainings(prev => prev.filter(item => item.id !== t.id));
      showToast(`Kegiatan ${t.venue} berhasil dihapus.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus kegiatan', 'error');
    }
  };

  // ==========================================
  // 4. HANDLERS: PESERTA (Add, Edit, Delete)
  // ==========================================
  const handleSaveParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantForm.full_name.trim()) return showToast('Nama peserta wajib diisi', 'error');
    try {
      setIsSubmitting(true);
      if (editingParticipant) {
        const updated = await actionUpdateParticipant(editingParticipant.id, {
          full_name: participantForm.full_name.trim(),
          participant_type: participantForm.participant_type,
          gender: participantForm.gender,
          class_name: participantForm.class_name.trim() || undefined,
          attendance_status: participantForm.attendance_status,
          notes: participantForm.notes.trim() || undefined,
        });
        setParticipants(prev => prev.map(p => p.id === editingParticipant.id ? { ...p, ...updated } : p));
        setEditingParticipant(null);
        showToast(`Peserta ${participantForm.full_name} berhasil diperbarui!`);
      } else {
        const targetTrainingId = participantForm.training_id || trainings[0]?.id || 'TRN-MKW-001';
        const targetSchoolId = participantForm.school_id || schools[0]?.id || 'sch-01';
        const newId = await actionCreateParticipant({
          training_id: targetTrainingId,
          school_id: targetSchoolId,
          participant_type: participantForm.participant_type,
          full_name: participantForm.full_name.trim(),
          gender: participantForm.gender,
          class_name: participantForm.class_name.trim() || undefined,
          attendance_status: participantForm.attendance_status,
          notes: participantForm.notes.trim() || undefined,
        });
        const schoolObj = schools.find(s => s.id === targetSchoolId);
        const newPart: Participant = {
          id: newId,
          training_id: targetTrainingId,
          school_id: targetSchoolId,
          school_name: schoolObj?.name,
          participant_type: participantForm.participant_type,
          full_name: participantForm.full_name.trim(),
          gender: participantForm.gender,
          class_name: participantForm.class_name.trim() || undefined,
          attendance_status: participantForm.attendance_status,
          notes: participantForm.notes.trim() || undefined,
          created_at: new Date().toISOString(),
        };
        setParticipants(prev => [newPart, ...prev]);
        setShowAddParticipantModal(false);
        showToast(`Peserta ${participantForm.full_name} berhasil ditambahkan!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan peserta', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteParticipant = async (p: Participant) => {
    if (!confirm(`Hapus peserta "${p.full_name}"?`)) return;
    try {
      await actionDeleteParticipant(p.id);
      setParticipants(prev => prev.filter(item => item.id !== p.id));
      showToast(`Peserta ${p.full_name} berhasil dihapus.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus peserta', 'error');
    }
  };

  // ==========================================
  // 5. HANDLERS: RAB (Add, Edit, Delete)
  // ==========================================
  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetForm.description.trim()) return showToast('Deskripsi anggaran wajib diisi', 'error');
    const total = Number(budgetForm.volume) * Number(budgetForm.unit_price);
    try {
      setIsSubmitting(true);
      if (editingBudget) {
        const cat = budgetCategories.find(c => c.id === budgetForm.category_id);
        const updated = await actionUpdateBudget(editingBudget.id, {
          category_id: budgetForm.category_id,
          category_name: cat?.name || '',
          description: budgetForm.description.trim(),
          volume: Number(budgetForm.volume),
          unit: budgetForm.unit.trim(),
          unit_price: Number(budgetForm.unit_price),
          total,
          notes: budgetForm.notes.trim() || undefined,
        });
        setBudgets(prev => prev.map(b => b.id === editingBudget.id ? { ...b, ...updated } : b));
        setEditingBudget(null);
        showToast(`Item RAB berhasil diperbarui!`);
      } else {
        const targetTrainingId = budgetForm.training_id || trainings[0]?.id || 'TRN-MKW-001';
        const newId = await actionCreateBudget({
          training_id: targetTrainingId,
          category_id: budgetForm.category_id,
          description: budgetForm.description.trim(),
          volume: Number(budgetForm.volume),
          unit: budgetForm.unit.trim(),
          unit_price: Number(budgetForm.unit_price),
          notes: budgetForm.notes.trim() || undefined,
        });
        const cat = budgetCategories.find(c => c.id === budgetForm.category_id);
        const newBgt: Budget = {
          id: newId,
          training_id: targetTrainingId,
          fiscal_year: 2026,
          category_id: budgetForm.category_id,
          category_name: cat?.name || '',
          description: budgetForm.description.trim(),
          volume: Number(budgetForm.volume),
          unit: budgetForm.unit.trim(),
          unit_price: Number(budgetForm.unit_price),
          total,
          notes: budgetForm.notes.trim() || undefined,
          created_at: new Date().toISOString(),
        };
        setBudgets(prev => [newBgt, ...prev]);
        setShowAddBudgetModal(false);
        showToast(`Item RAB berhasil ditambahkan!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan RAB', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (b: Budget) => {
    if (!confirm(`Hapus item anggaran "${b.description}"?`)) return;
    try {
      await actionDeleteBudget(b.id);
      setBudgets(prev => prev.filter(item => item.id !== b.id));
      showToast(`Item RAB berhasil dihapus.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus item RAB', 'error');
    }
  };

  // ==========================================
  // 6. HANDLERS: REALISASI (Add, Edit, Delete)
  // ==========================================
  const handleSaveRealization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realizationForm.description.trim()) return showToast('Deskripsi belanja wajib diisi', 'error');
    const total = Number(realizationForm.volume) * Number(realizationForm.unit_price);
    try {
      setIsSubmitting(true);
      if (editingRealization) {
        const cat = budgetCategories.find(c => c.id === realizationForm.category_id);
        const updated = await actionUpdateRealization(editingRealization.id, {
          transaction_date: realizationForm.transaction_date,
          category_id: realizationForm.category_id,
          category_name: cat?.name || '',
          description: realizationForm.description.trim(),
          vendor: realizationForm.vendor.trim() || '-',
          invoice_number: realizationForm.invoice_number.trim() || '-',
          volume: Number(realizationForm.volume),
          unit: realizationForm.unit.trim(),
          unit_price: Number(realizationForm.unit_price),
          total,
          notes: realizationForm.notes.trim() || undefined,
        });
        setRealizations(prev => prev.map(r => r.id === editingRealization.id ? { ...r, ...updated } : r));
        setEditingRealization(null);
        showToast(`Item realisasi berhasil diperbarui!`);
      } else {
        const targetTrainingId = realizationForm.training_id || trainings[0]?.id || 'TRN-MKW-001';
        const newId = await actionCreateRealization({
          training_id: targetTrainingId,
          transaction_date: realizationForm.transaction_date,
          category_id: realizationForm.category_id,
          description: realizationForm.description.trim(),
          vendor: realizationForm.vendor.trim() || 'Vendor Lokal',
          invoice_number: realizationForm.invoice_number.trim() || '-',
          volume: Number(realizationForm.volume),
          unit: realizationForm.unit.trim(),
          unit_price: Number(realizationForm.unit_price),
          notes: realizationForm.notes.trim() || undefined,
        });
        const cat = budgetCategories.find(c => c.id === realizationForm.category_id);
        const newRlz: Realization = {
          id: newId,
          training_id: targetTrainingId,
          transaction_date: realizationForm.transaction_date,
          category_id: realizationForm.category_id,
          category_name: cat?.name || '',
          description: realizationForm.description.trim(),
          vendor: realizationForm.vendor.trim() || 'Vendor Lokal',
          volume: Number(realizationForm.volume),
          unit: realizationForm.unit.trim(),
          unit_price: Number(realizationForm.unit_price),
          total,
          invoice_number: realizationForm.invoice_number.trim() || '-',
          notes: realizationForm.notes.trim() || undefined,
          created_by: currentUser.full_name,
          created_at: new Date().toISOString(),
        };
        setRealizations(prev => [newRlz, ...prev]);
        setShowAddRealizationModal(false);
        showToast(`Realisasi berhasil dicatat!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan realisasi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRealization = async (r: Realization) => {
    if (!confirm(`Hapus catatan realisasi "${r.description}"?`)) return;
    try {
      await actionDeleteRealization(r.id);
      setRealizations(prev => prev.filter(item => item.id !== r.id));
      showToast(`Item realisasi berhasil dihapus.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus realisasi', 'error');
    }
  };

  // Filtered Participants
  const filteredParticipants = participants.filter(p => {
    const matchSearch = p.full_name.toLowerCase().includes(participantSearch.toLowerCase()) || (p.school_name || '').toLowerCase().includes(participantSearch.toLowerCase());
    const matchType = !participantTypeFilter || p.participant_type === participantTypeFilter;
    return matchSearch && matchType;
  });

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
            onClick={() => {
              setDistrictForm({ name: '', code: '', coordinator: '', target_teachers: 30, target_students: 90, status: 'Planning', notes: '' });
              setShowAddDistrictModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Distrik</span>
          </button>
          <button
            onClick={() => {
              setSchoolForm({ district_id: districts[0]?.id || '', name: '', school_level: 'SD', principal: '', address: '', teacher_participants: 15, student_participants: 45, notes: '' });
              setShowAddSchoolModal(true);
            }}
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
            { key: 'peserta', label: `5. Rekap Peserta (${participants.length})`, icon: Users },
            { key: 'rab', label: `6. RAB (${budgets.length})`, icon: Wallet, hidden: !perms.canViewFinancialBreakdown },
            { key: 'realisasi', label: `7. Realisasi (${realizations.length})`, icon: Receipt, hidden: !perms.canViewFinancialBreakdown },
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
                  <span className="text-xs text-emerald-700 font-semibold">{trainings.length} Kegiatan</span>
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
                      <strong className="text-base">{formatRupiah(currentTotalRab)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Realisasi</span>
                      <strong className="text-base text-emerald-400">{formatRupiah(currentTotalRealization)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sisa Anggaran</span>
                      <strong className="text-base text-amber-300">{formatRupiah(currentTotalRab - currentTotalRealization)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tingkat Penyerapan</span>
                      <strong className="text-base">
                        {currentTotalRab > 0 ? Math.round((currentTotalRealization / currentTotalRab) * 100) : 0}%
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DISTRIK (CRUD DISTRIK) */}
          {activeTab === 'distrik' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Daftar Distrik di {regency.name} ({districts.length})
                  </h4>
                  <p className="text-xs text-slate-500">Edit, kelola status, dan hapus master data distrik</p>
                </div>
                <button
                  onClick={() => {
                    setDistrictForm({ name: '', code: '', coordinator: '', target_teachers: 30, target_students: 90, status: 'Planning', notes: '' });
                    setShowAddDistrictModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Distrik</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {districts.map(d => (
                  <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="text-sm">Distrik {d.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">Kode: {d.code}</span>
                        <button
                          onClick={() => {
                            setEditingDistrict(d);
                            setDistrictForm({
                              name: d.name,
                              code: d.code,
                              coordinator: d.coordinator,
                              target_teachers: d.target_teachers || 30,
                              target_students: d.target_students || 90,
                              status: d.status,
                              notes: d.notes || '',
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                          title="Edit Distrik"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDistrict(d)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus Distrik"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-slate-600">Koordinator: <strong className="text-slate-800">{d.coordinator}</strong></div>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
                      <span>Target Guru: <strong className="text-slate-800">{d.target_teachers}</strong> Org</span>
                      <span>Target Siswa: <strong className="text-slate-800">{d.target_students}</strong> Siswa</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SEKOLAH (CRUD SEKOLAH) */}
          {activeTab === 'sekolah' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Daftar Sekolah & Master Siswa ({schools.length})
                  </h4>
                  <p className="text-xs text-slate-500">Edit data sekolah, jenjang, kepala sekolah, dan jumlah siswa</p>
                </div>
                <button
                  onClick={() => {
                    setSchoolForm({ district_id: districts[0]?.id || '', name: '', school_level: 'SD', principal: '', address: '', teacher_participants: 15, student_participants: 45, notes: '' });
                    setShowAddSchoolModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Sekolah</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {schools.map(s => (
                  <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="text-sm">{s.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-100">{s.school_level}</span>
                        <button
                          onClick={() => {
                            setEditingSchool(s);
                            setSchoolForm({
                              district_id: s.district_id,
                              name: s.name,
                              school_level: s.school_level,
                              principal: s.principal || '',
                              address: s.address || '',
                              teacher_participants: s.teacher_participants || 15,
                              student_participants: s.student_participants || 45,
                              notes: s.notes || '',
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Sekolah"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchool(s)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus Sekolah"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-slate-600">Distrik: <strong className="text-slate-800">{s.district_name || '-'}</strong></div>
                    <div className="text-slate-600">Kepala Sekolah: <strong className="text-slate-800">{s.principal || '-'}</strong></div>
                    {s.address && <div className="text-slate-500 text-[11px] truncate">Alamat: {s.address}</div>}

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
            </div>
          )}

          {/* TAB 4: KEGIATAN (CRUD KEGIATAN) */}
          {activeTab === 'kegiatan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Kegiatan Pelatihan di Wilayah Ini ({trainings.length})
                  </h4>
                  <p className="text-xs text-slate-500">Edit jadwal, lokasi pelatihan, atau hapus kegiatan</p>
                </div>
                <Link
                  href="/kegiatan/baru"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kegiatan Baru</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {trainings.map((t: any) => (
                  <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="text-sm">{t.venue}</span>
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100">{t.status}</span>
                        <button
                          onClick={() => {
                            setEditingTraining(t);
                            setTrainingForm({
                              venue: t.venue,
                              location: t.location || t.venue,
                              start_date: t.start_date,
                              end_date: t.end_date,
                              pic: t.pic || '',
                              target_teachers: t.target_teachers || 30,
                              target_students: t.target_students || 90,
                              status: t.status,
                              notes: t.notes || '',
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                          title="Edit Kegiatan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTraining(t)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus Kegiatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-slate-600">Distrik: <strong>{t.district_name}</strong> • PIC: <strong>{t.pic}</strong></div>
                    <div className="text-slate-600">Jadwal: {formatDateIndo(t.start_date)} - {formatDateIndo(t.end_date)}</div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-emerald-700 font-bold">{formatRupiah(t.total_realization || 0)}</span>
                      <Link href={`/kegiatan/${t.id}`} className="text-emerald-700 font-bold hover:underline">
                        Buka Workspace →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: REKAP PESERTA (CRUD PESERTA) */}
          {activeTab === 'peserta' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Rekapitulasi & Master Peserta ({participants.length})
                  </h4>
                  <p className="text-xs text-slate-500">Kelola, edit profil guru/siswa, dan hapus peserta pelatihan</p>
                </div>
                <button
                  onClick={() => {
                    setParticipantForm({
                      training_id: trainings[0]?.id || '',
                      school_id: schools[0]?.id || '',
                      participant_type: 'guru',
                      full_name: '',
                      gender: 'L',
                      class_name: '',
                      attendance_status: 'Hadir',
                      notes: '',
                    });
                    setShowAddParticipantModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Peserta</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={e => setParticipantSearch(e.target.value)}
                    placeholder="Cari nama peserta / sekolah..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <select
                  value={participantTypeFilter}
                  onChange={e => setParticipantTypeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Semua Peran</option>
                  <option value="guru">Guru</option>
                  <option value="siswa">Siswa</option>
                </select>
              </div>

              {filteredParticipants.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Tidak ada peserta yang cocok dengan pencarian.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Nama Lengkap</th>
                        <th className="p-3">Peran</th>
                        <th className="p-3">Gender</th>
                        <th className="p-3">Asal Sekolah</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredParticipants.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold text-slate-900">{p.full_name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.participant_type === 'guru' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {p.participant_type.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">{p.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                          <td className="p-3 text-slate-600">{p.school_name || '-'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                              {p.attendance_status || 'Hadir'}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingParticipant(p);
                                setParticipantForm({
                                  training_id: p.training_id,
                                  school_id: p.school_id,
                                  participant_type: p.participant_type,
                                  full_name: p.full_name,
                                  gender: p.gender,
                                  class_name: p.class_name || '',
                                  attendance_status: (p.attendance_status as any) || 'Hadir',
                                  notes: p.notes || '',
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded inline-block"
                              title="Edit Peserta"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteParticipant(p)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded inline-block"
                              title="Hapus Peserta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: RAB (CRUD RAB) */}
          {activeTab === 'rab' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Rencana Anggaran Biaya (RAB) ({budgets.length} Item)
                  </h4>
                  <p className="text-xs text-slate-500">Total RAB: <strong className="text-emerald-700">{formatRupiah(currentTotalRab)}</strong></p>
                </div>
                <button
                  onClick={() => {
                    setBudgetForm({
                      training_id: trainings[0]?.id || '',
                      category_id: budgetCategories[0]?.id || 'cat-1',
                      description: '',
                      volume: 1,
                      unit: 'Paket',
                      unit_price: 1000000,
                      notes: '',
                    });
                    setShowAddBudgetModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Item RAB</span>
                </button>
              </div>

              {budgets.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Belum ada item anggaran (RAB) untuk kabupaten ini.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Uraian / Deskripsi</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Volume</th>
                        <th className="p-3">Harga Satuan</th>
                        <th className="p-3">Total Biaya</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {budgets.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold text-slate-900">{b.description}</td>
                          <td className="p-3 text-slate-600">{b.category_name || '-'}</td>
                          <td className="p-3">{b.volume} {b.unit}</td>
                          <td className="p-3">{formatRupiah(b.unit_price)}</td>
                          <td className="p-3 font-bold text-emerald-800">{formatRupiah(b.total)}</td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingBudget(b);
                                setBudgetForm({
                                  training_id: b.training_id,
                                  category_id: b.category_id,
                                  description: b.description,
                                  volume: b.volume,
                                  unit: b.unit,
                                  unit_price: b.unit_price,
                                  notes: b.notes || '',
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded inline-block"
                              title="Edit RAB"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBudget(b)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded inline-block"
                              title="Hapus RAB"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: REALISASI (CRUD REALISASI) */}
          {activeTab === 'realisasi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Realisasi Belanja & Pengeluaran ({realizations.length} Item)
                  </h4>
                  <p className="text-xs text-slate-500">Total Realisasi: <strong className="text-emerald-700">{formatRupiah(currentTotalRealization)}</strong></p>
                </div>
                <button
                  onClick={() => {
                    setRealizationForm({
                      training_id: trainings[0]?.id || '',
                      transaction_date: new Date().toISOString().split('T')[0],
                      category_id: budgetCategories[0]?.id || 'cat-1',
                      description: '',
                      vendor: '',
                      invoice_number: '',
                      volume: 1,
                      unit: 'Paket',
                      unit_price: 1000000,
                      notes: '',
                    });
                    setShowAddRealizationModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Catat Realisasi Baru</span>
                </button>
              </div>

              {realizations.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Belum ada catatan realisasi belanja untuk kabupaten ini.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Uraian / Vendor</th>
                        <th className="p-3">No. Bukti / Kuitansi</th>
                        <th className="p-3">Volume</th>
                        <th className="p-3">Total Belanja</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {realizations.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50/80">
                          <td className="p-3 text-slate-500 whitespace-nowrap">{formatDateIndo(r.transaction_date)}</td>
                          <td className="p-3 font-bold text-slate-900">
                            <div>{r.description}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{r.vendor}</div>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">{r.invoice_number}</td>
                          <td className="p-3">{r.volume} {r.unit}</td>
                          <td className="p-3 font-bold text-emerald-800">{formatRupiah(r.total)}</td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingRealization(r);
                                setRealizationForm({
                                  training_id: r.training_id,
                                  transaction_date: r.transaction_date,
                                  category_id: r.category_id,
                                  description: r.description,
                                  vendor: r.vendor,
                                  invoice_number: r.invoice_number || '',
                                  volume: r.volume,
                                  unit: r.unit,
                                  unit_price: r.unit_price,
                                  notes: r.notes || '',
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded inline-block"
                              title="Edit Realisasi"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRealization(r)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded inline-block"
                              title="Hapus Realisasi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

      {/* ========================================================= */}
      {/* MODAL 1: TAMBAH / EDIT DISTRIK                            */}
      {/* ========================================================= */}
      {(showAddDistrictModal || editingDistrict) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>{editingDistrict ? `Edit Distrik ${editingDistrict.name}` : `Tambah Distrik Baru (${regency.name})`}</span>
              </h3>
              <button onClick={() => { setShowAddDistrictModal(false); setEditingDistrict(null); }} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveDistrict} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Distrik *</label>
                <input
                  type="text"
                  value={districtForm.name}
                  onChange={e => setDistrictForm({ ...districtForm, name: e.target.value })}
                  placeholder="Nama distrik..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Distrik</label>
                  <input
                    type="text"
                    value={districtForm.code}
                    onChange={e => setDistrictForm({ ...districtForm, code: e.target.value.toUpperCase() })}
                    placeholder="Contoh: MNU"
                    maxLength={5}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={districtForm.status}
                    onChange={e => setDistrictForm({ ...districtForm, status: e.target.value as any })}
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
                <label className="font-bold text-slate-700 block mb-1">Nama Koordinator</label>
                <input
                  type="text"
                  value={districtForm.coordinator}
                  onChange={e => setDistrictForm({ ...districtForm, coordinator: e.target.value })}
                  placeholder="Koordinator Distrik..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Guru</label>
                  <input
                    type="number"
                    value={districtForm.target_teachers}
                    onChange={e => setDistrictForm({ ...districtForm, target_teachers: Number(e.target.value) })}
                    min={1}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Siswa</label>
                  <input
                    type="number"
                    value={districtForm.target_students}
                    onChange={e => setDistrictForm({ ...districtForm, target_students: Number(e.target.value) })}
                    min={1}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => { setShowAddDistrictModal(false); setEditingDistrict(null); }} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600">
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

      {/* ========================================================= */}
      {/* MODAL 2: TAMBAH / EDIT SEKOLAH                            */}
      {/* ========================================================= */}
      {(showAddSchoolModal || editingSchool) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>{editingSchool ? `Edit ${editingSchool.name}` : `Tambah Sekolah Baru`}</span>
              </h3>
              <button onClick={() => { setShowAddSchoolModal(false); setEditingSchool(null); }} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveSchool} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Sekolah *</label>
                <input
                  type="text"
                  value={schoolForm.name}
                  onChange={e => setSchoolForm({ ...schoolForm, name: e.target.value })}
                  placeholder="Contoh: SD YPPK Santo Paulus"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Distrik *</label>
                  <select
                    value={schoolForm.district_id}
                    onChange={e => setSchoolForm({ ...schoolForm, district_id: e.target.value })}
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
                    value={schoolForm.school_level}
                    onChange={e => setSchoolForm({ ...schoolForm, school_level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kepala Sekolah</label>
                <input
                  type="text"
                  value={schoolForm.principal}
                  onChange={e => setSchoolForm({ ...schoolForm, principal: e.target.value })}
                  placeholder="Nama Kepsek..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <div>
                  <label className="font-bold text-blue-900 block mb-1">Jumlah Siswa *</label>
                  <input
                    type="number"
                    value={schoolForm.student_participants}
                    onChange={e => setSchoolForm({ ...schoolForm, student_participants: Number(e.target.value) })}
                    min={1}
                    required
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-blue-900 block mb-1">Jumlah Guru *</label>
                  <input
                    type="number"
                    value={schoolForm.teacher_participants}
                    onChange={e => setSchoolForm({ ...schoolForm, teacher_participants: Number(e.target.value) })}
                    min={1}
                    required
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg font-bold"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => { setShowAddSchoolModal(false); setEditingSchool(null); }} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600">
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

      {/* ========================================================= */}
      {/* MODAL 3: EDIT KEGIATAN                                    */}
      {/* ========================================================= */}
      {editingTraining && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-700" />
                <span>Edit Kegiatan Pelatihan</span>
              </h3>
              <button onClick={() => setEditingTraining(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveTraining} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Tempat / Venue *</label>
                <input
                  type="text"
                  value={trainingForm.venue}
                  onChange={e => setTrainingForm({ ...trainingForm, venue: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={trainingForm.start_date}
                    onChange={e => setTrainingForm({ ...trainingForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={trainingForm.end_date}
                    onChange={e => setTrainingForm({ ...trainingForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PIC Pelaksana</label>
                  <input
                    type="text"
                    value={trainingForm.pic}
                    onChange={e => setTrainingForm({ ...trainingForm, pic: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Kegiatan</label>
                  <select
                    value={trainingForm.status}
                    onChange={e => setTrainingForm({ ...trainingForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Ready">Ready</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setEditingTraining(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-xs">
                  {isSubmitting ? 'Menyimpan...' : 'Perbarui Kegiatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: TAMBAH / EDIT PESERTA                            */}
      {/* ========================================================= */}
      {(showAddParticipantModal || editingParticipant) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>{editingParticipant ? `Edit Peserta ${editingParticipant.full_name}` : `Tambah Peserta Baru`}</span>
              </h3>
              <button onClick={() => { setShowAddParticipantModal(false); setEditingParticipant(null); }} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveParticipant} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={participantForm.full_name}
                  onChange={e => setParticipantForm({ ...participantForm, full_name: e.target.value })}
                  placeholder="Nama peserta..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Peran Peserta</label>
                  <select
                    value={participantForm.participant_type}
                    onChange={e => setParticipantForm({ ...participantForm, participant_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select
                    value={participantForm.gender}
                    onChange={e => setParticipantForm({ ...participantForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Asal Sekolah</label>
                <select
                  value={participantForm.school_id}
                  onChange={e => setParticipantForm({ ...participantForm, school_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.district_name})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelas (Khusus Siswa)</label>
                  <input
                    type="text"
                    value={participantForm.class_name}
                    onChange={e => setParticipantForm({ ...participantForm, class_name: e.target.value })}
                    placeholder="Contoh: Kelas 4"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kehadiran</label>
                  <select
                    value={participantForm.attendance_status}
                    onChange={e => setParticipantForm({ ...participantForm, attendance_status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpa">Alpa</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => { setShowAddParticipantModal(false); setEditingParticipant(null); }} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-xs">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Peserta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: TAMBAH / EDIT RAB                                */}
      {/* ========================================================= */}
      {(showAddBudgetModal || editingBudget) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-700" />
                <span>{editingBudget ? `Edit Anggaran RAB` : `Tambah Item Anggaran (RAB)`}</span>
              </h3>
              <button onClick={() => { setShowAddBudgetModal(false); setEditingBudget(null); }} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveBudget} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Uraian / Deskripsi Pengeluaran *</label>
                <input
                  type="text"
                  value={budgetForm.description}
                  onChange={e => setBudgetForm({ ...budgetForm, description: e.target.value })}
                  placeholder="Contoh: Modul Pelatihan GASING..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={budgetForm.category_id}
                    onChange={e => setBudgetForm({ ...budgetForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {budgetCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    value={budgetForm.unit}
                    onChange={e => setBudgetForm({ ...budgetForm, unit: e.target.value })}
                    placeholder="Paket / Kamar / Org"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Volume</label>
                  <input
                    type="number"
                    value={budgetForm.volume}
                    onChange={e => setBudgetForm({ ...budgetForm, volume: Number(e.target.value) })}
                    min={1}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    value={budgetForm.unit_price}
                    onChange={e => setBudgetForm({ ...budgetForm, unit_price: Number(e.target.value) })}
                    min={0}
                    step={1000}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl font-bold flex justify-between">
                <span>Subtotal Estimasi:</span>
                <span>{formatRupiah(Number(budgetForm.volume) * Number(budgetForm.unit_price))}</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => { setShowAddBudgetModal(false); setEditingBudget(null); }} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-xs">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan RAB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: TAMBAH / EDIT REALISASI                          */}
      {/* ========================================================= */}
      {(showAddRealizationModal || editingRealization) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>{editingRealization ? `Edit Catatan Realisasi` : `Catat Realisasi Belanja Baru`}</span>
              </h3>
              <button onClick={() => { setShowAddRealizationModal(false); setEditingRealization(null); }} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveRealization} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Uraian Transaksi *</label>
                <input
                  type="text"
                  value={realizationForm.description}
                  onChange={e => setRealizationForm({ ...realizationForm, description: e.target.value })}
                  placeholder="Contoh: Pembayaran katering 14 hari..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={realizationForm.transaction_date}
                    onChange={e => setRealizationForm({ ...realizationForm, transaction_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={realizationForm.category_id}
                    onChange={e => setRealizationForm({ ...realizationForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {budgetCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Vendor / Toko</label>
                  <input
                    type="text"
                    value={realizationForm.vendor}
                    onChange={e => setRealizationForm({ ...realizationForm, vendor: e.target.value })}
                    placeholder="CV Mandiri..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Kuitansi / Invoice</label>
                  <input
                    type="text"
                    value={realizationForm.invoice_number}
                    onChange={e => setRealizationForm({ ...realizationForm, invoice_number: e.target.value })}
                    placeholder="KW-001/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Volume</label>
                  <input
                    type="number"
                    value={realizationForm.volume}
                    onChange={e => setRealizationForm({ ...realizationForm, volume: Number(e.target.value) })}
                    min={1}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    value={realizationForm.unit_price}
                    onChange={e => setRealizationForm({ ...realizationForm, unit_price: Number(e.target.value) })}
                    min={0}
                    step={1000}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl font-bold flex justify-between">
                <span>Total Belanja:</span>
                <span>{formatRupiah(Number(realizationForm.volume) * Number(realizationForm.unit_price))}</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => { setShowAddRealizationModal(false); setEditingRealization(null); }} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-xs">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Realisasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
