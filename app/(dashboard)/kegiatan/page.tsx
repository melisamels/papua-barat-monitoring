import React from 'react';
import { getTrainings, getRegencies } from '@/lib/db/queries';
import KegiatanListClient from './KegiatanListClient';

export default async function KegiatanListPage() {
  const trainings = getTrainings();
  const regencies = getRegencies();

  return <KegiatanListClient initialTrainings={trainings} regencies={regencies} />;
}
