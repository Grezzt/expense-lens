export type Role = 'owner' | 'admin' | 'accountant' | 'member' | 'viewer';

export type Permission =
  | 'all'
  | 'manage_users'
  | 'manage_policies'
  | 'approve_expenses'
  | 'view_all_reports'
  | 'view_all_expenses'
  | 'reject_expenses'
  | 'export_accounting_data'
  | 'create_expense'
  | 'view_own_expenses'
  | 'delete_own_drafts'
  | 'view_dashboard'
  | 'export_reports';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ['all'],
  admin: ['manage_users', 'manage_policies', 'approve_expenses', 'view_all_reports'],
  accountant: ['view_all_expenses', 'approve_expenses', 'reject_expenses', 'export_accounting_data'],
  member: ['create_expense', 'view_own_expenses', 'delete_own_drafts'],
  viewer: ['view_dashboard', 'view_all_reports', 'export_reports'],
};

export function hasPermission(role: Role | null, permission: Permission): boolean {
  if (!role) return false;

  const permissions = ROLE_PERMISSIONS[role];

  // Owner has all permissions
  if (permissions.includes('all')) return true;

  return permissions.includes(permission);
}

export function canAccessRoute(role: Role | null, allowedRoles: Role[]): boolean {
  if (!role) return false;
  return allowedRoles.includes(role);
}
