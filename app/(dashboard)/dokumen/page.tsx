import React from 'react';
import { getDocuments } from '@/lib/db/queries';
import DokumenClient from './DokumenClient';

export default async function DokumenPage() {
  const documents = getDocuments();

  return <DokumenClient initialDocuments={documents} />;
}
