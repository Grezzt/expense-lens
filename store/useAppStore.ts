import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Organization {
  id: string;
  name: string;
  slug: string;
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

  setCurrentOrg: (org: Organization) => void;
  setUserOrgs: (orgs: Organization[]) => void;
  setCurrentUser: (user: User) => void;
  setUserRole: (role: AppState['userRole']) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentOrg: null,
      userOrgs: [],
      currentUser: null,
      userRole: null,

      setCurrentOrg: (org) => set({ currentOrg: org }),
      setUserOrgs: (orgs) => set({ userOrgs: orgs }),
      setCurrentUser: (user) => set({ currentUser: user }),
      setUserRole: (role) => set({ userRole: role }),
      reset: () => set({
        currentOrg: null,
        userOrgs: [],
        currentUser: null,
        userRole: null,
      }),
    }),
    {
      name: 'expenselens-storage',
    }
  )
);
