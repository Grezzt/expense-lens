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

  if (loading) {
      return <div className="p-8 text-white">Loading approvals...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl h-full flex flex-col">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
               <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                   <Inbox className="w-8 h-8" />
                   Review & Approvals
               </h1>
               <p className="text-foreground-muted mt-1">
                   {expenses.length} expenses waiting for your approval
               </p>
           </div>
       </div>

       {/* List or Empty State */}
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
