'use client';

import { useRef } from 'react';
import { Camera, Calendar } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface DashboardHeaderProps {
  userName: string;
  greeting: string;
  onScanClick: () => void;
  onDateFilterChange: (filter: string) => void;
  currentFilter: string;
  userRole?: string | null;
  insight?: string;
}

export default function DashboardHeader({
  userName,
  greeting,
  onScanClick,
  onDateFilterChange,
  currentFilter,
  userRole,
  insight,
}: DashboardHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);

  const dateFilters = [
    { value: 'today', label: 'Hari ini' },
    { value: 'week', label: 'Minggu ini' },
    { value: 'month', label: 'Bulan ini' },
    { value: 'quarter', label: 'Kuartal ini' },
  ];

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(
        '.dh-greeting',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      )
        .fromTo(
          '.dh-insight',
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.35'
        )
        .fromTo(
          '.dh-actions',
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4 },
          '-=0.25'
        );
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8"
      style={{ paddingBottom: 24, borderBottom: '1px solid rgba(2,44,34,0.1)' }}
    >
      {/* Greeting Section */}
      <div>
        <p
          className="dh-insight el-callout-text mb-2"
        >
          {greeting}
        </p>
        <h1
          className="dh-greeting font-bold"
          style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            color: 'var(--el-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {userName}
        </h1>
        <p
          className="dh-insight mt-2 text-sm"
          style={{ color: 'var(--el-primary)', opacity: 0.55, lineHeight: 1.5 }}
        >
          {insight || 'Keuangan bulan ini terlihat stabil'}
        </p>
      </div>

      {/* Actions Section */}
      <div className="dh-actions flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Date Filter */}
        <div className="relative">
          <select
            value={currentFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="appearance-none cursor-pointer pr-10 pl-4 py-2.5 text-sm font-medium"
            style={{
              backgroundColor: 'var(--el-white)',
              border: '1px solid rgba(2,44,34,0.2)',
              color: 'var(--el-primary)',
              outline: 'none',
              borderRadius: 0,
              minWidth: 140,
            }}
          >
            {dateFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
          <Calendar
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--el-accent)' }}
          />
        </div>

        {/* Scan Receipt CTA */}
        {userRole !== 'viewer' && (
          <button
            onClick={onScanClick}
            className="btn-el-accent flex items-center gap-2"
            style={{ whiteSpace: 'nowrap' }}
          >
            <Camera className="w-4 h-4" />
            Scan Receipt Now
          </button>
        )}
      </div>
    </div>
  );
}
