import { create } from 'zustand';

type UIState = {
  isDarkMode: boolean;
  hasSeenOnboarding: boolean;
  isImmersiveMode: boolean;
  isPlayerVisible: boolean;
  setDarkMode: (dark: boolean) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setImmersiveMode: (immersive: boolean) => void;
  setPlayerVisible: (visible: boolean) => void;
};

// When selecting multiple store values in a component, use useShallow from
// 'zustand/react/shallow' to avoid unnecessary re-renders with Zustand v5.
export const useUIStore = create<UIState>()((set) => ({
  isDarkMode: true,
  hasSeenOnboarding: false,
  isImmersiveMode: false,
  isPlayerVisible: false,
  setDarkMode: (dark) => set({ isDarkMode: dark }),
  setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
  setImmersiveMode: (immersive) => set({ isImmersiveMode: immersive }),
  setPlayerVisible: (visible) => set({ isPlayerVisible: visible }),
}));
