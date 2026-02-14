'use client';

import { useEffect, useState } from 'react';
import ExpenseCard from './ExpenseCard';
import { Expense } from '@/lib/supabase';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'VERIFIED'>('ALL');

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();

    // Listen for new expenses
    const handleExpenseAdded = () => fetchExpenses();
    window.addEventListener('expenseAdded', handleExpenseAdded);

    return () => {
      window.removeEventListener('expenseAdded', handleExpenseAdded);
    };
  }, []);

  const filteredExpenses = expenses.filter((expense) => {
    if (filter === 'ALL') return true;
    return expense.status === filter;
  });

  const stats = {
    total: expenses.length,
    draft: expenses.filter((e) => e.status === 'DRAFT').length,
    verified: expenses.filter((e) => e.status === 'VERIFIED').length,
    totalAmount: expenses
      .filter((e) => e.status === 'VERIFIED')
      .reduce((sum, e) => sum + e.amount, 0),
  };

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="animate-spin text-6xl mb-4">⚙️</div>
        <p className="text-foreground-muted">Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-sm text-foreground-muted">Total</div>
          <div className="text-2xl font-bold text-foreground">
            {stats.total}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-foreground-muted">Draft</div>
          <div className="text-2xl font-bold text-orange-600">
            {stats.draft}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-foreground-muted">Verified</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.verified}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-foreground-muted">Total Amount</div>
          <div className="text-xl font-bold text-blue-600">
            Rp {stats.totalAmount.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'DRAFT', 'VERIFIED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-primary text-white shadow-lg'
                : 'bg-secondary/10 text-primary hover:bg-secondary/20'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Expense List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-foreground-muted">
              No expenses found
            </p>
            <p className="text-sm text-foreground-muted mt-2">
              Upload a receipt to get started
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onUpdate={fetchExpenses}
            />
          ))
        )}
      </div>
    </div>
  );
}
