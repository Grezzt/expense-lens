'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { getOrganizationBySlug, checkOrganizationMembership } from '@/lib/organization-service';
import { supabase } from '@/lib/supabase';

export default function OrgGuard({
  children,
  params
}: {
  children: React.ReactNode;
  params: { orgSlug: string };
}) {
  const router = useRouter();
  const { currentOrg, setCurrentOrg, currentUser } = useAppStore();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // 1. Check Local Auth (State)
      let userId = currentUser?.id;

      // Fallback: Check Supabase Session directly
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/');
            return;
        }
        userId = session.user.id;
      }

      // 2. Verify Org matches Slug
      let orgId = currentOrg?.id;

      // If currentOrg mismatch or missing, fetch it
      if (!currentOrg || currentOrg.slug !== params.orgSlug) {
        const org = await getOrganizationBySlug(params.orgSlug);
        if (!org) {
            router.push('/organizations');
            return;
        }
        orgId = org.id;
        // Ideally update store here, but we can do it after membership check
        setCurrentOrg(org);
      }

      // 3. Verify Membership
      // Optimization: If we already have currentOrg AND currentUser, we likely have role too?
      // But to be Safe/Secure, let's verify membership against DB
      if (orgId && userId) {
          const member = await checkOrganizationMembership(userId, orgId);
          if (!member) {
              router.push('/organizations');
              return;
          }
      }

      setAuthorized(true);
      setChecking(false);
    };

    checkAccess();
  }, [params.orgSlug, currentUser, currentOrg, router, setCurrentOrg]);

  if (checking) {
    return (
       <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground-muted">Verifying access...</p>
        </div>
       </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
