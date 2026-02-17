import OrgGuard from '@/components/auth/OrgGuard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ExpenseLens Organization',
};

export default function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgSlug: string };
}) {
  return (
    <OrgGuard params={params}>
      {children}
    </OrgGuard>
  );
}
