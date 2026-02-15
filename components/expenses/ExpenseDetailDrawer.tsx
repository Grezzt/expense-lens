'use client';

import { useState, useEffect } from 'react';
import { X, Check, Loader2, Trash2 } from 'lucide-react';
import { Expense, createExpense, getAllCategories, type Category } from '@/lib/supabase'; // We might need an updateExpense function later
import { supabase } from '@/lib/supabase';

interface ExpenseDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onUpdate: () => void;
}

export default function ExpenseDetailDrawer({ isOpen, onClose, expense, onUpdate }: ExpenseDetailDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    merchant_name: '',
    amount: '',
    date: '',
    category: '',
    description: '',
    items: [] as string[],
  });

  // Fetch categories on mount
  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error);
  }, []);

  // Hydrate form when expense changes
  useEffect(() => {
    if (expense) {
      setFormData({
        merchant_name: expense.merchant_name,
        amount: expense.amount.toString(),
        date: expense.date,
        category: expense.category,
        description: expense.description || '',
        items: expense.items || [],
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;

    setLoading(true);

    try {
       const { error } = await supabase
        .from('expenses')
        .update({
            merchant_name: formData.merchant_name,
            amount: parseFloat(formData.amount) || 0,
            date: formData.date,
            category: formData.category,
            description: formData.description,
            items: formData.items,
        })
        .eq('id', expense.id);

        if (error) throw error;

        onUpdate(); // Refresh parent
        onClose();
    } catch (error) {
        console.error('Update error:', error);
        alert('Failed to update expense');
    } finally {
        setLoading(false);
    }
  };

  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity cursor-pointer ${
          isOpen ? 'animate-fade-in' : 'animate-fade-out'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel - WIDER (max-w-5xl) for Split View */}
      <div className={`relative w-full max-w-6xl h-full glass-drawer text-white shadow-2xl transform transition-transform flex flex-col ${
        isOpen ? 'animate-slide-in-right' : 'animate-slide-out-right'
      }`}>

        {/* Header - Stays on top */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Expense Details
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#034433] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Split Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

            {/* LEFT SIDE: Image (Desktop: 50%, Mobile: Top) */}
            <div className="w-full md:w-1/2 p-6 bg-black/30 md:border-r border-white/10 flex flex-col justify-center items-center relative overflow-hidden shrink-0 h-[40vh] md:h-full">
                 <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 bg-black/20 flex items-center justify-center relative group">
                    {expense?.image_url ? (
                        <img src={expense.image_url} className="w-full h-full object-contain" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-white/30 gap-2">
                             <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                <Check className="w-6 h-6 text-white/20" />
                             </div>
                             <span className="text-sm">No Receipt Image</span>
                        </div>
                    )}
                 </div>
                  {/* Floating Action for Image */}
                  {expense?.image_url && (
                    <a
                        href={expense.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-10 right-10 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-white hover:bg-[#bfd852] hover:text-[#022c22] transition-colors border border-white/10 shadow-lg"
                    >
                        View Original
                    </a>
                )}
            </div>

            {/* RIGHT SIDE: Form (Desktop: 50%, Mobile: Bottom) */}
            <div className="w-full md:w-1/2 flex flex-col h-full bg-[#022c22]/50">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Merchant */}
                        <div className="space-y-2">
                            <label className="text-xs text-secondary/80 uppercase tracking-widest font-semibold ml-1">Merchant</label>
                            <input
                            type="text"
                            value={formData.merchant_name}
                            onChange={(e) => setFormData({...formData, merchant_name: e.target.value})}
                            style={{ color: '#ffffff' }}
                            className="w-full bg-black/20 border border-white/10 focus:border-[#bfd852] rounded-xl px-4 py-3.5 !text-white placeholder-white/50 outline-none transition-all duration-300 focus:bg-black/40"
                            required
                            />
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <label className="text-xs text-secondary/80 uppercase tracking-widest font-semibold ml-1">Amount</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-[#bfd852] transition-colors">Rp</span>
                                <input
                                type="number"
                                min="0"
                                value={formData.amount}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (val < 0) return;
                                    setFormData({...formData, amount: e.target.value})
                                }}
                                style={{ color: '#ffffff' }}
                                className="w-full bg-black/20 border border-white/10 focus:border-[#bfd852] rounded-xl pl-10 pr-4 py-3.5 !text-white placeholder-white/50 outline-none transition-all duration-300 focus:bg-black/40"
                                required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-secondary/80 uppercase tracking-widest font-semibold ml-1">Date</label>
                                <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                style={{ color: '#ffffff' }}
                                className="w-full bg-black/20 border border-white/10 focus:border-[#bfd852] rounded-xl px-4 py-3.5 !text-white outline-none transition-all duration-300 focus:bg-black/40 [color-scheme:dark]"
                                required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-secondary/80 uppercase tracking-widest font-semibold ml-1">Category</label>
                                <select
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                style={{ color: '#ffffff' }}
                                className="w-full bg-black/20 border border-white/10 focus:border-[#bfd852] rounded-xl px-4 py-3.5 !text-white outline-none transition-all duration-300 focus:bg-black/40 appearance-none cursor-pointer"
                                >
                                    <option value="" disabled className="bg-[#022c22] text-white">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name} className="bg-[#022c22] text-white my-1">
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-secondary/80 uppercase tracking-widest font-semibold ml-1">Description</label>
                            <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            style={{ color: '#ffffff' }}
                            className="w-full bg-black/20 border border-white/10 focus:border-[#bfd852] rounded-xl px-4 py-3.5 !text-white placeholder-white/50 outline-none transition-all duration-300 focus:bg-black/40 resize-none"
                            placeholder="No description"
                            />
                        </div>

                        <div className="space-y-3 mt-4 ml-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-secondary/80 uppercase tracking-widest font-semibold ml-1">Items List</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, items: [...(formData.items || []), '']})}
                                    className="text-xs text-[#bfd852] hover:text-[#d0ea62] font-semibold flex items-center gap-1 transition-colors"
                                >
                                    + Add Item
                                </button>
                            </div>

                            <div className="space-y-2">
                                {formData.items?.map((item: string, index: number) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => {
                                                const newItems = [...(formData.items || [])];
                                                newItems[index] = e.target.value;
                                                setFormData({...formData, items: newItems});
                                            }}
                                            style={{ color: '#ffffff' }}
                                            className="flex-1 bg-black/20 border border-white/10 focus:border-[#bfd852] rounded-xl px-4 py-2 text-sm !text-white placeholder-white/50 outline-none transition-all duration-300 focus:bg-black/40"
                                            placeholder={`Item ${index + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = formData.items.filter((_: string, i: number) => i !== index);
                                                setFormData({...formData, items: newItems});
                                            }}
                                            className="p-2 text-white/50 hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer in Right Column */}
                <div className="p-6 border-t border-[#034433] bg-[#022c22] flex gap-4 shrink-0">
                    <button
                        type="submit"
                        form="edit-form"
                        disabled={loading}
                        className="flex-1 bg-[#bfd852] text-[#022c22] py-3 rounded-xl font-bold hover:bg-[#d0ea62] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#bfd852]/10"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Check className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
