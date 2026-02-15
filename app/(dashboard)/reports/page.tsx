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
    ArrowDownRight,
    Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
    const { currentOrg, currentUser } = useAppStore();
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'this_month' | 'last_3_months' | 'all'>('this_month');

    // Fetch Data
    useEffect(() => {
        if (!currentOrg || !currentUser) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Check Role (Optional - handled by sidebar visibility mostly, but good for safety)
                const role = await getUserRole(currentOrg.id, currentUser.id);
                if (!['owner', 'admin', 'accountant', 'viewer'].includes(role || '')) {
                    router.push('/dashboard');
                    return;
                }

                let query = supabase
                    .from('expenses')
                    .select('*')
                    .eq('organization_id', currentOrg.id)
                    .eq('status', 'VERIFIED') // Only verified expenses for reports? Or all? Usually Verified.
                    .order('date', { ascending: true });

                // Apply Time Range Filter
                const now = new Date();
                let startDate = new Date();

                if (timeRange === 'this_month') {
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                } else if (timeRange === 'last_3_months') {
                    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                } else {
                    startDate = new Date(1970, 0, 1); // All time
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

        // Simplified Logic for "vs last month" would require fetching previous data.
        // For now, we'll just show the totals.
        return { totalSpend, count, average };
    }, [expenses]);

    // Export Logic (Placeholder)
    const handleExport = () => {
        alert('Export functionality coming soon! (CSV/PDF)');
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                        <BarChart3 className="w-8 h-8" />
                        Reports & Analytics
                    </h1>
                    <p className="text-foreground-muted mt-1">
                        Overview of your organization's verified financial activity
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Time Range Selector */}
                    <div className="bg-white rounded-lg p-1 flex border border-border shadow-sm">
                        <button
                            onClick={() => setTimeRange('this_month')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === 'this_month' ? 'bg-[#bfd852] text-[#022c22]' : 'text-foreground-muted hover:bg-gray-100'}`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => setTimeRange('last_3_months')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === 'last_3_months' ? 'bg-[#bfd852] text-[#022c22]' : 'text-foreground-muted hover:bg-gray-100'}`}
                        >
                            Last 3 Months
                        </button>
                         <button
                            onClick={() => setTimeRange('all')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === 'all' ? 'bg-[#bfd852] text-[#022c22]' : 'text-foreground-muted hover:bg-gray-100'}`}
                        >
                            All Time
                        </button>
                    </div>

                    <button
                         onClick={handleExport}
                         className="btn btn-outline flex items-center gap-2 bg-white"
                         title="Export Data"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="animate-fade-in space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Total Spend */}
                        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp className="w-20 h-20 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-2">Total Verified Spend</span>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-primary">Rp {kpis.totalSpend.toLocaleString('id-ID')}</h3>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-medium">
                                <div className="bg-green-100 p-1 rounded-full"><ArrowUpRight className="w-3 h-3" /></div>
                                <span>Based on {timeRange.replace('_', ' ')}</span>
                            </div>
                        </div>

                        {/* Transaction Count */}
                        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CreditCard className="w-20 h-20 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-2">Total Transactions</span>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-gray-800">{kpis.count}</h3>
                                <span className="text-sm text-gray-500">receipts</span>
                            </div>
                        </div>

                        {/* Average Transaction */}
                        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Calendar className="w-20 h-20 text-orange-500" />
                            </div>
                            <span className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-2">Average / Transaction</span>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-gray-800">Rp {Math.round(kpis.average).toLocaleString('id-ID')}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    {expenses.length > 0 ? (
                        <DashboardCharts expenses={expenses} />
                    ) : (
                         <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                             <p className="text-gray-500 mb-2">No verified expense data found for this period.</p>
                             <p className="text-sm text-gray-400">Try changing the date filter or verify some expenses.</p>
                         </div>
                    )}
                </div>
            )}
        </div>
    );
}
