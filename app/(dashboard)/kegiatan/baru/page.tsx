import React from 'react';
import { getRegencies, getDistricts } from '@/lib/db/queries';
import TambahKegiatanClient from './TambahKegiatanClient';

export default async function TambahKegiatanPage() {
  const regencies = getRegencies();
  const allDistricts = getDistricts();

  return <TambahKegiatanClient regencies={regencies} allDistricts={allDistricts} />;
}
