'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { createOrganization } from '@/lib/organization-service';
import { X, Building2, Loader2 } from 'lucide-react';

interface CreateOrgModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOrgModal({ onClose, onSuccess }: CreateOrgModalProps) {
  const { currentUser } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    setError('');

    try {
      const { organization, error: createError } = await createOrganization(
        currentUser.id,
        formData.name,
        formData.slug,
        formData.description
      );

      if (createError) {
        setError(createError);
        setIsLoading(false);
        return;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
      setIsLoading(false);
    }
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
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Create Organization</h2>
              <p className="text-sm text-foreground-muted">Set up a new organization</p>
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

        {/* Error Message */}
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
              Organization Name <span className="text-error">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Acme Corporation"
              className="input"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-primary mb-2">
              Custom URL <span className="text-error">*</span>
            </label>
            <input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="acme-corporation"
              className="input font-mono text-sm"
              required
              disabled={isLoading}
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens"
            />
            <p className="text-xs text-foreground-muted mt-1">
              Your organization's unique URL: expenselens.com/org/<strong>{formData.slug || 'your-url'}</strong>
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-primary mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of your organization..."
              className="input min-h-[80px] resize-none"
              disabled={isLoading}
              rows={3}
            />
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
              disabled={isLoading || !formData.name || !formData.slug}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
