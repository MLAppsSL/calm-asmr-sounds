import storage from '@react-native-firebase/storage';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LibrarySound } from '@/library/data/sounds';
import { SOUNDS_BY_ID } from '@/shared/data/catalogs/sounds';
import { useAudioStore } from '@/shared/domain/stores/audioStore';
import { useUIStore } from '@/shared/domain/stores/uiStore';

type SoundCardProps = {
  sound: LibrarySound;
};

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

function Badge({ sound }: { sound: LibrarySound }) {
  if (sound.badge === 'pro') {
    return (
      <View style={styles.proBadge}>
        <Text style={styles.proText}>PRO</Text>
      </View>
    );
  }

  if (sound.badge === 'lock') {
    return (
      <View style={[styles.lockBadge, { borderColor: sound.accentColor + '66' }]}>
        <MaterialIcons color={sound.accentColor} name="lock" size={16} />
      </View>
    );
  }

  if (sound.badge === 'equalizer') {
    return (
      <View style={styles.equalizerBadge}>
        <View style={styles.equalizerBarShort} />
        <View style={styles.equalizerBarTall} />
        <View style={styles.equalizerBarMedium} />
      </View>
    );
  }

  return null;
}

function Artwork({ sound }: { sound: LibrarySound }) {
  if (sound.artwork === 'rain') {
    return (
      <View style={styles.artworkBase}>
        <LinearGradient colors={['#171a22', '#0d1017']} style={StyleSheet.absoluteFill} />
        {Array.from({ length: 14 }).map((_, index) => (
          <View
            key={`rain-${index}`}
            style={[
              styles.rainStroke,
              {
                left: 12 + index * 15,
                opacity: 0.08 + (index % 4) * 0.04,
                top: -4 + (index % 3) * 18,
              },
            ]}
          />
        ))}
      </View>
    );
  }

  if (sound.artwork === 'forest') {
    return (
      <View style={styles.artworkBase}>
        <LinearGradient colors={['#5b6557', '#1a241d']} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'transparent']}
          style={styles.forestPath}
        />
        {Array.from({ length: 8 }).map((_, index) => (
          <View
            key={`forest-${index}`}
            style={[
              styles.treeTrunk,
              {
                height: 160 + (index % 3) * 24,
                left: index * 28 + 4,
                width: 10 + (index % 2) * 4,
              },
            ]}
          />
        ))}
      </View>
    );
  }

  if (sound.artwork === 'ocean') {
    return (
      <View style={styles.artworkBase}>
        <LinearGradient colors={['#8ab7cf', '#0f5168']} style={StyleSheet.absoluteFill} />
        <View style={styles.oceanHorizon} />
        <View style={styles.oceanWaterLineA} />
        <View style={styles.oceanWaterLineB} />
      </View>
    );
  }

  if (sound.artwork === 'fire') {
    return (
      <View style={styles.artworkBase}>
        <LinearGradient
          colors={['#2d1611', '#8e3d1e', '#f59e0b']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.fireGlowOuter} />
        <View style={styles.fireGlowInner} />
        <View style={styles.fireFlameCore} />
      </View>
    );
  }

  if (sound.artwork === 'vinyl') {
    return (
      <View style={styles.artworkBase}>
        <LinearGradient colors={['#d6d4d3', '#7e7d80']} style={StyleSheet.absoluteFill} />
        <View style={styles.vinylDiscLarge} />
        <View style={styles.vinylDiscSmall} />
        <View style={styles.vinylShadow} />
      </View>
    );
  }

  if (sound.artwork === 'white') {
    return (
      <View style={styles.artworkBase}>
        <LinearGradient colors={['#d5d5d5', '#7f7f7f']} style={StyleSheet.absoluteFill} />
        <View style={styles.whiteCylinderTop} />
        <View style={styles.whiteCylinderBody} />
      </View>
    );
  }

  if (sound.artwork === 'cafe') {
    return (
      <View style={styles.artworkBase}>
        <LinearGradient colors={['#c6a17e', '#8e6548']} style={StyleSheet.absoluteFill} />
        <View style={styles.cafeLampCord} />
        <View style={styles.cafeLampShade} />
        <View style={styles.cafeCup} />
        <View style={styles.cafePlantPot} />
        <View style={styles.cafeLeafA} />
        <View style={styles.cafeLeafB} />
      </View>
    );
  }

  return (
    <View style={styles.artworkBase}>
      <LinearGradient colors={['#a8c1e8', '#3f4b72']} style={StyleSheet.absoluteFill} />
      <View style={styles.trainGround} />
      <View style={styles.trainBody} />
      <View style={styles.trainRoof} />
      <View style={styles.trainWindowA} />
      <View style={styles.trainWindowB} />
      <View style={styles.trainFront} />
    </View>
  );
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

  const isWide = sound.cardVariant === 'wide';

  return (
    <Pressable onPress={handlePress} style={isWide ? styles.wideCard : styles.squareCard}>
      <View
        style={[
          styles.artworkFrame,
          isWide ? styles.wideArtworkFrame : styles.squareArtworkFrame,
          sound.badge === 'pro' || sound.badge === 'lock' ? styles.premiumFrame : null,
        ]}
      >
        <Artwork sound={sound} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.26)']}
          style={StyleSheet.absoluteFill}
        />
        <Badge sound={sound} />
      </View>

      <Text numberOfLines={1} style={styles.soundName}>
        {sound.name}
      </Text>
      <Text numberOfLines={1} style={styles.subtitle}>
        {sound.subtitle}
      </Text>
      <Text style={styles.hiddenDuration}>{displayDuration}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  artworkBase: {
    flex: 1,
    overflow: 'hidden',
  },
  artworkFrame: {
    backgroundColor: '#1a1c22',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    overflow: 'hidden',
  },
  premiumFrame: {
    borderColor: 'rgba(139,92,246,0.36)',
    shadowColor: 'rgba(139,92,246,0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  wideArtworkFrame: {
    borderRadius: 24,
    height: 156,
    width: 156,
  },
  squareArtworkFrame: {
    borderRadius: 24,
    height: 156,
    width: '100%',
  },
  wideCard: {
    gap: 10,
    marginRight: 16,
    width: 156,
  },
  squareCard: {
    gap: 10,
    marginBottom: 20,
    width: '48%',
  },
  soundName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '500',
  },
  subtitle: {
    color: '#91a0b5',
    fontSize: 12,
  },
  hiddenDuration: {
    color: 'transparent',
    fontSize: 1,
    height: 0,
  },
  proBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(61,40,97,0.8)',
    borderColor: 'rgba(164,134,255,0.42)',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  proText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  lockBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(38,38,43,0.66)',
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    width: 32,
  },
  equalizerBadge: {
    alignItems: 'flex-end',
    bottom: 10,
    flexDirection: 'row',
    gap: 3,
    position: 'absolute',
    right: 12,
  },
  equalizerBarShort: {
    backgroundColor: '#8f5bff',
    borderRadius: 4,
    height: 12,
    width: 5,
  },
  equalizerBarTall: {
    backgroundColor: '#8f5bff',
    borderRadius: 4,
    height: 20,
    width: 5,
  },
  equalizerBarMedium: {
    backgroundColor: '#8f5bff',
    borderRadius: 4,
    height: 16,
    width: 5,
  },
  rainStroke: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    height: 156,
    position: 'absolute',
    transform: [{ rotate: '14deg' }],
    width: 1,
  },
  forestPath: {
    bottom: -14,
    height: 128,
    left: 58,
    position: 'absolute',
    transform: [{ rotate: '8deg' }],
    width: 34,
  },
  treeTrunk: {
    backgroundColor: 'rgba(19,21,16,0.84)',
    bottom: -10,
    position: 'absolute',
  },
  oceanHorizon: {
    backgroundColor: 'rgba(255,255,255,0.38)',
    height: 2,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 42,
  },
  oceanWaterLineA: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    height: 2,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 78,
  },
  oceanWaterLineB: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    height: 2,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 102,
  },
  fireGlowOuter: {
    backgroundColor: 'rgba(251,146,60,0.34)',
    borderRadius: 999,
    bottom: 18,
    height: 88,
    left: 24,
    position: 'absolute',
    width: 108,
  },
  fireGlowInner: {
    backgroundColor: 'rgba(254,215,170,0.48)',
    borderRadius: 999,
    bottom: 34,
    height: 56,
    left: 44,
    position: 'absolute',
    width: 68,
  },
  fireFlameCore: {
    backgroundColor: 'rgba(255,251,235,0.82)',
    borderRadius: 999,
    bottom: 54,
    height: 28,
    left: 64,
    position: 'absolute',
    width: 28,
  },
  vinylDiscLarge: {
    backgroundColor: 'rgba(174,158,150,0.6)',
    borderRadius: 999,
    height: 76,
    left: 30,
    position: 'absolute',
    top: 30,
    width: 76,
  },
  vinylDiscSmall: {
    backgroundColor: 'rgba(193,184,179,0.74)',
    borderRadius: 999,
    height: 64,
    left: 74,
    position: 'absolute',
    top: 36,
    width: 64,
  },
  vinylShadow: {
    backgroundColor: 'rgba(95,96,102,0.18)',
    borderRadius: 999,
    bottom: 16,
    height: 24,
    left: 22,
    position: 'absolute',
    width: 90,
  },
  whiteCylinderTop: {
    backgroundColor: 'rgba(92,92,92,0.26)',
    borderRadius: 999,
    height: 18,
    left: 34,
    position: 'absolute',
    top: 56,
    width: 86,
  },
  whiteCylinderBody: {
    backgroundColor: 'rgba(116,116,116,0.36)',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 58,
    left: 40,
    position: 'absolute',
    top: 66,
    width: 74,
  },
  cafeLampCord: {
    backgroundColor: 'rgba(255,255,255,0.48)',
    height: 42,
    left: 52,
    position: 'absolute',
    top: 0,
    width: 2,
  },
  cafeLampShade: {
    backgroundColor: 'rgba(175,126,88,0.85)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    height: 18,
    left: 42,
    position: 'absolute',
    top: 40,
    width: 22,
  },
  cafeCup: {
    backgroundColor: 'rgba(88,56,31,0.55)',
    borderRadius: 8,
    bottom: 28,
    height: 16,
    left: 68,
    position: 'absolute',
    width: 24,
  },
  cafePlantPot: {
    backgroundColor: 'rgba(101,72,48,0.55)',
    borderRadius: 10,
    bottom: 24,
    height: 20,
    left: 104,
    position: 'absolute',
    width: 24,
  },
  cafeLeafA: {
    backgroundColor: '#274f30',
    borderRadius: 999,
    height: 34,
    left: 106,
    position: 'absolute',
    top: 84,
    transform: [{ rotate: '-28deg' }],
    width: 12,
  },
  cafeLeafB: {
    backgroundColor: '#2f643a',
    borderRadius: 999,
    height: 30,
    left: 118,
    position: 'absolute',
    top: 80,
    transform: [{ rotate: '24deg' }],
    width: 12,
  },
  trainGround: {
    backgroundColor: 'rgba(61,85,43,0.9)',
    bottom: 0,
    height: 34,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  trainBody: {
    backgroundColor: '#ab4857',
    borderRadius: 6,
    bottom: 34,
    height: 36,
    left: 58,
    position: 'absolute',
    width: 76,
  },
  trainRoof: {
    backgroundColor: '#3d546f',
    borderRadius: 8,
    bottom: 64,
    height: 12,
    left: 70,
    position: 'absolute',
    width: 50,
  },
  trainWindowA: {
    backgroundColor: '#5a7391',
    borderRadius: 4,
    bottom: 54,
    height: 10,
    left: 78,
    position: 'absolute',
    width: 12,
  },
  trainWindowB: {
    backgroundColor: '#5a7391',
    borderRadius: 4,
    bottom: 54,
    height: 10,
    left: 94,
    position: 'absolute',
    width: 12,
  },
  trainFront: {
    backgroundColor: '#cfb63f',
    borderRadius: 6,
    bottom: 36,
    height: 32,
    left: 44,
    position: 'absolute',
    width: 20,
  },
});
