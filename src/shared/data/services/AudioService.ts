import {
  Audio,
  InterruptionModeAndroid,
  InterruptionModeIOS,
  type AVPlaybackStatus,
} from 'expo-av';

const CROSSFADE_DURATION_MS = 700;
const ANIMATION_STEP_MS = 50;

type SoundInstance = Audio.Sound;

export type PlaybackStatusSnapshot = {
  didJustFinish: boolean;
  durationMillis: number | null;
  isLooping: boolean;
  isPlaying: boolean;
  positionMillis: number;
};

class AudioServiceClass {
  private initialized = false;
  private initializePromise: Promise<void> | null = null;
  private activeSound: SoundInstance | null = null;
  private outgoingSound: SoundInstance | null = null;
  private activeSoundId: string | null = null;
  private activeVolume = 1;
  private isLooping = true;
  private playbackStatusListener: ((status: PlaybackStatusSnapshot | null) => void) | null = null;
  private animationId = 0;
  private animationTimer: ReturnType<typeof setTimeout> | null = null;
  private animationResolve: ((completed: boolean) => void) | null = null;

  async initialize() {
    if (this.initialized) {
      return;
    }

    if (!this.initializePromise) {
      this.initializePromise = this.applyAudioMode(false)
        .then(() => {
          this.initialized = true;
        })
        .finally(() => {
          this.initializePromise = null;
        });
    }

    await this.initializePromise;
  }

  async play(soundId: string, localUri: string) {
    const trimmedUri = localUri.trim();

    if (!trimmedUri) {
      throw new Error('AudioService.play requires a valid localUri.');
    }

    await this.initialize();

    if (this.outgoingSound) {
      await this.stop();
    }

    if (this.activeSound && this.activeSoundId === soundId) {
      const status = await this.activeSound.getStatusAsync();
      if (status.isLoaded) {
        await this.activeSound.playAsync();
        return;
      }
      this.activeSound = null;
    }

    if (!this.activeSound) {
      await this.startFresh(soundId, trimmedUri);
      return;
    }

    await this.crossfadeTo(soundId, trimmedUri);
  }

  async stop() {
    this.cancelAnimation();

    const sounds = [this.activeSound, this.outgoingSound].filter(
      (sound): sound is SoundInstance => sound !== null,
    );

    this.activeSound = null;
    this.outgoingSound = null;
    this.activeSoundId = null;
    this.activeVolume = 1;
    this.emitPlaybackStatus(null);

    await Promise.allSettled(sounds.map((sound) => this.unloadSound(sound)));
    await this.applyAudioMode(false);
  }

  async pause() {
    if (!this.activeSound) {
      return;
    }

    await this.activeSound.pauseAsync();
  }

  async resume() {
    if (!this.activeSound) {
      return false;
    }

    await this.activeSound.playAsync();
    return true;
  }

  async setLooping(looping: boolean) {
    this.isLooping = looping;

    const updates = [this.activeSound, this.outgoingSound]
      .filter((sound): sound is SoundInstance => sound !== null)
      .map((sound) => this.setSoundLooping(sound, looping));

    await Promise.allSettled(updates);
  }

  setPlaybackStatusListener(listener: ((status: PlaybackStatusSnapshot | null) => void) | null) {
    this.playbackStatusListener = listener;
  }

  async fadeOut(durationMs: number) {
    if (!this.activeSound) {
      return;
    }

    const startingVolume = this.activeVolume;

    if (startingVolume <= 0) {
      return;
    }

    if (durationMs <= 0) {
      await this.setTrackedActiveVolume(this.activeSound, 0);
      return;
    }

    const targetSound = this.activeSound;

    await this.runAnimation(durationMs, async (progress) => {
      const nextVolume = startingVolume * (1 - progress);

      if (this.activeSound !== targetSound) {
        return;
      }

      await this.setTrackedActiveVolume(targetSound, nextVolume);
    });
  }

  private async startFresh(soundId: string, localUri: string) {
    const sound = await this.createSound(localUri, 1);

    this.activeSound = sound;
    this.outgoingSound = null;
    this.activeSoundId = soundId;
    this.activeVolume = 1;
  }

