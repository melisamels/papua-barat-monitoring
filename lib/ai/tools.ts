// Papua Barat Monitoring System - AI Server Tools
// Safely executes structured queries against the database without direct unrestricted SQL access (#87)

import {
  getProgramSummary,
  getRegencies,
  getDistricts,
  getTrainings,
  getUpcomingTrainings,
  getAttentionItems,
} from '@/lib/db/queries';
import { formatRupiah, formatDateIndo } from '@/lib/utils/formatters';
import { UserRole } from '@/lib/types';

export const AI_SERVER_TOOLS = {
  get_program_summary: (role: UserRole) => {
    const summary = getProgramSummary();
    const result: any = {
      nama_program: 'Program Pandai Berhitung dengan Metode GASING - Provinsi Papua Barat',
      total_kabupaten: summary.regency_count,
      total_distrik: summary.district_count,
      total_sekolah: summary.school_count,
      total_kegiatan: summary.training_count,
      distribusi_status: summary.status_counts,
      persentase_penyelesaian: `${summary.overall_progress}% (${summary.status_counts.completed} dari ${summary.training_count} kegiatan selesai)`,
      peserta: {
        guru_target: summary.participants.target_teachers,
        guru_terealisasi: summary.participants.actual_teachers,
        guru_persen: `${summary.participants.teacher_rate}%`,
        siswa_target: summary.participants.target_students,
        siswa_terealisasi: summary.participants.actual_students,
        siswa_persen: `${summary.participants.student_rate}%`,
      }
    };

    // Viewer role does not get sensitive internal financial breakdown (#4, #88)
    if (role !== 'viewer') {
      result.keuangan = {
        total_rab: formatRupiah(summary.financial.total_rab),
        total_realisasi: formatRupiah(summary.financial.total_realization),
        sisa_anggaran: formatRupiah(summary.financial.balance),
        persentase_penyerapan: `${summary.financial.absorption_rate}%`,
      };
    }

    return result;
  },

  get_regency_progress: (role: UserRole) => {
    const regencies = getRegencies();
    return regencies.map(r => {
      const item: any = {
        kabupaten: r.name,
        distrik: r.district_count,
        kegiatan: r.training_count,
        progress: `${r.progress}%`,
        status: r.status,
        guru: `${r.actual_teachers} / ${r.target_teachers}`,
        siswa: `${r.actual_students} / ${r.target_students}`,
      };
      if (role !== 'viewer') {
        item.rab = formatRupiah(r.total_rab);
        item.realisasi = formatRupiah(r.total_realization);
      }
      return item;
    });
  },

  get_district_progress: () => {
    const districts = getDistricts();
    return districts.map(d => ({
      kabupaten: d.regency_name,
      distrik: d.name,
      koordinator: d.coordinator,
      target_guru: d.target_teachers,
      target_siswa: d.target_students,
      status: d.status,
    }));
  },

  get_training_status: (statusFilter?: string) => {
    const trainings = getTrainings(statusFilter ? { status: statusFilter } : undefined);
    return trainings.map(t => ({
      id: t.id,
      kabupaten: t.regency_name,
      distrik: t.district_name,
      lokasi: t.venue,
      jadwal: `${formatDateIndo(t.start_date)} s/d ${formatDateIndo(t.end_date)}`,
      status: t.status,
      pic: t.pic,
      progress_aktivitas: `${t.activity_progress}%`,
    }));
  },

  get_budget_summary: (role: UserRole) => {
    if (role === 'viewer') {
      return { error: 'Akses terbatas untuk informasi rincian anggaran' };
    }
    const summary = getProgramSummary();
    const trainings = getTrainings();
    
    // Sort by absorption
    const sorted = [...trainings].sort((a, b) => (b.total_realization || 0) - (a.total_realization || 0));

    return {
      total_rab: formatRupiah(summary.financial.total_rab),
      total_realisasi: formatRupiah(summary.financial.total_realization),
      sisa_anggaran: formatRupiah(summary.financial.balance),
      persentase_penyerapan: `${summary.financial.absorption_rate}%`,
      kabupaten_penyerapan: getRegencies().map(r => ({
        kabupaten: r.name,
        rab: formatRupiah(r.total_rab),
        realisasi: formatRupiah(r.total_realization),
        penyerapan: (r.total_rab || 0) > 0 ? `${Math.round(((r.total_realization || 0) / r.total_rab!) * 100)}%` : '0%',
      })),
      kegiatan_teratas: sorted.slice(0, 5).map(t => ({
        distrik: t.district_name,
        kabupaten: t.regency_name,
        rab: formatRupiah(t.total_rab),
        realisasi: formatRupiah(t.total_realization),
      }))
    };
  },

  get_participant_summary: () => {
    const summary = getProgramSummary();
    return {
      guru: {
        target: summary.participants.target_teachers,
        terealisasi: summary.participants.actual_teachers,
        persentase: `${summary.participants.teacher_rate}%`,
      },
      siswa: {
        target: summary.participants.target_students,
        terealisasi: summary.participants.actual_students,
        persentase: `${summary.participants.student_rate}%`,
      },
      rincian_per_kabupaten: getRegencies().map(r => ({
        kabupaten: r.name,
        guru: `${r.actual_teachers} / ${r.target_teachers}`,
        siswa: `${r.actual_students} / ${r.target_students}`,
      }))
    };
  },

  get_lpj_status: () => {
    const trainings = getTrainings();
    const completedTrainings = trainings.filter(t => t.status === 'Completed');
    const incompleteLpj = completedTrainings.filter(t => (t.lpj_completeness || 0) < 100);

    return {
      total_selesai: completedTrainings.length,
      lpj_lengkap_100: completedTrainings.length - incompleteLpj.length,
      lpj_belum_lengkap: incompleteLpj.map(t => ({
        kabupaten: t.regency_name,
        distrik: t.district_name,
        kelengkapan: `${t.lpj_completeness}%`,
        pic: t.pic,
      }))
    };
  },

  get_documentation_status: () => {
    const trainings = getTrainings();
    const lowDocs = trainings.filter(t => (t.status === 'Completed' || t.status === 'Ongoing') && (t.doc_completeness || 0) < 60);

    return {
      total_kegiatan_aktif: trainings.filter(t => t.status === 'Completed' || t.status === 'Ongoing').length,
      kegiatan_dokumentasi_minim: lowDocs.map(t => ({
        kabupaten: t.regency_name,
        distrik: t.district_name,
        kelengkapan_dokumentasi: `${t.doc_completeness}%`,
      }))
    };
  },

  get_upcoming_trainings: () => {
    const upcoming = getUpcomingTrainings(5);
    return upcoming.map(t => ({
      kabupaten: t.regency_name,
      distrik: t.district_name,
      lokasi: t.venue,
      tanggal_mulai: formatDateIndo(t.start_date),
      tanggal_selesai: formatDateIndo(t.end_date),
      status: t.status,
    }));
  },

  get_attention_items: () => {
    return getAttentionItems();
  }
};
