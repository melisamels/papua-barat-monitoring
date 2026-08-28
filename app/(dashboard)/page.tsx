import React from 'react';
import {
  getProgramSummary,
  getRegencies,
  getUpcomingTrainings,
  getAttentionItems,
  getAuditLogs,
  getAttendanceAnalytics,
} from '@/lib/db/queries';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const summary = getProgramSummary();
  const regencies = getRegencies();
  const upcomingTrainings = getUpcomingTrainings(5);
  const attentionItems = getAttentionItems();
  const recentLogs = getAuditLogs(10);
  const attendanceAnalytics = getAttendanceAnalytics();

  return (
    <DashboardClient
      initialSummary={summary}
      initialRegencies={regencies}
      initialUpcoming={upcomingTrainings}
      initialAttention={attentionItems}
      initialLogs={recentLogs}
      initialAttendance={attendanceAnalytics}
    />
  );
}
