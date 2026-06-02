import { MaterialIcons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { SOUNDS } from '@/library/data/sounds';
import { BottomControlPill } from '@/player/ui/components/BottomControlPill';
import { CircularProgressArc } from '@/player/ui/components/CircularProgressArc';
import { VideoBackground } from '@/player/ui/components/VideoBackground';
import { SOUNDS_BY_ID } from '@/shared/data/catalogs/sounds';
import { AudioService, type PlaybackStatusSnapshot } from '@/shared/data/services/AudioService';
import { SoundCacheService } from '@/shared/data/services/SoundCacheService';
import { type TimerDurationMs, useAudioStore } from '@/shared/domain/stores/audioStore';
import {
  TIMER_DURATION_OPTIONS,
  timerDurationMsFromSeconds,
  timerDurationSecondsFromMs,
} from '@/shared/domain/timerOptions';
import { useUIStore } from '@/shared/domain/stores/uiStore';

const KEEP_AWAKE_TAG = 'fullscreen-player';
const FOREST_VIDEO = require('../background_video/forest.mp4');

function formatMillisAsClock(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function PlayerRoute() {
  const params = useLocalSearchParams<{ soundId?: string | string[] }>();

  const {
    currentSoundId,
    isLooping,
    isPlaying,
    setCurrentSound,
    setIsLooping,
    setIsPlaying,
    setTimerDuration,
    timerDurationMs,
  } = useAudioStore(
    useShallow((state) => ({
      currentSoundId: state.currentSoundId,
      isLooping: state.isLooping,
      isPlaying: state.isPlaying,
      setCurrentSound: state.setCurrentSound,
      setIsLooping: state.setIsLooping,
      setIsPlaying: state.setIsPlaying,
      setTimerDuration: state.setTimerDuration,
      timerDurationMs: state.timerDurationMs,
    })),
  );
  const setPlayerVisible = useUIStore((state) => state.setPlayerVisible);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatusSnapshot | null>(null);
  const [lastPlaybackStatus, setLastPlaybackStatus] = useState<PlaybackStatusSnapshot | null>(null);
  const autoplayedSoundId = useRef<string | null>(null);

  const paramSoundId = useMemo(() => {
    const candidate = params.soundId;

    return Array.isArray(candidate) ? candidate[0] : candidate;
  }, [params.soundId]);

  const resolvedSoundId = paramSoundId ?? currentSoundId;
  const sound = SOUNDS.find((item) => item.id === resolvedSoundId) ?? null;
  const runtimeSound = resolvedSoundId ? (SOUNDS_BY_ID[resolvedSoundId] ?? null) : null;
  const effectivePlaybackStatus = playbackStatus ?? lastPlaybackStatus;
  const timerLabel = useMemo(() => {
    if (!effectivePlaybackStatus?.durationMillis) {
      return sound?.duration ?? '0:00';
    }

    const remainingMillis =
      effectivePlaybackStatus.durationMillis - effectivePlaybackStatus.positionMillis;
    return formatMillisAsClock(remainingMillis);
  }, [
    effectivePlaybackStatus?.durationMillis,
    effectivePlaybackStatus?.positionMillis,
    sound?.duration,
  ]);
  const progress = useMemo(() => {
    if (!effectivePlaybackStatus?.durationMillis || effectivePlaybackStatus.durationMillis <= 0) {
      return 1;
    }

    const rawProgress =
      1 - effectivePlaybackStatus.positionMillis / effectivePlaybackStatus.durationMillis;
    return Math.min(1, Math.max(0, rawProgress));
  }, [effectivePlaybackStatus?.durationMillis, effectivePlaybackStatus?.positionMillis]);

  useEffect(() => {
    setPlayerVisible(true);

    return () => {
      setPlayerVisible(false);
    };
  }, [setPlayerVisible]);

  useEffect(() => {
    if (!sound) {
      return;
    }

    setCurrentSound(sound.id);
  }, [setCurrentSound, sound]);

  useEffect(() => {
    AudioService.setPlaybackStatusListener(setPlaybackStatus);

    return () => {
      AudioService.setPlaybackStatusListener(null);
    };
  }, []);

  useEffect(() => {
    if (!playbackStatus) {
      return;
    }

    setLastPlaybackStatus(playbackStatus);
  }, [playbackStatus]);

  useEffect(() => {
    setPlaybackStatus(null);
    setLastPlaybackStatus(null);
  }, [resolvedSoundId]);

  useEffect(() => {
    if (!playbackStatus?.didJustFinish || playbackStatus.isLooping || !resolvedSoundId) {
      return;
    }

    const finishedSoundId = resolvedSoundId;

    if (useAudioStore.getState().currentSoundId !== finishedSoundId) {
      return;
    }

    setLastPlaybackStatus({
      ...playbackStatus,
      isPlaying: false,
      positionMillis: playbackStatus.durationMillis ?? playbackStatus.positionMillis,
    });

    void AudioService.stop().then(() => {
      if (useAudioStore.getState().currentSoundId === finishedSoundId) {
        setIsPlaying(false);
      }
    });
  }, [playbackStatus, setIsPlaying, resolvedSoundId]);

  const startPlayback = useCallback(async () => {
    if (!sound || !runtimeSound) {
      return;
    }

    const localUri = await SoundCacheService.getLocalUri(runtimeSound);

    if (!localUri) {
      setIsPlaying(false);
      return;
    }

    await AudioService.setLooping(isLooping);
    await AudioService.play(runtimeSound.id, localUri);
    setCurrentSound(sound.id);
    setIsPlaying(true);
  }, [isLooping, runtimeSound, setCurrentSound, setIsPlaying, sound]);

  useEffect(() => {
    if (!paramSoundId || !sound || !runtimeSound || autoplayedSoundId.current === sound.id) {
      return;
    }

    autoplayedSoundId.current = sound.id;
    void startPlayback();
  }, [paramSoundId, runtimeSound, sound, startPlayback]);

  useFocusEffect(
    useCallback(() => {
      const { defaultTimerDuration } = useUIStore.getState();
      const audioStore = useAudioStore.getState();

      if (!audioStore.isPlaying) {
        audioStore.setTimerDuration(timerDurationMsFromSeconds(defaultTimerDuration));
      }

      return () => {
        deactivateKeepAwake(KEEP_AWAKE_TAG);
      };
    }, []),
  );

  const enterFullscreen = useCallback(() => {
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    setIsFullscreen(true);
  }, []);

  const exitFullscreen = useCallback(() => {
    deactivateKeepAwake(KEEP_AWAKE_TAG);
    setIsFullscreen(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      void AudioService.pause().finally(() => {
        setIsPlaying(false);
      });
      return;
    }

    if (playbackStatus) {
      void AudioService.resume().then((didResume) => {
        if (didResume) {
          setIsPlaying(true);
          return;
        }

        void startPlayback();
      });
      return;
    }

    void startPlayback();
  }, [isPlaying, playbackStatus, setIsPlaying, startPlayback]);

  const handleLoop = useCallback(() => {
    const nextLooping = !isLooping;

    setIsLooping(nextLooping);
    void AudioService.setLooping(nextLooping);
  }, [isLooping, setIsLooping]);

  const handleTimerDurationChange = useCallback(
    (durationMs: TimerDurationMs) => {
      setTimerDuration(durationMs);
      useUIStore.getState().setDefaultTimerDuration(timerDurationSecondsFromMs(durationMs));
    },
    [setTimerDuration],
  );

  const handleLeavePlayer = useCallback(() => {
    setPlayerVisible(false);
    router.back();
  }, [setPlayerVisible]);

  if (!sound) {
    return (
      <SafeAreaView style={styles.unavailableSafeArea}>
        <View style={styles.unavailableState}>
          <Text style={styles.unavailableTitle}>Player unavailable</Text>
          <Text style={styles.unavailableCopy}>
            We couldn&apos;t find a sound for this session. Head back to the library and start a new
            one.
          </Text>
          <Pressable
            onPress={() => {
              setPlayerVisible(false);
              router.replace('/');
            }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Back to Library</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <VideoBackground source={FOREST_VIDEO} />
      <View style={styles.scrim} />

      {isFullscreen ? (
        <Pressable onPress={exitFullscreen} style={StyleSheet.absoluteFill} />
      ) : (
        <>
          <SafeAreaView style={styles.topBar}>
            <Pressable onPress={handleLeavePlayer} style={styles.backButton}>
              <MaterialIcons color="#ffffff" name="chevron-left" size={28} />
            </Pressable>
            <View style={styles.topCenter}>
              <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
              <Text numberOfLines={1} style={styles.soundName}>
                {sound.name}
              </Text>
            </View>
            <Pressable style={styles.moreButton}>
              <Text style={styles.moreIcon}>•••</Text>
            </Pressable>
          </SafeAreaView>

          <View style={styles.center}>
            <CircularProgressArc
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              progress={progress}
              timerLabel={timerLabel}
            />
          </View>

          <View style={styles.bottomArea}>
            <View style={styles.timerSelector}>
              {TIMER_DURATION_OPTIONS.map((option) => {
                const isActive = option.value === timerDurationMs;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      handleTimerDurationChange(option.value);
                    }}
                    style={[styles.timerChip, isActive ? styles.timerChipActive : null]}
                  >
                    <Text
                      style={[styles.timerChipText, isActive ? styles.timerChipTextActive : null]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <BottomControlPill
              favoriteSoundId={sound.id}
              loopActive={isLooping}
              onFullscreen={enterFullscreen}
              onLoop={handleLoop}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
  },
  bottomArea: {
    alignItems: 'center',
    bottom: 60,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  center: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  container: {
    backgroundColor: '#0f1115',
    flex: 1,
  },
  moreButton: {
    padding: 8,
  },
  moreIcon: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    letterSpacing: 1,
  },
  nowPlayingLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 24,
    width: '100%',
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  soundName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '300',
    marginTop: 2,
  },
  timerChip: {
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  timerChipActive: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.22)',
  },
  timerChipText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '600',
  },
  timerChipTextActive: {
    color: '#ffffff',
  },
  timerSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 10,
  },
  topCenter: {
    alignItems: 'center',
    flex: 1,
  },
  unavailableCopy: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  unavailableSafeArea: {
    backgroundColor: '#020617',
    flex: 1,
  },
  unavailableState: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  unavailableTitle: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
  },
});
