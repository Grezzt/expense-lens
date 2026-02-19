'use client';

import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAppStore } from '@/store/useAppStore';

export default function SmartScanButton() {
  const { canAccessRoute } = usePermissions();
  const { setScanDrawerOpen } = useAppStore();
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!canAccessRoute(['owner', 'admin', 'accountant', 'member'])) {
    return null;
  }

  const handleClick = () => {
    setScanDrawerOpen(true);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-3 group"
      style={{
        backgroundColor: 'var(--el-accent)',
        color: 'var(--el-primary)',
        padding: '14px 22px',
        fontWeight: 800,
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(191,216,82,0.35)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'fixed',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 40px rgba(191,216,82,0.45)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(191,216,82,0.35)';
      }}
    >
      <Camera className="w-5 h-5 flex-shrink-0" />
      <span>Scan Receipt</span>
    </button>
  );
}
