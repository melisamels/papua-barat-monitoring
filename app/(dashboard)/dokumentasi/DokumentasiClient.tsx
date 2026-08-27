'use client';

import React, { useState, useMemo } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { formatDateIndo } from '@/lib/utils/formatters';
import { Training } from '@/lib/types';
import { Camera, Search, Filter, X, ZoomIn } from 'lucide-react';

interface DokumentasiClientProps {
  trainings: Training[];
}

export default function DokumentasiClient({ trainings }: DokumentasiClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Aggregate all photos across all trainings
  const allPhotos = useMemo(() => {
    const photos: any[] = [];
    trainings.forEach(t => {
      photos.push(
        {
          id: `p-${t.id}-1`,
          training_id: t.id,
          venue: t.venue,
          district_name: t.district_name,
          regency_name: t.regency_name,
          category: 'Pelatihan',
          file_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
          caption: `Aktivitas kelas belajar berhitung metode GASING di ${t.district_name}`,
          date: t.start_date,
        },
        {
          id: `p-${t.id}-2`,
          training_id: t.id,
          venue: t.venue,
          district_name: t.district_name,
          regency_name: t.regency_name,
          category: 'Pembukaan',
          file_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
          caption: `Pembukaan pelatihan oleh perwakilan dinas setempat di ${t.district_name}`,
          date: t.start_date,
        }
      );
    });
    return photos;
  }, [trainings]);

  const categories = [
    'Persiapan', 'Pembukaan', 'Pelatihan', 'Trainer', 'Guru',
    'Siswa', 'Aktivitas Kelas', 'Konsumsi', 'Snack', 'Penginapan',
    'Transportasi', 'Penutupan', 'Serah Terima', 'Foto Bersama',
    'Bukti Pembayaran', 'Dokumen Resmi', 'Lainnya'
  ];

  const filtered = allPhotos.filter(p => {
    const matchCat = !selectedCategory || p.category === selectedCategory;
    const matchSearch = p.caption.toLowerCase().includes(search.toLowerCase()) || p.district_name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Galeri Dokumentasi Program' }]} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Camera className="w-6 h-6 text-emerald-700" />
            <span>Galeri Dokumentasi Kegiatan GASING</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Arsip foto pelaksanaan pelatihan, aktivitas kelas, guru, siswa, dan serah terima sertifikat di seluruh Papua Barat
          </p>
        </div>
      </div>

      {/* Category Pills (#30) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            !selectedCategory ? 'bg-emerald-800 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Semua Kategori ({allPhotos.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat ? 'bg-emerald-800 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photo Grid (#30, #31) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => setLightboxUrl(p.file_url)}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
              <img
                src={p.file_url}
                alt={p.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ZoomIn className="w-6 h-6" />
              </div>
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                {p.category}
              </span>
            </div>

            <div className="p-3.5 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 line-clamp-2 leading-snug">
                {p.caption}
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                <span>{p.district_name} ({p.regency_name})</span>
                <span>{formatDateIndo(p.date)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal (#31) */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxUrl}
            alt="Preview Lightbox"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
