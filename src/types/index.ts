import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

export type AuthUser = FirebaseAuthTypes.User;

export type FavoritesMap = Record<
  string,
  {
    addedAt: number;
  }
>;

export type FavoritesDocument = {
  favorites: FavoritesMap;
};
