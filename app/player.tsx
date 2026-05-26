import { MaterialIcons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { setStatusBarHidden } from 'expo-status-bar';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { SOUNDS } from '@/library/data/sounds';
import { BottomControlPill } from '@/player/ui/components/BottomControlPill';
import { CircularProgressArc } from '@/player/ui/components/CircularProgressArc';
import { VideoBackground } from '@/player/ui/components/VideoBackground';
import { useAudioStore } from '@/shared/domain/stores/audioStore';
import { useUIStore } from '@/shared/domain/stores/uiStore';

const KEEP_AWAKE_TAG = 'fullscreen-player';
const FOREST_VIDEO = require('../background_video/forest.mp4');

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

  const paramSoundId = useMemo(() => {
    const candidate = params.soundId;

    return Array.isArray(candidate) ? candidate[0] : candidate;
  }, [params.soundId]);

  const resolvedSoundId = paramSoundId ?? currentSoundId;
  const sound = SOUNDS.find((item) => item.id === resolvedSoundId) ?? null;

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

    if (paramSoundId) {
      setIsPlaying(true);
    }
  }, [paramSoundId, setCurrentSound, setIsPlaying, sound]);

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
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const handleLoop = useCallback(() => {
    setIsLooping(!isLooping);
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
              progress={1}
              timerLabel={sound.duration}
            />
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
