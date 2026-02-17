'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
    updateOrganization,
    deleteOrganization,
    getUserRole,
    getAllCategories,
    Category
} from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    Settings,
    Save,
    Trash2,
    AlertTriangle,
    Tag,
    Plus,
    Building,
    Check
} from 'lucide-react';

export default function SettingsPage() {
    const { currentOrg, currentUser, setCurrentOrg } = useAppStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'danger'>('general');

    // General Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: ''
    });

    // Categories State
    const [systemCategories, setSystemCategories] = useState<Category[]>([]);
    const [customCategories, setCustomCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState('');

    // Load Data
    useEffect(() => {
        if (currentOrg) {
            setFormData({
                name: currentOrg.name,
                slug: currentOrg.slug,
                description: currentOrg.description || ''
            });

            // Load Custom Categories from JSONB settings
            const savedCategories = currentOrg.settings?.custom_categories || [];
            setCustomCategories(savedCategories);

            // Fetch System Categories
            getAllCategories().then(cats => setSystemCategories(cats));
        }

        // Security Check
        if (currentOrg && currentUser) {
            getUserRole(currentOrg.id, currentUser.id).then(role => {
                if (!['owner', 'admin'].includes(role || '')) {
                    router.push('/dashboard');
                }
            });
        }
    }, [currentOrg, currentUser, router]);

    // Handlers
    const handleUpdateGeneral = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentOrg) return;
        setLoading(true);

        const oldSlug = currentOrg.slug;

        try {
            const updated = await updateOrganization(currentOrg.id, {
                name: formData.name,
                slug: formData.slug,
                description: formData.description
            });
            setCurrentOrg(updated);
            alert('Settings updated successfully');

            if (updated.slug !== oldSlug) {
                // Redirect to new URL if slug changed
                window.location.href = `/${updated.slug}/organization/settings`;
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim() || !currentOrg) return;
        if (customCategories.includes(newCategory) || systemCategories.some(c => c.name === newCategory)) {
            alert('Category already exists');
            return;
        }

        const updatedCategories = [...customCategories, newCategory.trim()];

        try {
            // Optimistic Update
            setCustomCategories(updatedCategories);
            setNewCategory('');

            // Save to DB
            const updated = await updateOrganization(currentOrg.id, {
                settings: {
                    ...currentOrg.settings,
                    custom_categories: updatedCategories
                }
            });
            setCurrentOrg(updated);

        } catch (error) {
            console.error('Failed to add category:', error);
            alert('Failed to add category');
            setCustomCategories(customCategories); // Revert
        }
    };

    const handleDeleteCategory = async (catToDelete: string) => {
        if (!currentOrg || !confirm(`Remove category "${catToDelete}"?`)) return;

        const updatedCategories = customCategories.filter(c => c !== catToDelete);

        try {
             // Optimistic Update
             setCustomCategories(updatedCategories);

             // Save to DB
             const updated = await updateOrganization(currentOrg.id, {
                 settings: {
                     ...currentOrg.settings,
                     custom_categories: updatedCategories
                 }
             });
             setCurrentOrg(updated);
        } catch (error) {
             console.error('Failed to delete category:', error);
             alert('Failed to delete category');
             setCustomCategories(customCategories); // Revert
        }
    };

    const handleDeleteOrg = async () => {
        if (!currentOrg || !currentUser) return;

        const confirmName = prompt(`To confirm deletion, please type "${currentOrg.name}":`);
        if (confirmName !== currentOrg.name) {
            alert('Incorrect organization name. Deletion cancelled.');
            return;
        }

        if(!confirm('WARNING: This action cannot be undone. All data will be lost. Are you absolute sure?')) return;

        try {
            await deleteOrganization(currentOrg.id);
            router.push('/organizations');
            window.location.reload(); // Force refresh to clear store
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete organization');
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-4xl h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-primary">Settings</h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === 'general'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    General Information
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === 'categories'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Expense Categories
                </button>
                <button
                    onClick={() => setActiveTab('danger')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === 'danger'
                        ? 'border-red-500 text-red-500'
                        : 'border-transparent text-gray-500 hover:text-red-400'
                    }`}
                >
                    Danger Zone
                </button>
            </div>

            {/* Content */}
            <div className="animate-fade-in">

                {/* GENERAL SETTINGS */}
                {activeTab === 'general' && (
                    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm max-w-2xl">
                        <form onSubmit={handleUpdateGeneral} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Custom URL (Slug)</label>
                                <div className="flex items-center">
                                    <span className="bg-gray-50 border border-r-0 border-gray-200 px-3 py-2 rounded-l-lg text-gray-500 text-sm">
                                        expenselens.app/
                                    </span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-r-lg focus:ring-primary focus:border-primary outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary text-white hover:bg-primary/90 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                                >
                                    {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* CATEGORIES SETTINGS */}
                {activeTab === 'categories' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Custom Categories */}
                        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                            <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Custom Categories
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Add categories specific to your organization. These will appear in the expense form.
                            </p>

                            <div className="flex items-center gap-2 mb-6">
                                <input
                                    type="text"
                                    placeholder="e.g. Project Bali, Team Lunch"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-primary focus:border-primary outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <button
                                    onClick={handleAddCategory}
                                    disabled={!newCategory.trim()}
                                    className="bg-secondary text-primary hover:bg-secondary/80 px-4 py-2 rounded-lg font-bold transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {customCategories.length === 0 && (
                                    <p className="text-center text-gray-400 py-4 text-sm italic">No custom categories added yet.</p>
                                )}
                                {customCategories.map((cat) => (
                                    <div key={cat} className="flex justify-between items-center group p-3 bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                                        <span className="font-medium text-gray-700">{cat}</span>
                                        <button
                                            onClick={() => handleDeleteCategory(cat)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Categories (Read Only) */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
                             <h2 className="text-lg font-bold text-gray-500 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                System Defaults
                            </h2>
                            <p className="text-sm text-gray-400 mb-6">
                                Standard categories provided by ExpenseLens. These cannot be removed.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {systemCategories.map(cat => (
                                    <span key={cat.id} className="bg-white border border-gray-200 text-gray-500 px-3 py-1.5 rounded-full text-sm">
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* DANGER ZONE */}
                {activeTab === 'danger' && (
                     <div className="bg-red-50 p-6 rounded-2xl border border-red-100 max-w-2xl">
                        <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Delete Organization
                        </h2>
                        <p className="text-sm text-red-800 mb-6">
                            Permanently delete this organization, including all members, expenses, and data. This action cannot be undone.
                        </p>

                        <div className="bg-white p-4 rounded-lg border border-red-100 mb-6">
                            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                                <li>All {customCategories.length} custom categories will be lost.</li>
                                <li>All expense records will be permanently deleted.</li>
                                <li>Member access will be revoked immediately.</li>
                            </ul>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleDeleteOrg}
                                className="bg-red-600 text-white hover:bg-red-700 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-500/20"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Organization
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

// Icon helper
function Shield({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    )
}
