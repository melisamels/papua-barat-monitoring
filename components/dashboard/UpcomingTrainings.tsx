'use client';

import React from 'react';
import Link from 'next/link';
import { Training } from '@/lib/types';
import { formatDateIndo, getStatusBadgeClass } from '@/lib/utils/formatters';
import { Calendar, MapPin, ArrowUpRight, Clock } from 'lucide-react';

interface UpcomingTrainingsProps {
  trainings: Training[];
}

export function UpcomingTrainings({ trainings }: UpcomingTrainingsProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Jadwal Kegiatan Terdekat</h3>
            <p className="text-xs text-slate-500">Urutan pelaksanaan menurut tanggal terdekat</p>
          </div>
        </div>
        <Link
          href="/kegiatan"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
        >
          <span>Semua</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {trainings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Belum ada jadwal pelatihan terdekat.
          </div>
        ) : (
          trainings.map(t => {
            const badge = getStatusBadgeClass(t.status);
            return (
              <Link
                key={t.id}
                href={`/kegiatan/${t.id}`}
                className="block p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-xs transition-all bg-slate-50/50 hover:bg-white"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-900 truncate max-w-[200px]">
                    {t.district_name}, {t.regency_name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {t.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600 truncate mb-1">
                  {t.venue}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100/80">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDateIndo(t.start_date)} - {formatDateIndo(t.end_date)}
                  </span>
                  <span className="font-semibold text-emerald-700 text-[10px]">
                    PIC: {t.pic.split(',')[0]}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
