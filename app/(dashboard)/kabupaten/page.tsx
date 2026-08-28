import React from 'react';
import { getRegencies } from '@/lib/db/queries';
import KabupatenClient from './KabupatenClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function KabupatenPage() {
  const regencies = getRegencies();
  return <KabupatenClient initialRegencies={regencies} />;
}
