import React from 'react';
import { getSchools, getRegencies, getDistricts } from '@/lib/db/queries';
import SekolahClient from './SekolahClient';

export default async function SekolahPage() {
  const schools = getSchools();
  const regencies = getRegencies();
  const districts = getDistricts();

  return <SekolahClient initialSchools={schools} regencies={regencies} districts={districts} />;
}
