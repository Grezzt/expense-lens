'use client';

import { Sparkles } from 'lucide-react';

interface AISummaryCardProps {
  summary: string;
  isLoading?: boolean;
}

export default function AISummaryCard({ summary, isLoading }: AISummaryCardProps) {
  return (
    <div className="bg-primary rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white mb-2">
            AI Executive Summary
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded animate-pulse w-full" />
              <div className="h-3 bg-gray-700 rounded animate-pulse w-5/6" />
              <div className="h-3 bg-gray-700 rounded animate-pulse w-4/6" />
            </div>
          ) : (
            <p className="text-sm text-white/90 leading-relaxed">
              {summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
