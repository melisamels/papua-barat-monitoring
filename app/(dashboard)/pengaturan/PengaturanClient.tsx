'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { actionUpdateSystemSettings } from '@/app/actions/data';
import { useApp } from '@/components/providers/AppProvider';
import { SystemSettings } from '@/lib/types';
import { Settings, Save, Building, FileText, Bell } from 'lucide-react';

interface PengaturanClientProps {
  initialSettings: SystemSettings;
}

export default function PengaturanClient({ initialSettings }: PengaturanClientProps) {
  const { showToast } = useApp();

  const [systemName, setSystemName] = useState(initialSettings.system_name);
  const [programName, setProgramName] = useState(initialSettings.program_name);
  const [institutionName, setInstitutionName] = useState(initialSettings.institution_name);
  const [provinceName, setProvinceName] = useState(initialSettings.province_name);
  const [signatoryName, setSignatoryName] = useState(initialSettings.report_signatory_name);
  const [signatoryTitle, setSignatoryTitle] = useState(initialSettings.report_signatory_title);
  const [reportFooter, setReportFooter] = useState(initialSettings.report_footer);
  const [remindersEnabled, setRemindersEnabled] = useState(initialSettings.reminders_enabled);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await actionUpdateSystemSettings({
      system_name: systemName,
      program_name: programName,
      institution_name: institutionName,
      province_name: provinceName,
      report_signatory_name: signatoryName,
      report_signatory_title: signatoryTitle,
      report_footer: reportFooter,
      reminders_enabled: remindersEnabled,
    });
    showToast('Pengaturan sistem dan pelaporan berhasil disimpan!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: 'Pengaturan Sistem' }]} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-700" />
            <span>Pengaturan Sistem & Format Pelaporan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi identitas program, penandatangan resmi laporan dinas, dan pengingat
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Organisasi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-700" />
            <span>1. Identitas Program & Organisasi</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Aplikasi Sistem</label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Program Pelatihan</label>
              <input
                type="text"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Instansi</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Provinsi</label>
              <input
                type="text"
                value={provinceName}
                onChange={(e) => setProvinceName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Reporting (#84, #111) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>2. Format Dokumen Laporan & Penandatangan</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Pejabat Penandatangan</label>
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Jabatan Pejabat</label>
              <input
                type="text"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Catatan Kaki (Footer Laporan)</label>
              <input
                type="text"
                value={reportFooter}
                onChange={(e) => setReportFooter(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Pengingat Notifikasi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-700" />
            <span>3. Pengingat & Reminder Otomatis</span>
          </h3>

          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <div className="font-bold text-slate-800">Aktifkan Pengingat Jadwal & Warning LPJ</div>
              <div className="text-slate-500">Notifikasi otomatis pada H-30, H-14, H-7, dan keterlambatan realisasi</div>
            </div>
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
              className="w-5 h-5 accent-emerald-700 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
