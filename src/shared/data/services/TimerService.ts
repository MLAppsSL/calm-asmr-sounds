import { AppState, type AppStateStatus } from 'react-native';

import { useAudioStore } from '@/shared/domain/stores/audioStore';

import { AudioService } from './AudioService';

type TimerDurationMs = 60000 | 120000 | 180000;

const TIMER_POLL_MS = 1000;
const TIMER_FADE_OUT_MS = 1500;

class TimerServiceClass {
  private appStateSubscription: { remove: () => void } | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private expiryInProgress = false;

  start(durationMs: TimerDurationMs) {
    useAudioStore.getState().startTimer(durationMs);
    this.expiryInProgress = false;
    this.ensureInterval();
    void this.tick();
  }

  stop() {
    this.clearInterval();
    this.expiryInProgress = false;
    useAudioStore.getState().stopTimer();
  }

  initAppStateListener() {
    if (this.appStateSubscription) {
      return;
    }

    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      void this.handleAppStateChange(nextAppState);
    });

    if (useAudioStore.getState().timerStartedAt !== null) {
      this.ensureInterval();
      void this.tick();
    }
  }

  removeAppStateListener() {
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
  }

  private async handleAppStateChange(nextAppState: AppStateStatus) {
    if (nextAppState !== 'active') {
      return;
    }

    if (useAudioStore.getState().timerStartedAt === null) {
      this.clearInterval();
      return;
    }

    this.ensureInterval();
    await this.tick();
  }

  private ensureInterval() {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      void this.tick();
    }, TIMER_POLL_MS);
  }

  private clearInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async tick() {
    const { timerDurationMs, timerStartedAt } = useAudioStore.getState();

    if (timerStartedAt === null) {
      this.clearInterval();
      return;
    }

    const elapsedMs = Date.now() - timerStartedAt;
    const remainingMs = timerDurationMs - elapsedMs;

    if (remainingMs > 0) {
      return;
    }

    await this.handleExpiry();
  }

  private async handleExpiry() {
    if (this.expiryInProgress) {
      return;
    }

    this.expiryInProgress = true;
    this.clearInterval();

    try {
      await AudioService.fadeOut(TIMER_FADE_OUT_MS);
      await AudioService.stop();
    } finally {
      const store = useAudioStore.getState();

      store.setCurrentSound(null);
      store.setIsPlaying(false);
      store.stopTimer();
      this.expiryInProgress = false;
    }
  }
}

export const TimerService = new TimerServiceClass();
