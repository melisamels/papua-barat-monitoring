import React from 'react';
import { getParticipants, getSchools } from '@/lib/db/queries';
import PesertaClient from './PesertaClient';

export default async function PesertaPage() {
  const participants = getParticipants();
  const schools = getSchools();

  return <PesertaClient initialParticipants={participants} schools={schools} />;
}
