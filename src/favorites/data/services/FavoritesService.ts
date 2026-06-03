import { firestore } from '@/lib/firebase';
import type { FavoritesDocument } from '@/types';

import type { Favorite } from '../../domain/types';
import {
  favoritesArrayToMap,
  favoritesMapToArray,
  mergeFavoritesByEarliest,
} from './favoritesFirestoreHelpers';

function cloneFavorite(favorite: Favorite): Favorite {
  return {
    id: favorite.id,
    addedAt: favorite.addedAt,
  };
}

export class FavoritesService {
  static firestore = firestore;

  static async getFavorites(uid: string): Promise<Favorite[]> {
    const snapshot = await FavoritesService.firestore().collection('users').doc(uid).get();
    const data = snapshot.data() as FavoritesDocument | undefined;

    return favoritesMapToArray(data?.favorites);
  }

  static async setFavorites(uid: string, favorites: Favorite[]): Promise<void> {
    const favoritesMap = favoritesArrayToMap(favorites);

    await FavoritesService.firestore().collection('users').doc(uid).set(
      {
        favorites: favoritesMap,
      },
      { merge: true },
    );
  }

  static async migrateLocalToCloud(uid: string, localFavorites: Favorite[]): Promise<Favorite[]> {
    const cloudFavorites = await FavoritesService.getFavorites(uid);
    const mergedFavorites = mergeFavoritesByEarliest(cloudFavorites, localFavorites).map(
      cloneFavorite,
    );

    await FavoritesService.setFavorites(uid, mergedFavorites);

    return mergedFavorites;
  }
}
