import { create } from 'zustand';

type FavoritesState = {
  favoriteIds: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setFavorites: (ids: string[]) => void;
};

// When selecting multiple store values in a component, use useShallow from
// 'zustand/react/shallow' to avoid unnecessary re-renders with Zustand v5.
export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  favoriteIds: [],
  addFavorite: (id) =>
    set((state) => ({
      favoriteIds: state.favoriteIds.includes(id) ? state.favoriteIds : [...state.favoriteIds, id],
    })),
  removeFavorite: (id) =>
    set((state) => ({
      favoriteIds: state.favoriteIds.filter((favoriteId) => favoriteId !== id),
    })),
  isFavorite: (id) => get().favoriteIds.includes(id),
  setFavorites: (ids) => set({ favoriteIds: ids }),
}));
