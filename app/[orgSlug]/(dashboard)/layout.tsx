'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Sidebar from '@/components/navigation/Sidebar';
import SmartScanButton from '@/components/navigation/SmartScanButton';
import CreateExpenseDrawer from '@/components/expenses/CreateExpenseDrawer';
import { getOrganizationBySlug } from '@/lib/organization-service';

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgSlug: string };
}) {
  const router = useRouter();
  const { currentOrg, setCurrentOrg, isScanDrawerOpen, setScanDrawerOpen } = useAppStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCheckingOrg, setIsCheckingOrg] = useState(true);

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const validateOrg = async () => {
        if (!isHydrated) return;

        // If currentOrg is set and matches slug, we are good
        if (currentOrg && currentOrg.slug === params.orgSlug) {
            setIsCheckingOrg(false);
            return;
        }

        // If mismatch or not set, fetch correct org
        try {
            const org = await getOrganizationBySlug(params.orgSlug);
            if (org) {
                // Determine role (simplified for now, ideally we fetch role too)
                // Since this is client side, we rely on page-level checks or previous session
                // But for switching context, we need to update currentOrg
                setCurrentOrg(org);
                // Note: Role might be stale if we just switch org object.
                // ideally we should refetch full context.
                // For MVP, we assume session is valid and backend checks access.
            } else {
                // Invalid slug
                router.push('/organizations');
            }
        } catch (error) {
            console.error('Org sync failed:', error);
            router.push('/organizations');
        } finally {
            setIsCheckingOrg(false);
        }
    };

    validateOrg();
  }, [isHydrated, params.orgSlug, currentOrg, router, setCurrentOrg]);

  // Show loading while hydrating or checking org
  if (!isHydrated || isCheckingOrg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F1F1F1' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Floating Scan Button */}
      <SmartScanButton />

      {/* Global Expense Drawer */}
      <CreateExpenseDrawer
        isOpen={isScanDrawerOpen}
        onClose={() => setScanDrawerOpen(false)}
      />
    </div>
  );
}
