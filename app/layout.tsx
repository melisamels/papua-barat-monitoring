import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/providers/AppProvider';

export const metadata: Metadata = {
  title: 'Papua Barat Monitoring System - GASING 2026',
  description: 'Sistem Monitoring Pelaksanaan Program Pandai Berhitung dengan Metode GASING di Seluruh Wilayah Provinsi Papua Barat',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
