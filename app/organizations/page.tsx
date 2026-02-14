'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { initializeUserData } from '@/lib/user-service';
import { getUserOrganizations, type OrganizationWithRole } from '@/lib/organization-service';
import { getUserRole } from '@/lib/user-service';
import { Building2, Plus, LogIn, Users, ChevronRight, Crown, Shield, Eye, User } from 'lucide-react';
import CreateOrgModal from '@/components/organizations/CreateOrgModal';
import JoinOrgModal from '@/components/organizations/JoinOrgModal';

export default function OrganizationsPage() {
  const router = useRouter();
  const { currentUser, setCurrentUser, setCurrentOrg, setUserRole, setUserOrgs } = useAppStore();
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    checkAuthAndLoadOrgs();
  }, []);

  const checkAuthAndLoadOrgs = async () => {
    try {
      // Check Supabase auth session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/');
        return;
      }

      // If currentUser is not set, initialize it
      if (!currentUser) {
        const { user, organizations: userOrgs } = await initializeUserData(session.user.id);
        setCurrentUser({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        });
        setUserOrgs(userOrgs);

        // Fetch organizations with roles
        const orgsWithRoles = await getUserOrganizations(session.user.id);
        setOrganizations(orgsWithRoles);
      } else {
        // User already set, just fetch organizations
        await fetchOrganizations();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganizations = async () => {

    if (!currentUser) return;

    setIsLoading(true);
    try {
      const orgs = await getUserOrganizations(currentUser.id);
      setOrganizations(orgs);
      setUserOrgs(orgs.map(o => ({ id: o.id, name: o.name, slug: o.slug, description: o.description })));
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOrg = async (org: OrganizationWithRole) => {
    if (!currentUser) return;

    try {
      // Fetch user's role in this org
      const role = await getUserRole(currentUser.id, org.id);

      // Set app state
      setCurrentOrg({
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
      });
      setUserRole(role);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error selecting organization:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'accountant':
        return <Users className="w-4 h-4" />;
      case 'viewer':
        return <Eye className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-secondary text-primary';
      case 'admin':
        return 'bg-primary/10 text-primary';
      case 'accountant':
        return 'bg-blue-500/10 text-blue-600';
      case 'viewer':
        return 'bg-gray-500/10 text-gray-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">ExpenseLens</h1>
              <p className="text-sm text-foreground-muted mt-1">Select an organization to continue</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-primary">{currentUser?.full_name}</p>
                <p className="text-xs text-foreground-muted">{currentUser?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {currentUser?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2 px-6 py-3"
          >
            <Plus className="w-5 h-5" />
            New Organization
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn btn-secondary flex items-center gap-2 px-6 py-3"
          >
            <LogIn className="w-5 h-5" />
            Join via Invite Code
          </button>
        </div>

        {/* Organizations List */}
        {organizations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-card border-2 border-dashed border-border flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-foreground-muted" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">No Organizations Yet</h2>
            <p className="text-foreground-muted mb-6 max-w-md mx-auto">
              Create your first organization to start managing expenses, or join an existing one with an invite code.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Organization
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Join Organization
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-all cursor-pointer group"
                onClick={() => handleSelectOrg(org)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(org.role)}`}>
                    {getRoleIcon(org.role)}
                    <span className="capitalize">{org.role}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-primary mb-1 group-hover:text-primary-600 transition-colors">
                  {org.name}
                </h3>
                {org.description && (
                  <p className="text-sm text-foreground-muted mb-4 line-clamp-2">
                    {org.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 text-sm text-foreground-muted">
                    <Users className="w-4 h-4" />
                    <span>{org.member_count || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
                    <span>Open</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateOrgModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchOrganizations();
          }}
        />
      )}

      {showJoinModal && (
        <JoinOrgModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            setShowJoinModal(false);
            fetchOrganizations();
          }}
        />
      )}
    </div>
  );
}
