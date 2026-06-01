import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Favorite } from '../types';

type FavoritesState = {
  favorites: Favorite[];
  _hasHydrated: boolean;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setFavorites: (favorites: Favorite[]) => void;
  setHasHydrated: (hydrated: boolean) => void;
  getSortedFavorites: () => Favorite[];
};

type PersistedFavoritesState = {
  favorites?: Favorite[];
  favoriteIds?: string[];
};

const FAVORITES_STORE_VERSION = 2;
const LEGACY_MIGRATION_BASE_ADDED_AT = 1_000_000_000_000;

function dedupeFavorites(favorites: Favorite[]) {
  const uniqueFavorites = new Map<string, Favorite>();

  favorites.forEach((favorite) => {
    if (!favorite?.id) {
      return;
    }

    uniqueFavorites.set(favorite.id, {
      id: favorite.id,
      addedAt: favorite.addedAt,
    });
  });

  return Array.from(uniqueFavorites.values());
}

function sortFavoritesByMostRecent(favorites: Favorite[]) {
  return [...favorites].sort((left, right) => right.addedAt - left.addedAt);
}

export function migratePersistedFavoritesState(
  persistedState: PersistedFavoritesState | undefined,
): Pick<FavoritesState, 'favorites'> {
  if (!persistedState) {
    return { favorites: [] };
  }

  if (Array.isArray(persistedState.favorites)) {
    return { favorites: dedupeFavorites(persistedState.favorites) };
  }

  if (!Array.isArray(persistedState.favoriteIds)) {
    return { favorites: [] };
  }

  return {
    favorites: dedupeFavorites(
      persistedState.favoriteIds.map((id, index) => ({
        id,
        addedAt: LEGACY_MIGRATION_BASE_ADDED_AT + index,
      })),
    ),
  };
}

// When selecting multiple store values in a component, use useShallow from
// 'zustand/react/shallow' to avoid unnecessary re-renders with Zustand v5.
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      _hasHydrated: false,
      toggleFavorite: (id) => {
        if (get().isFavorite(id)) {
          set((state) => ({
            favorites: state.favorites.filter((favorite) => favorite.id !== id),
          }));
          return;
        }

        set((state) => ({
          favorites: [...state.favorites, { id, addedAt: Date.now() }],
        }));
      },
      isFavorite: (id) => get().favorites.some((favorite) => favorite.id === id),
      setFavorites: (favorites) => set({ favorites: dedupeFavorites(favorites) }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      getSortedFavorites: () => sortFavoritesByMostRecent(get().favorites),
    }),
    {
      name: 'favorites-store',
      version: FAVORITES_STORE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ favorites: state.favorites }),
      migrate: (persistedState) =>
        migratePersistedFavoritesState(persistedState as PersistedFavoritesState),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
