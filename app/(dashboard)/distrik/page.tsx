import React from 'react';
import { getDistricts, getRegencies } from '@/lib/db/queries';
import DistrikClient from './DistrikClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DistrikPage() {
  const districts = getDistricts();
  const regencies = getRegencies();

  return <DistrikClient initialDistricts={districts} regencies={regencies} />;
}
