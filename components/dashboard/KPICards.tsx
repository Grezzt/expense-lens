'use client';

import { useRef } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  accent?: boolean; // lime accent icon box
}

function KPICard({ title, value, change, icon: Icon, trend, accent = false }: KPICardProps) {
  return (
    <div
      className="el-hover-card-wrapper"
      style={{ borderRight: 'none' }}
    >
      <div
        className="el-hover-card"
        style={{ minHeight: 160, padding: '20px 20px 16px' }}
      >
        {/* Top row: title + icon */}
        <div className="flex items-start justify-between mb-auto">
          <p
            className="el-callout-text"
            style={{ fontSize: 11, letterSpacing: '1.5px' }}
          >
            {title}
          </p>
          <div
            className="el-hover-card-icon w-9 h-9 flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: accent ? 'var(--el-accent)' : 'rgba(2,44,34,0.08)',
              color: accent ? 'var(--el-primary)' : 'var(--el-primary)',
            }}
          >
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Value */}
        <div className="mt-4">
          <h3
            className="el-hover-card-heading font-bold"
            style={{ fontSize: 'clamp(18px, 2vw, 24px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            {value}
          </h3>

          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1.5">
              {trend === 'up' && <TrendingUp className="w-3 h-3" style={{ color: 'var(--el-accent)' }} />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" style={{ color: '#dc2626' }} />}
              <span
                className="text-xs font-medium el-hover-card-text"
                style={{
                  color: trend === 'up' ? 'var(--el-primary)' : trend === 'down' ? '#dc2626' : 'var(--el-primary)',
                  opacity: 0.6,
                }}
              >
                {change > 0 ? '+' : ''}{change}% vs bulan lalu
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Lime shadow offset */}
      <div className="el-hover-card-shadow" />
    </div>
  );
}

interface KPICardsProps {
  totalExpense: number;
  dailyAverage: number;
  pendingCount: number;
  flaggedCount: number;
  totalChange?: number;
}

export default function KPICards({
  totalExpense,
  dailyAverage,
  pendingCount,
  flaggedCount,
  totalChange,
}: KPICardsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useGSAP(
    () => {
      gsap.from('.kpi-card-wrap', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
      });
    },
    { scope: sectionRef }
  );

  return (
    <div
      ref={sectionRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    >
      <div className="kpi-card-wrap">
        <KPICard
          title="Total Pengeluaran"
          value={formatCurrency(totalExpense)}
          change={totalChange}
          trend={totalChange && totalChange > 0 ? 'up' : totalChange && totalChange < 0 ? 'down' : 'neutral'}
          icon={DollarSign}
          accent
        />
      </div>
      <div className="kpi-card-wrap">
        <KPICard
          title="Rata-rata Harian"
          value={formatCurrency(dailyAverage)}
          icon={TrendingUp}
        />
      </div>
      <div className="kpi-card-wrap">
        <KPICard
          title="Transaksi Pending"
          value={pendingCount.toString()}
          icon={Clock}
        />
      </div>
      <div className="kpi-card-wrap">
        <KPICard
          title="Flagged by AI"
          value={flaggedCount.toString()}
          icon={AlertTriangle}
        />
      </div>
    </div>
  );
}
