import React from 'react';
import { getAuditLogs } from '@/lib/db/queries';
import AuditLogClient from './AuditLogClient';

export default async function AuditLogPage() {
  const logs = getAuditLogs(100);

  return <AuditLogClient initialLogs={logs} />;
}
