import storage from '@react-native-firebase/storage';
import { Audio, type AVPlaybackStatus } from 'expo-av';

import type { SoundConfig } from '../catalogs/sounds';

class SoundDurationServiceClass {
  private cachedDurations = new Map<string, number | null>();
  private inFlight = new Map<string, Promise<number | null>>();

  async getDurationMillis(sound: SoundConfig): Promise<number | null> {
    const cachedDuration = this.cachedDurations.get(sound.id);

    if (cachedDuration !== undefined) {
      return cachedDuration;
    }

    const existingRequest = this.inFlight.get(sound.id);

    if (existingRequest) {
      return existingRequest;
    }

    const request = this.loadDuration(sound).finally(() => {
      this.inFlight.delete(sound.id);
    });

    this.inFlight.set(sound.id, request);

    return request;
  }

  private async loadDuration(sound: SoundConfig): Promise<number | null> {
    let audioSound: Audio.Sound | null = null;

    try {
      const downloadUrl = await storage().ref(sound.storageRef).getDownloadURL();
      const result = await Audio.Sound.createAsync(
        { uri: downloadUrl },
        { shouldPlay: false },
        undefined,
        false,
      );

      audioSound = result.sound;

      const durationMillis = this.readDurationMillis(result.status);
      this.cachedDurations.set(sound.id, durationMillis);

      return durationMillis;
    } catch (error) {
      console.warn(`[SoundDurationService] Failed to read duration for ${sound.id}.`, error);
      this.cachedDurations.set(sound.id, null);
      return null;
    } finally {
      if (audioSound) {
        await audioSound.unloadAsync().catch(() => {
          // Ignore unload cleanup failures and keep the cached result.
        });
      }
    }
  }

  private readDurationMillis(status: AVPlaybackStatus) {
    if (!status.isLoaded) {
      return null;
    }

    return status.durationMillis ?? null;
  }
}

export const SoundDurationService = new SoundDurationServiceClass();
