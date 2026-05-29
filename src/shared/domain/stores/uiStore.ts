import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type UIState = {
  isDarkMode: boolean;
  hasSeenOnboarding: boolean;
  isImmersiveMode: boolean;
  isPlayerVisible: boolean;
  _hasHydrated: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setImmersiveMode: (immersive: boolean) => void;
  setPlayerVisible: (visible: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
};

// When selecting multiple store values in a component, use useShallow from
// 'zustand/react/shallow' to avoid unnecessary re-renders with Zustand v5.
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDarkMode: true,
      hasSeenOnboarding: false,
      isImmersiveMode: false,
      isPlayerVisible: false,
      _hasHydrated: false,
      setDarkMode: (dark) => set({ isDarkMode: dark }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
      setImmersiveMode: (immersive) => set({ isImmersiveMode: immersive }),
      setPlayerVisible: (visible) => set({ isPlayerVisible: visible }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'ui-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<UIState> | undefined;

        if (version >= 1) {
          return state ?? {};
        }

        return {
          ...state,
          hasSeenOnboarding: false,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
