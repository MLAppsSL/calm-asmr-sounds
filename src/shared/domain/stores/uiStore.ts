import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TimerDuration } from '../types';

type UIState = {
  isDarkMode: boolean;
  defaultTimerDuration: TimerDuration;
  hasSeenOnboarding: boolean;
  isImmersiveMode: boolean;
  isPlayerVisible: boolean;
  _hasHydrated: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
  setDefaultTimerDuration: (duration: TimerDuration) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setImmersiveMode: (immersive: boolean) => void;
  setPlayerVisible: (visible: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
};

const initialDarkMode = Appearance.getColorScheme() === 'dark';

// When selecting multiple store values in a component, use useShallow from
// 'zustand/react/shallow' to avoid unnecessary re-renders with Zustand v5.
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDarkMode: initialDarkMode,
      defaultTimerDuration: 60,
      hasSeenOnboarding: false,
      isImmersiveMode: false,
      isPlayerVisible: false,
      _hasHydrated: false,
      setDarkMode: (dark) => set({ isDarkMode: dark }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDefaultTimerDuration: (duration) => set({ defaultTimerDuration: duration }),
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
      setImmersiveMode: (immersive) => set({ isImmersiveMode: immersive }),
      setPlayerVisible: (visible) => set({ isPlayerVisible: visible }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'ui-store',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        defaultTimerDuration: state.defaultTimerDuration,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
      migrate: (persistedState) => ({
        defaultTimerDuration: 60,
        ...(persistedState as Partial<UIState> | undefined),
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
