'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { supabase, Expense, getUserRole } from '@/lib/supabase';
import ApprovalList from '@/components/approvals/ApprovalList';
import ExpenseDetailDrawer from '@/components/expenses/ExpenseDetailDrawer'; // We reuse this for viewing
import { useRouter } from 'next/navigation';
import { Inbox, CheckCircle2 } from 'lucide-react';

export default function ApprovalsPage() {
  const { currentOrg, currentUser } = useAppStore();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  // Drawer State
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!currentOrg || !currentUser) return;

    const checkAccess = async () => {
        try {
            const userRole = await getUserRole(currentOrg.id, currentUser.id);
            setRole(userRole);

            // RBAC Check: proper roles
            if (!['owner', 'admin', 'accountant'].includes(userRole || '')) {
                router.push('/dashboard'); // Redirect unauthorized
                return;
            }

            fetchPendingExpenses();
        } catch (error) {
            console.error('Error checking role:', error);
            setLoading(false);
        }
    };

    checkAccess();
  }, [currentOrg, currentUser, router]);

  const fetchPendingExpenses = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
        // Fetch expenses that are DRAFT (Pending Approval)
        // In a real app, you might filter by 'PENDING' status if available
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('organization_id', currentOrg.id)
            .eq('status', 'DRAFT')
            .order('date', { ascending: true }); // Oldest first for approvals

        if (error) throw error;
        setExpenses(data || []);
    } catch (error) {
        console.error('Error fetching approvals:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
      try {
          const { error } = await supabase
            .from('expenses')
            .update({ status: 'VERIFIED' }) // Mark as VERIFIED
            .eq('id', id);

          if (error) throw error;

          // Optimistic update
          setExpenses(prev => prev.filter(e => e.id !== id));

          // Optional: Show success toast
      } catch (error) {
          console.error('Approval error:', error);
          alert('Failed to approve expense');
      }
  };

  const handleReject = async (id: string) => {
      if(!confirm('Rejecting this expense will delete it. Continue?')) return;

      try {
          // For now, rejection deletes the draft.
          // Ideally, change status to 'REJECTED' or 'NEEDS_REVISION'
          const { error } = await supabase.from('expenses').delete().eq('id', id);

          if (error) throw error;
           // Optimistic update
           setExpenses(prev => prev.filter(e => e.id !== id));
      } catch (error) {
          console.error('Rejection error:', error);
          alert('Failed to reject expense');
      }
  };

  return (
    <div className="mx-auto px-6 py-10" style={{ maxWidth: 1400 }}>
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid rgba(2,44,34,0.1)' }}>
           <div>
               <p className="el-callout-text mb-2">Needs Attention</p>
               <h1 className="font-bold flex items-center gap-3" style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--el-primary)', lineHeight: 1.1 }}>
                   <Inbox className="w-8 h-8" style={{ color: 'var(--el-accent)' }} />
                   Approvals
               </h1>
               <p className="mt-2 text-sm" style={{ color: 'var(--el-primary)', opacity: 0.6 }}>
                   {expenses.length > 0 ? `${expenses.length} expenses waiting for your review` : 'No pending approvals'}
               </p>
           </div>
       </div>

       {/* List or Empty State */}
       <div className="animate-fade-in">
           <ApprovalList
            expenses={expenses}
            isLoading={loading}
            onView={(exp) => {
                setSelectedExpense(exp);
                setIsDrawerOpen(true);
            }}
            onApprove={handleApprove}
            onReject={handleReject}
           />
       </div>

       {/* Detail Drawer (Read-Only or Edit if needed) */}
       <ExpenseDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
            setIsDrawerOpen(false);
            setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onUpdate={fetchPendingExpenses} // Refresh list if edited in drawer
       />

    </div>
  );
}
