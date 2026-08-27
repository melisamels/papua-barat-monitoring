'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { actionCreateTraining } from '@/app/actions/data';
import { useApp } from '@/components/providers/AppProvider';
import { validateTrainingInput } from '@/lib/utils/validations';
import { Regency, District } from '@/lib/types';
import {
  CalendarDays,
  ArrowLeft,
  Save,
  Building,
  MapPin,
  Calendar,
  Users,
} from 'lucide-react';

interface TambahKegiatanClientProps {
  regencies: Regency[];
  allDistricts: District[];
}

export default function TambahKegiatanClient({ regencies, allDistricts }: TambahKegiatanClientProps) {
  const router = useRouter();
  const { showToast } = useApp();

  // Form states (#61)
  const [regencyId, setRegencyId] = useState(regencies[0]?.id || '');
  const [districtId, setDistrictId] = useState('');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pic, setPic] = useState('');
  const [targetTeachers, setTargetTeachers] = useState(30);
  const [targetStudents, setTargetStudents] = useState(90);
  const [status, setStatus] = useState<'Planning' | 'Ready' | 'Ongoing' | 'Completed'>('Planning');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter districts belonging to selected regency
  const availableDistricts = useMemo(() => {
    return allDistricts.filter(d => d.regency_id === regencyId);
  }, [allDistricts, regencyId]);

  // Set default district when regency changes
  React.useEffect(() => {
    if (availableDistricts.length > 0 && (!districtId || !availableDistricts.some(d => d.id === districtId))) {
      setDistrictId(availableDistricts[0].id);
    }
  }, [availableDistricts, districtId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateTrainingInput({
      regency_id: regencyId,
      district_id: districtId,
      venue,
      start_date: startDate,
      end_date: endDate,
      target_teachers: targetTeachers,
      target_students: targetStudents,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast('Mohon lengkapi formulir dengan benar', 'error');
      return;
    }

    try {
      const createdId = await actionCreateTraining({
        regency_id: regencyId,
        district_id: districtId,
        venue: venue.trim(),
        location: location.trim() || venue.trim(),
        start_date: startDate,
        end_date: endDate,
        pic: pic.trim() || 'Koordinator Distrik',
        target_teachers: Number(targetTeachers),
        target_students: Number(targetStudents),
        status,
        notes: notes.trim() || undefined,
      });

      showToast(`Kegiatan berhasil dibuat`);
      router.push(`/kegiatan/${createdId}`);
    } catch (err: any) {
      showToast(err.message || 'Gagal membuat kegiatan', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Kegiatan Pelatihan', href: '/kegiatan' },
          { label: 'Tambah Kegiatan Baru' },
        ]}
      />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-700" />
            <span>Tambah Kegiatan Pelatihan Baru</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Program Pandai Berhitung dengan Metode GASING — Provinsi Papua Barat
          </p>
        </div>

        <Link
          href="/kegiatan"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Batal</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Informasi Wilayah (#61) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-700" />
            <span>1. Informasi Wilayah</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Kabupaten *</label>
              <select
                value={regencyId}
                onChange={(e) => setRegencyId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-600"
              >
                {regencies.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Distrik Pelatihan *</label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-600"
              >
                {availableDistricts.length === 0 ? (
                  <option value="">Tidak ada distrik</option>
                ) : (
                  availableDistricts.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.coordinator})</option>
                  ))
                )}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">1 distrik hanya memiliki 1 kegiatan utama pelatihan</p>
            </div>
          </div>
        </div>

        {/* Section 2: Venue & Lokasi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>2. Lokasi & Venue Pelatihan</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Gedung / Venue *</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Contoh: Aula Dinas Pendidikan / Gedung PKK"
                required
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-600"
              />
              {errors.venue && <p className="text-red-600 text-[11px] mt-1">{errors.venue}</p>}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Alamat / Lokasi Singkat</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Jl. Merdeka No. 10, Wasior"
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Jadwal Pelatihan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>3. Jadwal & Penanggung Jawab</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tanggal Mulai *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tanggal Selesai *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
              {errors.end_date && <p className="text-red-600 text-[11px] mt-1">{errors.end_date}</p>}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">PIC / Koordinator</label>
              <input
                type="text"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Nama penanggung jawab kegiatan"
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Target Peserta */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>4. Target Peserta & Status</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Guru</label>
              <input
                type="number"
                min="0"
                value={targetTeachers}
                onChange={(e) => setTargetTeachers(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Siswa</label>
              <input
                type="number"
                min="0"
                value={targetStudents}
                onChange={(e) => setTargetStudents(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Status Kegiatan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="Planning">Planning (25%)</option>
                <option value="Ready">Ready (50%)</option>
                <option value="Ongoing">Ongoing (75%)</option>
                <option value="Completed">Completed (100%)</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan persiapan logistik, transportasi laut/darat, atau kebutuhan khusus..."
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/kegiatan"
            className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 text-xs"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Kegiatan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
