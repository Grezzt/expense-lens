'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { joinOrganization } from '@/lib/organization-service';
import { X, LogIn, Loader2, CheckCircle } from 'lucide-react';

interface JoinOrgModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function JoinOrgModal({ onClose, onSuccess }: JoinOrgModalProps) {
  const { currentUser } = useAppStore();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    setError('');

    try {
      const { organization, error: joinError } = await joinOrganization(
        currentUser.id,
        inviteCode.trim()
      );

      if (joinError) {
        setError(joinError);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to join organization');
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    // Auto-uppercase and limit to 8 characters
    setInviteCode(value.toUpperCase().slice(0, 8));
    setError('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-border rounded-xl max-w-md w-full p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Join Organization</h2>
              <p className="text-sm text-foreground-muted">Enter an invite code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-card-hover rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-foreground-muted" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">Successfully Joined!</h3>
            <p className="text-foreground-muted">You are now a member of the organization.</p>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-primary mb-2">
                  Invite Code <span className="text-error">*</span>
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="ABC12345"
                  className="input font-mono text-lg tracking-wider text-center"
                  required
                  disabled={isLoading}
                  autoFocus
                  maxLength={8}
                />
                <p className="text-xs text-foreground-muted mt-2 text-center">
                  Enter the 8-character code shared by your organization admin
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                <p className="text-sm text-foreground-muted">
                  <strong className="text-primary">Don't have an invite code?</strong>
                  <br />
                  Ask your organization owner or admin to generate one from the organization settings.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={isLoading || inviteCode.length !== 8}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Join Organization
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
