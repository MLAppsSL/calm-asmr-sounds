import { useFavoritesStore } from '../../domain/stores/favoritesStore';
import type { Favorite } from '../../domain/types';

export class LocalFavoritesAdapter {
  async getFavorites(): Promise<Favorite[]> {
    return useFavoritesStore.getState().getSortedFavorites();
  }

  async isFavorite(id: string): Promise<boolean> {
    return useFavoritesStore.getState().isFavorite(id);
  }

  async addFavorite(id: string): Promise<void> {
    const store = useFavoritesStore.getState();

    if (!store.isFavorite(id)) {
      store.toggleFavorite(id);
    }
  }

  async removeFavorite(id: string): Promise<void> {
    const store = useFavoritesStore.getState();

    if (store.isFavorite(id)) {
      store.toggleFavorite(id);
    }
  }

  async setFavorites(favorites: Favorite[]): Promise<void> {
    useFavoritesStore.getState().setFavorites(favorites);
  }
}
