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
  Legend
} from 'recharts';
import { Expense } from '@/lib/supabase';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface DashboardChartsProps {
  expenses: Expense[];
}

// el- palette
const COLORS = ['#bfd852', '#022c22', '#a3a3a3', '#fbbf24', '#0d9488', '#f97316'];

export default function DashboardCharts({ expenses }: DashboardChartsProps) {

  // 1. Prepare Trend Data (Daily Spend)
  const trendData = useMemo(() => {
    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
  }, [expenses]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

      {/* Spending Trend Chart */}
      <div
          className="p-6 bg-white"
          style={{
              border: '1.5px solid var(--el-primary)',
              position: 'relative'
          }}
      >
        {/* Top Accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: 'var(--el-accent)' }} />

        <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--el-accent)' }} />
            <h3 className="text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--el-primary)' }}>Spending Trend</h3>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#bfd852" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#bfd852" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(2,44,34,0.1)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#022c22', fontSize: 11, fontWeight: 600 }}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#022c22', fontSize: 11, fontWeight: 600 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                    backgroundColor: '#022c22',
                    border: 'none',
                    borderRadius: '0px',
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
                itemStyle={{ color: '#bfd852' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: 4 }}
                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Amount']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#022c22"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution Chart */}
      <div
          className="p-6 bg-white"
          style={{
              border: '1.5px solid var(--el-primary)',
              position: 'relative'
          }}
      >
        {/* Top Accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: 'var(--el-accent)' }} />

        <div className="flex items-center gap-2 mb-6">
            <PieIcon className="w-5 h-5" style={{ color: 'var(--el-accent)' }} />
            <h3 className="text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--el-primary)' }}>Spending by Category</h3>
        </div>

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
                        stroke="none"
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                         contentStyle={{
                            backgroundColor: '#022c22',
                            border: 'none',
                            borderRadius: '0px',
                            color: '#fff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}
                        itemStyle={{ color: '#bfd852' }}
                        formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Spend']}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="square"
                        formatter={(value) => <span className="text-xs font-bold uppercase tracking-wide ml-1" style={{ color: 'var(--el-primary)' }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
