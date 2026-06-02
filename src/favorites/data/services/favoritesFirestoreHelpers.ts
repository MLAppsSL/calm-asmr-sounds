import type { FavoritesMap } from '@/types';

import type { Favorite } from '../../domain/types';

function sanitizeAddedAt(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function sortFavoritesByMostRecent(favorites: Favorite[]) {
  return [...favorites].sort((left, right) => right.addedAt - left.addedAt);
}

export function favoritesMapToArray(favoritesMap: FavoritesMap | null | undefined): Favorite[] {
  if (!favoritesMap || typeof favoritesMap !== 'object') {
    return [];
  }

  const favorites = Object.entries(favoritesMap)
    .filter(([id]) => typeof id === 'string' && id.length > 0)
    .map(([id, value]) => ({
      id,
      addedAt: sanitizeAddedAt(value?.addedAt),
    }));

  return sortFavoritesByMostRecent(favorites);
}

export function favoritesArrayToMap(favorites: Favorite[]): FavoritesMap {
  const favoritesMap: FavoritesMap = {};

  favorites.forEach((favorite) => {
    if (!favorite?.id) {
      return;
    }

    const addedAt = sanitizeAddedAt(favorite.addedAt);
    const existingFavorite = favoritesMap[favorite.id];

    if (!existingFavorite || addedAt < existingFavorite.addedAt) {
      favoritesMap[favorite.id] = { addedAt };
    }
  });

  return favoritesMap;
}

export function mergeFavoritesByEarliest(
  cloudFavorites: Favorite[],
  localFavorites: Favorite[],
): Favorite[] {
  const mergedFavorites = new Map<string, Favorite>();

  [...cloudFavorites, ...localFavorites].forEach((favorite) => {
    if (!favorite?.id) {
      return;
    }

    const normalizedFavorite = {
      id: favorite.id,
      addedAt: sanitizeAddedAt(favorite.addedAt),
    };
    const existingFavorite = mergedFavorites.get(favorite.id);

    if (!existingFavorite || normalizedFavorite.addedAt < existingFavorite.addedAt) {
      mergedFavorites.set(favorite.id, normalizedFavorite);
    }
  });

  return sortFavoritesByMostRecent(Array.from(mergedFavorites.values()));
}
