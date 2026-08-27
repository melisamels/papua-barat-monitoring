import React from 'react';
import { getTrainings } from '@/lib/db/queries';
import KeuanganLpjClient from './KeuanganLpjClient';

export default async function KeuanganLpjPage() {
  const trainings = getTrainings();

  return <KeuanganLpjClient initialTrainings={trainings} />;
}
