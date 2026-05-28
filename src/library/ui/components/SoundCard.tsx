import storage from '@react-native-firebase/storage';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LibrarySound } from '@/library/data/sounds';
import { SOUNDS_BY_ID } from '@/shared/data/catalogs/sounds';
import { useAudioStore } from '@/shared/domain/stores/audioStore';
import { useUIStore } from '@/shared/domain/stores/uiStore';

type SoundCardProps = {
  sound: LibrarySound;
};

const CARD_SIZE = 156;
const cachedDurations = new Map<string, number | null>();
const inFlightDurations = new Map<string, Promise<number | null>>();

function formatMillisAsClock(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function readDurationMillis(status: AVPlaybackStatus) {
  if (!status.isLoaded) {
    return null;
  }

  return status.durationMillis ?? null;
}

async function getDurationMillis(soundId: string) {
  const cachedDuration = cachedDurations.get(soundId);

  if (cachedDuration !== undefined) {
    return cachedDuration;
  }

  const runtimeSound = SOUNDS_BY_ID[soundId];

  if (!runtimeSound) {
    cachedDurations.set(soundId, null);
    return null;
  }

  const existingRequest = inFlightDurations.get(soundId);

  if (existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
    let audioSound: Audio.Sound | null = null;

    try {
      const downloadUrl = await storage().ref(runtimeSound.storageRef).getDownloadURL();
      const result = await Audio.Sound.createAsync(
        { uri: downloadUrl },
        { shouldPlay: false },
        undefined,
        false,
      );

      audioSound = result.sound;

      const durationMillis = readDurationMillis(result.status);
      cachedDurations.set(soundId, durationMillis);

      return durationMillis;
    } catch (error) {
      console.warn(`[SoundCard] Failed to load duration for ${soundId}.`, error);
      cachedDurations.set(soundId, null);
      return null;
    } finally {
      inFlightDurations.delete(soundId);

      if (audioSound) {
        await audioSound.unloadAsync().catch(() => {
          // Ignore unload cleanup failures and keep the cached result.
        });
      }
    }
  })();

  inFlightDurations.set(soundId, request);

  return request;
}

export function SoundCard({ sound }: SoundCardProps) {
  const setCurrentSound = useAudioStore((state) => state.setCurrentSound);
  const setPlayerVisible = useUIStore((state) => state.setPlayerVisible);
  const [displayDuration, setDisplayDuration] = useState(sound.duration);

  useEffect(() => {
    let isCancelled = false;

    setDisplayDuration(sound.duration);

    void getDurationMillis(sound.id).then((durationMillis) => {
      if (isCancelled || durationMillis === null) {
        return;
      }

      setDisplayDuration(formatMillisAsClock(durationMillis));
    });

    return () => {
      isCancelled = true;
    };
  }, [sound.duration, sound.id]);

  function handlePress() {
    setCurrentSound(sound.id);
    setPlayerVisible(true);
    router.push({ pathname: '/player', params: { soundId: sound.id } });
  }

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: sound.imageAsset }]} />
      <Image contentFit="cover" source={null} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.78)']}
        end={{ x: 0, y: 1 }}
        start={{ x: 0, y: 0.35 }}
        style={StyleSheet.absoluteFill}
      />

      {sound.isPremium ? (
        <View style={styles.proBadge}>
          <Text style={styles.proText}>PRO</Text>
        </View>
      ) : null}

      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={styles.soundName}>
          {sound.name}
        </Text>
        <View style={styles.metaRow}>
          <Text numberOfLines={1} style={styles.subtitle}>
            {sound.subtitle}
          </Text>
          <Text style={styles.duration}>{displayDuration}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1c22',
    borderRadius: 24,
    height: CARD_SIZE,
    marginRight: 14,
    overflow: 'hidden',
    width: CARD_SIZE,
  },
  proBadge: {
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderColor: 'rgba(139,92,246,0.45)',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  proText: {
    color: '#8b5cf6',
    fontSize: 10,
    fontWeight: '700',
  },
  textContainer: {
    bottom: 12,
    left: 12,
    position: 'absolute',
    right: 12,
  },
  soundName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.64)',
    flex: 1,
    fontSize: 11,
  },
  duration: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 11,
    fontWeight: '600',
  },
});
