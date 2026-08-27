// Papua Barat Monitoring System - Validation Utilities
// Indonesian Error Messages for Form Validation

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateTrainingInput(data: {
  regency_id?: string;
  district_id?: string;
  venue?: string;
  start_date?: string;
  end_date?: string;
  target_teachers?: number;
  target_students?: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.regency_id) {
    errors.regency_id = 'Kabupaten wajib dipilih';
  }
  if (!data.district_id) {
    errors.district_id = 'Distrik wajib dipilih';
  }
  if (!data.venue || data.venue.trim() === '') {
    errors.venue = 'Lokasi / Venue pelatihan wajib diisi';
  }
  if (!data.start_date) {
    errors.start_date = 'Tanggal mulai wajib diisi';
  }
  if (!data.end_date) {
    errors.end_date = 'Tanggal selesai wajib diisi';
  }
  if (data.start_date && data.end_date) {
    if (new Date(data.end_date) < new Date(data.start_date)) {
      errors.end_date = 'Tanggal selesai tidak boleh sebelum tanggal mulai';
    }
  }
  if (data.target_teachers !== undefined && data.target_teachers < 0) {
    errors.target_teachers = 'Target guru tidak boleh bernilai negatif';
  }
  if (data.target_students !== undefined && data.target_students < 0) {
    errors.target_students = 'Target siswa tidak boleh bernilai negatif';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateBudgetInput(data: {
  category_id?: string;
  description?: string;
  volume?: number;
  unit_price?: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.category_id) {
    errors.category_id = 'Kategori RAB wajib dipilih';
  }
  if (!data.description || data.description.trim() === '') {
    errors.description = 'Uraian kebutuhan wajib diisi';
  }
  if (data.volume === undefined || data.volume <= 0) {
    errors.volume = 'Volume harus lebih besar dari 0';
  }
  if (data.unit_price === undefined || data.unit_price < 0) {
    errors.unit_price = 'Harga satuan tidak boleh bernilai negatif';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRealizationInput(data: {
  training_id?: string;
  transaction_date?: string;
  category_id?: string;
  description?: string;
  volume?: number;
  unit_price?: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.training_id) {
    errors.training_id = 'Realisasi harus terhubung dengan kegiatan tertentu';
  }
  if (!data.transaction_date) {
    errors.transaction_date = 'Tanggal transaksi wajib diisi';
  }
  if (!data.category_id) {
    errors.category_id = 'Kategori wajib dipilih';
  }
  if (!data.description || data.description.trim() === '') {
    errors.description = 'Uraian pengeluaran wajib diisi';
  }
  if (data.volume === undefined || data.volume <= 0) {
    errors.volume = 'Volume harus lebih besar dari 0';
  }
  if (data.unit_price === undefined || data.unit_price < 0) {
    errors.unit_price = 'Harga tidak boleh bernilai negatif';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
