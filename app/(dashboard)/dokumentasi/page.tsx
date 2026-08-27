import React from 'react';
import { getTrainings } from '@/lib/db/queries';
import DokumentasiClient from './DokumentasiClient';

export default async function DokumentasiPage() {
  const trainings = getTrainings();

  return <DokumentasiClient trainings={trainings} />;
}
