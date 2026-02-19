'use client';

import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Transaction {
  id: string;
  merchant_name: string;
  amount: number;
  date: string;
  status: 'VERIFIED' | 'DRAFT' | 'FLAGGED';
  category: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const badges = {
      VERIFIED: {
        icon: CheckCircle,
        text: 'Verified',
        style: {
          backgroundColor: 'rgba(191,216,82,0.15)',
          color: 'var(--el-primary)',
          border: '1px solid rgba(191,216,82,0.4)',
        },
      },
      DRAFT: {
        icon: Clock,
        text: 'Processing',
        style: {
          backgroundColor: 'rgba(245,158,11,0.1)',
          color: '#92400e',
          border: '1px solid rgba(245,158,11,0.3)',
        },
      },
      FLAGGED: {
        icon: AlertCircle,
        text: 'Flagged',
        style: {
          backgroundColor: 'rgba(220,38,38,0.08)',
          color: '#dc2626',
          border: '1px solid rgba(220,38,38,0.25)',
        },
      },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold"
        style={badge.style}
      >
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--el-white)',
        border: '1.5px solid var(--el-primary)',
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
      <div
        className="px-6 pt-7 pb-4"
        style={{ borderBottom: '1px solid rgba(2,44,34,0.1)' }}
      >
        <p className="el-callout-text" style={{ fontSize: 11, letterSpacing: '1.5px' }}>
          Recent Activity
        </p>
        <h3
          className="font-bold mt-1"
          style={{ color: 'var(--el-primary)', fontSize: 18, letterSpacing: '-0.01em' }}
        >
          Recent Transactions
        </h3>
      </div>

      <div className="overflow-x-auto px-6 pb-6 pt-2">
        <table className="w-full">
          <thead>
            <tr>
              {['Merchant', 'Category', 'Date', 'Amount', 'Status'].map((h, i) => (
                <th
                  key={h}
                  className="py-3 px-2 el-callout-text"
                  style={{
                    fontSize: 10,
                    letterSpacing: '1.5px',
                    textAlign: i === 3 ? 'right' : i === 4 ? 'center' : 'left',
                    borderBottom: '1px solid rgba(2,44,34,0.1)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12"
                  style={{ color: 'var(--el-primary)', opacity: 0.4, fontSize: 14 }}
                >
                  No transactions yet
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid rgba(2,44,34,0.05)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(191,216,82,0.05)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <td
                    className="py-3 px-2 text-sm font-semibold"
                    style={{ color: 'var(--el-primary)' }}
                  >
                    {transaction.merchant_name}
                  </td>
                  <td
                    className="py-3 px-2 text-sm"
                    style={{ color: 'var(--el-primary)', opacity: 0.55 }}
                  >
                    {transaction.category}
                  </td>
                  <td
                    className="py-3 px-2 text-sm"
                    style={{ color: 'var(--el-primary)', opacity: 0.55 }}
                  >
                    {formatDate(transaction.date)}
                  </td>
                  <td
                    className="py-3 px-2 text-sm font-bold text-right"
                    style={{ color: 'var(--el-primary)' }}
                  >
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {getStatusBadge(transaction.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
