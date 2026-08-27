// Papua Barat Monitoring System - Formatting Utilities
// Standardized Indonesian Rupiah, Dates (WIT/Asia Jayapura), and Metrics

/**
 * Format number into Indonesian Rupiah format
 * Example: 1300000000 -> "Rp 1.300.000.000"
 */
export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rp 0';
  }
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('id-ID').format(rounded);
  return `Rp ${formatted}`;
}

/**
 * Format date into Indonesian standard format (DD MMMM YYYY) in Asia/Jayapura (WIT)
 * Example: "2026-08-17" -> "17 Agustus 2026"
 */
const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatDateIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '-';
    
    // In local representation or Jayapura timezone
    const day = d.getDate();
    const month = INDONESIAN_MONTHS[d.getMonth()];
    const year = d.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch {
    return '-';
  }
}

/**
 * Format date and time in Asia/Jayapura WIT
 * Example: "17 Agustus 2026, 14:30 WIT"
 */
export function formatDateTimeIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '-';
    
    const day = d.getDate();
    const month = INDONESIAN_MONTHS[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes} WIT`;
  } catch {
    return '-';
  }
}

/**
 * Calculate difference in days between two date strings
 */
export function calculateDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Safe percentage calculation with fallback
 */
export function formatPercentage(numerator: number | undefined | null, denominator: number | undefined | null): string {
  if (!denominator || denominator <= 0) return '0%';
  if (!numerator || numerator <= 0) return '0%';
  const pct = Math.round((numerator / denominator) * 100);
  return `${pct}%`;
}

export function calculatePercentageValue(numerator: number | undefined | null, denominator: number | undefined | null): number {
  if (!denominator || denominator <= 0) return 0;
  if (!numerator || numerator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

/**
 * Calculate Activity Progress according to Master Prompt Section #70:
 * Planning = 25%
 * Ready = 50%
 * Ongoing = 75%
 * Completed = 100%
 */
export function getActivityProgress(status: string): number {
  switch (status) {
    case 'Planning':
      return 25;
    case 'Ready':
      return 50;
    case 'Ongoing':
      return 75;
    case 'Completed':
      return 100;
    default:
      return 0;
  }
}

/**
 * Status color classes for badges
 */
export function getStatusBadgeClass(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Planning':
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
    case 'Ready':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' };
    case 'Ongoing':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' };
    case 'Completed':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
  }
}
