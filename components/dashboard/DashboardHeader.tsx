'use client';

import { Camera, Calendar } from 'lucide-react';
import "../../app/globals.css";

interface DashboardHeaderProps {
  userName: string;
  greeting: string;
  onScanClick: () => void;
  onDateFilterChange: (filter: string) => void;
  currentFilter: string;
}

export default function DashboardHeader({
  userName,
  greeting,
  onScanClick,
  onDateFilterChange,
  currentFilter,
}: DashboardHeaderProps) {
  const dateFilters = [
    { value: 'today', label: 'Hari ini' },
    { value: 'week', label: 'Minggu ini' },
    { value: 'month', label: 'Bulan ini' },
    { value: 'quarter', label: 'Kuartal ini' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
      {/* Greeting Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}, {userName}
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          Keuangan bulan ini terlihat stabil
        </p>
      </div>

      {/* Actions Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Date Filter */}
        <div className="relative">
          <select
            value={currentFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
          >
            {dateFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Scan Receipt CTA */}
        <button
          onClick={onScanClick}
          className="bg-primary hover:bg-primary-600 text-white flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all text-sm"
        >
          <Camera className="w-4 h-4" />
          Scan Receipt Now
        </button>
      </div>
    </div>
  );
}
