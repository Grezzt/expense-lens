'use client';

import {
  FileText,
  Clock,
  Calendar,
  Tag,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Expense } from '@/lib/supabase';
import { useState } from 'react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface ExpenseListProps {
  expenses: Expense[];
  onView: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export default function ExpenseList({ expenses, onView, onDelete, isLoading }: ExpenseListProps) {
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-gray-100 animate-pulse border border-gray-200" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-dashed border-gray-300">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-1">No expenses found</h3>
        <p className="text-gray-500 text-sm">Create your first expense to get started.</p>
      </div>
    );
  }

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpenseToDelete(id);
  };

  const confirmDelete = () => {
    if (onDelete && expenseToDelete) {
      onDelete(expenseToDelete);
      setExpenseToDelete(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenses.map((expense) => (
           <div
              key={expense.id}
              className="group el-hover-card-wrapper"
              onClick={() => onView(expense)}
              style={{ cursor: 'pointer' }}
          >
              <div className="el-hover-card relative flex flex-col h-full" style={{ padding: 20 }}>

                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                           {/* Receipt Thumbnail or Icon */}
                           <div className="w-12 h-12 rounded-none overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-200">
                              {expense.image_url ? (
                                  <img src={expense.image_url} alt="Receipt" className="w-full h-full object-cover" />
                              ) : (
                                  <FileText className="w-6 h-6 text-gray-400" />
                              )}
                           </div>

                           <div>
                               <h3 className="font-bold text-lg leading-tight line-clamp-1" style={{ color: 'var(--el-primary)' }}>{expense.merchant_name}</h3>
                               <div className="flex items-center gap-2 text-xs font-medium mt-1" style={{ color: 'var(--el-primary)', opacity: 0.6 }}>
                                   <Calendar className="w-3 h-3" />
                                   {new Date(expense.date).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                               </div>
                           </div>
                      </div>

                      {/* Status Badge */}
                      <StatusBadge status={expense.status} />
                  </div>

                  {/* Description */}
                  {expense.description && (
                      <p className="text-sm italic line-clamp-2 mb-4 flex-1" style={{ color: 'var(--el-primary)', opacity: 0.7 }}>
                          "{expense.description}"
                      </p>
                  )}
                  {!expense.description && <div className="flex-1" />}

                  {/* Footer */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-end">
                      <div className="flex flex-col gap-1">
                           <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--el-primary)', opacity: 0.4 }}>Category</span>
                           <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold w-fit" style={{ backgroundColor: '#f1f1f1', color: 'var(--el-primary)' }}>
                              <Tag className="w-3 h-3" />
                              {expense.category}
                           </span>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                           {/* Delete Action (Hover) */}
                           {onDelete && (
                               <button
                                   onClick={(e) => handleDeleteClick(e, expense.id)}
                                   className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                   title="Delete"
                               >
                                   <Trash2 className="w-4 h-4" />
                               </button>
                           )}

                           <div>
                               <span className="text-[10px] uppercase tracking-wider font-bold block text-right mb-0.5" style={{ color: 'var(--el-primary)', opacity: 0.4 }}>Amount</span>
                               <p className="text-lg font-black" style={{ color: 'var(--el-primary)' }}>
                                   Rp {expense.amount.toLocaleString('id-ID')}
                               </p>
                           </div>
                      </div>
                  </div>
              </div>

              {/* Lime Shadow */}
              <div className="el-hover-card-shadow" />
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete Expense"
        variant="danger"
      />
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'VERIFIED':
            return (
                <div className="px-2 py-1 bg-[#bfd852]/20 text-[#022c22] text-[10px] font-bold uppercase tracking-wide flex items-center gap-1" title="Verified">
                     <CheckCircle2 className="w-3 h-3" /> Verified
                </div>
            );
        case 'FLAGGED':
            return (
                <div className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1" title="Flagged">
                    <AlertCircle className="w-3 h-3" /> Flagged
                </div>
            );
        default:
            return (
                <div className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1" title="Pending">
                    <Clock className="w-3 h-3" /> Draft
                </div>
            );
    }
}
