'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Regency } from '@/lib/types';
import { formatRupiah } from '@/lib/utils/formatters';
import { MapPin, ArrowRight } from 'lucide-react';

interface PapuaMapProps {
  regencies: Regency[];
  selectedRegencyId?: string | null;
  onSelectRegency?: (id: string) => void;
}

export function PapuaMap({ regencies, selectedRegencyId, onSelectRegency }: PapuaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined') return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Clean existing map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center around West Papua: -1.8, 133.5 with zoom level 7
      const map = L.map(mapContainerRef.current, {
        center: [-2.0, 133.6],
        zoom: 7,
        minZoom: 6,
        maxZoom: 12,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Status color lookup (#103)
      const getStatusColor = (status?: string) => {
        switch (status) {
          case 'Completed': return '#16A34A'; // Green
          case 'Ongoing': return '#D97706'; // Amber
          case 'Ready': return '#2563EB'; // Blue
          case 'Planning':
          default: return '#64748B'; // Slate
        }
      };

      // Add Custom Markers for each Kabupaten
      regencies.forEach(reg => {
        const color = getStatusColor(reg.status);
        const isSelected = selectedRegencyId === reg.id;

        // Custom HTML Marker Icon
        const iconHtml = `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            background-color: ${color};
            color: white;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span style="font-size: 11px; font-weight: bold;">${reg.code}</span>
            <div style="
              position: absolute;
              bottom: -4px;
              width: 6px;
              height: 6px;
              background-color: ${color};
              transform: rotate(45deg);
            "></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-map-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const marker = L.marker([reg.latitude, reg.longitude], { icon: customIcon }).addTo(map);

        // Rich Interactive Popup Content (#14, #112)
        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 text-slate-800 font-sans';
        popupContent.style.minWidth = '220px';
        popupContent.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <h4 style="font-weight: 700; font-size: 14px; margin: 0; color: #0F172A;">${reg.name}</h4>
            <span style="
              font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px;
              background-color: ${color}20; color: ${color};
            ">${reg.status || 'Planning'}</span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
            <div><strong>Distrik Program:</strong> ${reg.district_count || 0} distrik</div>
            <div><strong>Kegiatan:</strong> ${reg.training_count || 0} kegiatan (${reg.progress || 0}% selesai)</div>
            <div><strong>Guru:</strong> ${reg.actual_teachers || 0} / ${reg.target_teachers || 0} orang</div>
            <div><strong>Siswa:</strong> ${reg.actual_students || 0} / ${reg.target_students || 0} siswa</div>
            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #E2E8F0;">
              <div><strong>Total RAB:</strong> ${formatRupiah(reg.total_rab)}</div>
              <div><strong>Realisasi:</strong> ${formatRupiah(reg.total_realization)}</div>
            </div>
          </div>
          <a 
            href="/kabupaten/${reg.id}" 
            style="
              display: block; width: 100%; text-align: center; background-color: #0B2545;
              color: white; font-weight: 600; font-size: 11px; padding: 6px 10px;
              border-radius: 6px; text-decoration: none; margin-top: 6px;
            "
          >
            Lihat Detail Kabupaten →
          </a>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectRegency) {
            onSelectRegency(reg.id);
          }
        });
      });
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [regencies, selectedRegencyId]);

  return (
    <div className="relative w-full h-[440px] bg-slate-100 rounded-2xl overflow-hidden shadow-xs border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend (#14) */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-md border border-slate-200 text-xs font-medium text-slate-700">
        <div className="font-bold text-slate-900 mb-2 text-[11px] uppercase tracking-wider">
          Status Program Kabupaten
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0"></span>
            <span>Completed (Selesai)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
            <span>Ongoing (Berjalan)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0"></span>
            <span>Ready (Siap)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0"></span>
            <span>Planning (Rencana)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
