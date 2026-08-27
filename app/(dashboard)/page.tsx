import React from 'react';
import {
  getProgramSummary,
  getRegencies,
  getUpcomingTrainings,
  getAttentionItems,
  getAuditLogs,
} from '@/lib/db/queries';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const summary = getProgramSummary();
  const regencies = getRegencies();
  const upcomingTrainings = getUpcomingTrainings(5);
  const attentionItems = getAttentionItems();
  const recentLogs = getAuditLogs(10);

  return (
    <DashboardClient
      initialSummary={summary}
      initialRegencies={regencies}
      initialUpcoming={upcomingTrainings}
      initialAttention={attentionItems}
      initialLogs={recentLogs}
    />
  );
}
