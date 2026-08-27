import React from 'react';
import { getProgramSummary, getTrainings, getSystemSettings, getRegencies } from '@/lib/db/queries';
import { formatRupiah, formatDateIndo, formatDateTimeIndo } from '@/lib/utils/formatters';
import PrintControls from '@/components/print/PrintControls';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LaporanCetakPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = (params.type as string) || 'keseluruhan';
  const year = (params.year as string) || '2026';
  const regencyParam = (params.regency as string) || (params.kabupaten as string) || '';
  const statusParam = (params.status as string) || '';
  const trainingParam = (params.kegiatan as string) || '';

  const settings = getSystemSettings();
  const trainings = getTrainings();
  const regencies = getRegencies();

  const summary = getProgramSummary({
    fiscal_year: Number(year),
    regency_id: regencyParam || null,
  });

  const filteredTrainings = trainings.filter(t => {
    const matchReg = !regencyParam || t.regency_id === regencyParam;
    const matchStatus = !statusParam || t.status === statusParam;
    const matchTraining = !trainingParam || t.id === trainingParam;
    return matchReg && matchStatus && matchTraining;
  });

  const getReportTitle = () => {
    switch (type) {
      case 'kegiatan': return 'LAPORAN REALISASI PER KEGIATAN';
      case 'kabupaten': return 'LAPORAN PELAKSANAAN PER KABUPATEN';
      case 'bulanan': return 'LAPORAN MONITORING BULANAN PROGRAM';
      case 'tahunan': return 'LAPORAN TAHUNAN EVALUASI PROGRAM';
      case 'keseluruhan':
      default:
        return 'LAPORAN EKSEKUTIF KESELURUHAN PROGRAM';
    }
  };

  return (
    <div className="bg-white min-h-screen p-8 text-black print:p-0 font-serif">
      {/* Print Controls - Hidden on Print (#76) */}
      <PrintControls />

      {/* Official Government Header (#44) */}
      <div className="border-b-4 border-double border-black pb-4 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center font-black text-xl">
            PB
          </div>
          <div>
            <h1 className="text-base font-bold uppercase tracking-wide">
              PEMERINTAH PROVINSI PAPUA BARAT
            </h1>
            <h2 className="text-lg font-black uppercase tracking-wider">
              {settings.institution_name}
            </h2>
            <p className="text-xs italic font-sans text-slate-700">
              Jalan Abraham O. Atururi, Perkantoran Pemprov Papua Barat, Arfai - Manokwari
            </p>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-black">
          <h3 className="text-sm font-black uppercase tracking-wider underline">
            {getReportTitle()}
          </h3>
          <p className="text-xs font-bold font-sans mt-0.5">
            {settings.program_name} — TAHUN ANGGARAN {year}
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="my-6 p-4 border border-black grid grid-cols-4 gap-2 text-center text-xs font-sans">
        <div>
          <div className="text-[10px] text-slate-600 uppercase font-bold">Total Kegiatan</div>
          <div className="text-sm font-black">{filteredTrainings.length} Distrik</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-600 uppercase font-bold">Kegiatan Selesai</div>
          <div className="text-sm font-black">{summary.status_counts.completed} ({summary.overall_progress}%)</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-600 uppercase font-bold">Guru Terlatih</div>
          <div className="text-sm font-black">{summary.participants.actual_teachers} / {summary.participants.target_teachers}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-600 uppercase font-bold">Siswa Terlatih</div>
          <div className="text-sm font-black">{summary.participants.actual_students} / {summary.participants.target_students}</div>
        </div>
      </div>

      {/* Main Table (#44) */}
      <div className="my-6">
        <table className="w-full text-left text-xs border-collapse border border-black font-sans">
          <thead>
            <tr className="bg-slate-100 border-b border-black text-center font-bold text-[10px] uppercase">
              <th className="p-2 border border-black w-10">No</th>
              <th className="p-2 border border-black">Kabupaten</th>
              <th className="p-2 border border-black">Distrik</th>
              <th className="p-2 border border-black">Venue Pelatihan</th>
              <th className="p-2 border border-black">Jadwal Pelaksanaan</th>
              <th className="p-2 border border-black text-center">Status</th>
              <th className="p-2 border border-black text-right">RAB (Rp)</th>
              <th className="p-2 border border-black text-right">Realisasi (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrainings.map((t, idx) => (
              <tr key={t.id} className="border-b border-black">
                <td className="p-2 border border-black text-center">{idx + 1}</td>
                <td className="p-2 border border-black font-bold">{t.regency_name}</td>
                <td className="p-2 border border-black">{t.district_name}</td>
                <td className="p-2 border border-black">{t.venue}</td>
                <td className="p-2 border border-black text-[11px] whitespace-nowrap">
                  {formatDateIndo(t.start_date)} - {formatDateIndo(t.end_date)}
                </td>
                <td className="p-2 border border-black text-center font-bold text-[10px]">{t.status}</td>
                <td className="p-2 border border-black text-right">{formatRupiah(t.total_rab)}</td>
                <td className="p-2 border border-black text-right font-bold">{formatRupiah(t.total_realization)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold border-t-2 border-black bg-slate-100">
              <td colSpan={6} className="p-2 border border-black text-right">Total Akumulasi:</td>
              <td className="p-2 border border-black text-right">{formatRupiah(summary.financial.total_rab)}</td>
              <td className="p-2 border border-black text-right font-black">{formatRupiah(summary.financial.total_realization)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Signature Section (#111) */}
      <div className="mt-12 flex justify-end text-xs font-sans pr-8">
        <div className="text-center space-y-16">
          <div>
            <p>Manokwari, {formatDateIndo(new Date())}</p>
            <p className="font-bold mt-1">Mengetahui,</p>
            <p>{settings.report_signatory_title}</p>
          </div>
          <div>
            <p className="font-black underline text-sm tracking-wide">
              {settings.report_signatory_name}
            </p>
            <p className="text-[10px] text-slate-600">NIP. 19680512 199403 1 005</p>
          </div>
        </div>
      </div>

      {/* Footer (#44) */}
      <div className="mt-16 pt-3 border-t border-black text-[10px] text-slate-500 flex justify-between font-sans">
        <span>{settings.report_footer}</span>
        <span>Dicetak pada: {formatDateTimeIndo(new Date())}</span>
      </div>
    </div>
  );
}
