'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';

interface AttentionItem {
  id: string;
  training_id: string;
  training_name: string;
  regency_name: string;
  district_name: string;
  type: string;
  title: string;
  description: string;
  severity: 'warning' | 'critical';
}

interface AttentionRequiredProps {
  items: AttentionItem[];
}

export function AttentionRequired({ items }: AttentionRequiredProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Perlu Perhatian Pimpinan</h3>
            <p className="text-xs text-slate-500">Deteksi otomatis batas waktu, kelengkapan LPJ, & anggaran</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
          {items.length} Isu
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px]">
        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Tidak ada isu kritis yang memerlukan perhatian saat ini.
          </div>
        ) : (
          items.map(item => (
            <Link
              key={item.id}
              href={`/kegiatan/${item.training_id}`}
              className={`block p-3.5 rounded-xl border transition-all ${
                item.severity === 'critical'
                  ? 'bg-red-50/40 border-red-200 hover:border-red-400'
                  : 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    item.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {item.district_name} ({item.regency_name})
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                        item.severity === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 leading-snug">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {item.description}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
