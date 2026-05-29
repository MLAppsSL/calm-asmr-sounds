import { getDownloadURL, getStorage, ref } from '@react-native-firebase/storage';
import * as FileSystem from 'expo-file-system/legacy';

import type { SoundConfig } from '../catalogs/sounds';

class SoundCacheServiceClass {
  private inProgress = new Map<string, Promise<string | null>>();
  private storage = getStorage();

  async getLocalUri(sound: SoundConfig): Promise<string | null> {
    const localPath = this.localPath(sound.id);

    if (!localPath) {
      return null;
    }

    const fileInfo = await FileSystem.getInfoAsync(localPath);

    if (fileInfo.exists) {
      return localPath;
    }

    const existingDownload = this.inProgress.get(sound.id);

    if (existingDownload) {
      return existingDownload;
    }

    const downloadPromise = this.download(sound, localPath).finally(() => {
      this.inProgress.delete(sound.id);
    });

    this.inProgress.set(sound.id, downloadPromise);

    return downloadPromise;
  }

  isLoading(soundId: string) {
    return this.inProgress.has(soundId);
  }

  private localPath(soundId: string) {
    if (!FileSystem.documentDirectory) {
      console.warn('[SoundCacheService] documentDirectory is unavailable.');
      return null;
    }

    return `${FileSystem.documentDirectory}sounds/${soundId}.mp3`;
  }

  private async download(sound: SoundConfig, localPath: string): Promise<string | null> {
    try {
      await this.ensureSoundsDirectory();

      // Firebase Storage rules must allow reads for the sounds/ prefix.
      const downloadUrl = await getDownloadURL(ref(this.storage, sound.storageRef));
      const result = await FileSystem.downloadAsync(downloadUrl, localPath);

      if (result.status !== 200) {
        await this.cleanupPartialFile(localPath);
        return null;
      }

      return localPath;
    } catch (error) {
      console.warn(`[SoundCacheService] Failed to cache ${sound.id}.`, error);
      await this.cleanupPartialFile(localPath);
      return null;
    }
  }

  private async ensureSoundsDirectory() {
    if (!FileSystem.documentDirectory) {
      throw new Error('documentDirectory is unavailable.');
    }

    const directoryPath = `${FileSystem.documentDirectory}sounds/`;
    const directoryInfo = await FileSystem.getInfoAsync(directoryPath);

    if (!directoryInfo.exists) {
      await FileSystem.makeDirectoryAsync(directoryPath, { intermediates: true });
    }
  }

  private async cleanupPartialFile(localPath: string) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(localPath);

      if (fileInfo.exists) {
        await FileSystem.deleteAsync(localPath, { idempotent: true });
      }
    } catch {
      // Ignore cleanup errors and preserve the null-on-failure contract.
    }
  }
}

export const SoundCacheService = new SoundCacheServiceClass();
