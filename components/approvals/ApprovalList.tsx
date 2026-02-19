'use client';

import {
  CheckCircle2,
  XCircle,
  Calendar,
  Tag,
  User as UserIcon,
  Check,
  X,
  FileText
} from 'lucide-react';
import { Expense } from '@/lib/supabase';
import { useState } from 'react';

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
          <div key={i} className="h-48 bg-gray-100 animate-pulse" style={{ border: '1px solid rgba(2,44,34,0.1)' }} />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" style={{ backgroundColor: 'var(--el-white)', border: '1px solid rgba(2,44,34,0.1)' }}>
        <div className="w-16 h-16 flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(2,44,34,0.03)' }}>
          <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--el-primary)', opacity: 0.3 }} />
        </div>
        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--el-primary)' }}>All caught up!</h3>
        <p className="text-sm" style={{ color: 'var(--el-primary)', opacity: 0.6 }}>No expenses pending approval.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {expenses.map((expense) => (
        <div
            key={expense.id}
            className="group el-hover-card-wrapper"
            onClick={() => onView(expense)}
            style={{ cursor: 'pointer', borderRight: 'none' }} // Override wrapper border for grid cards if needed, but standard wrapper is fine.
        >
             <div className="el-hover-card relative flex flex-col h-full" style={{ padding: 20 }}>

                {/* Header: User & Date */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--el-primary)', color: 'var(--el-accent)' }}>
                            <UserIcon className="w-5 h-5" />
                         </div>
                         <div>
                             <p className="text-sm font-bold" style={{ color: 'var(--el-primary)' }}>
                                 Member Request
                             </p>
                             <div className="flex items-center gap-2 text-xs font-medium mt-0.5" style={{ color: 'var(--el-primary)', opacity: 0.6 }}>
                                 <Calendar className="w-3 h-3" />
                                 {new Date(expense.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                             </div>
                         </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-4 flex-1">
                     <h3 className="font-bold text-lg mb-1 line-clamp-1" style={{ color: 'var(--el-primary)' }}>{expense.merchant_name}</h3>
                     {expense.description && (
                        <p className="text-sm line-clamp-2 italic" style={{ color: 'var(--el-primary)', opacity: 0.7 }}>
                            "{expense.description}"
                        </p>
                    )}
                </div>

                {/* Receipt Preview */}
                {expense.image_url && (
                    <div className="h-24 w-full mb-4 overflow-hidden border" style={{ borderColor: 'rgba(2,44,34,0.1)', backgroundColor: '#f9fafb' }}>
                         <img src={expense.image_url} alt="Receipt" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}

                {/* Footer: Amount & Actions */}
                <div className="mt-auto pt-4 flex justify-between items-end border-t" style={{ borderColor: 'rgba(2,44,34,0.1)' }}>
                    <div>
                        <span className="text-xs uppercase tracking-wider font-bold block mb-0.5" style={{ color: 'var(--el-primary)', opacity: 0.5 }}>Amount</span>
                        <p className="text-xl font-bold" style={{ color: 'var(--el-primary)' }}>
                             Rp {expense.amount.toLocaleString('id-ID')}
                        </p>
                    </div>

                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => onReject(expense.id)}
                            className="w-9 h-9 flex items-center justify-center border transition-colors hover:bg-red-50 hover:border-red-200"
                            style={{ borderColor: 'rgba(2,44,34,0.1)', color: '#ef4444' }}
                            title="Reject"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onApprove(expense.id)}
                            className="w-9 h-9 flex items-center justify-center overflow-hidden relative"
                            style={{ backgroundColor: 'var(--el-accent)', color: 'var(--el-primary)' }}
                            title="Approve"
                        >
                            <Check className="w-5 h-5 font-bold" />
                        </button>
                    </div>
                </div>
             </div>
             {/* Lime Shadow */}
             <div className="el-hover-card-shadow" />
        </div>
      ))}
    </div>
  );
}
