// Papua Barat Monitoring System - AI Executive Summary API Route
// POST /api/ai/executive-summary

import { NextRequest, NextResponse } from 'next/server';
import { generateExecutiveSummary } from '@/lib/ai/engine';
import { UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role: UserRole = body.role || 'pimpinan';

    const result = generateExecutiveSummary(role);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Executive summary endpoint error:', err);
    return NextResponse.json(
      { error: 'Terjadi kendala saat membuat ringkasan eksekutif. Silakan coba kembali.' },
      { status: 500 }
    );
  }
}
