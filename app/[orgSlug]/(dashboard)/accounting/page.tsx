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
        <div className="mx-auto px-6 py-10" style={{ maxWidth: 1400 }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid rgba(2,44,34,0.1)' }}>
                <div>
                     <p className="el-callout-text mb-2">Finance & Export</p>
                    <h1 className="font-bold flex items-center gap-3" style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--el-primary)', lineHeight: 1.1 }}>
                        <FileSpreadsheet className="w-8 h-8" style={{ color: 'var(--el-accent)' }} />
                        Accounting Export
                    </h1>
                    <p className="mt-2 text-sm" style={{ color: 'var(--el-primary)', opacity: 0.6 }}>
                        Download transaction reports for external accounting software
                    </p>
                </div>
            </div>

            {/* Filter Panel */}
            <div
                className="p-6 mb-8"
                style={{
                    backgroundColor: 'var(--el-white)',
                    border: '1.5px solid var(--el-primary)',
                    position: 'relative'
                }}
            >
                {/* Top Accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: 'var(--el-accent)' }} />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    {/* Start Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--el-primary)', opacity: 0.7, fontSize: 11 }}>Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--el-accent)' }} />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm font-medium"
                                style={{
                                    backgroundColor: 'rgba(2,44,34,0.03)',
                                    border: '1px solid rgba(2,44,34,0.1)',
                                    color: 'var(--el-primary)',
                                    outline: 'none',
                                    borderRadius: 0
                                }}
                            />
                        </div>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--el-primary)', opacity: 0.7, fontSize: 11 }}>End Date</label>
                         <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--el-accent)' }} />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm font-medium"
                                style={{
                                    backgroundColor: 'rgba(2,44,34,0.03)',
                                    border: '1px solid rgba(2,44,34,0.1)',
                                    color: 'var(--el-primary)',
                                    outline: 'none',
                                    borderRadius: 0
                                }}
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--el-primary)', opacity: 0.7, fontSize: 11 }}>Status</label>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--el-accent)' }} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm font-medium appearance-none cursor-pointer"
                                style={{
                                    backgroundColor: 'rgba(2,44,34,0.03)',
                                    border: '1px solid rgba(2,44,34,0.1)',
                                    color: 'var(--el-primary)',
                                    outline: 'none',
                                    borderRadius: 0
                                }}
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
                        className={`flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold transition-all ${
                            expenses.length > 0
                            ? 'btn-el-accent'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        style={expenses.length > 0 ? {} : { borderRadius: 0 }}
                    >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {exporting ? 'Generating Excel...' : 'Export to Excel'}
                    </button>
                </div>
            </div>

            {/* Preview Section */}
            <div
                className="flex-1 flex flex-col overflow-hidden"
                style={{
                    backgroundColor: 'var(--el-white)',
                    border: '1.5px solid var(--el-primary)',
                }}
            >
                <div className="p-6 border-b flex justify-between items-center" style={{ borderBottom: '1px solid rgba(2,44,34,0.1)', backgroundColor: 'rgba(2,44,34,0.02)' }}>
                    <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--el-primary)' }}>
                        Preview Data
                        <span className="text-xs font-bold px-2 py-0.5" style={{ backgroundColor: 'var(--el-accent)', color: 'var(--el-primary)' }}>
                            {expenses.length} records
                        </span>
                    </h2>
                    {expenses.length > 1000 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                            <AlertCircle className="w-4 h-4" />
                            Preview limited to first 50
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-x-auto">
                     {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" style={{ color: 'var(--el-accent)' }} />
                            <p style={{ color: 'var(--el-primary)', fontSize: 13, fontWeight: 500 }}>Loading preview...</p>
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                             <div className="w-16 h-16 flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(2,44,34,0.03)' }}>
                                <FileSpreadsheet className="w-8 h-8" style={{ color: 'var(--el-primary)', opacity: 0.3 }} />
                             </div>
                             <p className="font-bold mb-1" style={{ color: 'var(--el-primary)' }}>No transactions found</p>
                             <p className="text-sm" style={{ color: 'var(--el-primary)', opacity: 0.5 }}>Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr>
                                    {['Date', 'Merchant', 'Category', 'Amount', 'Status', 'Description'].map((h, i) => (
                                        <th
                                            key={h}
                                            className="px-6 py-4 el-callout-text"
                                            style={{
                                                fontSize: 10,
                                                letterSpacing: '1.5px',
                                                borderBottom: '1px solid rgba(2,44,34,0.1)',
                                                textAlign: i === 3 ? 'right' : i === 4 ? 'center' : 'left'
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.slice(0, 50).map((expense) => (
                                    <tr
                                        key={expense.id}
                                        className="transition-colors"
                                        style={{ borderBottom: '1px solid rgba(2,44,34,0.05)' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(191,216,82,0.05)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                                    >
                                        <td className="px-6 py-4 font-semibold" style={{ color: 'var(--el-primary)' }}>
                                            {new Date(expense.date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4" style={{ color: 'var(--el-primary)' }}>{expense.merchant_name}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 text-xs font-medium border" style={{ backgroundColor: 'rgba(2,44,34,0.03)', borderColor: 'rgba(2,44,34,0.1)', color: 'var(--el-primary)' }}>
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold" style={{ color: 'var(--el-primary)' }}>
                                            Rp {expense.amount.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {expense.status === 'VERIFIED' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: 'rgba(191,216,82,0.2)', color: 'var(--el-primary)' }}>
                                                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#666' }}>
                                                    DRAFT
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate" style={{ color: 'var(--el-primary)', opacity: 0.6 }} title={expense.description}>
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
