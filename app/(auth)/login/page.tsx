'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/components/providers/AppProvider';
import { DEMO_USERS, getRoleNameIndo } from '@/lib/auth/session';
import { UserRole } from '@/lib/types';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  Sparkles,
  Building,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, showToast } = useApp();

  const [email, setEmail] = useState('admin@papuabarat.go.id');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const match = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || DEMO_USERS[0];
      setCurrentUser(match);
      showToast(`Selamat datang, ${match.full_name} (${getRoleNameIndo(match.role)})`);
      router.push('/');
    }, 600);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    const match = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    setCurrentUser(match);
    showToast(`Masuk sebagai ${getRoleNameIndo(match.role)}: ${match.full_name}`);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#07192F] to-[#0A2618] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 papua-pattern opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-emerald-600 to-[#0B2545] text-white mx-auto flex items-center justify-center font-black text-2xl shadow-xl ring-4 ring-amber-400/20">
            PB
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Papua Barat Monitoring System
          </h1>
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
            Program Pandai Berhitung dengan Metode GASING
          </div>
        </div>

        {/* Papua Motif Divider */}
        <div className="papua-motif-divider w-full rounded-full shadow-xs" />

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Email Pengguna</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@papuabarat.go.id"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">Kata Sandi</label>
              <Link
                href="/reset-password"
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-emerald-700 focus:ring-emerald-600"
              />
              <span>Ingat sesi saya</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#0B2545] to-[#1E5E3A] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Pill Selector (#4) */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            Pilih Cepat Role Pengguna Demo:
          </span>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('super_admin')}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-white hover:to-indigo-50 border border-indigo-100 hover:border-indigo-300 text-slate-800 font-bold transition-all text-left shadow-2xs hover:shadow-md group"
            >
              <div className="text-[11px] text-indigo-700 font-black flex items-center justify-between">
                <span>Super Admin</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
              </div>
              <div className="text-[10px] font-normal text-slate-500 truncate mt-0.5">Dr. Yan Pieterson</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('finance')}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white hover:to-emerald-50 border border-emerald-100 hover:border-emerald-300 text-slate-800 font-bold transition-all text-left shadow-2xs hover:shadow-md group"
            >
              <div className="text-[11px] text-emerald-700 font-black flex items-center justify-between">
                <span>Finance (Keuangan)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
              </div>
              <div className="text-[10px] font-normal text-slate-500 truncate mt-0.5">Maria Magdalena, S.E.</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('pimpinan')}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white hover:to-amber-50 border border-amber-100 hover:border-amber-300 text-slate-800 font-bold transition-all text-left shadow-2xs hover:shadow-md group"
            >
              <div className="text-[11px] text-amber-700 font-black flex items-center justify-between">
                <span>Pimpinan</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
              </div>
              <div className="text-[10px] font-normal text-slate-500 truncate mt-0.5">Ir. Dominggus Mandacan</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('viewer')}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-50/80 to-white hover:to-sky-50 border border-sky-100 hover:border-sky-300 text-slate-800 font-bold transition-all text-left shadow-2xs hover:shadow-md group"
            >
              <div className="text-[11px] text-sky-700 font-black flex items-center justify-between">
                <span>Viewer (Kadisdik)</span>
                <span className="w-2 h-2 rounded-full bg-sky-500 group-hover:scale-125 transition-transform" />
              </div>
              <div className="text-[10px] font-normal text-slate-500 truncate mt-0.5">Barnabas Dowansiba</div>
            </button>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400">
          Pemerintah Provinsi Papua Barat • Dinas Pendidikan © 2026
        </div>
      </div>
    </div>
  );
}
