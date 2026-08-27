'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { DEMO_USERS, getRoleNameIndo } from '@/lib/auth/session';
import { UserProfile, UserRole } from '@/lib/types';
import { useApp } from '@/components/providers/AppProvider';
import { UserCheck, Plus, Search, Shield, X, Edit2 } from 'lucide-react';

export default function UserManagementPage() {
  const { currentUser, showToast } = useApp();
  const [users, setUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Nama dan email wajib diisi', 'error');
      return;
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      full_name: name.trim(),
      email: email.trim(),
      role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: 'Belum pernah login',
    };

    setUsers(prev => [newUser, ...prev]);
    setShowAddModal(false);
    setName('');
    setEmail('');
    showToast(`Pengguna baru ${newUser.full_name} (${getRoleNameIndo(newUser.role)}) berhasil didaftarkan!`);
  };

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? ({ ...u, is_active: !u.is_active }) : u));
    showToast('Status keaktifan user diperbarui');
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Manajemen Pengguna & Hak Akses' }]} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-700" />
            <span>Manajemen Pengguna & Hak Akses</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun operasional untuk Super Admin, Finance, Pimpinan, dan Viewer (Kepala Dinas)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pengguna berdasarkan nama atau email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Email Instansi</th>
                <th className="py-3.5 px-4">Hak Akses (Role)</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4">Login Terakhir</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{u.full_name}</div>
                    <div className="text-[10px] text-slate-400">ID: {u.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                      <Shield className="w-3 h-3 text-emerald-700" />
                      <span>{getRoleNameIndo(u.role)}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{u.last_login || '-'}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-100"
                    >
                      {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Tambah Pengguna Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Drs. Barnabas Dowansiba, M.Pd."
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Instansi *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@papuabarat.go.id"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Hak Akses (Role) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                >
                  <option value="super_admin">Super Admin (Akses Penuh)</option>
                  <option value="finance">Finance (RAB, Realisasi, LPJ)</option>
                  <option value="pimpinan">Pimpinan (Strategis Read-Only & AI)</option>
                  <option value="viewer">Viewer (Kepala Dinas Pendidikan Prov)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
