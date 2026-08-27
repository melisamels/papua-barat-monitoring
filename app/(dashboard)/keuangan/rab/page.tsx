import React from 'react';
import { getTrainings, getRegencies } from '@/lib/db/queries';
import KeuanganRabClient from './KeuanganRabClient';

export default async function KeuanganRabPage() {
  const trainings = getTrainings();
  const regencies = getRegencies();

  return <KeuanganRabClient initialTrainings={trainings} regencies={regencies} />;
}
