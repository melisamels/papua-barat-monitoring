'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, DashboardFilter } from '@/lib/types';
import { DEMO_USERS } from '@/lib/auth/session';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  globalFilter: DashboardFilter;
  setGlobalFilter: React.Dispatch<React.SetStateAction<DashboardFilter>>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Default to Super Admin so all features are accessible out-of-the-box
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('papua_active_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const found = DEMO_USERS.find(u => u.id === parsed.id || u.role === parsed.role);
          if (found) {
            return { ...found, full_name: parsed.full_name || found.full_name };
          }
        } catch {}
      }
    }
    return DEMO_USERS[0];
  });

  const [globalFilter, setGlobalFilter] = useState<DashboardFilter>({
    fiscal_year: 2026,
    month: null,
    regency_id: null,
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('papua_active_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const switchRole = (role: UserRole) => {
    const user = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    setCurrentUser(user);
    showToast(`Beralih ke hak akses: ${user.role.toUpperCase()} (${user.full_name})`, 'info');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        globalFilter,
        setGlobalFilter,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
      {/* Toast Notification Container (#79) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm font-medium transition-all transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-red-900 text-white border-red-700'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-white/70 hover:text-white text-xs font-bold px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
