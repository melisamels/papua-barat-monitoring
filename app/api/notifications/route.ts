// Papua Barat Monitoring System - Notifications API Route
// GET & POST /api/notifications

import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/lib/db/queries';

export async function GET() {
  try {
    const notifs = getNotifications();
    return NextResponse.json(notifs);
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    return NextResponse.json({ error: 'Gagal mengambil notifikasi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'mark_all_read') {
      markAllNotificationsAsRead();
      return NextResponse.json({ success: true });
    }
    if (body.id) {
      markNotificationAsRead(body.id);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (err: any) {
    console.error('Error updating notification:', err);
    return NextResponse.json({ error: 'Gagal memperbarui notifikasi' }, { status: 500 });
  }
}
