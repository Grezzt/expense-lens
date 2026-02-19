'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
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
  const { currentUser, currentOrg, reset } = useAppStore();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    reset();
    router.push('/');
  };

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>('.sidebar-nav-group');
      gsap.fromTo(
        items,
        { x: -16, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power2.out',
        }
      );
    },
    { scope: sidebarRef }
  );

  const sidebarContent = (
    <div ref={sidebarRef} className="flex flex-col h-full" style={{ backgroundColor: 'var(--el-white)' }}>
      {/* Logo — matching landing navbar style */}
      <div
        className="sidebar-nav-group flex items-center gap-2 px-5 py-5"
        style={{
          backgroundColor: 'var(--el-primary)',
          borderBottom: '1px solid rgba(191,216,82,0.2)',
        }}
      >
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: 'var(--el-white)' }}
        >
          Expense
        </span>
        <span
          className="flex items-center px-1.5 py-0.5 text-xs font-black tracking-widest uppercase"
          style={{
            backgroundColor: 'var(--el-accent)',
            color: 'var(--el-primary)',
          }}
        >
          Lens
        </span>
        <span
          className="ml-auto text-xs font-medium opacity-50"
          style={{ color: 'var(--el-white)' }}
        >
          Dashboard
        </span>
      </div>

      {/* Org Switcher */}
      <div className="sidebar-nav-group px-4 py-4" style={{ borderBottom: '1px solid rgba(2,44,34,0.08)' }}>
        <OrgSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Main Menu */}
        <div className="sidebar-nav-group mb-5">
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            route={`/${currentOrg?.slug || 'dash'}/dashboard`}
            visibleTo={['owner', 'admin', 'accountant', 'member', 'viewer']}
          />
          <NavItem
            icon={Receipt}
            label="My Expenses"
            route={`/${currentOrg?.slug || 'dash'}/expenses/me`}
            visibleTo={['owner', 'admin', 'accountant', 'member', 'viewer']}
          />
        </div>

        {/* Finance Office */}
        <div className="sidebar-nav-group mb-5">
          <p
            className="text-xs font-black uppercase tracking-widest px-3 mb-2"
            style={{ color: 'var(--el-primary)', opacity: 0.45, letterSpacing: '1.5px' }}
          >
            Finance Office
          </p>
          <NavItem
            icon={Inbox}
            label="Inbox & Approvals"
            route={`/${currentOrg?.slug || 'dash'}/approvals`}
            visibleTo={['owner', 'admin', 'accountant']}
            highlight
          />
          <NavItem
            icon={BarChart3}
            label="Reports & Analytics"
            route={`/${currentOrg?.slug || 'dash'}/reports`}
            visibleTo={['owner', 'admin', 'accountant', 'viewer']}
          />
          <NavItem
            icon={FileSpreadsheet}
            label="Accounting Export"
            route={`/${currentOrg?.slug || 'dash'}/accounting`}
            visibleTo={['owner', 'admin', 'accountant']}
          />
        </div>

        {/* Organization */}
        <div className="sidebar-nav-group mb-5">
          <p
            className="text-xs font-black uppercase tracking-widest px-3 mb-2"
            style={{ color: 'var(--el-primary)', opacity: 0.45, letterSpacing: '1.5px' }}
          >
            Organization
          </p>
          <NavItem
            icon={Users}
            label="Members & Roles"
            route={`/${currentOrg?.slug || 'dash'}/organization/members`}
            visibleTo={['owner', 'admin']}
          />
          <NavItem
            icon={Settings}
            label="Settings"
            route={`/${currentOrg?.slug || 'dash'}/organization/settings`}
            visibleTo={['owner', 'admin']}
          />
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div
        className="sidebar-nav-group px-4 py-4"
        style={{ borderTop: '1px solid rgba(2,44,34,0.1)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: 'var(--el-accent)',
                color: 'var(--el-primary)',
              }}
            >
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--el-primary)' }}
              >
                {currentUser?.full_name || 'User'}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--el-primary)', opacity: 0.5 }}
              >
                {currentUser?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--el-primary)' }}
            title="Logout"
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(2,44,34,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut className="w-4 h-4" />
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 border rounded-lg shadow-lg"
        style={{
          backgroundColor: 'var(--el-white)',
          borderColor: 'rgba(2,44,34,0.15)',
          color: 'var(--el-primary)',
        }}
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
      <aside
        className="hidden lg:flex w-64 flex-col"
        style={{
          backgroundColor: 'var(--el-white)',
          borderRight: '1px solid rgba(2,44,34,0.1)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-64 z-40 transform transition-transform ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--el-white)',
          borderRight: '1px solid rgba(2,44,34,0.1)',
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
