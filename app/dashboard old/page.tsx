'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AISummaryCard from '@/components/dashboard/AISummaryCard';
import KPICards from '@/components/dashboard/KPICards';
import SpendingTrendChart from '@/components/dashboard/SpendingTrendChart';
import CategoryAllocationChart from '@/components/dashboard/CategoryAllocationChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AnomalyWatchlist from '@/components/dashboard/AnomalyWatchlist';

export default function DashboardPage() {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'quarter'>('month');

  // Mock data
  const stats = {
    totalExpense: 45000000,
    dailyAverage: 1500000,
    pendingCount: 5,
    flaggedCount: 2,
    totalChange: 12,
  };

  const spendingData = [
    { date: '1 Feb', amount: 1200000 },
    { date: '5 Feb', amount: 1800000 },
    { date: '10 Feb', amount: 2200000 },
    { date: '15 Feb', amount: 1500000 },
    { date: '20 Feb', amount: 2800000 },
    { date: '25 Feb', amount: 1900000 },
  ];

  const categoryData = [
    { name: 'Konsumsi', value: 11100000, color: '#3B82F6' },
    { name: 'Beban Operasional', value: 9900000, color: '#F59E0B' },
    { name: 'Transportasi', value: 7800000, color: '#BFD852' },
    { name: 'Lainnya', value: 6900000, color: '#10B981' },
  ];

  const recentTransactions = [
    {
      id: '1',
      merchant_name: 'Instagram Ads',
      amount: 5000000,
      date: '2024-02-13',
      status: 'VERIFIED' as const,
      category: 'Beban Pemasaran',
    },
    {
      id: '2',
      merchant_name: 'Grab',
      amount: 150000,
      date: '2024-02-13',
      status: 'DRAFT' as const,
      category: 'Transportasi',
    },
    {
      id: '3',
      merchant_name: 'Starbucks',
      amount: 250000,
      date: '2024-02-12',
      status: 'VERIFIED' as const,
      category: 'Konsumsi',
    },
  ];

  const anomalies = [
    {
      id: '1',
      type: 'High Value Meal',
      merchant: 'Steak House',
      amount: 12000000,
      rule: 'High Value Consumption',
      severity: 'high' as const,
    },
  ];

  const aiSummary = "Pengeluaran bulan ini mencapai Rp 45.000.000, naik 12% dari bulan lalu. Lonjakan terbesar ada pada kategori 'Beban Pemasaran' karena campaign Instagram Ads.";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 18) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  const handleScanClick = () => {
    router.push('/scan');
  };

  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter as typeof dateFilter);
  };

  const handleReviewAnomaly = (id: string) => {
    console.log('Review anomaly:', id);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F1F1F1' }}>
      {/* Main Container */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <DashboardHeader
          userName="User"
          greeting={getGreeting()}
          onScanClick={handleScanClick}
          onDateFilterChange={handleDateFilterChange}
          currentFilter={dateFilter}
        />

        {/* AI Summary */}
        {/* <div className="mb-6">
          <AISummaryCard summary={aiSummary} isLoading={false} />
        </div> */}

        {/* KPI Cards */}
        <div className="mb-6">
          <KPICards
            totalExpense={stats.totalExpense}
            dailyAverage={stats.dailyAverage}
            pendingCount={stats.pendingCount}
            flaggedCount={stats.flaggedCount}
            totalChange={stats.totalChange}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SpendingTrendChart data={spendingData} />
          <CategoryAllocationChart data={categoryData} />
        </div>

        {/* Bottom Section - Recent Transactions & Anomalies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTransactions transactions={recentTransactions} />
          </div>
          <div className="lg:col-span-1">
            <AnomalyWatchlist anomalies={anomalies} onReview={handleReviewAnomaly} />
          </div>
        </div>
      </div>
    </div>
  );
}

