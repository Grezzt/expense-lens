'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
    getOrganizationMembers,
    updateMemberRole,
    removeMemberFromOrganization,
    OrganizationMember,
    getUserRole
} from '@/lib/supabase';
import { regenerateInviteCode } from '@/lib/organization-service';
import {
    Users,
    Mail,
    Trash2,
    Copy,
    RefreshCw,
    UserPlus,
    Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function MembersPage() {
    const { currentOrg, currentUser } = useAppStore();
    const router = useRouter();
    const [members, setMembers] = useState<any[]>([]);
    const [currentUserRole, setCurrentUserRole] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [inviteCode, setInviteCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    // Confirmation States
    const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
    const [memberToUpdate, setMemberToUpdate] = useState<{ id: string; role: string } | null>(null);
    const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

    // Fetch Data
    const fetchData = async () => {
        if (!currentOrg || !currentUser) return;
        setLoading(true);
        try {
            // Get Current User Role
            const role = await getUserRole(currentOrg.id, currentUser.id);
            if (!['owner', 'admin'].includes(role || '')) {
                // Redirect if not authorized (though Sidebar hides it, direct access needs protection)
               // router.push('/dashboard');
            }
            setCurrentUserRole(role || '');

            // Get Members
            const membersData = await getOrganizationMembers(currentOrg.id);
            setMembers(membersData || []);

            // Set Invite Code
            setInviteCode(currentOrg.invite_code || '');

        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentOrg, currentUser]);

    // Handlers
    const handleCopyCode = () => {
        navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const onRegenerateClick = () => {
        setShowRegenerateConfirm(true);
    };

    const confirmRegenerate = async () => {
        if (!currentOrg || !currentUser) return;

        setRegenerating(true);
        try {
            const { invite_code, error } = await regenerateInviteCode(currentOrg.id, currentUser.id);
            if (error) throw error;
            setInviteCode(invite_code);
        } catch (error) {
            console.error('Regenerate error:', error);
            alert('Failed to regenerate code.');
        } finally {
            setRegenerating(false);
        }
    };

    const onRoleChangeClick = (userId: string, newRole: string) => {
        setMemberToUpdate({ id: userId, role: newRole });
    };

    const confirmRoleChange = async () => {
        if (!currentOrg || !memberToUpdate) return;

        try {
            await updateMemberRole(currentOrg.id, memberToUpdate.id, memberToUpdate.role as OrganizationMember['role']);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Update role error:', error);
            alert('Failed to update role.');
        }
    };

    const onRemoveMemberClick = (userId: string) => {
        setMemberToRemove(userId);
    };

    const confirmRemoveMember = async () => {
        if (!currentOrg || !memberToRemove) return;

        try {
            await removeMemberFromOrganization(currentOrg.id, memberToRemove);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Remove member error:', error);
            alert('Failed to remove member.');
        }
    };

    const canManage = ['owner', 'admin'].includes(currentUserRole);

    return (
        <div className="mx-auto px-6 py-10" style={{ maxWidth: 1000 }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid rgba(2,44,34,0.1)' }}>
                <div>
                     <p className="el-callout-text mb-2">Team Management</p>
                    <h1 className="font-bold flex items-center gap-3" style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--el-primary)', lineHeight: 1.1 }}>
                        <Users className="w-8 h-8" style={{ color: 'var(--el-accent)' }} />
                        Members & Roles
                    </h1>
                    <p className="mt-2 text-sm" style={{ color: 'var(--el-primary)', opacity: 0.6 }}>
                        Manage access and permissions for {currentOrg?.name}
                    </p>
                </div>
            </div>

            {/* Invite Code Section (Only for Admins) */}
            {canManage && (
                <div
                    className="mb-8 relative overflow-hidden"
                    style={{
                        backgroundColor: 'var(--el-white)',
                        border: '1.5px solid var(--el-primary)',
                    }}
                >
                    {/* Top Accent */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: 'var(--el-accent)' }} />

                    <div className="p-8 relative z-10">
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <h2 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--el-primary)' }}>
                                     <Mail className="w-5 h-5" />
                                     Invite New Members
                                </h2>
                                <p className="text-sm mb-6 max-w-xl" style={{ color: 'var(--el-primary)', opacity: 0.6 }}>
                                    Share this code with your team. They can join by entering this code when creating an account or joining an organization.
                                </p>

                                <div className="flex items-center gap-3 max-w-md">
                                    <div className="flex-1 px-4 py-3 text-center font-mono text-xl font-bold tracking-widest" style={{ backgroundColor: 'rgba(2,44,34,0.03)', border: '2px dashed rgba(2,44,34,0.15)', color: 'var(--el-primary)' }}>
                                        {inviteCode || 'NO-CODE'}
                                    </div>
                                    <button
                                        onClick={handleCopyCode}
                                        className="p-3 transition-colors border"
                                        style={{ backgroundColor: 'var(--el-white)', borderColor: 'rgba(2,44,34,0.1)', color: 'var(--el-primary)' }}
                                        title="Copy Code"
                                    >
                                        {copied ? <Check className="w-5 h-5" style={{ color: 'var(--el-accent)' }} /> : <Copy className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={onRegenerateClick}
                                        disabled={regenerating}
                                        className="p-3 transition-colors border"
                                        style={{ backgroundColor: 'var(--el-white)', borderColor: 'rgba(2,44,34,0.1)', color: 'var(--el-primary)' }}
                                        title="Regenerate Code"
                                    >
                                        <RefreshCw className={`w-5 h-5 ${regenerating ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>
                            <UserPlus className="w-24 h-24 absolute right-6 top-6 opacity-5 pointer-events-none" style={{ color: 'var(--el-primary)' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Members List */}
            <div
                className="flex flex-col"
                style={{
                    backgroundColor: 'var(--el-white)',
                    border: '1.5px solid var(--el-primary)',
                }}
            >
                 <div className="p-6 border-b flex justify-between items-center" style={{ borderBottom: '1px solid rgba(2,44,34,0.1)', backgroundColor: 'rgba(2,44,34,0.02)' }}>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--el-primary)' }}>
                        Team Members ({members.length})
                    </h2>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm">
                        <thead>
                             <tr>
                                {['Member', 'Role', 'Joined At', canManage ? 'Actions' : ''].map((h, i) => (
                                    h && (
                                    <th
                                        key={h}
                                        className="px-6 py-4 el-callout-text"
                                        style={{
                                            fontSize: 10,
                                            letterSpacing: '1.5px',
                                            borderBottom: '1px solid rgba(2,44,34,0.1)',
                                            textAlign: h === 'Actions' ? 'right' : 'left'
                                        }}
                                    >
                                        {h}
                                    </th>
                                    )
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-[rgba(191,216,82,0.05)] transition-colors" style={{ borderBottom: '1px solid rgba(2,44,34,0.05)' }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold text-lg"
                                                style={{ backgroundColor: 'var(--el-primary)', color: 'var(--el-accent)' }}
                                            >
                                                {member.users?.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-bold" style={{ color: 'var(--el-primary)' }}>{member.users?.full_name}</div>
                                                <div className="text-xs" style={{ color: 'var(--el-primary)', opacity: 0.5 }}>{member.users?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {canManage && member.role !== 'owner' && member.user_id !== currentUser?.id ? (
                                            <select
                                                value={member.role}
                                                onChange={(e) => onRoleChangeClick(member.user_id, e.target.value)}
                                                className="border text-sm p-2 outline-none cursor-pointer hover:border-gray-400 transition-colors bg-transparent font-medium"
                                                style={{ borderColor: 'rgba(2,44,34,0.2)', color: 'var(--el-primary)' }}
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="accountant">Accountant</option>
                                                <option value="member">Member</option>
                                                <option value="viewer">Viewer</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wider border ${
                                                member.role === 'owner' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                member.role === 'admin' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                member.role === 'accountant' ? 'bg-[#bfd852]/20 text-[#022c22] border-[#bfd852]/40' :
                                                'bg-gray-100 text-gray-800 border-gray-200'}`}
                                            >
                                                {member.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--el-primary)', opacity: 0.6 }}>
                                        {new Date(member.joined_at).toLocaleDateString('en-GB')}
                                    </td>
                                    {canManage && (
                                        <td className="px-6 py-4 text-right">
                                            {member.role !== 'owner' && member.user_id !== currentUser?.id && (
                                                <button
                                                    onClick={() => onRemoveMemberClick(member.user_id)}
                                                    className="p-2 transition-colors text-red-400 hover:text-red-600 hover:bg-red-50"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={showRegenerateConfirm}
                onClose={() => setShowRegenerateConfirm(false)}
                onConfirm={confirmRegenerate}
                title="Regenerate Invite Code"
                message="Are you sure? The old invite code will stop working immediately."
                confirmText="Regenerate"
                variant="warning"
            />

            <ConfirmationModal
                isOpen={!!memberToUpdate}
                onClose={() => setMemberToUpdate(null)}
                onConfirm={confirmRoleChange}
                title="Change Member Role"
                message={`Are you sure you want to change this user's role to ${memberToUpdate?.role}?`}
                confirmText="Change Role"
                variant="warning"
            />

            <ConfirmationModal
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onConfirm={confirmRemoveMember}
                title="Remove Member"
                message="Are you sure you want to remove this member from the organization? They will lose access immediately."
                confirmText="Remove Member"
                variant="danger"
            />
        </div>
    );
}
