import assert from 'node:assert/strict';
import test from 'node:test';

import {
  TIMER_DURATION_OPTIONS,
  timerDurationMsFromSeconds,
  timerDurationSecondsFromMs,
} from '../timerOptions.ts';

test('timer option helpers round-trip every supported duration', () => {
  for (const option of TIMER_DURATION_OPTIONS) {
    assert.equal(timerDurationMsFromSeconds(option.seconds), option.value);
    assert.equal(timerDurationSecondsFromMs(option.value), option.seconds);
  }
});
