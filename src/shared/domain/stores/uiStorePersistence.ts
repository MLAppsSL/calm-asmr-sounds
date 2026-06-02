import type { TimerDuration } from '../types';

export type PersistedUIState = {
  defaultTimerDuration?: unknown;
} & Record<string, unknown>;

const DEFAULT_TIMER_DURATION: TimerDuration = 60;
const VALID_TIMER_DURATIONS = new Set<TimerDuration>([60, 90, 120, 130, 150, 180]);

function sanitizeTimerDuration(value: unknown): TimerDuration {
  return typeof value === 'number' && VALID_TIMER_DURATIONS.has(value as TimerDuration)
    ? (value as TimerDuration)
    : DEFAULT_TIMER_DURATION;
}

export function migratePersistedUIState(persistedState: PersistedUIState | undefined) {
  const migratedState = persistedState ?? {};

  return {
    ...migratedState,
    defaultTimerDuration: sanitizeTimerDuration(migratedState.defaultTimerDuration),
  };
}
