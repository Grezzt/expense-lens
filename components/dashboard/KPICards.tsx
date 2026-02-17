'use client';

import { TrendingUp, TrendingDown, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'secondary' | 'warning' | 'error';
}

function KPICard({ title, value, change, icon: Icon, trend, color = 'primary' }: KPICardProps) {
  const colorClasses = {
    primary: 'bg-green-500/20 text-green-400',
    secondary: 'bg-yellow-500/20 text-yellow-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
  };

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  return (
    <div className="card p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-foreground-muted uppercase tracking-wide">{title}</p>
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-foreground mb-1">{value}</h3>
      {change !== undefined && (
        <div className="flex items-center gap-1">
          {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
          <span className={`text-xs font-medium ${trend ? trendColors[trend] : 'text-foreground-muted'}`}>
            {change > 0 ? '+' : ''}{change}% vs bulan lalu
          </span>
        </div>
      )}
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Total Pengeluaran"
        value={formatCurrency(totalExpense)}
        change={totalChange}
        trend={totalChange && totalChange > 0 ? 'up' : totalChange && totalChange < 0 ? 'down' : 'neutral'}
        icon={DollarSign}
        color="primary"
      />
      <KPICard
        title="Rata-rata Harian"
        value={formatCurrency(dailyAverage)}
        icon={TrendingUp}
        color="secondary"
      />
      <KPICard
        title="Transaksi Pending"
        value={pendingCount.toString()}
        icon={Clock}
        color="warning"
      />
      <KPICard
        title="Flagged by AI"
        value={flaggedCount.toString()}
        icon={AlertTriangle}
        color="error"
      />
    </div>
  );
}
