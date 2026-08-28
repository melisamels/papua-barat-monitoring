import React from 'react';
import { getTrainings } from '@/lib/db/queries';
import KeuanganLpjClient from './KeuanganLpjClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function KeuanganLpjPage() {
  const trainings = getTrainings();

  return <KeuanganLpjClient initialTrainings={trainings} />;
}
