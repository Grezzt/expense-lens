'use client';

import { useAppStore } from '@/store/useAppStore';
import { hasPermission, canAccessRoute, type Permission, type Role } from '@/lib/rbac/permissions';

export function usePermissions() {
  const userRole = useAppStore((state) => state.userRole);

  return {
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    canAccessRoute: (allowedRoles: Role[]) => canAccessRoute(userRole, allowedRoles),
    role: userRole,
  };
}
