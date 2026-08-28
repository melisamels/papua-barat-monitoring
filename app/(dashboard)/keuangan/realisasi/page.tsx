import React from 'react';
import { getTrainings, getRegencies } from '@/lib/db/queries';
import KeuanganRealisasiClient from './KeuanganRealisasiClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function KeuanganRealisasiPage() {
  const trainings = getTrainings();
  const regencies = getRegencies();

  return <KeuanganRealisasiClient initialTrainings={trainings} regencies={regencies} />;
}
