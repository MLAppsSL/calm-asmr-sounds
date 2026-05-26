import { create } from 'zustand';

export type TimerDurationMs = 60000 | 120000 | 180000;

type AudioState = {
  currentSoundId: string | null;
  isPlaying: boolean;
  isLooping: boolean;
  timerSeconds: number | null;
  timerStartedAt: number | null;
  timerDurationMs: number;
  volume: number;
  setCurrentSound: (id: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLooping: (looping: boolean) => void;
  setTimer: (seconds: number | null) => void;
  setVolume: (volume: number) => void;
  startTimer: (durationMs: number) => void;
  resetTimer: () => void;
  stopTimer: () => void;
  setTimerDuration: (durationMs: TimerDurationMs) => void;
  reset: () => void;
};

const initialState = {
  currentSoundId: null,
  isPlaying: false,
  isLooping: false,
  timerSeconds: 60,
  timerStartedAt: null,
  timerDurationMs: 60000,
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
  startTimer: (durationMs) =>
    set({
      timerDurationMs: durationMs,
      timerStartedAt: Date.now(),
    }),
  resetTimer: () => set({ timerStartedAt: Date.now() }),
  stopTimer: () => set({ timerStartedAt: null }),
  setTimerDuration: (durationMs) =>
    set((state) => ({
      timerDurationMs: durationMs,
      timerStartedAt: state.timerStartedAt === null ? null : Date.now(),
    })),
  reset: () => set(initialState),
}));
