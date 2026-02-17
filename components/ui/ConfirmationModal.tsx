import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  validationString?: string; // If provided, user must type this to enable confirm button
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  validationString
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setInputValue(''); // Reset input on open
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-500/20';
      default:
        return 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20';
    }
  };

  const isConfirmDisabled = validationString ? inputValue !== validationString : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border animate-in zoom-in-95 duration-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full shrink-0 ${
              variant === 'danger' ? 'bg-red-100' :
              variant === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
            }`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {title}
              </h3>
              <p className="text-sm text-foreground-muted leading-relaxed mb-4">
                {message}
              </p>

              {validationString && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Type <span className="text-foreground select-all font-bold">"{validationString}"</span> to confirm <span className="text-red-500 normal-case ml-1">(case sensitive)</span>
                  </label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={validationString}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded-lg transition-colors text-foreground-muted hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                if (!isConfirmDisabled) {
                  onConfirm();
                  onClose();
                }
              }}
              disabled={isConfirmDisabled}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-lg ${
                isConfirmDisabled ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white' : getButtonColor()
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
