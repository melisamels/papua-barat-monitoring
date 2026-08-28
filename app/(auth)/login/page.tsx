'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/components/providers/AppProvider';
import { DEMO_USERS, getRoleNameIndo } from '@/lib/auth/session';
import { UserRole } from '@/lib/types';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye as ViewIcon,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, showToast } = useApp();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const input = usernameOrEmail.trim().toLowerCase();
      const user = DEMO_USERS.find(
        u => u.email.toLowerCase() === input || u.username?.toLowerCase() === input
      );

      if (!user) {
        setIsLoading(false);
        setErrorMessage('Pengguna tidak ditemukan. Silakan gunakan username/email yang terdaftar.');
        return;
      }

      // Check password (allow user.password or 'password123' as universal fallback)
      const validPasswords = [user.password, 'password123', `${user.username}123`];
      if (!validPasswords.includes(password)) {
        setIsLoading(false);
        setErrorMessage(`Kata sandi salah untuk akun "${user.full_name}".`);
        return;
      }

      setCurrentUser(user);
      showToast(`Selamat datang, ${user.full_name} (${getRoleNameIndo(user.role)})`);
      router.push('/');
    }, 500);
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

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-7 sm:p-8 shadow-2xl border border-white/40 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-emerald-600 to-[#0B2545] text-white mx-auto flex items-center justify-center font-black text-xl shadow-xl ring-4 ring-amber-400/20">
            PB
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Papua Barat Monitoring System
          </h1>
          <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
            Program Pandai Berhitung Metode GASING
          </div>
        </div>

        {/* Papua Motif Divider */}
        <div className="papua-motif-divider w-full rounded-full shadow-xs" />

        {/* Error Notification if login fails */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Username atau Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Contoh: melisa / rechi / viewer"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Kata Sandi</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
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

          <div className="flex items-center justify-between text-xs pt-0.5">
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
            className="w-full py-2.5 bg-gradient-to-r from-[#0B2545] to-[#1E5E3A] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Cards with Passwords Displayed */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pilih Cepat / Akun Pengguna:
            </span>
          </div>

          <div className="space-y-2">
            {/* Super Admin: Melisa */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('super_admin')}
              className="w-full p-2.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-200 text-left transition-all flex items-center justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs text-indigo-950">Super Admin (Melisa)</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-200 text-indigo-900">Akses Penuh</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  User: <strong className="text-slate-700">melisa</strong> • Password: <strong className="text-slate-700">admin123</strong>
                </div>
              </div>
              <span className="text-indigo-600 text-xs font-bold group-hover:translate-x-0.5 transition-transform">Masuk →</span>
            </button>

            {/* Finance: Rechi Muhammad */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('finance')}
              className="w-full p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200 text-left transition-all flex items-center justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs text-emerald-950">Finance (Rechi Muhammad)</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900">RAB & Realisasi</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  User: <strong className="text-slate-700">rechi</strong> • Password: <strong className="text-slate-700">finance123</strong>
                </div>
              </div>
              <span className="text-emerald-700 text-xs font-bold group-hover:translate-x-0.5 transition-transform">Masuk →</span>
            </button>

            {/* Viewer: Khusus Melihat & Memantau Saja */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('viewer')}
              className="w-full p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-50 border border-amber-200 text-left transition-all flex items-center justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs text-amber-950">Viewer (Pemantau)</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">Hanya Lihat</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  User: <strong className="text-slate-700">viewer</strong> • Password: <strong className="text-slate-700">viewer123</strong>
                </div>
                <div className="text-[10px] text-amber-800 font-medium mt-0.5">
                  ✓ Tanpa tombol edit, hanya memantau jalannya pelatihan & progress
                </div>
              </div>
              <span className="text-amber-700 text-xs font-bold group-hover:translate-x-0.5 transition-transform">Masuk →</span>
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
