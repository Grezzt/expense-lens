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
    Shield,
    MoreVertical,
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
        <div className="container mx-auto px-6 py-8 max-w-5xl h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                        <Users className="w-8 h-8" />
                        Members & Roles
                    </h1>
                    <p className="text-foreground-muted mt-1">
                        Manage access and permissions for {currentOrg?.name}
                    </p>
                </div>
            </div>

            {/* Invite Code Section (Only for Admins) */}
            {canManage && (
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm mb-8 animate-fade-in relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-6 opacity-5">
                        <UserPlus className="w-32 h-32 text-primary" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                             <Mail className="w-5 h-5" />
                             Invite New Members
                        </h2>
                        <p className="text-sm text-gray-500 mb-4 max-w-xl">
                            Share this code with your team. They can join by entering this code when creating an account or joining an organization.
                        </p>

                        <div className="flex items-center gap-3 max-w-md">
                            <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-center font-mono text-xl font-bold tracking-widest text-[#022c22]">
                                {inviteCode || 'NO-CODE'}
                            </div>
                            <button
                                onClick={handleCopyCode}
                                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                                title="Copy Code"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={onRegenerateClick}
                                disabled={regenerating}
                                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                                title="Regenerate Code"
                            >
                                <RefreshCw className={`w-5 h-5 ${regenerating ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Members List */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex-1 flex flex-col">
                 <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-bold text-primary">
                        Team Members ({members.length})
                    </h2>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                             <tr>
                                <th className="px-6 py-4 font-semibold">Member</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Joined At</th>
                                {canManage && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-secondary text-primary font-bold flex items-center justify-center text-lg">
                                                {member.users?.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{member.users?.full_name}</div>
                                                <div className="text-sm text-gray-500">{member.users?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {canManage && member.role !== 'owner' && member.user_id !== currentUser?.id ? (
                                            <select
                                                value={member.role}
                                                onChange={(e) => onRoleChangeClick(member.user_id, e.target.value)}
                                                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none cursor-pointer hover:border-gray-400 transition-colors"
                                            >
                                                <option value="modules">Select Role...</option>
                                                <option value="admin">Admin</option>
                                                <option value="accountant">Accountant</option>
                                                <option value="member">Member</option>
                                                <option value="viewer">Viewer</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                                                  member.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                                  member.role === 'accountant' ? 'bg-green-100 text-green-800' :
                                                  'bg-gray-100 text-gray-800'}`}>
                                                {member.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(member.joined_at).toLocaleDateString('en-GB')}
                                    </td>
                                    {canManage && (
                                        <td className="px-6 py-4 text-right">
                                            {member.role !== 'owner' && member.user_id !== currentUser?.id && (
                                                <button
                                                    onClick={() => onRemoveMemberClick(member.user_id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
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
