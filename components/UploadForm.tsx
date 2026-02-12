'use client';

import { useState } from 'react';

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setSuccess(false);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setError('');
      setSuccess(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    } else {
      setError('Please drop an image file');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        // Prepare FormData
        const formData = new FormData();
        formData.append('base64', base64Image);

        // Step 1: Upload to Supabase Storage
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Upload failed');
        const { imageUrl } = await uploadRes.json();

        // Step 2: Extract data with AI
        const extractRes = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl }),
        });

        if (!extractRes.ok) throw new Error('Extraction failed');

        setSuccess(true);
        setFile(null);
        setPreview('');
        setLoading(false);

        // Reload expense list
        window.dispatchEvent(new Event('expenseAdded'));
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        📸 Upload Receipt
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drag & Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            preview
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
          }`}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          {preview ? (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg shadow-lg"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to change image
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-6xl">📄</div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Drag & drop receipt image
              </p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
          )}
        </div>

        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || loading}
          className={`w-full btn btn-primary py-3 text-lg font-semibold ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⚙️</span>
              Processing...
            </span>
          ) : (
            '🚀 Extract Data'
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
            ❌ {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300">
            ✅ Expense extracted successfully!
          </div>
        )}
      </form>
    </div>
  );
}
