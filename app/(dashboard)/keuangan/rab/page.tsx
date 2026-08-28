import React from 'react';
import { getTrainings, getRegencies } from '@/lib/db/queries';
import KeuanganRabClient from './KeuanganRabClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function KeuanganRabPage() {
  const trainings = getTrainings();
  const regencies = getRegencies();

  return <KeuanganRabClient initialTrainings={trainings} regencies={regencies} />;
}
