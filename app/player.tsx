import { MaterialIcons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { setStatusBarHidden } from 'expo-status-bar';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { SOUNDS } from '@/library/data/sounds';
import { BottomControlPill } from '@/player/ui/components/BottomControlPill';
import { CircularProgressArc } from '@/player/ui/components/CircularProgressArc';
import { VideoBackground } from '@/player/ui/components/VideoBackground';
import { SOUNDS_BY_ID } from '@/shared/data/catalogs/sounds';
import { AudioService, type PlaybackStatusSnapshot } from '@/shared/data/services/AudioService';
import { SoundCacheService } from '@/shared/data/services/SoundCacheService';
import { useAudioStore } from '@/shared/domain/stores/audioStore';
import { useUIStore } from '@/shared/domain/stores/uiStore';

const KEEP_AWAKE_TAG = 'fullscreen-player';
const FOREST_VIDEO = require('../background_video/forest.mp4');

function formatMillisAsClock(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDisplayClock(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function PlayerRoute() {
  const params = useLocalSearchParams<{ soundId?: string | string[] }>();
  const currentSoundId = useAudioStore((state) => state.currentSoundId);
  const isLooping = useAudioStore((state) => state.isLooping);
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const setCurrentSound = useAudioStore((state) => state.setCurrentSound);
  const setIsLooping = useAudioStore((state) => state.setIsLooping);
  const setIsPlaying = useAudioStore((state) => state.setIsPlaying);
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
  const displayTimerLabel = useMemo(() => {
    if (!effectivePlaybackStatus?.durationMillis) {
      const [minutes = '0', seconds = '00'] = (sound?.duration ?? '0:00').split(':');
      return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }

    const remainingMillis =
      effectivePlaybackStatus.durationMillis - effectivePlaybackStatus.positionMillis;
    return formatDisplayClock(remainingMillis);
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
    if (!playbackStatus?.didJustFinish || playbackStatus.isLooping) {
      return;
    }

    setLastPlaybackStatus({
      ...playbackStatus,
      isPlaying: false,
      positionMillis: playbackStatus.durationMillis ?? playbackStatus.positionMillis,
    });

    void AudioService.stop().finally(() => {
      setIsPlaying(false);
    });
  }, [playbackStatus, setIsPlaying]);

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
      return () => {
        deactivateKeepAwake(KEEP_AWAKE_TAG);
        setStatusBarHidden(false, 'fade');
      };
    }, []),
  );

  const enterFullscreen = useCallback(() => {
    setStatusBarHidden(true, 'fade');
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    setIsFullscreen(true);
  }, []);

  const exitFullscreen = useCallback(() => {
    setStatusBarHidden(false, 'fade');
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
            <Pressable onPress={handleLeavePlayer} style={styles.iconButton}>
              <MaterialIcons color="rgba(255,255,255,0.9)" name="expand-more" size={24} />
            </Pressable>

            <View style={styles.topCenter}>
              <Text style={styles.nowPlayingLabel}>Now Playing</Text>
              <Text numberOfLines={1} style={styles.topSoundName}>
                {sound.name}
              </Text>
            </View>

            <Pressable style={styles.iconButton}>
              <MaterialIcons color="rgba(255,255,255,0.9)" name="more-horiz" size={24} />
            </Pressable>
          </SafeAreaView>

          <View style={styles.centerContent}>
            <View style={styles.copyBlock}>
              <Text style={styles.title}>{sound.name}</Text>
              <Text style={styles.meta}>
                {sound.subtitle.toUpperCase()} {'\u2022'} {timerLabel}
              </Text>
            </View>

            <CircularProgressArc
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              progress={progress}
            />

            <Text style={styles.timer}>{displayTimerLabel}</Text>
          </View>

          <View style={styles.bottomArea}>
            <BottomControlPill
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
  container: {
    backgroundColor: '#000000',
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    zIndex: 10,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  topCenter: {
    alignItems: 'center',
    flex: 1,
  },
  nowPlayingLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  topSoundName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '300',
    marginTop: 2,
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 8,
  },
  copyBlock: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '300',
    letterSpacing: -0.6,
  },
  meta: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  timer: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 30,
    fontWeight: '200',
    letterSpacing: 6,
    marginTop: 32,
  },
  bottomArea: {
    alignItems: 'center',
    bottom: 32,
    left: 0,
    position: 'absolute',
    right: 0,
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
  unavailableCopy: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
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
});