  private async crossfadeTo(soundId: string, localUri: string) {
    if (!this.activeSound) {
      await this.startFresh(soundId, localUri);
      return;
    }

    const outgoing = this.activeSound;
    const outgoingSoundId = this.activeSoundId;
    const outgoingStartingVolume = this.activeVolume;
    let incoming: SoundInstance | null = null;
    let completed = false;

    await this.applyAudioMode(true);

    try {
      incoming = await this.createSound(localUri, 0);
      const createdIncoming = incoming;

      this.activeSound = createdIncoming;
      this.outgoingSound = outgoing;
      this.activeSoundId = soundId;
      this.activeVolume = 0;

      completed = await this.runAnimation(CROSSFADE_DURATION_MS, async (progress) => {
        const incomingVolume = progress;
        const outgoingVolume = outgoingStartingVolume * (1 - progress);

        await Promise.allSettled([
          createdIncoming.setVolumeAsync(incomingVolume),
          outgoing.setVolumeAsync(outgoingVolume),
        ]);

        if (this.activeSound === createdIncoming) {
          this.activeVolume = incomingVolume;
        }
      });

      if (completed) {
        this.outgoingSound = null;
        this.activeVolume = 1;
      }
    } finally {
      const cleanup: Promise<unknown>[] = [];

      const transitionStillOwnsState =
        this.outgoingSound === outgoing || (incoming !== null && this.activeSound === incoming);

      if (completed) {
        cleanup.push(this.unloadSound(outgoing));
      } else if (incoming) {
        cleanup.push(this.unloadSound(incoming));

        if (transitionStillOwnsState) {
          this.activeSound = outgoing;
          this.outgoingSound = null;
          this.activeSoundId = outgoingSoundId;
          this.activeVolume = outgoingStartingVolume;
          cleanup.push(outgoing.setVolumeAsync(outgoingStartingVolume));
        }
      }

      cleanup.push(this.applyAudioMode(false));

      await Promise.allSettled(cleanup);
    }
  }

  private async createSound(localUri: string, volume: number) {
    const { sound } = await Audio.Sound.createAsync(
      { uri: localUri },
      {
        isLooping: this.isLooping,
        shouldPlay: true,
        progressUpdateIntervalMillis: ANIMATION_STEP_MS,
        volume,
      },
      null,
      false,
    );

    sound.setOnPlaybackStatusUpdate((status) => {
      this.handlePlaybackStatus(sound, status);
    });

    return sound;
  }

  private async unloadSound(sound: SoundInstance) {
    await Promise.allSettled([sound.stopAsync(), sound.unloadAsync()]);
  }

  private async setTrackedActiveVolume(sound: SoundInstance, volume: number) {
    await sound.setVolumeAsync(volume);

    if (this.activeSound === sound) {
      this.activeVolume = volume;
    }
  }

  private async setSoundLooping(sound: SoundInstance, looping: boolean) {
    if (typeof sound.setIsLoopingAsync !== 'function') {
      return;
    }

    await sound.setIsLoopingAsync(looping);
  }

  private handlePlaybackStatus(sound: SoundInstance, status: AVPlaybackStatus) {
    if (!status.isLoaded || this.activeSound !== sound) {
      return;
    }

    this.emitPlaybackStatus({
      didJustFinish: status.didJustFinish,
      durationMillis: status.durationMillis ?? null,
      isLooping: status.isLooping,
      isPlaying: status.isPlaying,
      positionMillis: status.positionMillis,
    });
  }

  private emitPlaybackStatus(status: PlaybackStatusSnapshot | null) {
    this.playbackStatusListener?.(status);
  }

  private cancelAnimation() {
    this.animationId += 1;

    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }

    if (this.animationResolve) {
      const resolve = this.animationResolve;
      this.clearAnimationCallbacks();
      resolve(false);
    }
  }

  private runAnimation(
    durationMs: number,
    onFrame: (progress: number) => Promise<void>,
  ): Promise<boolean> {
    this.cancelAnimation();

    const animationId = this.animationId;

    return new Promise((resolve, reject) => {
      this.animationResolve = resolve;
      const startedAt = Date.now();

      const tick = async () => {
        try {
          if (this.animationId !== animationId) {
            return;
          }

          const elapsed = Date.now() - startedAt;
          const progress = Math.min(elapsed / durationMs, 1);

          await onFrame(progress);

          if (this.animationId !== animationId) {
            return;
          }

          if (progress >= 1) {
            this.animationTimer = null;
            this.clearAnimationCallbacks();
            resolve(true);
            return;
          }

          this.animationTimer = setTimeout(() => {
            void tick();
          }, ANIMATION_STEP_MS);
        } catch (error) {
          this.animationTimer = null;
          this.clearAnimationCallbacks();
          reject(error);
        }
      };

      void tick();
    });
  }

  private clearAnimationCallbacks() {
    this.animationResolve = null;
  }

  private async applyAudioMode(allowMixing: boolean) {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeAndroid: allowMixing
        ? InterruptionModeAndroid.DuckOthers
        : InterruptionModeAndroid.DoNotMix,
      interruptionModeIOS: allowMixing
        ? InterruptionModeIOS.MixWithOthers
        : InterruptionModeIOS.DoNotMix,
      playThroughEarpieceAndroid: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: allowMixing,
      staysActiveInBackground: true,
    });
  }
}

export const AudioService = new AudioServiceClass();
