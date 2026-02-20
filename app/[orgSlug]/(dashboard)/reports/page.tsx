'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { supabase, Expense, getUserRole } from '@/lib/supabase';
import DashboardCharts from '@/components/reports/DashboardCharts';
import {
    BarChart3,
    TrendingUp,
    CreditCard,
    Calendar,
    ArrowUpRight,
    Download
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function ReportsPage() {
    const { currentOrg, currentUser } = useAppStore();
    const router = useRouter();
    const params = useParams();
    const orgSlug = params?.orgSlug as string;
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'this_month' | 'last_3_months' | 'all'>('this_month');

    // Fetch Data
    useEffect(() => {
        if (!currentOrg || !currentUser) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Check Role
                const role = await getUserRole(currentOrg.id, currentUser.id);
                if (!['owner', 'admin', 'accountant', 'viewer'].includes(role || '')) {
                   // router.push('/dashboard');
                }

                let query = supabase
                    .from('expenses')
                    .select('*')
                    .eq('organization_id', currentOrg.id)
                    .eq('status', 'VERIFIED')
                    .order('date', { ascending: true });

                // Apply Time Range Filter
                const now = new Date();
                let startDate = new Date();

                if (timeRange === 'this_month') {
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                } else if (timeRange === 'last_3_months') {
                    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                } else {
                    startDate = new Date(1970, 0, 1);
                }

                if (timeRange !== 'all') {
                    query = query.gte('date', startDate.toISOString().split('T')[0]);
                }

                const { data, error } = await query;
                if (error) throw error;
                setExpenses(data || []);

            } catch (error) {
                console.error('Error fetching report data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentOrg, currentUser, timeRange, router]);

    // Calculate KPIs
    const kpis = useMemo(() => {
        const totalSpend = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const count = expenses.length;
        const average = count > 0 ? totalSpend / count : 0;
        return { totalSpend, count, average };
    }, [expenses]);

    const handleExport = () => {
        router.push(`/${orgSlug}/accounting`);
    };

    return (
        <div className="mx-auto px-6 py-10 max-w-7xl h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                     <p className="el-callout-text mb-2">Detailed Analytics</p>
                    <h1 className="font-bold flex items-center gap-3" style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--el-primary)', lineHeight: 1.1 }}>
                        <BarChart3 className="w-8 h-8" style={{ color: 'var(--el-accent)' }} />
                        Reports & Analytics
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Time Range Selector */}
                    <div className="flex bg-white p-1 border shadow-sm" style={{ borderColor: 'rgba(2,44,34,0.1)' }}>
                        {[
                            { id: 'this_month', label: 'This Month' },
                            { id: 'last_3_months', label: 'Last 3 Months' },
                            { id: 'all', label: 'All Time' }
                        ].map((range) => (
                            <button
                                key={range.id}
                                onClick={() => setTimeRange(range.id as any)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                                    timeRange === range.id
                                    ? 'bg-[#bfd852] text-[#022c22]'
                                    : 'bg-transparent text-[#022c22] opacity-60 hover:opacity-100 hover:bg-gray-50'
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>

                    <button
                         onClick={handleExport}
                         className="flex items-center gap-2 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider border shadow-sm hover:bg-gray-50 transition-colors"
                         style={{ borderColor: 'rgba(2,44,34,0.1)', color: 'var(--el-primary)' }}
                         title="Export Data"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#022c22] border-t-[#bfd852] rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="animate-fade-in space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Total Spend */}
                        <div className="bg-white p-6 relative overflow-hidden group" style={{ border: '1.5px solid var(--el-primary)' }}>
                            <div className="absolute top-0 left-0 right-0 h-1 bg-[#bfd852]" />
                            <div className="absolute top-4 right-4 p-2 opacity-5">
                                <TrendingUp className="w-16 h-16 text-[#022c22]" />
                            </div>
                            <span className="text-xs font-bold text-[#022c22] opacity-60 uppercase tracking-wider mb-2 block">Total Verified Spend</span>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-[#022c22]">Rp {kpis.totalSpend.toLocaleString('id-ID')}</h3>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#022c22]">
                                <div className="bg-[#bfd852]/20 p-1 rounded-full"><ArrowUpRight className="w-3 h-3 text-[#022c22]" /></div>
                                <span>Based on {timeRange.replace(/_/g, ' ')}</span>
                            </div>
                        </div>

                        {/* Transaction Count */}
                        <div className="bg-white p-6 relative overflow-hidden group" style={{ border: '1.5px solid var(--el-primary)' }}>
                             <div className="absolute top-0 left-0 right-0 h-1 bg-[#bfd852]" />
                             <div className="absolute top-4 right-4 p-2 opacity-5">
                                <CreditCard className="w-16 h-16 text-[#022c22]" />
                            </div>
                            <span className="text-xs font-bold text-[#022c22] opacity-60 uppercase tracking-wider mb-2 block">Total Transactions</span>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-[#022c22]">{kpis.count}</h3>
                                <span className="text-xs text-[#022c22] opacity-50 font-bold uppercase">receipts</span>
                            </div>
                        </div>

                        {/* Average */}
                        <div className="bg-white p-6 relative overflow-hidden group" style={{ border: '1.5px solid var(--el-primary)' }}>
                             <div className="absolute top-0 left-0 right-0 h-1 bg-[#bfd852]" />
                             <div className="absolute top-4 right-4 p-2 opacity-5">
                                <Calendar className="w-16 h-16 text-[#022c22]" />
                            </div>
                            <span className="text-xs font-bold text-[#022c22] opacity-60 uppercase tracking-wider mb-2 block">Average / Transaction</span>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-[#022c22]">Rp {Math.round(kpis.average).toLocaleString('id-ID')}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    {expenses.length > 0 ? (
                        <DashboardCharts expenses={expenses} />
                    ) : (
                         <div className="flex flex-col items-center justify-center py-20 bg-gray-50 border border-dashed border-gray-300">
                             <p className="font-bold text-[#022c22] mb-1">No verified expense data found.</p>
                             <p className="text-sm text-[#022c22] opacity-60">Try changing the date filter or verify some expenses.</p>
                         </div>
                    )}
                </div>
            )}
        </div>
    );
}
