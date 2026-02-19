'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ChevronDown, Building2, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OrgSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentOrg, userOrgs, setCurrentOrg } = useAppStore();
  const router = useRouter();

  const handleOrgChange = (org: typeof currentOrg) => {
    if (org) {
      setCurrentOrg(org);
      setIsOpen(false);
      router.push(`/${org.slug}/dashboard`);
    }
  };

  if (!currentOrg) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 transition-colors"
        style={{
          backgroundColor: 'rgba(2,44,34,0.05)',
          border: '1px solid rgba(2,44,34,0.15)',
          borderRadius: 0,
          color: 'var(--el-primary)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--el-primary)' }}
          >
            <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--el-accent)' }} />
          </div>
          <div className="text-left min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--el-primary)' }}
            >
              {currentOrg.name}
            </p>
            <p
              className="text-xs"
              style={{ color: 'var(--el-primary)', opacity: 0.5 }}
            >
              Organization
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--el-accent)' }}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden shadow-lg"
          style={{
            backgroundColor: 'var(--el-white)',
            border: '1px solid rgba(2,44,34,0.15)',
          }}
        >
          <div className="max-h-52 overflow-y-auto">
            {userOrgs.map((org) => (
              <button
                key={org.id}
                onClick={() => handleOrgChange(org)}
                className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left"
                style={{
                  backgroundColor: org.id === currentOrg.id ? 'rgba(191,216,82,0.1)' : 'transparent',
                  borderLeft: org.id === currentOrg.id ? '3px solid var(--el-accent)' : '3px solid transparent',
                }}
                onMouseEnter={e => {
                  if (org.id !== currentOrg.id) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(2,44,34,0.04)';
                  }
                }}
                onMouseLeave={e => {
                  if (org.id !== currentOrg.id) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div
                  className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: org.id === currentOrg.id ? 'var(--el-accent)' : 'rgba(2,44,34,0.08)' }}
                >
                  <Building2
                    className="w-3.5 h-3.5"
                    style={{ color: org.id === currentOrg.id ? 'var(--el-primary)' : 'var(--el-primary)' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--el-primary)' }}>
                    {org.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--el-primary)', opacity: 0.45 }}>
                    {org.slug}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(2,44,34,0.1)', padding: '6px' }}>
            <button
              onClick={() => (window.location.href = '/organizations')}
              className="w-full flex items-center gap-3 px-3 py-2 transition-colors text-sm"
              style={{ color: 'var(--el-primary)', opacity: 0.6 }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(2,44,34,0.05)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.opacity = '0.6';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <Settings className="w-4 h-4" />
              Manage Organizations
            </button>
            <button
              onClick={() => {
                useAppStore.getState().reset();
                window.location.href = '/';
              }}
              className="w-full flex items-center gap-3 px-3 py-2 transition-colors text-sm"
              style={{ color: '#dc2626' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(220,38,38,0.06)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
