import React from 'react';
import { getRegencyById } from '@/lib/db/queries';
import RegencyDetailClient from './RegencyDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailKabupatenPage({ params }: PageProps) {
  const { id } = await params;
  const regency = getRegencyById(id);

  return <RegencyDetailClient regency={regency} />;
}
