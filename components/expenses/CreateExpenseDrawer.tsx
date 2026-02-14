'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Check, Loader2, ScanLine, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { createExpense } from '@/lib/supabase';

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

  // State for data to save
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [rawData, setRawData] = useState<any>(null);

  // Manual Form State
  const [formData, setFormData] = useState({
    merchant_name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Lainnya',
  });

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep('upload');
      setFile(null);
      setPreview('');
      setUploadedImageUrl('');
      setRawData(null);
      setFormData({
        merchant_name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Lainnya',
      });
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

        setFormData({
            ...formData,
            merchant_name: data.extractedData.merchant_name || '',
            amount: data.extractedData.amount?.toString() || '',
            date: data.extractedData.date || new Date().toISOString().split('T')[0],
            category: data.extractedData.category || 'Lainnya',
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOrg || !currentUser) {
        alert('Missing user or organization session');
        return;
    }

    setLoading(true);

    try {
        await createExpense({
            organization_id: currentOrg.id,
            created_by: currentUser.id,
            merchant_name: formData.merchant_name,
            amount: parseFloat(formData.amount) || 0,
            date: formData.date,
            category: formData.category,
            image_url: uploadedImageUrl || '',
            status: 'VERIFIED',
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

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={handleBackdropClick}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-[#022c22] text-white shadow-2xl transform transition-transform animate-slide-in-right flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#034433]">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Create expense
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#034433] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs (Segmented Control) */}
        <div className="p-6 pb-0">
          <div className="flex bg-[#034433] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'manual' ? 'bg-[#bfd852] text-[#022c22]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Manual
            </button>
            <button
              onClick={() => { setActiveTab('scan'); if(step === 'success') setStep('upload'); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'scan' ? 'bg-[#bfd852] text-[#022c22]' : 'text-gray-400 hover:text-white'
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
                  className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isDragging ? 'border-[#bfd852] bg-[#034433]' : 'border-[#034433] hover:border-[#bfd852] hover:bg-[#034433]/50'
                  }`}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />

                  <div className="w-24 h-24 bg-[#034433] rounded-full flex items-center justify-center mb-6 relative group">
                     <div className="absolute inset-0 bg-[#bfd852] rounded-full opacity-0 group-hover:opacity-10 transition-opacity" />
                     <img src="/icons/receipt-illustration.svg" alt="" className="w-12 h-12 opacity-50" onError={(e) => e.currentTarget.style.display='none'} />
                     <ScanLine className="w-10 h-10 text-[#bfd852]" />
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
                  <p className="text-gray-400 text-sm">Extracting details with AI magic ✨</p>
                </div>
              )}

              {step === 'verify' && (
                <div className="animate-fade-in flex-1">
                    <div className="mb-6 h-40 w-full rounded-xl overflow-hidden border border-[#034433] relative">
                         <img src={preview} className="w-full h-full object-cover opacity-80" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <button onClick={() => { setStep('upload'); setFile(null); }} className="bg-black/50 hover:bg-black/70 px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm transition-colors">
                                Change Receipt
                            </button>
                         </div>
                    </div>
                    {/* Render Form for Verification */}
                    <form id="verify-form" onSubmit={handleSubmit} className="space-y-4">
                        <FormFields formData={formData} setFormData={setFormData} />
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
                    <FormFields formData={formData} setFormData={setFormData} />
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
function FormFields({ formData, setFormData }: { formData: any, setFormData: any }) {
    return (
        <>
            <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-wide">Merchant</label>
                <input
                type="text"
                value={formData.merchant_name}
                onChange={(e) => setFormData({...formData, merchant_name: e.target.value})}
                className="w-full bg-[#034433] border border-transparent focus:border-[#bfd852] rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none transition-all"
                placeholder="e.g. Starbucks"
                required
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-wide">Amount</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">Rp</span>
                    <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-[#034433] border border-transparent focus:border-[#bfd852] rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-all"
                    placeholder="0"
                    required
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Date</label>
                    <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-[#034433] border border-transparent focus:border-[#bfd852] rounded-lg px-4 py-3 text-white outline-none transition-all [color-scheme:dark]"
                    required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Category</label>
                    <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-[#034433] border border-transparent focus:border-[#bfd852] rounded-lg px-4 py-3 text-white outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="Lainnya">Lainnya</option>
                        <option value="Makan & Minum">Makan & Minum</option>
                        <option value="Transportasi">Transportasi</option>
                        <option value="Belanja">Belanja</option>
                        <option value="Hiburan">Hiburan</option>
                    </select>
                </div>
            </div>
        </>
    );
}
