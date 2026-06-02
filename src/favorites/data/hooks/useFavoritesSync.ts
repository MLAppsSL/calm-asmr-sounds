import AsyncStorage from '@react-native-async-storage/async-storage';

import { useEffect, useRef } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useFavoritesStore } from '@/favorites/domain/stores/favoritesStore';
import type { Favorite } from '@/favorites/domain/types';

import { FavoritesSyncController, parseStoredFavoritesSnapshot } from './FavoritesSyncController';
import { FavoritesService } from '../services/FavoritesService';

const LOCAL_FAVORITES_SNAPSHOT_STORAGE_KEY = 'favorites-local-snapshot-before-login';

function cloneFavorites(favorites: Favorite[]) {
  return favorites.map((favorite) => ({
    id: favorite.id,
    addedAt: favorite.addedAt,
  }));
}

const asyncStorageSnapshotStorage = {
  async loadSnapshot() {
    return parseStoredFavoritesSnapshot(
      await AsyncStorage.getItem(LOCAL_FAVORITES_SNAPSHOT_STORAGE_KEY),
    );
  },
  async saveSnapshot(favorites: Favorite[]) {
    await AsyncStorage.setItem(
      LOCAL_FAVORITES_SNAPSHOT_STORAGE_KEY,
      JSON.stringify(cloneFavorites(favorites)),
    );
  },
  async clearSnapshot() {
    await AsyncStorage.removeItem(LOCAL_FAVORITES_SNAPSHOT_STORAGE_KEY);
  },
};

export function useFavoritesSync(): void {
  const { isLoading, user } = useAuth();
  const favorites = useFavoritesStore((state) => state.favorites);
  const controllerRef = useRef<FavoritesSyncController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new FavoritesSyncController(
      FavoritesService,
      asyncStorageSnapshotStorage,
      () => useFavoritesStore.getState().favorites,
      (nextFavorites) => useFavoritesStore.getState().setFavorites(nextFavorites),
    );
  }

  useEffect(() => {
    if (isLoading) {
      return;
    }

    void controllerRef.current?.handleUserChange(user?.uid ?? null);
  }, [isLoading, user?.uid]);

  useEffect(() => {
    void controllerRef.current?.handleFavoritesChange(favorites);
  }, [favorites]);
}
