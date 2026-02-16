'use client';

import { useState } from 'react';
import OrgSwitcher from './OrgSwitcher';
import NavItem from './NavItem';
import {
  LayoutDashboard,
  Receipt,
  Inbox,
  BarChart3,
  FileSpreadsheet,
  Users,
  Scale,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const { currentUser, reset } = useAppStore();

  const handleLogout = () => {
    reset();
    router.push('/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-primary">ExpenseLens</h1>
        <p className="text-xs text-foreground-muted mt-1">Smart Expense Management</p>
      </div>

      {/* Org Switcher */}
      <div className="px-4 mb-6">
        <OrgSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {/* Main Menu */}
        <div className="mb-6">
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            route="/dashboard"
            visibleTo={['owner', 'admin', 'accountant', 'member', 'viewer']}
          />
          <NavItem
            icon={Receipt}
            label="My Expenses"
            route="/expenses/me"
            visibleTo={['owner', 'admin', 'accountant', 'member', 'viewer']}
          />
        </div>

        {/* Finance Office */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide px-4 mb-2">
            Finance Office
          </p>
          <NavItem
            icon={Inbox}
            label="Inbox & Approvals"
            route="/approvals"
            visibleTo={['owner', 'admin', 'accountant']}
            highlight
          />
          <NavItem
            icon={BarChart3}
            label="Reports & Analytics"
            route="/reports"
            visibleTo={['owner', 'admin', 'accountant', 'viewer']}
          />
          <NavItem
            icon={FileSpreadsheet}
            label="Accounting Export"
            route="/accounting"
            visibleTo={['owner', 'admin', 'accountant']}
          />
        </div>

        {/* Organization */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide px-4 mb-2">
            Organization
          </p>
          <NavItem
            icon={Users}
            label="Members & Roles"
            route="/organization/members"
            visibleTo={['owner', 'admin']}
          />

          <NavItem
            icon={Settings}
            label="Settings"
            route="/organization/settings"
            visibleTo={['owner', 'admin']}
          />
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-sm font-semibold text-foreground">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{currentUser?.full_name || 'User'}</p>
              <p className="text-xs text-foreground-muted">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-card-hover rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-foreground-muted" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col">
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border z-40 transform transition-transform ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
