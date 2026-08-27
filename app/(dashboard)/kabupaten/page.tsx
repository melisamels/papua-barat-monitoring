import React from 'react';
import { getRegencies } from '@/lib/db/queries';
import KabupatenClient from './KabupatenClient';

export default async function KabupatenPage() {
  const regencies = getRegencies();
  return <KabupatenClient initialRegencies={regencies} />;
}
