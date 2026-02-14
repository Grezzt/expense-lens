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

  // Check if user has access to this route
  if (!canAccessRoute(visibleTo)) {
    return null;
  }

  return (
    <Link
      href={route}
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? 'bg-primary text-white'
          : 'hover:bg-card-hover text-primary'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>

      {badge !== null && badge !== undefined && badge > 0 && (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
          isActive
            ? 'bg-white text-primary'
            : highlight
            ? 'bg-error text-white'
            : 'bg-secondary text-primary'
        }`}>
          {badge}
        </span>
      )}
    </Link>
  );
}
