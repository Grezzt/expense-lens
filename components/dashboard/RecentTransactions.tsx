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
        className: 'bg-green-100 text-green-700',
      },
      DRAFT: {
        icon: Clock,
        text: 'Processing',
        className: 'bg-yellow-100 text-yellow-700',
      },
      FLAGGED: {
        icon: AlertCircle,
        text: 'Flagged',
        className: 'bg-red-100 text-red-700',
      },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4">
        Recent Transactions
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Merchant</th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
              <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
              <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No transactions yet
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-card-hover transition-colors">
                  <td className="py-3 px-2 text-sm font-medium text-white">
                    {transaction.merchant_name}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-300">
                    {transaction.category}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-300">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-3 px-2 text-sm font-semibold text-right text-white">
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
