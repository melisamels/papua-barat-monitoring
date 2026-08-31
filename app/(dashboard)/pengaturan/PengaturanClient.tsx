'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { actionUpdateSystemSettings, actionSyncRegencyData } from '@/app/actions/data';
import { useApp } from '@/components/providers/AppProvider';
import { SystemSettings } from '@/lib/types';
import { Settings, Save, Building, FileText, Bell, Database, Download, Upload } from 'lucide-react';

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

  const handleExportData = () => {
    try {
      const regencyIds = ['reg-mkw', 'reg-mansel', 'reg-pegarfak', 'reg-bintuni', 'reg-wondama', 'reg-fakfak', 'reg-kaimana'];
      const regencyData: Record<string, any> = {};

      for (const id of regencyIds) {
        const saved = localStorage.getItem(`papua_regency_custom_v1_${id}`);
        if (saved) {
          try {
            regencyData[id] = JSON.parse(saved);
          } catch {
            // ignore
          }
        }
      }

      const backupObj = {
        app: 'papua-barat-monitoring',
        version: '1.0',
        timestamp: new Date().toISOString(),
        regency_data: regencyData,
      };

      const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cadangan_gasing_papua_barat_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Cadangan data berhasil diunduh!');
    } catch (e: any) {
      showToast('Gagal mengekspor data: ' + e.message, 'error');
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.app !== 'papua-barat-monitoring' || !parsed.regency_data) {
          throw new Error('Berkas cadangan tidak valid.');
        }

        const dataMap = parsed.regency_data;
        const regencyIds = Object.keys(dataMap);
        let count = 0;

        for (const id of regencyIds) {
          const item = dataMap[id];
          if (item && item.is_customized) {
            localStorage.setItem(`papua_regency_custom_v1_${id}`, JSON.stringify(item));
            
            // Sync with serverless backend
            await actionSyncRegencyData(id, {
              districts: item.districts || [],
              schools: item.schools || [],
              trainings: item.trainings || [],
              participants: item.participants || [],
              budgets: item.budgets || [],
              realizations: item.realizations || [],
            });
            count++;
          }
        }

        showToast(`Berhasil memulihkan ${count} data wilayah! Mengalihkan ke dashboard...`);
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } catch (err: any) {
        showToast('Gagal mengimpor data: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  };

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

        {/* Section 4: Cadangan & Pemulihan Data */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-700" />
            <span>4. Cadangan & Pemulihan Data (Backup & Restore)</span>
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">
            Gunakan fitur ini untuk memindahkan data antar laptop/perangkat atau mengamankan data Anda dari reset server otomatis di layanan cloud (seperti Vercel). Ekspor cadangan ke file JSON, lalu impor kembali di browser mana pun untuk sinkronisasi instan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex flex-col justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Unduh Cadangan Data</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Unduh seluruh perubahan riil (distrik, sekolah, kegiatan, peserta, RAB, dan realisasi) yang telah Anda lakukan ke dalam satu file cadangan (.json).
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File Cadangan (.json)</span>
              </button>
            </div>

            <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex flex-col justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-700" />
                  <span>Puluhkan dari Cadangan</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Pilih file cadangan (.json) yang telah Anda unduh sebelumnya untuk memulihkan seluruh data dan menyinkronkan server seketika.
                </p>
              </div>
              <label className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih & Unggah File Cadangan</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
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
