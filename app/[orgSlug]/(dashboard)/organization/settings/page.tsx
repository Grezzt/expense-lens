'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
    updateOrganization,
    getUserRole,
    getAllCategories,
    Category
} from '@/lib/supabase';
import { deleteOrganization } from '@/lib/organization-service';
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

import ConfirmationModal from '@/components/ui/ConfirmationModal';

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

    // Confirmation States
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [showDeleteOrgConfirm, setShowDeleteOrgConfirm] = useState(false);

    // Load Data
    useEffect(() => {
        if (currentOrg) {
            setFormData({
                name: currentOrg.name,
                slug: currentOrg.slug,
                description: currentOrg.description || ''
            });

            const savedCategories = currentOrg.settings?.custom_categories || [];
            setCustomCategories(savedCategories);

            getAllCategories().then(cats => setSystemCategories(cats));
        }

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
            setCustomCategories(updatedCategories);
            setNewCategory('');

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
            setCustomCategories(customCategories);
        }
    };

    const onDeleteCategoryClick = (catToDelete: string) => {
        setCategoryToDelete(catToDelete);
    };

    const confirmDeleteCategory = async () => {
        if (!currentOrg || !categoryToDelete) return;

        const updatedCategories = customCategories.filter(c => c !== categoryToDelete);

        try {
             setCustomCategories(updatedCategories);

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
             setCustomCategories(customCategories);
        }
    };

    const onDeleteOrgClick = () => {
        setShowDeleteOrgConfirm(true);
    };

    const confirmDeleteOrg = async () => {
        if (!currentOrg || !currentUser) return;

        try {
            const result = await deleteOrganization(currentOrg.id, currentUser.id);
            if (!result.success) throw new Error(result.error);

            router.push('/organizations');
            window.location.reload();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete organization');
        }
    };

    return (
        <div className="mx-auto px-6 py-10 max-w-4xl h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b" style={{ borderBottomColor: 'rgba(2,44,34,0.1)' }}>
                <Settings className="w-8 h-8" style={{ color: 'var(--el-accent)' }} />
                <h1 className="text-3xl font-bold" style={{ color: 'var(--el-primary)' }}>Settings</h1>
            </div>

            {/* Tabs */}
            <div className="flex mb-8" style={{ borderBottom: '2px solid rgba(2,44,34,0.1)' }}>
                {[
                    { id: 'general', label: 'General Information' },
                    { id: 'categories', label: 'Expense Categories' },
                    { id: 'danger', label: 'Danger Zone' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-3 font-bold text-sm transition-all relative ${
                            activeTab === tab.id
                            ? 'text-[#022c22]'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                        style={{
                            marginBottom: -2,
                            borderBottom: activeTab === tab.id ? '2px solid #bfd852' : '2px solid transparent'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="animate-fade-in">

                {/* GENERAL SETTINGS */}
                {activeTab === 'general' && (
                    <div
                        className="p-8 max-w-2xl"
                        style={{
                            backgroundColor: 'var(--el-white)',
                            border: '1.5px solid var(--el-primary)',
                            position: 'relative'
                        }}
                    >
                         {/* Top Accent */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: 'var(--el-accent)' }} />

                        <form onSubmit={handleUpdateGeneral} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--el-primary)', opacity: 0.7 }}>Organization Name</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: 'var(--el-primary)', opacity: 0.4 }} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2.5 bg-[#fcfcfc] border focus:border-[#bfd852] focus:ring-1 focus:ring-[#bfd852] outline-none transition-all font-medium"
                                        style={{ borderColor: 'rgba(2,44,34,0.2)', color: 'var(--el-primary)', borderRadius: 0 }}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--el-primary)', opacity: 0.7 }}>Custom URL (Slug)</label>
                                <div className="flex items-center">
                                    <span className="bg-[#f1f1f1] border border-r-0 px-3 py-2.5 text-xs font-mono text-gray-500" style={{ borderColor: 'rgba(2,44,34,0.2)' }}>
                                        expenselens.app/
                                    </span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                        className="flex-1 px-4 py-2.5 bg-[#fcfcfc] border focus:border-[#bfd852] focus:ring-1 focus:ring-[#bfd852] outline-none transition-all font-medium"
                                        style={{ borderColor: 'rgba(2,44,34,0.2)', color: 'var(--el-primary)', borderRadius: 0 }}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--el-primary)', opacity: 0.7 }}>Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-[#fcfcfc] border focus:border-[#bfd852] focus:ring-1 focus:ring-[#bfd852] outline-none transition-all font-medium"
                                    style={{ borderColor: 'rgba(2,44,34,0.2)', color: 'var(--el-primary)', borderRadius: 0 }}
                                />
                            </div>

                            <div className="pt-6 border-t flex justify-end" style={{ borderColor: 'rgba(2,44,34,0.1)' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-el-accent flex items-center gap-2 px-6 py-2.5"
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
                        <div
                            className="p-6 h-full flex flex-col"
                            style={{
                                backgroundColor: 'var(--el-white)',
                                border: '1.5px solid var(--el-primary)',
                                position: 'relative'
                            }}
                        >
                            {/* Top Accent */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: 'var(--el-accent)' }} />

                            <h2 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--el-primary)' }}>
                                <Tag className="w-5 h-5" style={{ color: 'var(--el-accent)' }} />
                                Custom Categories
                            </h2>
                            <p className="text-sm mb-6" style={{ color: 'var(--el-primary)', opacity: 0.6 }}>
                                Add categories specific to your organization.
                            </p>

                            <div className="flex items-center gap-2 mb-6">
                                <input
                                    type="text"
                                    placeholder="e.g. Project Bali, Team Lunch"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="flex-1 px-4 py-2 border focus:border-[#bfd852] outline-none text-sm font-medium"
                                    style={{ borderColor: 'rgba(2,44,34,0.2)', color: 'var(--el-primary)', borderRadius: 0 }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <button
                                    onClick={handleAddCategory}
                                    disabled={!newCategory.trim()}
                                    className="px-4 py-2 bg-[#bfd852] text-[#022c22] font-bold hover:bg-[#aacc41] transition-colors disabled:opacity-50"
                                    style={{ borderRadius: 0 }}
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                {customCategories.length === 0 && (
                                    <p className="text-center py-4 text-sm italic" style={{ color: 'var(--el-primary)', opacity: 0.4 }}>No custom categories added yet.</p>
                                )}
                                {customCategories.map((cat) => (
                                    <div key={cat} className="flex justify-between items-center group p-3 bg-gray-50 border border-transparent hover:border-[#bfd852] transition-colors">
                                        <span className="font-bold text-sm" style={{ color: 'var(--el-primary)' }}>{cat}</span>
                                        <button
                                            onClick={() => onDeleteCategoryClick(cat)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Categories (Read Only) */}
                        <div
                            className="p-6 bg-gray-50 border border-dashed border-gray-300"
                            style={{ height: 'fit-content' }}
                        >
                             <h2 className="text-lg font-bold text-gray-500 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                System Defaults
                            </h2>
                            <p className="text-sm text-gray-400 mb-6">
                                Standard categories provided by ExpenseLens. Cannot be removed.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {systemCategories.map(cat => (
                                    <span key={cat.id} className="bg-white border border-gray-200 text-gray-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* DANGER ZONE */}
                {activeTab === 'danger' && (
                     <div
                        className="p-6 max-w-2xl bg-red-50 border border-red-200"
                        style={{ position: 'relative' }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: '#ef4444' }} />

                        <h2 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Delete Organization
                        </h2>
                        <p className="text-sm text-red-800 mb-6">
                            Permanently delete this organization, including all members, expenses, and data. This action cannot be undone.
                        </p>

                        <div className="bg-white p-4 border border-red-100 mb-6">
                            <ul className="list-disc list-inside text-sm text-red-600 space-y-1 font-medium">
                                <li>All {customCategories.length} custom categories will be lost.</li>
                                <li>All expense records will be permanently deleted.</li>
                                <li>Member access will be revoked immediately.</li>
                            </ul>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={onDeleteOrgClick}
                                className="bg-red-600 text-white hover:bg-red-700 px-6 py-2.5 text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-500/20"
                                style={{ borderRadius: 0 }}
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Organization
                            </button>
                        </div>
                    </div>
                )}

            </div>

             {/* Confirmation Modals */}
             <ConfirmationModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={confirmDeleteCategory}
                title="Delete Category"
                message={`Are you sure you want to delete the category "${categoryToDelete}"? This will not remove expenses already tagged with this category, but will prevent new uses.`}
                confirmText="Delete"
                variant="danger"
            />

            <ConfirmationModal
                isOpen={showDeleteOrgConfirm}
                onClose={() => setShowDeleteOrgConfirm(false)}
                onConfirm={confirmDeleteOrg}
                title="Delete Organization"
                message="Are you ABSOLUTELY sure? This action cannot be undone. This will permanently delete your organization and all related data."
                confirmText="Delete Organization"
                variant="danger"
                validationString={currentOrg?.name}
            />
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
