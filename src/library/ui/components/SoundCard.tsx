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

  return (
    <Pressable
      onPress={handlePress}
      style={sound.cardVariant === 'wide' ? styles.wideCard : styles.squareCard}
    >
      <View
        style={[
          styles.artworkFrame,
          sound.cardVariant === 'wide' ? styles.wideArtworkFrame : styles.squareArtworkFrame,
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
    borderColor: 'rgba(145,108,255,0.18)',
    borderWidth: 1,
    overflow: 'hidden',
  },
  wideArtworkFrame: {
    borderRadius: 30,
    height: 226,
    width: 226,
  },
  squareArtworkFrame: {
    borderRadius: 28,
    height: 232,
    width: '100%',
  },
  wideCard: {
    marginRight: 18,
    width: 226,
  },
  squareCard: {
    marginBottom: 24,
    width: '48%',
  },
  soundName: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 14,
  },
  subtitle: {
    color: '#91a0b5',
    fontSize: 14,
    marginTop: 4,
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
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 54,
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  proText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  lockBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(38,38,43,0.66)',
    borderRadius: 18,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
    width: 44,
  },
  equalizerBadge: {
    alignItems: 'flex-end',
    bottom: 14,
    flexDirection: 'row',
    gap: 3,
    position: 'absolute',
    right: 18,
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
    height: 184,
    position: 'absolute',
    transform: [{ rotate: '14deg' }],
    width: 1,
  },
  forestPath: {
    bottom: -14,
    height: 180,
    left: 92,
    position: 'absolute',
    transform: [{ rotate: '8deg' }],
    width: 44,
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
    top: 58,
  },
  oceanWaterLineA: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    height: 2,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 108,
  },
  oceanWaterLineB: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    height: 2,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 144,
  },
  vinylDiscLarge: {
    backgroundColor: 'rgba(174,158,150,0.6)',
    borderRadius: 999,
    height: 110,
    left: 52,
    position: 'absolute',
    top: 40,
    width: 110,
  },
  vinylDiscSmall: {
    backgroundColor: 'rgba(193,184,179,0.74)',
    borderRadius: 999,
    height: 92,
    left: 112,
    position: 'absolute',
    top: 48,
    width: 92,
  },
  vinylShadow: {
    backgroundColor: 'rgba(95,96,102,0.18)',
    borderRadius: 999,
    bottom: 22,
    height: 42,
    left: 36,
    position: 'absolute',
    width: 126,
  },
  whiteCylinderTop: {
    backgroundColor: 'rgba(92,92,92,0.26)',
    borderRadius: 999,
    height: 24,
    left: 52,
    position: 'absolute',
    top: 86,
    width: 118,
  },
  whiteCylinderBody: {
    backgroundColor: 'rgba(116,116,116,0.36)',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 84,
    left: 60,
    position: 'absolute',
    top: 98,
    width: 102,
  },
  cafeLampCord: {
    backgroundColor: 'rgba(255,255,255,0.48)',
    height: 64,
    left: 76,
    position: 'absolute',
    top: 0,
    width: 2,
  },
  cafeLampShade: {
    backgroundColor: 'rgba(175,126,88,0.85)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    height: 28,
    left: 62,
    position: 'absolute',
    top: 62,
    width: 30,
  },
  cafeCup: {
    backgroundColor: 'rgba(88,56,31,0.55)',
    borderRadius: 8,
    bottom: 42,
    height: 24,
    left: 104,
    position: 'absolute',
    width: 34,
  },
  cafePlantPot: {
    backgroundColor: 'rgba(101,72,48,0.55)',
    borderRadius: 10,
    bottom: 36,
    height: 30,
    left: 154,
    position: 'absolute',
    width: 34,
  },
  cafeLeafA: {
    backgroundColor: '#274f30',
    borderRadius: 999,
    height: 54,
    left: 156,
    position: 'absolute',
    top: 120,
    transform: [{ rotate: '-28deg' }],
    width: 18,
  },
  cafeLeafB: {
    backgroundColor: '#2f643a',
    borderRadius: 999,
    height: 48,
    left: 174,
    position: 'absolute',
    top: 116,
    transform: [{ rotate: '24deg' }],
    width: 18,
  },
  trainGround: {
    backgroundColor: 'rgba(61,85,43,0.9)',
    bottom: 0,
    height: 54,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  trainBody: {
    backgroundColor: '#ab4857',
    borderRadius: 8,
    bottom: 54,
    height: 54,
    left: 86,
    position: 'absolute',
    width: 110,
  },
  trainRoof: {
    backgroundColor: '#3d546f',
    borderRadius: 8,
    bottom: 100,
    height: 18,
    left: 104,
    position: 'absolute',
    width: 74,
  },
  trainWindowA: {
    backgroundColor: '#5a7391',
    borderRadius: 4,
    bottom: 84,
    height: 14,
    left: 116,
    position: 'absolute',
    width: 18,
  },
  trainWindowB: {
    backgroundColor: '#5a7391',
    borderRadius: 4,
    bottom: 84,
    height: 14,
    left: 140,
    position: 'absolute',
    width: 18,
  },
  trainFront: {
    backgroundColor: '#cfb63f',
    borderRadius: 6,
    bottom: 56,
    height: 48,
    left: 68,
    position: 'absolute',
    width: 30,
  },
});
