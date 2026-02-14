'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ChevronDown, Building2 } from 'lucide-react';

export default function OrgSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentOrg, userOrgs, setCurrentOrg } = useAppStore();

  const handleOrgChange = (org: typeof currentOrg) => {
    if (org) {
      setCurrentOrg(org);
      setIsOpen(false);
      // Refresh page data when org changes
      window.location.reload();
    }
  };

  if (!currentOrg) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-card hover:bg-card-hover rounded-lg transition-colors border border-border"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">{currentOrg.name}</p>
            <p className="text-xs text-foreground-muted">Organization</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-foreground-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && userOrgs.length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {userOrgs.map((org) => (
            <button
              key={org.id}
              onClick={() => handleOrgChange(org)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-card-hover transition-colors ${
                org.id === currentOrg.id ? 'bg-primary/5' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-foreground" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-foreground">{org.name}</p>
                <p className="text-xs text-foreground-muted">{org.slug}</p>
              </div>
              {org.id === currentOrg.id && (
                <div className="w-2 h-2 rounded-full bg-secondary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
