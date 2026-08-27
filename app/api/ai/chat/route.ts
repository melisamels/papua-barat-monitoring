// Papua Barat Monitoring System - AI Chat API Route
// POST /api/ai/chat

import { NextRequest, NextResponse } from 'next/server';
import { processAiQuery } from '@/lib/ai/engine';
import { UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt;
    const role: UserRole = body.role || 'pimpinan';

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Pertanyaan tidak boleh kosong' }, { status: 400 });
    }

    const result = await processAiQuery(prompt.trim(), role);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('AI chat endpoint error:', err);
    return NextResponse.json(
      { error: 'Terjadi kendala saat memproses pertanyaan AI. Silakan coba kembali.' },
      { status: 500 }
    );
  }
}
