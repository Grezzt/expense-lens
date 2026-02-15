'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Check, Loader2, ScanLine, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { createExpense, getAllCategories, type Category } from '@/lib/supabase';

interface CreateExpenseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type ScanStep = 'upload' | 'scanning' | 'verify' | 'success';

interface ExtractedData {
  merchant_name: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
  items?: string[];
}

export default function CreateExpenseDrawer({ isOpen, onClose }: CreateExpenseDrawerProps) {
  const router = useRouter();
  const { currentOrg, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'manual' | 'scan'>('scan');
  const [step, setStep] = useState<ScanStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data
  const [categories, setCategories] = useState<Category[]>([]);

  // State for data to save
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [rawData, setRawData] = useState<any>(null);

  // Manual Form State
  const [formData, setFormData] = useState({
    merchant_name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '', // Default to empty, will be set after fetch
    description: '',
    items: [] as string[],
  });

  // Fetch categories on mount
  useEffect(() => {
    getAllCategories().then((data) => {
      setCategories(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, category: data[0].name }));
      }
    }).catch(console.error);
  }, []);

  // Reset state helper
  const resetForm = () => {
      setStep('upload');
      setFile(null);
      setPreview('');
      setUploadedImageUrl('');
      setRawData(null);
      setFormData(prev => ({
        merchant_name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: categories.length > 0 ? categories[0].name : '',
        description: '',
        items: [],
      }));
  };

  // Reset state only on open if previously successful
  useEffect(() => {
    if (isOpen) {
        if (step === 'success') {
            resetForm();
        }
        // Otherwise keep the state (persisting scanned data)
    }
  }, [isOpen]);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);

    startScan(selectedFile);
  };

  const startScan = async (imageFile: File) => {
    setStep('scanning');
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);

      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const formData = new FormData();
        formData.append('base64', base64);

        // Upload
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Upload failed');
        const { imageUrl } = await uploadRes.json();
        setUploadedImageUrl(imageUrl);

        // Extract
        const extractRes = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl }),
        });
        if (!extractRes.ok) throw new Error('Extraction failed');
        const data = await extractRes.json();
        setRawData(data.extractedData);

        setFormData(prev => ({
            ...prev,
            merchant_name: data.extractedData.merchant_name || '',
            amount: data.extractedData.amount?.toString() || '',
            date: data.extractedData.date || new Date().toISOString().split('T')[0],
            category: data.extractedData.category || prev.category || 'Lainnya',
            description: data.extractedData.description || '',
            items: data.extractedData.items || [],
        }));
        setStep('verify');
      };
    } catch (error) {
      console.error('Scan error:', error);
      alert('Failed to scan. Please try manual entry.');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  // Role State
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch role on mount or org change
  useEffect(() => {
    if (currentOrg && currentUser) {
        import('@/lib/supabase').then(({ getUserRole }) => {
            getUserRole(currentOrg.id, currentUser.id).then(role => setUserRole(role));
        });
    }
  }, [currentOrg, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOrg || !currentUser) {
        alert('Missing user or organization session');
        return;
    }

    setLoading(true);

    try {
        // Force DRAFT status for ALL roles (User Request)
        // This ensures every expense goes through the Approval workflow
        const status = 'DRAFT';

        await createExpense({
            organization_id: currentOrg.id,
            created_by: currentUser.id,
            merchant_name: formData.merchant_name,
            amount: parseFloat(formData.amount) || 0,
            date: formData.date,
            category: formData.category,
            description: formData.description,
            items: formData.items,
            image_url: uploadedImageUrl || '',
            status: status,
            raw_data: rawData || {},
        });

        setStep('success');

        // Refresh dashboard and close
        setTimeout(() => {
            setLoading(false);
            onClose();
            window.location.reload();
        }, 1500);

    } catch (error) {
        console.error('Save error:', error);
        alert('Failed to save expense');
        setLoading(false);
    }
  };

  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 350); // Slightly longer than animation (300ms)
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle backdrop click
  // We can attach click directly to the backdrop element since it's a sibling to the drawer
  // and sits behind it visually.

  if (!isVisible && !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop - Clicking this closes the drawer */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity cursor-pointer ${
          isOpen ? 'animate-fade-in' : 'animate-fade-out'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`relative w-full max-w-md h-full glass-drawer text-white shadow-2xl transform transition-transform flex flex-col ${
        isOpen ? 'animate-slide-in-right' : 'animate-slide-out-right'
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Create expense
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#034433] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs (Segmented Control) */}
        <div className="p-6 pb-0">
          <div className="flex bg-black/20 rounded-xl p-1 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ease-out flex items-center justify-center gap-2 ${
                activeTab === 'manual'
                ? 'bg-[#bfd852] text-[#022c22] shadow-lg shadow-[#bfd852]/20 scale-100'
                : 'text-gray-400 hover:text-white hover:bg-white/5 scale-95'
              }`}
            >
              <FileText className="w-4 h-4" />
              Manual
            </button>
            <button
              onClick={() => { setActiveTab('scan'); if(step === 'success') setStep('upload'); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ease-out flex items-center justify-center gap-2 ${
                activeTab === 'scan'
                ? 'bg-[#bfd852] text-[#022c22] shadow-lg shadow-[#bfd852]/20 scale-100'
                : 'text-gray-400 hover:text-white hover:bg-white/5 scale-95'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              Scan
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* SCAN TAB */}
          {activeTab === 'scan' && (
            <div className="h-full flex flex-col">
              {step === 'upload' && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    e.dataTransfer.files?.[0] && handleFileSelect(e.dataTransfer.files[0]);
                  }}
                  className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-out group ${
                    isDragging
                    ? 'border-[#bfd852] bg-[#bfd852]/10 scale-[1.02]'
                    : 'border-white/10 hover:border-[#bfd852]/50 hover:bg-white/5'
                  }`}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />

                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-300">
                     <div className="absolute inset-0 bg-[#bfd852] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
                     <ScanLine className="w-10 h-10 text-[#bfd852] group-hover:text-[#d0ea62] transition-colors" />
                  </div>

                  <h3 className="text-xl font-bold mb-2">Upload receipts</h3>
                  <p className="text-gray-400 text-sm mb-6">or drag and drop them here</p>

                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="bg-[#bfd852] text-[#022c22] px-6 py-2 rounded-full font-bold hover:bg-[#d0ea62] transition-colors"
                  >
                    Choose files
                  </button>
                </div>
              )}

              {step === 'scanning' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-[#034433] rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Loader2 className="w-10 h-10 text-[#bfd852] animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Analyzing Receipt...</h3>
                </div>
              )}

              {step === 'verify' && (
                <div className="animate-fade-in flex-1">
                    <div className="mb-6 h-40 w-full rounded-xl overflow-hidden border border-[#034433] relative">
                         <img src={preview} className="w-full h-full object-cover opacity-80" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <button onClick={resetForm} className="bg-black/50 hover:bg-black/70 px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm transition-colors">
                                Change Receipt
                            </button>
                         </div>
                    </div>
                    {/* Render Form for Verification */}
                    <form id="verify-form" onSubmit={handleSubmit} className="space-y-4">
                        <FormFields formData={formData} setFormData={setFormData} categories={categories} />
                    </form>
                </div>
              )}

                {step === 'success' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-scale-in">
                        <div className="w-20 h-20 bg-[#bfd852] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(191,216,82,0.3)]">
                            <Check className="w-10 h-10 text-[#022c22]" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Saved!</h3>
                        <p className="text-gray-400">Expense added successfully.</p>
                    </div>
                )}
            </div>
          )}

          {/* MANUAL TAB */}
          {activeTab === 'manual' && step !== 'success' && (
             <form id="manual-form" onSubmit={handleSubmit} className="space-y-6 animate-fade-in h-full flex flex-col">
                <div className="flex-1 space-y-4">
                    <FormFields formData={formData} setFormData={setFormData} categories={categories} />
                </div>
             </form>
          )}
        </div>

        {/* Footer Actions (Only for verify/manual) */}
        {(activeTab === 'manual' || step === 'verify') && step !== 'success' && (
             <div className="p-6 border-t border-[#034433] bg-[#022c22]">
                 <button
                    type="submit"
                    form={activeTab === 'manual' ? "manual-form" : "verify-form"}
                    disabled={loading}
                    className="w-full bg-[#bfd852] text-[#022c22] py-3 rounded-xl font-bold hover:bg-[#d0ea62] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#bfd852]/10"
                 >
                    {loading ? <Loader2 className="animate-spin" /> : <Check className="w-5 h-5" />}
                    Save Expense
                 </button>
             </div>
        )}
      </div>
    </div>
  );
}

// Reusable Form Fields Component
function FormFields({ formData, setFormData, categories }: { formData: any, setFormData: any, categories: Category[] }) {
    return (
        <>
            <div className="space-y-2">
                <label className="text-xs text-secondary/80 uppercase tracking-widest font-semibold ml-1">Merchant</label>
                <input
                type="text"
                value={formData.merchant_name}
                onChange={(e) => setFormData({...formData, merchant_name: e.target.value})}
                style={{ color: '#ffffff' }}
                className="w-full bg-black/20 border border-white/10 focus:border-[#bfd852] rounded-xl px-4 py-3.5 !text-white placeholder-white/50 outline-none transition-all duration-300 focus:bg-black/40 focus:shadow-[0_0_15px_rgba(191,216,82,0.1)]"
                placeholder="e.g. Starbucks"
                required
                />
            </div>
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
                        if (val < 0) return; // Prevent negative
                        setFormData({...formData, amount: e.target.value})
                    }}
                    onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                        }
                    }}
                    className="w-full bg-black/20 border border-white/10 focus:border-[#bfd852] rounded-xl pl-10 pr-4 py-3.5 !text-white placeholder-white/50 outline-none transition-all duration-300 focus:bg-black/40 focus:shadow-[0_0_15px_rgba(191,216,82,0.1)]"
                    placeholder="0"
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
                    className="w-full bg-black/20 border border-white/10 focus:border-[#bfd852] rounded-xl px-4 py-3.5 text-white outline-none transition-all duration-300 focus:bg-black/40 [color-scheme:dark]"
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

            <div className="space-y-2 mt-4 ml-1">
                <label className="text-xs text-secondary/80 uppercase tracking-widest font-semibold ml-1">Description (Optional)</label>
                <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={{ color: '#ffffff' }}
                className="w-full bg-black/20 border border-white/10 focus:border-[#bfd852] rounded-xl px-4 py-3.5 !text-white placeholder-white/50 outline-none transition-all duration-300 focus:bg-black/40 resize-none"
                placeholder="Details about items (e.g. Ayam 20k, Teh 5k)"
                />
            </div>

            {/* Items List */}
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
                                className="flex-1 bg-black/20 border border-white/10 focus:border-[#bfd852] rounded-xl px-4 py-2 text-sm !text-white placeholder-white/50 outline-none transition-all duration-300 focus:bg-black/40"
                                style={{ color: '#ffffff' }}
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
                    {(!formData.items || formData.items.length === 0) && (
                         <div className="text-center py-4 bg-black/10 rounded-xl border border-dashed border-white/10 text-white/30 text-sm">
                             No items extracted
                         </div>
                    )}
                </div>
            </div>
            </>
    );
}
