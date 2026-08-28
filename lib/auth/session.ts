// Papua Barat Monitoring System - Authentication & Role Permission Management
// 4 Roles: super_admin, finance, pimpinan, viewer

import { UserProfile, UserRole } from '@/lib/types';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    full_name: 'Melisa',
    email: 'melisa@papuabarat.go.id',
    username: 'melisa',
    password: 'admin123',
    role: 'super_admin',
    avatar_url: '/assets/avatars/admin.png',
    is_active: true,
    last_login: '2026-08-28T08:30:00+09:00',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-28T08:30:00Z',
  },
  {
    id: 'usr-finance-01',
    full_name: 'Rechi Muhammad',
    email: 'rechi@papuabarat.go.id',
    username: 'rechi',
    password: 'finance123',
    role: 'finance',
    avatar_url: '/assets/avatars/finance.png',
    is_active: true,
    last_login: '2026-08-28T09:15:00+09:00',
    created_at: '2026-01-05T00:00:00Z',
    updated_at: '2026-08-28T09:15:00Z',
  },
  {
    id: 'usr-viewer-01',
    full_name: 'Viewer',
    email: 'viewer@papuabarat.go.id',
    username: 'viewer',
    password: 'viewer123',
    role: 'viewer',
    avatar_url: '/assets/avatars/viewer.png',
    is_active: true,
    last_login: '2026-08-28T07:20:00+09:00',
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-08-28T07:20:00Z',
  },
];

export interface RolePermissions {
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewAuditLogs: boolean;
  canEditMasterData: boolean; // Kabupaten, Distrik, Sekolah
  canEditTrainings: boolean;
  canEditParticipants: boolean;
  canEditBudget: boolean; // RAB
  canEditRealization: boolean; // Realisasi
  canUploadDocumentation: boolean;
  canEditLpj: boolean;
  canViewFinancialBreakdown: boolean;
  canGenerateReports: boolean;
  canUseAiAssistant: boolean;
}

export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case 'super_admin':
      return {
        canManageUsers: true,
        canManageSettings: true,
        canViewAuditLogs: true,
        canEditMasterData: true,
        canEditTrainings: true,
        canEditParticipants: true,
        canEditBudget: true,
        canEditRealization: true,
        canUploadDocumentation: true,
        canEditLpj: true,
        canViewFinancialBreakdown: true,
        canGenerateReports: true,
        canUseAiAssistant: true,
      };
    case 'finance':
      return {
        canManageUsers: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        canEditMasterData: false,
        canEditTrainings: false,
        canEditParticipants: false,
        canEditBudget: true,
        canEditRealization: true,
        canUploadDocumentation: true,
        canEditLpj: true,
        canViewFinancialBreakdown: true,
        canGenerateReports: true,
        canUseAiAssistant: true,
      };
    case 'pimpinan':
      return {
        canManageUsers: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        canEditMasterData: false,
        canEditTrainings: false,
        canEditParticipants: false,
        canEditBudget: false,
        canEditRealization: false,
        canUploadDocumentation: false,
        canEditLpj: false,
        canViewFinancialBreakdown: true,
        canGenerateReports: true,
        canUseAiAssistant: true,
      };
    case 'viewer':
      return {
        canManageUsers: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        canEditMasterData: false,
        canEditTrainings: false,
        canEditParticipants: false,
        canEditBudget: false,
        canEditRealization: false,
        canUploadDocumentation: false,
        canEditLpj: false,
        canViewFinancialBreakdown: false, // Hidden for viewer as per prompt #4
        canGenerateReports: true,
        canUseAiAssistant: true,
      };
    default:
      return {
        canManageUsers: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        canEditMasterData: false,
        canEditTrainings: false,
        canEditParticipants: false,
        canEditBudget: false,
        canEditRealization: false,
        canUploadDocumentation: false,
        canEditLpj: false,
        canViewFinancialBreakdown: false,
        canGenerateReports: false,
        canUseAiAssistant: false,
      };
  }
}

export function getRoleNameIndo(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'finance':
      return 'Finance / Keuangan';
    case 'pimpinan':
      return 'Pimpinan';
    case 'viewer':
      return 'Viewer (Pemantau)';
    default:
      return role;
  }
}
