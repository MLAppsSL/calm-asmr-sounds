import assert from 'node:assert/strict';
import { test } from 'node:test';

import { migratePersistedUIState } from '../uiStorePersistence.ts';

test('persisted ui state falls back to the default timer for invalid values', () => {
  assert.equal(migratePersistedUIState(undefined).defaultTimerDuration, 60);
  assert.equal(
    migratePersistedUIState({ defaultTimerDuration: undefined }).defaultTimerDuration,
    60,
  );
  assert.equal(migratePersistedUIState({ defaultTimerDuration: 90 }).defaultTimerDuration, 90);
  assert.equal(migratePersistedUIState({ defaultTimerDuration: 999 }).defaultTimerDuration, 60);
});
