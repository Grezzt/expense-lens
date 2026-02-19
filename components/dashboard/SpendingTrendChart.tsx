'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SpendingData {
  date: string;
  amount: number;
}

interface SpendingTrendChartProps {
  data: SpendingData[];
}

export default function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(value);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--el-white)',
        border: '1.5px solid var(--el-primary)',
        padding: '24px 20px',
        position: 'relative',
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: 'var(--el-accent)',
        }}
      />

      {/* Header */}
      <div className="mb-5">
        <p className="el-callout-text" style={{ fontSize: 11, letterSpacing: '1.5px' }}>
          Spending Trend
        </p>
        <h3
          className="font-bold mt-1"
          style={{
            color: 'var(--el-primary)',
            fontSize: 18,
            letterSpacing: '-0.01em',
          }}
        >
          Pengeluaran Periode Ini
        </h3>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="35%">
            <XAxis
              dataKey="date"
              stroke="rgba(2,44,34,0.3)"
              tick={{ fill: 'var(--el-primary)', fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="rgba(2,44,34,0.3)"
              tick={{ fill: 'var(--el-primary)', fontSize: 11 }}
              tickFormatter={formatCurrency}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
              contentStyle={{
                backgroundColor: 'var(--el-primary)',
                border: 'none',
                borderRadius: 0,
                padding: '10px 14px',
                color: 'var(--el-white)',
                fontSize: 13,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
              labelStyle={{ color: 'var(--el-accent)', fontWeight: 700, fontSize: 12 }}
              cursor={{ fill: 'rgba(191,216,82,0.08)' }}
            />
            <Bar
              dataKey="amount"
              fill="var(--el-accent)"
              radius={[0, 0, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
