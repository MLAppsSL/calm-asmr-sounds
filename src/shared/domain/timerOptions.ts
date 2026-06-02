import type { TimerDurationMs } from '@/shared/domain/stores/audioStore';

import type { TimerDuration } from './types';

type TimerDurationOption = {
  label: string;
  seconds: TimerDuration;
  value: TimerDurationMs;
};

export const TIMER_DURATION_OPTIONS: readonly {
  label: string;
  seconds: TimerDuration;
  value: TimerDurationMs;
}[] = [
  { label: '1m', seconds: 60, value: 60000 },
  { label: '90s', seconds: 90, value: 90000 },
  { label: '2m', seconds: 120, value: 120000 },
  { label: '130s', seconds: 130, value: 130000 },
  { label: '150s', seconds: 150, value: 150000 },
  { label: '3m', seconds: 180, value: 180000 },
];

const DEFAULT_TIMER_DURATION_OPTION: TimerDurationOption = TIMER_DURATION_OPTIONS[0];

export function timerDurationMsFromSeconds(seconds: TimerDuration): TimerDurationMs {
  return (
    TIMER_DURATION_OPTIONS.find((option) => option.seconds === seconds)?.value ??
    DEFAULT_TIMER_DURATION_OPTION.value
  );
}

export function timerDurationSecondsFromMs(durationMs: TimerDurationMs): TimerDuration {
  return (
    TIMER_DURATION_OPTIONS.find((option) => option.value === durationMs)?.seconds ??
    DEFAULT_TIMER_DURATION_OPTION.seconds
  );
}
