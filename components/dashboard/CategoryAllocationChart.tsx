'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryAllocationChartProps {
  data: CategoryData[];
}

// Themed palette derived from el- design system
const EL_PALETTE = [
  '#bfd852', // el-accent lime
  '#022c22', // el-primary dark green
  '#5a8a6a', // mid green
  '#8ab878', // light green
  '#d4ef82', // pale lime
  '#034433', // deep forest
  '#3d6b50', // moss green
  '#a0c84a', // yellow-green
];

export default function CategoryAllocationChart({ data }: CategoryAllocationChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.06) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Override colors with themed palette
  const themedData = data.map((item, i) => ({
    ...item,
    color: EL_PALETTE[i % EL_PALETTE.length],
  }));

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
          Category Breakdown
        </p>
        <h3
          className="font-bold mt-1"
          style={{
            color: 'var(--el-primary)',
            fontSize: 18,
            letterSpacing: '-0.01em',
          }}
        >
          Alokasi per Kategori
        </h3>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={themedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={75}
              innerRadius={42}
              fill="#022c22"
              dataKey="value"
              paddingAngle={2}
            >
              {themedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
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
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string, entry: any) => {
                const percentage = ((entry.payload.value / total) * 100).toFixed(1);
                return (
                  <span style={{ color: 'var(--el-primary)', fontSize: '11px', fontWeight: 500 }}>
                    {value} ({percentage}%)
                  </span>
                );
              }}
              wrapperStyle={{ fontSize: '11px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
