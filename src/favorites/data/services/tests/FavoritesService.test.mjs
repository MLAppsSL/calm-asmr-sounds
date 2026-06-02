import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  favoritesArrayToMap,
  favoritesMapToArray,
  mergeFavoritesByEarliest,
} from '../favoritesFirestoreHelpers.ts';

test('favoritesMapToArray sanitizes invalid timestamps and sorts by recency', () => {
  const favorites = favoritesMapToArray({
    'rain-01': { addedAt: 50 },
    'fire-01': { addedAt: Number.NaN },
    'forest-01': { addedAt: 100 },
  });

  assert.deepEqual(favorites, [
    { id: 'forest-01', addedAt: 100 },
    { id: 'rain-01', addedAt: 50 },
    { id: 'fire-01', addedAt: 0 },
  ]);
});

test('favoritesArrayToMap keeps the earliest timestamp for duplicate ids', () => {
  const favoritesMap = favoritesArrayToMap([
    { id: 'rain-01', addedAt: 500 },
    { id: 'rain-01', addedAt: 100 },
    { id: 'fire-01', addedAt: Number.POSITIVE_INFINITY },
  ]);

  assert.deepEqual(favoritesMap, {
    'rain-01': { addedAt: 100 },
    'fire-01': { addedAt: 0 },
  });
});

test('mergeFavoritesByEarliest unions local and cloud favorites without duplicates', () => {
  const mergedFavorites = mergeFavoritesByEarliest(
    [
      { id: 'rain-01', addedAt: 200 },
      { id: 'fire-01', addedAt: 300 },
    ],
    [
      { id: 'rain-01', addedAt: 100 },
      { id: 'forest-01', addedAt: 250 },
    ],
  );

  assert.deepEqual(mergedFavorites, [
    { id: 'fire-01', addedAt: 300 },
    { id: 'forest-01', addedAt: 250 },
    { id: 'rain-01', addedAt: 100 },
  ]);
});
