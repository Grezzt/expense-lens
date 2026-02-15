'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Expense } from '@/lib/supabase';

interface DashboardChartsProps {
  expenses: Expense[];
}

const COLORS = ['#bfd852', '#022c22', '#ffffff', '#a3a3a3', '#fbbf24', '#ef4444'];

export default function DashboardCharts({ expenses }: DashboardChartsProps) {

  // 1. Prepare Trend Data (Daily Spend)
  const trendData = useMemo(() => {
    // Group by date
    const grouped = expenses.reduce((acc, curr) => {
        const date = new Date(curr.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        acc[date] = (acc[date] || 0) + curr.amount;
        return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by date (simplified - assuming expenses are already somewhat sorted or strict date parsing needed for perfect sort)
    // For better sorting, we might need raw date strings.
    // Let's rely on the incoming expenses being sorted by date API side or re-sort here.
    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Re-group based on sorted
    const orderedGrouped = sortedExpenses.reduce((acc, curr) => {
         const date = new Date(curr.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
         if (!acc.find(item => item.date === date)) {
             acc.push({ date, amount: curr.amount });
         } else {
             const existing = acc.find(item => item.date === date)!;
             existing.amount += curr.amount;
         }
         return acc;
    }, [] as { date: string, amount: number }[]);

    return orderedGrouped;
  }, [expenses]);

  // 2. Prepare Category Data
  const categoryData = useMemo(() => {
    const grouped = expenses.reduce((acc, curr) => {
        const cat = curr.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + curr.amount;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value) // Highest spend first
        .slice(0, 6); // Top 6 only
  }, [expenses]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

      {/* Spending Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-6">Spending Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#bfd852" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#bfd852" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Amount']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#bfd852"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution Chart */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-6">Spending by Category</h3>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Spend']}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-sm font-medium text-gray-600 ml-1">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
