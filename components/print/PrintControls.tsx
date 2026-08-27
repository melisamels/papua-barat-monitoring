'use client';

import React from 'react';
import Link from 'next/link';
import { Printer, ArrowLeft } from 'lucide-react';

export default function PrintControls() {
  return (
    <div className="no-print mb-8 p-4 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between font-sans">
      <div>
        <h2 className="font-bold text-sm text-slate-800">Pratinjau Cetak / PDF Resmi</h2>
        <p className="text-xs text-slate-500">Gunakan tombol cetak untuk menyimpan sebagai PDF A4 atau mencetak fisik.</p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/laporan"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs shadow-md hover:bg-emerald-900"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen (Ctrl+P)</span>
        </button>
      </div>
    </div>
  );
}
