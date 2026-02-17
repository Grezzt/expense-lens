import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  invite_code?: string;
  settings?: Record<string, any>;
}

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface AppState {
  currentOrg: Organization | null;
  userOrgs: Organization[];
  currentUser: User | null;
  userRole: 'owner' | 'admin' | 'accountant' | 'member' | 'viewer' | null;
  isScanDrawerOpen: boolean;

  setCurrentOrg: (org: Organization) => void;
  setUserOrgs: (orgs: Organization[]) => void;
  setCurrentUser: (user: User) => void;
  setUserRole: (role: AppState['userRole']) => void;
  setScanDrawerOpen: (isOpen: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentOrg: null,
      userOrgs: [],
      currentUser: null,
      userRole: null,
      isScanDrawerOpen: false,

      setCurrentOrg: (org) => set({ currentOrg: org }),
      setUserOrgs: (orgs) => set({ userOrgs: orgs }),
      setCurrentUser: (user) => set({ currentUser: user }),
      setUserRole: (role) => set({ userRole: role }),
      setScanDrawerOpen: (isOpen) => set({ isScanDrawerOpen: isOpen }),
      reset: () => set({
        currentOrg: null,
        userOrgs: [],
        currentUser: null,
        userRole: null,
        isScanDrawerOpen: false,
      }),
    }),
    {
      name: 'expenselens-storage',
    }
  )
);
