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

  return (
    <div
      style={{
        backgroundColor: 'var(--el-primary)',
        border: '1.5px solid var(--el-primary)',
        position: 'relative',
        height: '100%',
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
        className="px-6 pt-7 pb-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(191,216,82,0.15)' }}
      >
        <AlertTriangle
          className="w-4 h-4 flex-shrink-0"
          style={{ color: 'var(--el-accent)' }}
        />
        <div>
          <p
            style={{
              color: 'var(--el-accent)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              fontSize: 11,
            }}
          >
            AI Watchlist
          </p>
          <h3
            className="font-bold mt-0.5"
            style={{ color: 'var(--el-white)', fontSize: 18, letterSpacing: '-0.01em' }}
          >
            Flagged by AI
          </h3>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {anomalies.length === 0 ? (
          <div className="text-center py-10">
            <div
              className="w-12 h-12 flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: 'rgba(191,216,82,0.15)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="var(--el-accent)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--el-white)' }}
            >
              No anomalies detected
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              All transactions look normal
            </p>
          </div>
        ) : (
          anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className="p-4"
              style={{
                backgroundColor: 'rgba(191,216,82,0.06)',
                border: '1px solid rgba(191,216,82,0.15)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: 'var(--el-accent)' }}
                    />
                    <h4
                      className="font-bold text-sm truncate"
                      style={{ color: 'var(--el-accent)' }}
                    >
                      {anomaly.type}
                    </h4>
                  </div>
                  <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    <span className="font-semibold">{anomaly.merchant}</span>
                    {' — '}
                    <span style={{ color: 'var(--el-accent)', fontWeight: 700 }}>
                      {formatCurrency(anomaly.amount)}
                    </span>
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {anomaly.rule}
                  </p>
                </div>
                <button
                  onClick={() => onReview(anomaly.id)}
                  className="btn-el-accent flex items-center gap-1 flex-shrink-0"
                  style={{ fontSize: 11, padding: '6px 14px' }}
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
