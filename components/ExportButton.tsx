'use client';

import { useState } from 'react';

export default function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'DRAFT'>('VERIFIED');

  const handleExport = async () => {
    setLoading(true);
    try {
      const statusParam = filter === 'ALL' ? '' : `?status=${filter}`;
      const url = `/api/export${statusParam}&format=excel`;

      const res = await fetch(url);
      const blob = await res.blob();

      // Download file
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `expense-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-xl font-bold text-foreground">
        📊 Export Report
      </h3>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground-muted">
          Filter by Status
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="input"
        >
          <option value="ALL">All Expenses</option>
          <option value="VERIFIED">Verified Only</option>
          <option value="DRAFT">Draft Only</option>
        </select>

        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full btn btn-primary py-3"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⚙️</span>
              Generating...
            </span>
          ) : (
            '📥 Download Excel Report'
          )}
        </button>
      </div>

      <div className="text-xs text-foreground-muted">
        💡 Tip: Only verified expenses are included in financial reports
      </div>
    </div>
  );
}
