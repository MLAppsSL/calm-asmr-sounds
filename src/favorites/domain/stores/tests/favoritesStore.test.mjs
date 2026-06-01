import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { migratePersistedFavoritesState, useFavoritesStore } from '../favoritesStore.ts';

function ensureAsyncStorageMock() {
  if (typeof AsyncStorage.getItem !== 'function') {
    AsyncStorage.getItem = async () => null;
  }

  if (typeof AsyncStorage.setItem !== 'function') {
    AsyncStorage.setItem = async () => {};
  }

  if (typeof AsyncStorage.removeItem !== 'function') {
    AsyncStorage.removeItem = async () => {};
  }
}

beforeEach(() => {
  ensureAsyncStorageMock();
  useFavoritesStore.setState({ favorites: [], _hasHydrated: false });
});

test('legacy favoriteIds migrate into deterministic favorite records', () => {
  const migrated = migratePersistedFavoritesState({
    favoriteIds: ['rain-01', 'fire-01', 'forest-01'],
  });

  assert.deepEqual(migrated.favorites, [
    { id: 'rain-01', addedAt: 1_000_000_000_000 },
    { id: 'fire-01', addedAt: 1_000_000_000_001 },
    { id: 'forest-01', addedAt: 1_000_000_000_002 },
  ]);
});

test('toggleFavorite and getSortedFavorites preserve most-recent-first reads', () => {
  const originalDateNow = Date.now;
  let nowMs = 1_000;

  Date.now = () => nowMs;

  try {
    useFavoritesStore.getState().toggleFavorite('rain-01');
    nowMs = 2_000;
    useFavoritesStore.getState().toggleFavorite('fire-01');
    nowMs = 3_000;
    useFavoritesStore.getState().toggleFavorite('forest-01');

    assert.deepEqual(useFavoritesStore.getState().getSortedFavorites(), [
      { id: 'forest-01', addedAt: 3_000 },
      { id: 'fire-01', addedAt: 2_000 },
      { id: 'rain-01', addedAt: 1_000 },
    ]);

    useFavoritesStore.getState().toggleFavorite('fire-01');

    assert.deepEqual(useFavoritesStore.getState().favorites, [
      { id: 'rain-01', addedAt: 1_000 },
      { id: 'forest-01', addedAt: 3_000 },
    ]);
  } finally {
    Date.now = originalDateNow;
  }
});
