import React from 'react';
import { getSystemSettings } from '@/lib/db/queries';
import PengaturanClient from './PengaturanClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PengaturanPage() {
  const settings = getSystemSettings();

  return <PengaturanClient initialSettings={settings} />;
}
