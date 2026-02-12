'use client';

import { useState } from 'react';
import { Expense } from '@/lib/supabase';

interface ExpenseCardProps {
  expense: Expense;
  onUpdate: () => void;
}

export default function ExpenseCard({ expense, onUpdate }: ExpenseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    merchant_name: expense.merchant_name,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
  });
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: expense.id, status: 'VERIFIED' }),
      });

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Verify failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: expense.id, ...formData }),
      });

      if (res.ok) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this expense?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/expenses?id=${expense.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 hover:shadow-2xl transition-all">
      <div className="flex gap-6">
        {/* Image */}
        <div className="flex-shrink-0">
          <img
            src={expense.image_url}
            alt="Receipt"
            className="w-32 h-32 object-cover rounded-lg shadow-md"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={formData.merchant_name}
                onChange={(e) =>
                  setFormData({ ...formData, merchant_name: e.target.value })
                }
                className="input"
                placeholder="Merchant Name"
              />
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) })
                }
                className="input"
                placeholder="Amount"
              />
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="input"
                placeholder="Category"
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="input"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {expense.merchant_name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    expense.status === 'VERIFIED'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                  }`}
                >
                  {expense.status}
                </span>
              </div>
              <div className="text-2xl font-bold text-primary-600">
                Rp {expense.amount.toLocaleString('id-ID')}
              </div>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>📂 {expense.category}</span>
                <span>📅 {new Date(expense.date).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="btn btn-primary text-sm"
              >
                💾 Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary text-sm"
              >
                ❌ Cancel
              </button>
            </>
          ) : (
            <>
              {expense.status === 'DRAFT' && (
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="btn bg-green-500 text-white hover:bg-green-600 text-sm"
                >
                  ✅ Verify
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary text-sm"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="btn bg-red-500 text-white hover:bg-red-600 text-sm"
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
