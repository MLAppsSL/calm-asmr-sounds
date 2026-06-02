import assert from 'node:assert/strict';
import { test } from 'node:test';

import { FavoritesSyncController } from '../FavoritesSyncController.ts';

function createSnapshotStorage(initialSnapshot = null) {
  let storedSnapshot = initialSnapshot;

  return {
    async loadSnapshot() {
      return storedSnapshot;
    },
    async saveSnapshot(favorites) {
      storedSnapshot = favorites.map((favorite) => ({ ...favorite }));
    },
    async clearSnapshot() {
      storedSnapshot = null;
    },
    getSnapshot() {
      return storedSnapshot;
    },
  };
}

function createControllerHarness({
  initialFavorites = [],
  migrateImpl = async (_uid, localFavorites) => localFavorites,
  setFavoritesImpl = async () => {},
  initialSnapshot = null,
} = {}) {
  let currentFavorites = initialFavorites.map((favorite) => ({ ...favorite }));
  const warnings = [];
  const snapshotStorage = createSnapshotStorage(initialSnapshot);
  const service = {
    getFavorites: async () => [],
    migrateLocalToCloud: async (uid, localFavorites) => migrateImpl(uid, localFavorites),
    setFavorites: async (uid, favorites) => setFavoritesImpl(uid, favorites),
  };
  const controller = new FavoritesSyncController(
    service,
    snapshotStorage,
    () => currentFavorites,
    (favorites) => {
      currentFavorites = favorites.map((favorite) => ({ ...favorite }));
    },
    (message, error) => {
      warnings.push({ message, error });
    },
  );

  return {
    controller,
    getFavorites: () => currentFavorites,
    setLocalFavorites: (favorites) => {
      currentFavorites = favorites.map((favorite) => ({ ...favorite }));
    },
    snapshotStorage,
    warnings,
  };
}

test('login migration captures the local snapshot and logout restores it', async () => {
  const harness = createControllerHarness({
    initialFavorites: [{ id: 'local-01', addedAt: 10 }],
    migrateImpl: async (_uid, localFavorites) => [
      ...localFavorites,
      { id: 'cloud-01', addedAt: 50 },
    ],
  });

  await harness.controller.handleUserChange('user-1');

  assert.deepEqual(harness.snapshotStorage.getSnapshot(), [{ id: 'local-01', addedAt: 10 }]);
  assert.deepEqual(harness.getFavorites(), [
    { id: 'local-01', addedAt: 10 },
    { id: 'cloud-01', addedAt: 50 },
  ]);

  await harness.controller.handleUserChange(null);

  assert.deepEqual(harness.getFavorites(), [{ id: 'local-01', addedAt: 10 }]);
  assert.equal(harness.snapshotStorage.getSnapshot(), null);
});

test('post-login favorites changes write back once and skip the initial cloud echo', async () => {
  const writes = [];
  const harness = createControllerHarness({
    initialFavorites: [{ id: 'local-01', addedAt: 10 }],
    migrateImpl: async () => [{ id: 'cloud-01', addedAt: 50 }],
    setFavoritesImpl: async (uid, favorites) => {
      writes.push({ uid, favorites: favorites.map((favorite) => ({ ...favorite })) });
    },
  });

  await harness.controller.handleUserChange('user-1');
  await harness.controller.handleFavoritesChange(harness.getFavorites());

  assert.equal(writes.length, 0);

  harness.setLocalFavorites([
    { id: 'cloud-01', addedAt: 50 },
    { id: 'new-01', addedAt: 75 },
  ]);

  await harness.controller.handleFavoritesChange(harness.getFavorites());

  assert.deepEqual(writes, [
    {
      uid: 'user-1',
      favorites: [
        { id: 'cloud-01', addedAt: 50 },
        { id: 'new-01', addedAt: 75 },
      ],
    },
  ]);
});

test('failed login sync keeps local favorites and retries on a later signed-in session', async () => {
  let attempts = 0;
  const harness = createControllerHarness({
    initialFavorites: [{ id: 'local-01', addedAt: 10 }],
    migrateImpl: async () => {
      attempts += 1;

      if (attempts === 1) {
        throw new Error('offline');
      }

      return [{ id: 'cloud-01', addedAt: 50 }];
    },
  });

  await harness.controller.handleUserChange('user-1');

  assert.deepEqual(harness.getFavorites(), [{ id: 'local-01', addedAt: 10 }]);
  assert.equal(harness.warnings.length, 1);

  await harness.controller.handleUserChange(null);
  await harness.controller.handleUserChange('user-1');

  assert.equal(attempts, 2);
  assert.deepEqual(harness.getFavorites(), [{ id: 'cloud-01', addedAt: 50 }]);
});
