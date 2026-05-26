import { AppState, type AppStateStatus } from 'react-native';

import { type TimerDurationMs, useAudioStore } from '@/shared/domain/stores/audioStore';

import { AudioService } from './AudioService';

const TIMER_POLL_MS = 1000;
const TIMER_FADE_OUT_MS = 1500;

type ExpiryToken = {
  currentSoundId: string | null;
  timerStartedAt: number | null;
};

class TimerServiceClass {
  private appStateSubscription: { remove: () => void } | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private expiryInProgress = false;
  private timerSessionId = 0;

  start(durationMs: TimerDurationMs) {
    this.startWithDuration(durationMs);
  }

  startVerification(durationMs: number) {
    this.startWithDuration(durationMs);
  }

  private startWithDuration(durationMs: number) {
    this.timerSessionId += 1;
    useAudioStore.getState().startTimer(durationMs);
    this.expiryInProgress = false;
    this.ensureInterval();
    void this.tick();
  }

  stop() {
    this.timerSessionId += 1;
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

    const expirySessionId = this.timerSessionId;
    const expiryToken = this.getExpiryToken();

    this.expiryInProgress = true;
    this.clearInterval();

    try {
      await AudioService.fadeOut(TIMER_FADE_OUT_MS);

      if (!this.expiryStillOwnsState(expirySessionId, expiryToken)) {
        return;
      }

      await AudioService.stop();
    } finally {
      if (this.expiryStillOwnsState(expirySessionId, expiryToken)) {
        const store = useAudioStore.getState();

        store.setCurrentSound(null);
        store.setIsPlaying(false);
        store.stopTimer();
      }

      this.expiryInProgress = false;
    }
  }

  private getExpiryToken(): ExpiryToken {
    const { currentSoundId, timerStartedAt } = useAudioStore.getState();

    return {
      currentSoundId,
      timerStartedAt,
    };
  }

  private expiryStillOwnsState(expirySessionId: number, expiryToken: ExpiryToken) {
    if (this.timerSessionId !== expirySessionId) {
      return false;
    }

    const { currentSoundId, timerStartedAt } = useAudioStore.getState();

    return (
      currentSoundId === expiryToken.currentSoundId && timerStartedAt === expiryToken.timerStartedAt
    );
  }
}

export const TimerService = new TimerServiceClass();
