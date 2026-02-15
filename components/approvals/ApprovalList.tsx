'use client';

import {
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  Calendar,
  Tag,
  User as UserIcon
} from 'lucide-react';
import { Expense } from '@/lib/supabase';

interface ApprovalListProps {
  expenses: Expense[];
  onView: (expense: Expense) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isLoading?: boolean;
}

export default function ApprovalList({ expenses, onView, onApprove, onReject, isLoading }: ApprovalListProps) {
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
          <CheckCircle2 className="w-8 h-8 text-white/20" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">All caught up!</h3>
        <p className="text-secondary/60 text-sm">No expenses pending approval.</p>
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
            {/* Header: User & Date */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 border border-secondary/30">
                        <UserIcon className="w-5 h-5 text-secondary" />
                     </div>
                     <div>
                         <p className="text-sm font-medium text-white">
                             Requested by <span className="text-secondary">Member</span>
                             {/* Need to fetch user details or display ID if name not available in expense object yet */}
                         </p>
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
            </div>

            {/* Merchant & Description */}
            <div>
                 <h3 className="font-semibold text-white line-clamp-1 text-lg">{expense.merchant_name}</h3>
                 {expense.description && (
                    <p className="text-sm text-white/60 line-clamp-1 mt-1">
                        "{expense.description}"
                    </p>
                )}
            </div>

            {/* Receipt Image Preview (Mini) */}
            {expense.image_url && (
                <div className="h-20 w-full rounded-lg overflow-hidden bg-white/5 border border-white/10">
                     <img src={expense.image_url} alt="Receipt" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
            )}

            {/* Footer: Amount & Actions */}
            <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center">
                <div>
                    <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Amount</span>
                    <p className="text-xl font-bold text-white">
                        Rp {expense.amount.toLocaleString('id-ID')}
                    </p>
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onReject(expense.id)}
                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20"
                        title="Reject"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onApprove(expense.id)}
                        className="p-2 bg-[#bfd852]/10 text-[#bfd852] hover:bg-[#bfd852] hover:text-[#022c22] rounded-lg transition-colors border border-[#bfd852]/20"
                        title="Approve"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
      ))}
    </div>
  );
}
