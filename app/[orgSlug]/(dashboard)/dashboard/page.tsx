'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import KPICards from '@/components/dashboard/KPICards';
import SpendingTrendChart from '@/components/dashboard/SpendingTrendChart';
import CategoryAllocationChart from '@/components/dashboard/CategoryAllocationChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AnomalyWatchlist from '@/components/dashboard/AnomalyWatchlist';
import {
  getDashboardStats,
  getSpendingTrend,
  getCategoryAllocation,
  type DashboardStats,
  type SpendingTrendData,
  type CategoryAllocation,
} from '@/lib/dashboard-service';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  merchant_name: string;
  amount: number;
  date: string;
  status: 'VERIFIED' | 'DRAFT' | 'FLAGGED';
  category: string;
}

interface Anomaly {
  id: string;
  type: string;
  merchant: string;
  amount: number;
  date: string;
  rule: string;
  severity: 'high' | 'medium' | 'low';
}

export default function DashboardPage() {
  const { currentOrg, currentUser, userRole, setScanDrawerOpen } = useAppStore();
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'quarter'>('month');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState<DashboardStats>({
    totalExpense: 0,
    dailyAverage: 0,
    pendingCount: 0,
    flaggedCount: 0,
    totalChange: 0,
  });
  const [spendingData, setSpendingData] = useState<SpendingTrendData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryAllocation[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    if (!currentOrg?.id) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [statsData, trendData, categoryAlloc, transactions, flaggedExpenses] = await Promise.all([
          getDashboardStats(currentOrg.id, dateFilter),
          getSpendingTrend(currentOrg.id, dateFilter),
          getCategoryAllocation(currentOrg.id, dateFilter),
          fetchRecentTransactions(currentOrg.id),
          fetchAnomalies(currentOrg.id),
        ]);

        setStats(statsData);
        setSpendingData(trendData);
        setCategoryData(categoryAlloc);
        setRecentTransactions(transactions);
        setAnomalies(flaggedExpenses);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentOrg?.id, dateFilter]);

  const fetchRecentTransactions = async (orgId: string): Promise<Transaction[]> => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('id, merchant_name, amount, date, status, category')
        .eq('organization_id', orgId)
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(exp => ({
        id: exp.id,
        merchant_name: exp.merchant_name,
        amount: exp.amount,
        date: exp.date,
        status: exp.status as 'VERIFIED' | 'DRAFT' | 'FLAGGED',
        category: exp.category,
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  };

  const fetchAnomalies = async (orgId: string): Promise<Anomaly[]> => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('id, merchant_name, amount, date, raw_data')
        .eq('organization_id', orgId)
        .eq('status', 'FLAGGED')
        .order('date', { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map(exp => ({
        id: exp.id,
        type: 'Flagged for Review',
        merchant: exp.merchant_name,
        amount: exp.amount,
        date: exp.date,
        rule: (exp.raw_data as any)?.anomaly_reason || 'Manual review required',
        severity: 'medium', // Default severity since it's not in DB yet
      }));
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      return [];
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleScanClick = () => {
    setScanDrawerOpen(true);
  };

  const handleDateFilterChange = (filter: string) => {
    const filterMap: Record<string, 'today' | 'week' | 'month' | 'quarter'> = {
      'hari ini': 'today',
      'today': 'today',
      'minggu ini': 'week',
      'week': 'week',
      'bulan ini': 'month',
      'month': 'month',
      'kuartal ini': 'quarter',
      'quarter': 'quarter',
    };
    setDateFilter(filterMap[filter.toLowerCase()] || 'month');
  };

  const handleReviewAnomaly = (id: string) => {
    window.location.href = `/expenses/${id}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground-muted">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no organization
  if (!currentOrg) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-xl font-semibold text-primary mb-2">No Organization Selected</p>
            <p className="text-foreground-muted">Please select an organization to view dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <DashboardHeader
        userName={currentUser?.full_name || 'User'}
        greeting={getGreeting()}
        onScanClick={handleScanClick}
        onDateFilterChange={handleDateFilterChange}
        currentFilter={dateFilter}
        userRole={userRole}
      />

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
  );
}
