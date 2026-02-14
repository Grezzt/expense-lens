'use client';

import { AlertTriangle, Eye } from 'lucide-react';

interface AnomalyItem {
  id: string;
  type: string;
  merchant: string;
  amount: number;
  rule: string;
  severity: 'high' | 'medium' | 'low';
}

interface AnomalyWatchlistProps {
  anomalies: AnomalyItem[];
  onReview: (id: string) => void;
}

export default function AnomalyWatchlist({ anomalies, onReview }: AnomalyWatchlistProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSeverityColor = (severity: AnomalyItem['severity']) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-blue-600 bg-blue-50 border-blue-200',
    };
    return colors[severity];
  };

  return (
    <div className="card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-error" />
        <h3 className="text-lg font-semibold text-white">
          Flagged by AI
        </h3>
      </div>

      <div className="space-y-3">
        {anomalies.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-sm text-gray-300">No anomalies detected</p>
            <p className="text-xs text-gray-400 mt-1">All transactions look normal</p>
          </div>
        ) : (
          anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className="p-4 rounded-lg bg-error/10 border border-error/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <h4 className="font-semibold text-sm text-error">{anomaly.type}</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">
                    <span className="font-medium">{anomaly.merchant}</span>
                    {' - '}
                    <span className="font-semibold">{formatCurrency(anomaly.amount)}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Rule: {anomaly.rule}
                  </p>
                </div>
                <button
                  onClick={() => onReview(anomaly.id)}
                  className="bg-secondary hover:bg-secondary/90 text-gray-900 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 flex-shrink-0 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Review
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
