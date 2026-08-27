import React from 'react';
import { getTrainingById, getBudgetCategories } from '@/lib/db/queries';
import DetailKegiatanClient from './DetailKegiatanClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailKegiatanPage({ params }: PageProps) {
  const { id } = await params;
  const training = getTrainingById(id);
  const categories = getBudgetCategories();

  return <DetailKegiatanClient initialTraining={training} categories={categories} />;
}
