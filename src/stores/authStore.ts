import { create } from 'zustand';

import type { User } from '@/types';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
};

// When selecting multiple store values in a component, use useShallow from
// 'zustand/react/shallow' to avoid unnecessary re-renders with Zustand v5.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
