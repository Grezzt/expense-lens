'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { type Role } from '@/lib/rbac/permissions';
import { usePermissions } from '@/hooks/usePermissions';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  route: string;
  badge?: number | null;
  visibleTo: Role[];
  highlight?: boolean;
}

export default function NavItem({ icon: Icon, label, route, badge, visibleTo, highlight }: NavItemProps) {
  const pathname = usePathname();
  const { canAccessRoute } = usePermissions();

  const isActive = pathname === route || pathname.startsWith(route + '/');

  if (!canAccessRoute(visibleTo)) {
    return null;
  }

  return (
    <Link
      href={route}
      className="flex items-center justify-between gap-3 px-3 py-2.5 transition-all"
      style={{
        backgroundColor: isActive ? 'var(--el-primary)' : 'transparent',
        color: isActive ? 'var(--el-white)' : 'var(--el-primary)',
        borderRadius: 0,
        borderLeft: isActive ? '3px solid var(--el-accent)' : '3px solid transparent',
        fontWeight: isActive ? 600 : 400,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(2,44,34,0.07)';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
        }
      }}
    >
      <div className="flex items-center gap-3">
        <Icon
          className="w-4 h-4 flex-shrink-0"
          style={{ color: isActive ? 'var(--el-accent)' : 'var(--el-primary)', opacity: isActive ? 1 : 0.6 }}
        />
        <span className="text-sm">{label}</span>
      </div>

      {badge !== null && badge !== undefined && badge > 0 && (
        <span
          className="px-2 py-0.5 text-xs font-bold"
          style={{
            backgroundColor: isActive ? 'var(--el-accent)' : highlight ? 'var(--error)' : 'var(--el-accent)',
            color: 'var(--el-primary)',
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
