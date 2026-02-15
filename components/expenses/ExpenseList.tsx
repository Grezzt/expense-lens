'use client';

import {
  FileText,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Tag
} from 'lucide-react';
import { Expense } from '@/lib/supabase';

interface ExpenseListProps {
  expenses: Expense[];
  onView: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export default function ExpenseList({ expenses, onView, onDelete, isLoading }: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-black/20 rounded-2xl border border-white/5">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-white/20" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">No expenses found</h3>
        <p className="text-secondary/60 text-sm">Create your first expense to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {expenses.map((expense) => (
        <div
            key={expense.id}
            className="group bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:border-[#bfd852]/50 hover:bg-black/60 transition-all duration-300 cursor-pointer flex flex-col gap-4 relative overflow-hidden"
            onClick={() => onView(expense)}
        >
            {/* Header: Merchant & Status */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                        {expense.image_url ? (
                            <img src={expense.image_url} alt="Receipt" className="w-full h-full object-cover" />
                        ) : (
                            <FileText className="w-6 h-6 text-white/50" />
                        )}
                     </div>
                     <div>
                         <h3 className="font-semibold text-white line-clamp-1 text-lg">{expense.merchant_name}</h3>
                         <div className="flex items-center gap-2 text-xs text-white/60 mt-0.5">
                             <Calendar className="w-3 h-3" />
                             {new Date(expense.date).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                         </div>
                     </div>
                </div>
                <StatusBadge status={expense.status} />
            </div>

            {/* Description (if any) */}
            {expense.description && (
                <p className="text-sm text-white/60 line-clamp-2 bg-white/5 p-2 rounded-lg italic">
                    "{expense.description}"
                </p>
            )}

            {/* Footer: Category & Amount */}
            <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-end">
                <div className="flex flex-col gap-1">
                     <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Category</span>
                     <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#bfd852]/10 text-[#bfd852] border border-[#bfd852]/20 w-fit">
                        <Tag className="w-3 h-3" />
                        {expense.category}
                     </span>
                </div>

                <div className="text-right">
                    <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Amount</span>
                    <p className="text-xl font-bold text-white">
                        Rp {expense.amount.toLocaleString('id-ID')}
                    </p>
                </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onDelete && confirm('Are you sure you want to delete this expense?')) {
                            onDelete(expense.id);
                        }
                    }}
                    className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20"
                    title="Delete"
                 >
                    <Trash2 className="w-4 h-4" />
                 </button>
            </div>

        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'VERIFIED':
            return (
                <div className="rounded-full bg-[#bfd852] p-1" title="Verified">
                     <CheckCircle2 className="w-4 h-4 text-[#022c22]" />
                </div>
            );
        case 'FLAGGED':
            return (
                <div className="rounded-full bg-red-500 p-1" title="Flagged">
                    <AlertCircle className="w-4 h-4 text-white" />
                </div>
            );
        default:
            return (
                <div className="rounded-full bg-blue-500 p-1" title="Pending">
                    <Clock className="w-4 h-4 text-white" />
                </div>
            );
    }
}
