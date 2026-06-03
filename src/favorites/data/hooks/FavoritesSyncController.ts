import type { Favorite } from '../../domain/types';

type FavoritesSyncService = {
  getFavorites: (uid: string) => Promise<Favorite[]>;
  setFavorites: (uid: string, favorites: Favorite[]) => Promise<void>;
  migrateLocalToCloud: (uid: string, localFavorites: Favorite[]) => Promise<Favorite[]>;
};

type SnapshotStorage = {
  loadSnapshot: () => Promise<Favorite[] | null>;
  saveSnapshot: (favorites: Favorite[]) => Promise<void>;
  clearSnapshot: () => Promise<void>;
};

type WarningLogger = (message: string, error: unknown) => void;

function cloneFavorites(favorites: Favorite[]) {
  return favorites.map((favorite) => ({
    id: favorite.id,
    addedAt: favorite.addedAt,
  }));
}

export function serializeFavorites(favorites: Favorite[]) {
  return JSON.stringify(
    cloneFavorites(favorites).sort((left, right) => {
      if (left.id === right.id) {
        return left.addedAt - right.addedAt;
      }

      return left.id.localeCompare(right.id);
    }),
  );
}

export function parseStoredFavoritesSnapshot(
  serializedFavorites: string | null,
): Favorite[] | null {
  if (!serializedFavorites) {
    return null;
  }

  try {
    const parsedFavorites = JSON.parse(serializedFavorites) as Favorite[];

    if (!Array.isArray(parsedFavorites)) {
      return null;
    }

    return parsedFavorites
      .filter((favorite) => typeof favorite?.id === 'string' && favorite.id.length > 0)
      .map((favorite) => ({
        id: favorite.id,
        addedAt:
          typeof favorite.addedAt === 'number' && Number.isFinite(favorite.addedAt)
            ? favorite.addedAt
            : 0,
      }));
  } catch {
    return null;
  }
}

export class FavoritesSyncController {
  private activeUserId: string | null = null;
  private hasCompletedInitialSync = false;
  private lastPersistedSnapshot = '';
  private localFavoritesSnapshot: Favorite[] | null = null;
  private suppressNextWrite = false;
  private userChangeToken = 0;

  constructor(
    private readonly service: FavoritesSyncService,
    private readonly snapshotStorage: SnapshotStorage,
    private readonly getFavorites: () => Favorite[],
    private readonly setFavorites: (favorites: Favorite[]) => void,
    private readonly logWarning: WarningLogger = (message, error) => {
      console.warn(message, error);
    },
  ) {}

  async handleUserChange(nextUserId: string | null): Promise<void> {
    const token = ++this.userChangeToken;

    if (!nextUserId) {
      await this.restoreSignedOutState(token);
      return;
    }

    if (this.activeUserId && this.activeUserId !== nextUserId) {
      await this.restoreSnapshotForAccountSwitch(token);
    }

    this.activeUserId = nextUserId;
    this.hasCompletedInitialSync = false;
    this.suppressNextWrite = false;
    this.lastPersistedSnapshot = '';

    const localFavorites = await this.ensureLocalFavoritesSnapshot();

    if (token !== this.userChangeToken || this.activeUserId !== nextUserId) {
      return;
    }

    try {
      const mergedFavorites = await this.service.migrateLocalToCloud(nextUserId, localFavorites);

      if (token !== this.userChangeToken || this.activeUserId !== nextUserId) {
        return;
      }

      this.applyCloudFavorites(mergedFavorites);
      this.hasCompletedInitialSync = true;
    } catch (error) {
      if (token !== this.userChangeToken || this.activeUserId !== nextUserId) {
        return;
      }

      this.logWarning('[useFavoritesSync] Login favorites sync failed silently.', error);
    }
  }

  async handleFavoritesChange(nextFavorites: Favorite[]): Promise<void> {
    if (!this.activeUserId || !this.hasCompletedInitialSync) {
      return;
    }

    const serializedFavorites = serializeFavorites(nextFavorites);

    if (this.suppressNextWrite) {
      this.suppressNextWrite = false;
      this.lastPersistedSnapshot = serializedFavorites;
      return;
    }

    if (serializedFavorites === this.lastPersistedSnapshot) {
      return;
    }

    const userId = this.activeUserId;

    try {
      await this.service.setFavorites(userId, cloneFavorites(nextFavorites));

      if (this.activeUserId === userId) {
        this.lastPersistedSnapshot = serializedFavorites;
      }
    } catch (error) {
      this.logWarning('[useFavoritesSync] Favorites writeback failed silently.', error);
    }
  }

  private applyCloudFavorites(favorites: Favorite[]) {
    const clonedFavorites = cloneFavorites(favorites);

    this.suppressNextWrite = true;
    this.lastPersistedSnapshot = serializeFavorites(clonedFavorites);
    this.setFavorites(clonedFavorites);
  }

  private async ensureLocalFavoritesSnapshot(): Promise<Favorite[]> {
    if (this.localFavoritesSnapshot) {
      return cloneFavorites(this.localFavoritesSnapshot);
    }

    const storedSnapshot = await this.snapshotStorage.loadSnapshot();

    if (storedSnapshot) {
      this.localFavoritesSnapshot = cloneFavorites(storedSnapshot);
      return cloneFavorites(this.localFavoritesSnapshot);
    }

    const currentLocalFavorites = cloneFavorites(this.getFavorites());

    this.localFavoritesSnapshot = currentLocalFavorites;
    await this.snapshotStorage.saveSnapshot(currentLocalFavorites);

    return cloneFavorites(currentLocalFavorites);
  }

  private async restoreLocalSnapshot(clearSnapshot: boolean) {
    const snapshotToRestore =
      this.localFavoritesSnapshot ?? (await this.snapshotStorage.loadSnapshot()) ?? null;

    if (snapshotToRestore) {
      this.setFavorites(cloneFavorites(snapshotToRestore));
    }

    if (clearSnapshot) {
      await this.snapshotStorage.clearSnapshot();
      this.localFavoritesSnapshot = null;
    }
  }

  private async restoreSignedOutState(token: number) {
    await this.restoreLocalSnapshot(true);

    if (token !== this.userChangeToken) {
      return;
    }

    this.activeUserId = null;
    this.hasCompletedInitialSync = false;
    this.lastPersistedSnapshot = '';
    this.suppressNextWrite = false;
  }

  private async restoreSnapshotForAccountSwitch(token: number) {
    await this.restoreLocalSnapshot(false);

    if (token !== this.userChangeToken) {
      return;
    }

    this.hasCompletedInitialSync = false;
    this.lastPersistedSnapshot = '';
    this.suppressNextWrite = false;
  }
}
