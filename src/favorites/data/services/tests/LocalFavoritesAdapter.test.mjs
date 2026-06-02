import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFavoritesStore } from '../../../domain/stores/favoritesStore.ts';
import { LocalFavoritesAdapter } from '../LocalFavoritesAdapter.ts';

const adapter = new LocalFavoritesAdapter();

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

test('adapter routes reads and directional writes through the favorites store', async () => {
  const originalDateNow = Date.now;
  let nowMs = 1_000;

  Date.now = () => nowMs;

  try {
    await adapter.addFavorite('rain-01');
    nowMs = 2_000;
    await adapter.addFavorite('fire-01');
    nowMs = 3_000;
    await adapter.addFavorite('fire-01');

    assert.equal(await adapter.isFavorite('rain-01'), true);
    assert.equal(await adapter.isFavorite('fire-01'), true);
    assert.deepEqual(await adapter.getFavorites(), [
      { id: 'fire-01', addedAt: 2_000 },
      { id: 'rain-01', addedAt: 1_000 },
    ]);

    await adapter.removeFavorite('rain-01');

    assert.equal(await adapter.isFavorite('rain-01'), false);
    assert.deepEqual(useFavoritesStore.getState().favorites, [{ id: 'fire-01', addedAt: 2_000 }]);
  } finally {
    Date.now = originalDateNow;
  }
});

test('adapter setFavorites replaces the store list and keeps sorted reads', async () => {
  await adapter.setFavorites([
    { id: 'rain-01', addedAt: 5 },
    { id: 'forest-01', addedAt: 20 },
    { id: 'fire-01', addedAt: 10 },
  ]);

  assert.deepEqual(await adapter.getFavorites(), [
    { id: 'forest-01', addedAt: 20 },
    { id: 'fire-01', addedAt: 10 },
    { id: 'rain-01', addedAt: 5 },
  ]);
});
