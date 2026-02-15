'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { supabase, Expense, getAllCategories, type Category } from '@/lib/supabase';
import ExpenseList from '@/components/expenses/ExpenseList';
import ExpenseDetailDrawer from '@/components/expenses/ExpenseDetailDrawer';
import { Plus, Filter, Search, ChevronDown, X } from 'lucide-react';

export default function MyExpensesPage() {
  const { currentOrg, setScanDrawerOpen } = useAppStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter States
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>(''); // 'VERIFIED', 'DRAFT', etc.
  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>('newest');

  // Filter Dropdown Visibility
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Drawer State
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch initial data
  useEffect(() => {
    if (!currentOrg) return;

    // Fetch Categories
    getAllCategories().then(setCategories).catch(console.error);

    fetchExpenses();
  }, [currentOrg]);

  const fetchExpenses = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('organization_id', currentOrg.id)
            .order('date', { ascending: false });

        if (error) throw error;
        setExpenses(data || []);
    } catch (error) {
        console.error('Error fetching expenses:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleCreateNew = () => {
      setScanDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
      try {
          const { error } = await supabase.from('expenses').delete().eq('id', id);
          if (error) throw error;
          // Optimistic update
          setExpenses(prev => prev.filter(e => e.id !== id));
      } catch (error) {
          console.error('Delete error:', error);
          alert('Failed to delete expense');
      }
  };

  // Filter Logic
  const filteredExpenses = expenses
    .filter(expense => {
        // Search Filter
        const matchesSearch =
            expense.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (expense.description && expense.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // Category Filter
        const matchesCategory = selectedCategory ? expense.category === selectedCategory : true;

        // Status Filter
        const matchesStatus = selectedStatus ? expense.status === selectedStatus : true;

        return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl h-full flex flex-col" onClick={() => {
        // Close dropdowns when clicking outside
        setShowCategoryFilter(false);
        setShowStatusFilter(false);
        setShowDateFilter(false);
    }}>
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
               <h1 className="text-3xl font-bold text-primary">My Expenses</h1>
               <p className="text-foreground-muted mt-1">Manage and track your spending</p>
           </div>

           <div className="flex items-center gap-3">
               <button
                onClick={handleCreateNew}
                className="btn btn-secondary shadow-lg shadow-[#bfd852]/20 flex items-center gap-2"
               >
                   <Plus className="w-5 h-5" />
                   New Expense
               </button>
           </div>
       </div>

       {/* Filters & Search Toolbar */}
       <div className="mb-6 space-y-4">

           {/* Search Bar */}
           <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
                <Search className="w-5 h-5 text-foreground-muted ml-2" />
                <input
                    type="text"
                    placeholder="Search expenses by merchant, category, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:outline-none text-foreground placeholder-foreground-muted"
                />
           </div>

           {/* Filter Pills Row */}
           <div className="flex flex-wrap items-center gap-3">

               {/* Type/Category Filter */}
               <div className="relative" onClick={(e) => e.stopPropagation()}>
                   <button
                        onClick={() => {
                            setShowCategoryFilter(!showCategoryFilter);
                            setShowStatusFilter(false);
                            setShowDateFilter(false);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                            selectedCategory
                            ? 'bg-[#022c22] text-white border-[#022c22]'
                            : 'bg-white text-foreground border-border hover:bg-gray-50'
                        }`}
                   >
                       <span>Type: {selectedCategory || 'All'}</span>
                       <ChevronDown className="w-4 h-4" />
                   </button>

                   {showCategoryFilter && (
                       <div className="absolute top-full left-0 mt-2 w-56 bg-[#022c22] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-scale-in">
                           <div className="p-2 max-h-60 overflow-y-auto">
                               <button
                                   onClick={() => { setSelectedCategory(''); setShowCategoryFilter(false); }}
                                   className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                                       selectedCategory === '' ? 'bg-[#bfd852] text-[#022c22] font-semibold' : 'text-white hover:bg-white/10'
                                   }`}
                               >
                                   All Types
                               </button>
                               {categories.map((cat) => (
                                   <button
                                       key={cat.id}
                                       onClick={() => { setSelectedCategory(cat.name); setShowCategoryFilter(false); }}
                                       className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                                           selectedCategory === cat.name ? 'bg-[#bfd852] text-[#022c22] font-semibold' : 'text-white hover:bg-white/10'
                                       }`}
                                   >
                                       {cat.name}
                                   </button>
                               ))}
                           </div>
                       </div>
                   )}
               </div>

               {/* Status Filter */}
               <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                         onClick={() => {
                             setShowStatusFilter(!showStatusFilter);
                             setShowCategoryFilter(false);
                             setShowDateFilter(false);
                         }}
                         className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                             selectedStatus
                             ? 'bg-[#022c22] text-white border-[#022c22]'
                             : 'bg-white text-foreground border-border hover:bg-gray-50'
                         }`}
                    >
                        <span>Status: {selectedStatus ? (selectedStatus === 'VERIFIED' ? 'Verified' : 'Draft') : 'All'}</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    {showStatusFilter && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-[#022c22] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-scale-in">
                            <div className="p-2">
                                <button
                                    onClick={() => { setSelectedStatus(''); setShowStatusFilter(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                                        selectedStatus === '' ? 'bg-[#bfd852] text-[#022c22] font-semibold' : 'text-white hover:bg-white/10'
                                    }`}
                                >
                                    All Statuses
                                </button>
                                <button
                                    onClick={() => { setSelectedStatus('VERIFIED'); setShowStatusFilter(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                                        selectedStatus === 'VERIFIED' ? 'bg-[#bfd852] text-[#022c22] font-semibold' : 'text-white hover:bg-white/10'
                                    }`}
                                >
                                    Verified
                                </button>
                                <button
                                    onClick={() => { setSelectedStatus('DRAFT'); setShowStatusFilter(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                        selectedStatus === 'DRAFT' ? 'bg-[#bfd852] text-[#022c22] font-semibold' : 'text-white hover:bg-white/10'
                                    }`}
                                >
                                    Draft
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Date Filter/Sort */}
               <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                         onClick={() => {
                             setShowDateFilter(!showDateFilter);
                             setShowCategoryFilter(false);
                             setShowStatusFilter(false);
                         }}
                         className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border bg-white text-foreground border-border hover:bg-gray-50`}
                    >
                        <span>Date: {dateSort === 'newest' ? 'Newest First' : 'Oldest First'}</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    {showDateFilter && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-[#022c22] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-scale-in">
                            <div className="p-2">
                                <button
                                    onClick={() => { setDateSort('newest'); setShowDateFilter(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                                        dateSort === 'newest' ? 'bg-[#bfd852] text-[#022c22] font-semibold' : 'text-white hover:bg-white/10'
                                    }`}
                                >
                                    Newest First
                                </button>
                                <button
                                    onClick={() => { setDateSort('oldest'); setShowDateFilter(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                        dateSort === 'oldest' ? 'bg-[#bfd852] text-[#022c22] font-semibold' : 'text-white hover:bg-white/10'
                                    }`}
                                >
                                    Oldest First
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Clear Filter Button */}
                {(selectedCategory || selectedStatus || searchQuery) && (
                    <button
                        onClick={() => {
                            setSelectedCategory('');
                            setSelectedStatus('');
                            setSearchQuery('');
                            setDateSort('newest');
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors ml-auto"
                    >
                        <X className="w-4 h-4" />
                        Clear Filters
                    </button>
                )}

           </div>
       </div>

       {/* Expense List */}
       <ExpenseList
        expenses={filteredExpenses}
        isLoading={loading}
        onView={(exp) => {
            setSelectedExpense(exp);
            setIsDrawerOpen(true);
        }}
        onDelete={handleDelete}
       />

       {/* Detail Drawer */}
       <ExpenseDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
            setIsDrawerOpen(false);
            setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onUpdate={fetchExpenses}
       />

    </div>
  );
}
