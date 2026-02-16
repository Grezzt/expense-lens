'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { supabase, Expense, getUserRole } from '@/lib/supabase';
import { generateAccountingExcel } from '@/lib/export-service';
import {
    FileSpreadsheet,
    Download,
    Calendar,
    Filter,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountingPage() {
    const { currentOrg, currentUser } = useAppStore();
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'DRAFT'>('VERIFIED');

    // Init Defaults (This Month)
    useEffect(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    }, []);

    // Check Role
    useEffect(() => {
        if (!currentOrg || !currentUser) return;
        getUserRole(currentOrg.id, currentUser.id).then(role => {
            if (!['owner', 'admin', 'accountant'].includes(role || '')) {
                router.push('/dashboard');
            }
        });
    }, [currentOrg, currentUser, router]);

    // Fetch Preview Data
    const fetchPreview = async () => {
        if (!currentOrg || !startDate || !endDate) return;
        setLoading(true);
        try {
            let query = supabase
                .from('expenses')
                .select('*')
                .eq('organization_id', currentOrg.id)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: false });

            if (statusFilter !== 'ALL') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setExpenses(data || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPreview();
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [startDate, endDate, statusFilter, currentOrg]);

    const handleExport = async () => {
        if (!expenses.length) return;
        setExporting(true);
        try {
            const orgName = currentOrg?.name || 'Organization';
            const dateRangeStr = `${startDate} to ${endDate}`;

            const blob = await generateAccountingExcel(expenses, orgName, dateRangeStr);

            // Trigger Download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Expense_Report_${orgName}_${startDate}_${endDate}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export Failed:', error);
            alert('Export failed. Check console for details.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                        <FileSpreadsheet className="w-8 h-8" />
                        Accounting Export
                    </h1>
                    <p className="text-foreground-muted mt-1">
                        Download transaction reports for external accounting software
                    </p>
                </div>
            </div>

            {/* Filter Panel */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm mb-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">

                    {/* Start Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">End Date</label>
                         <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">Status</label>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="VERIFIED">Verified Only (Recommended)</option>
                                <option value="ALL">All Transactions</option>
                                <option value="DRAFT">Drafts Only</option>
                            </select>
                         </div>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={loading || expenses.length === 0 || exporting}
                        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-[#022c22] transition-all shadow-lg shadow-[#bfd852]/20 ${
                            expenses.length > 0
                            ? 'bg-[#bfd852] hover:bg-[#d0ea62] hover:scale-105'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {exporting ? 'Generating Excel...' : 'Export to Excel'}
                    </button>
                </div>
            </div>

            {/* Preview Section */}
            <div className="flex-1 bg-white rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden animate-fade-in animation-delay-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                        Preview Data
                        <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                            {expenses.length} records found
                        </span>
                    </h2>
                    {expenses.length > 1000 && (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-medium">
                            <AlertCircle className="w-4 h-4" />
                            Only previewing first 50 - Full export contains all data
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-x-auto">
                     {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400 animate-pulse">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            Loading preview...
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FileSpreadsheet className="w-8 h-8 text-gray-300" />
                             </div>
                             No transactions found for this period.
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Merchant</th>
                                    <th className="px-6 py-4 font-semibold">Category</th>
                                    <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                    <th className="px-6 py-4 font-semibold">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.slice(0, 50).map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 font-medium">
                                            {new Date(expense.date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{expense.merchant_name}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            Rp {expense.amount.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {expense.status === 'VERIFIED' ? (
                                                <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                                                    Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={expense.description}>
                                            {expense.description || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
