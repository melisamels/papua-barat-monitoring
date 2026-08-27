'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { formatDateIndo } from '@/lib/utils/formatters';
import { ProgramDocument } from '@/lib/types';
import { FileText, Search, ExternalLink } from 'lucide-react';

interface DokumenClientProps {
  initialDocuments: ProgramDocument[];
}

export default function DokumenClient({ initialDocuments }: DokumenClientProps) {
  const [search, setSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');

  const docCategories = [
    'Surat Tugas', 'Surat Undangan', 'Surat Kesiapan', 'RAB',
    'SP2D', 'BKU', 'LPJ', 'Berita Acara', 'Daftar Hadir',
    'Invoice', 'Kuitansi', 'Bukti Transfer', 'Laporan Kegiatan', 'Dokumen Lainnya'
  ];

  const filtered = initialDocuments.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || (d.file_name || '').toLowerCase().includes(search.toLowerCase());
    const matchType = !docTypeFilter || d.document_type === docTypeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Document Library (Arsip Dokumen)' }]} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-700" />
            <span>Document Library Program GASING</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Penyimpanan terpusat dokumen resmi: Surat Tugas, SP2D, BKU, Berita Acara, dan Berkas LPJ
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul dokumen atau nama file..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={docTypeFilter}
          onChange={(e) => setDocTypeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-3 py-2"
        >
          <option value="">Semua Jenis Dokumen</option>
          {docCategories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Jenis Dokumen</th>
                <th className="py-3.5 px-4">Judul Berkas Resmi</th>
                <th className="py-3.5 px-4">Wilayah Terkait</th>
                <th className="py-3.5 px-4">Tanggal Dokumen</th>
                <th className="py-3.5 px-4">Pengunggah</th>
                <th className="py-3.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada arsip dokumen yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px]">
                        {d.document_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {d.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {d.district_name ? `${d.district_name} (${d.regency_name})` : d.regency_name || 'Provinsi'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatDateIndo(d.document_date)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {d.uploaded_by || 'Admin'}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <a
                        href={d.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors"
                      >
                        <span>Unduh / Buka</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
