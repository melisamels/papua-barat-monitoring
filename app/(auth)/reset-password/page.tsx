'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-[#051121] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 papua-pattern opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#0B2545] text-white mx-auto flex items-center justify-center font-black text-xl shadow-md">
            PB
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Atur Ulang Kata Sandi
          </h1>
          <p className="text-xs text-slate-500">
            Masukkan email terdaftar untuk menerima tautan pemulihan kata sandi
          </p>
        </div>

        {isSent ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
            <h3 className="font-bold text-sm text-emerald-900">Tautan Pemulihan Terkirim!</h3>
            <p className="text-xs text-emerald-800">
              Instruksi pengaturan ulang kata sandi telah dikirimkan ke alamat <strong>{email}</strong>. Silakan periksa kotak masuk atau spam email Anda.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block px-5 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
            >
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Email Instansi Terdaftar</label>
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

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#0B2545] to-[#1E5E3A] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Tautan Pemulihan</span>
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
