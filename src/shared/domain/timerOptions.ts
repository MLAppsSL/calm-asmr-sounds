import type { TimerDurationMs } from '@/shared/domain/stores/audioStore';

import type { TimerDuration } from './types';

export const TIMER_DURATION_OPTIONS: readonly {
  label: string;
  seconds: TimerDuration;
  value: TimerDurationMs;
}[] = [
  { label: '1m', seconds: 60, value: 60000 },
  { label: '2m', seconds: 120, value: 120000 },
  { label: '3m', seconds: 180, value: 180000 },
];

export function timerDurationMsFromSeconds(seconds: TimerDuration): TimerDurationMs {
  return TIMER_DURATION_OPTIONS.find((option) => option.seconds === seconds)?.value ?? 60000;
}

export function timerDurationSecondsFromMs(durationMs: TimerDurationMs): TimerDuration {
  return TIMER_DURATION_OPTIONS.find((option) => option.value === durationMs)?.seconds ?? 60;
}
