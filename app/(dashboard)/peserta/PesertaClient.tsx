'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { actionCreateParticipant, actionBatchCreateParticipants, fetchParticipants } from '@/app/actions/data';
import { useApp } from '@/components/providers/AppProvider';
import { getRolePermissions } from '@/lib/auth/session';
import { Participant, ParticipantType, School } from '@/lib/types';
import { getMergedParticipants, getMergedSchools } from '@/lib/utils/customStorageSync';
import {
  Users,
  Search,
  Plus,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  X,
} from 'lucide-react';

interface PesertaClientProps {
  initialParticipants: Participant[];
  schools: School[];
}

export default function PesertaClient({ initialParticipants, schools }: PesertaClientProps) {
  const { currentUser, showToast } = useApp();
  const perms = getRolePermissions(currentUser.role);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'guru' | 'siswa'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form State for Single Participant
  const [fullName, setFullName] = useState('');
  const [pType, setPType] = useState<ParticipantType>('guru');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [schoolId, setSchoolId] = useState(schools[0]?.id || 'sch-01');
  const [className, setClassName] = useState('Kelas 4');
  const [notes, setNotes] = useState('');

  // Import Preview State (#22)
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvRawText, setCsvRawText] = useState('');

  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [activeSchools, setActiveSchools] = useState<School[]>(schools);

  React.useEffect(() => {
    const sync = () => {
      setParticipants(getMergedParticipants(initialParticipants));
      setActiveSchools(getMergedSchools(schools));
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, [initialParticipants, schools]);

  const filtered = participants.filter(p => {
    const matchSearch = p.full_name.toLowerCase().includes(search.toLowerCase()) || (p.school_name || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || p.participant_type === typeFilter;
    return matchSearch && matchType;
  });

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Nama peserta wajib diisi', 'error');
      return;
    }

    try {
      const targetTrainingId = 'TRN-MKW-001';
      const newId = await actionCreateParticipant({
        training_id: targetTrainingId,
        school_id: schoolId,
        participant_type: pType,
        full_name: fullName.trim(),
        gender,
        class_name: pType === 'siswa' ? className : undefined,
        attendance_status: 'Hadir',
        notes: notes.trim() || undefined,
      });

      const school = schools.find(s => s.id === schoolId);
      const newParticipant: Participant = {
        id: newId,
        training_id: targetTrainingId,
        school_id: schoolId,
        school_name: school?.name,
        participant_type: pType,
        full_name: fullName.trim(),
        gender,
        class_name: pType === 'siswa' ? className : undefined,
        attendance_status: 'Hadir',
        notes: notes.trim() || undefined,
        created_at: new Date().toISOString(),
      };

      setParticipants(prev => [newParticipant, ...prev]);
      setShowAddModal(false);
      setFullName('');
      setNotes('');
      showToast(`Peserta berhasil ditambahkan: ${fullName.trim()}`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Mock CSV text import parser
  const handleParseCsv = () => {
    if (!csvRawText.trim()) return;
    const lines = csvRawText.trim().split('\n');
    const parsed = lines.slice(1).map((line, idx) => {
      const parts = line.split(',').map(s => s.trim());
      return {
        id: `import-${idx}`,
        full_name: parts[0] || 'Nama Peserta',
        participant_type: (parts[1]?.toLowerCase() === 'guru' ? 'guru' : 'siswa') as ParticipantType,
        gender: (parts[2]?.toUpperCase() === 'P' ? 'P' : 'L') as 'L' | 'P',
        school_id: schoolId,
        school_name: schools.find(s => s.id === schoolId)?.name || 'Sekolah Terpilih',
        class_name: parts[3] || 'Kelas 4',
      };
    });
    setCsvPreview(parsed);
  };

  const handleCommitImport = async () => {
    if (csvPreview.length === 0) return;

    try {
      const count = await actionBatchCreateParticipants(
        csvPreview.map(p => ({
          training_id: 'TRN-MKW-001',
          school_id: p.school_id,
          participant_type: p.participant_type,
          full_name: p.full_name,
          gender: p.gender,
          class_name: p.class_name,
          attendance_status: 'Hadir',
        }))
      );

      const refreshed = await fetchParticipants();
      setParticipants(refreshed);
      setShowImportModal(false);
      setCsvPreview([]);
      setCsvRawText('');
      showToast(`Berhasil mengimpor ${count} data peserta!`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Master Peserta GASING' }]} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-700" />
            <span>Peserta Pelatihan (Guru & Siswa)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Database peserta Program GASING Papua Barat — Dilengkapi import Excel/CSV & verifikasi data
          </p>
        </div>

        {perms.canEditMasterData && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Import CSV / Excel</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Peserta</span>
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
            placeholder="Cari nama peserta atau nama sekolah..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="flex gap-1.5">
          {(['all', 'guru', 'siswa'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === t
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? 'Semua Peserta' : t === 'guru' ? 'Guru' : 'Siswa'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-3 text-center">Tipe</th>
                <th className="py-3.5 px-3 text-center">L/P</th>
                <th className="py-3.5 px-4">Asal Sekolah</th>
                <th className="py-3.5 px-3 text-center">Kehadiran</th>
                <th className="py-3.5 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.full_name}</td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.participant_type === 'guru'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {p.participant_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold">{p.gender}</td>
                  <td className="py-3.5 px-4 text-slate-800">{p.school_name}</td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {p.attendance_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{p.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Tambah Peserta Tunggal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Tambah Peserta Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddParticipant} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Barnabas Wondiwoy"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipe Peserta</label>
                  <select
                    value={pType}
                    onChange={(e) => setPType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  >
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Asal Sekolah *</label>
                <select
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                >
                  {activeSchools.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.school_level})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Keterangan pendukung"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Simpan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Import CSV dengan Preview Modal (#22) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Import Data Peserta (CSV / Text)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Format: Nama, Tipe (Guru/Siswa), Gender (L/P), Kelas</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Sekolah Asal Peserta Import:</label>
                <select
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.school_level})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tempel (Paste) Konten CSV atau Teks Peserta:
                </label>
                <textarea
                  rows={5}
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  placeholder={`Nama,Tipe,Gender,Kelas\nYohanes Mandacan,Guru,L,Guru Matematika\nEster Rumkorem,Guru,P,Guru Kelas\nLukas Dowansiba,Siswa,L,Kelas 4\nMaria Mansim,Siswa,P,Kelas 5`}
                  className="w-full p-2.5 font-mono text-[11px] border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParseCsv}
                  className="px-4 py-1.5 bg-slate-800 text-white font-bold text-xs rounded-xl"
                >
                  Pratinjau Data CSV (Preview)
                </button>
              </div>

              {/* Data Preview Table (#22) */}
              {csvPreview.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 text-xs">
                      Pratinjau Data Siap Import ({csvPreview.length} Baris):
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 font-bold text-slate-600">
                        <tr>
                          <th className="p-2">Nama</th>
                          <th className="p-2 text-center">Tipe</th>
                          <th className="p-2 text-center">Gender</th>
                          <th className="p-2">Kelas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {csvPreview.map((p, i) => (
                          <tr key={i}>
                            <td className="p-2 font-bold">{p.full_name}</td>
                            <td className="p-2 text-center">{p.participant_type}</td>
                            <td className="p-2 text-center">{p.gender}</td>
                            <td className="p-2">{p.class_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={csvPreview.length === 0}
                onClick={handleCommitImport}
                className="px-5 py-2 bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold hover:bg-emerald-800"
              >
                Simpan & Import ke Database ({csvPreview.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
