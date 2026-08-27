'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 overflow-x-auto whitespace-nowrap py-1 no-print">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-emerald-700 font-medium transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Dashboard</span>
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-emerald-700 font-medium transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-800">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
