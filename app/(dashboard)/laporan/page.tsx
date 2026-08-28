import React from 'react';
import { getProgramSummary, getRegencies, getTrainings, getSystemSettings } from '@/lib/db/queries';
import LaporanClient from './LaporanClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LaporanPage() {
  const regencies = getRegencies();
  const trainings = getTrainings();
  const summary = getProgramSummary({ fiscal_year: 2026 });
  const settings = getSystemSettings();

  return (
    <LaporanClient
      regencies={regencies}
      trainings={trainings}
      initialSummary={summary}
      settings={settings}
    />
  );
}
