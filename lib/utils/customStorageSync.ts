import { District, School, Training, Participant, Regency } from '@/lib/types';

export const ALL_REGENCY_IDS = [
  'reg-mkw',
  'reg-mansel',
  'reg-pegarfak',
  'reg-bintuni',
  'reg-wondama',
  'reg-fakfak',
  'reg-kaimana',
];

export const REGENCY_NAME_MAP: Record<string, string> = {
  'reg-mkw': 'Manokwari',
  'reg-mansel': 'Manokwari Selatan',
  'reg-pegarfak': 'Pegunungan Arfak',
  'reg-bintuni': 'Teluk Bintuni',
  'reg-wondama': 'Teluk Wondama',
  'reg-fakfak': 'Fakfak',
  'reg-kaimana': 'Kaimana',
};

export interface CustomRegencyStore {
  is_customized: boolean;
  districts?: District[];
  schools?: School[];
  trainings?: Training[];
  participants?: Participant[];
  budgets?: any[];
  realizations?: any[];
}

export function getAllCustomRegencyData(): Record<string, CustomRegencyStore> {
  if (typeof window === 'undefined') return {};
  const result: Record<string, CustomRegencyStore> = {};

  for (const id of ALL_REGENCY_IDS) {
    try {
      const saved = localStorage.getItem(`papua_regency_custom_v1_${id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.is_customized) {
          result[id] = parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  return result;
}

export function getMergedDistricts(initialDistricts: District[]): District[] {
  const customMap = getAllCustomRegencyData();
  const customizedRegencyIds = new Set(Object.keys(customMap));
  if (customizedRegencyIds.size === 0) return initialDistricts;

  // Keep districts whose regency is not customized
  const retained = initialDistricts.filter(d => !customizedRegencyIds.has(d.regency_id));

  // Append custom districts
  const customDistricts: District[] = [];
  for (const regId of customizedRegencyIds) {
    const list = customMap[regId]?.districts;
    if (Array.isArray(list)) {
      customDistricts.push(...list);
    }
  }

  return [...retained, ...customDistricts];
}

export function getMergedSchools(initialSchools: School[]): School[] {
  const customMap = getAllCustomRegencyData();
  const customizedRegencyIds = new Set(Object.keys(customMap));
  if (customizedRegencyIds.size === 0) return initialSchools;

  // Keep schools whose regency is not customized
  const retained = initialSchools.filter(s => !customizedRegencyIds.has(s.regency_id));

  // Append custom schools
  const customSchools: School[] = [];
  for (const regId of customizedRegencyIds) {
    const list = customMap[regId]?.schools;
    if (Array.isArray(list)) {
      customSchools.push(...list);
    }
  }

  return [...retained, ...customSchools];
}

export function getMergedTrainings(initialTrainings: Training[]): Training[] {
  const customMap = getAllCustomRegencyData();
  const customizedRegencyIds = new Set(Object.keys(customMap));
  if (customizedRegencyIds.size === 0) return initialTrainings;

  // Keep trainings whose regency is not customized
  const retained = initialTrainings.filter(t => !customizedRegencyIds.has(t.regency_id));

  // Append custom trainings with computed fields
  const customTrainings: Training[] = [];
  for (const regId of customizedRegencyIds) {
    const custom = customMap[regId];
    const list = custom?.trainings;
    if (Array.isArray(list)) {
      const regName = REGENCY_NAME_MAP[regId] || '';
      list.forEach(t => {
        const budgets = (custom.budgets || []).filter(b => b.training_id === t.id);
        const realizations = (custom.realizations || []).filter(r => r.training_id === t.id);
        const totalRab = budgets.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
        const totalRealization = realizations.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
        const balance = totalRab - totalRealization;
        const absorptionRate = totalRab > 0 ? Math.round((totalRealization / totalRab) * 100) : 0;

        customTrainings.push({
          ...t,
          regency_name: t.regency_name || regName,
          total_rab: totalRab,
          total_realization: totalRealization,
          balance,
          absorption_rate: absorptionRate,
          lpj_completeness: t.lpj_completeness ?? (t.status === 'Completed' ? 100 : 0),
        });
      });
    }
  }

  return [...retained, ...customTrainings];
}

export function getMergedParticipants(initialParticipants: Participant[]): Participant[] {
  const customMap = getAllCustomRegencyData();
  const customizedRegencyIds = new Set(Object.keys(customMap));
  if (customizedRegencyIds.size === 0) return initialParticipants;

  const customRegencyNames = new Set(
    Array.from(customizedRegencyIds).map(id => REGENCY_NAME_MAP[id] || '').filter(Boolean)
  );

  // Keep participants not belonging to customized regencies
  const retained = initialParticipants.filter(p => {
    if (p.regency_name && customRegencyNames.has(p.regency_name)) return false;
    return true;
  });

  // Append custom participants
  const customParticipants: Participant[] = [];
  for (const regId of customizedRegencyIds) {
    const list = customMap[regId]?.participants;
    if (Array.isArray(list)) {
      const regName = REGENCY_NAME_MAP[regId] || '';
      list.forEach(p => {
        customParticipants.push({
          ...p,
          regency_name: p.regency_name || regName,
        });
      });
    }
  }

  return [...retained, ...customParticipants];
}
