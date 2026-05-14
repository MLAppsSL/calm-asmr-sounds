import { create } from 'zustand';

type AudioState = {
  currentSoundId: string | null;
  isPlaying: boolean;
  isLooping: boolean;
  timerSeconds: number | null;
  volume: number;
  setCurrentSound: (id: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLooping: (looping: boolean) => void;
  setTimer: (seconds: number | null) => void;
  setVolume: (volume: number) => void;
  reset: () => void;
};

const initialState = {
  currentSoundId: null,
  isPlaying: false,
  isLooping: false,
  timerSeconds: 60,
  volume: 1.0,
};

// When selecting multiple store values in a component, use useShallow from
// 'zustand/react/shallow' to avoid unnecessary re-renders with Zustand v5.
export const useAudioStore = create<AudioState>()((set) => ({
  ...initialState,
  setCurrentSound: (id) => set({ currentSoundId: id }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsLooping: (looping) => set({ isLooping: looping }),
  setTimer: (seconds) => set({ timerSeconds: seconds }),
  setVolume: (volume) => set({ volume }),
  reset: () => set(initialState),
}));
