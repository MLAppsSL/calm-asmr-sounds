import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SOUNDS } from '@/shared/data/catalogs/sounds';
import { AudioService } from '@/shared/data/services/AudioService';
import { SoundCacheService } from '@/shared/data/services/SoundCacheService';
import { TimerService } from '@/shared/data/services/TimerService';
import { useAudioStore } from '@/shared/domain/stores/audioStore';

const PRIMARY_SOUND = SOUNDS[0];
const SECONDARY_SOUND = SOUNDS[6];
const PRODUCTION_TIMER_MS = 60000;
const PRODUCTION_TIMER_SECONDS = 60;
const FAST_VERIFY_TIMER_MS = 10000;

function getSelectedDurationMs(timerSeconds: number | null) {
  if (timerSeconds === 120) {
    return 120000 as const;
  }

  if (timerSeconds === 180) {
    return 180000 as const;
  }

  return 60000 as const;
}

function getRemainingSeconds(timerStartedAt: number | null, timerDurationMs: number) {
  if (timerStartedAt === null) {
    return 0;
  }

  const remainingMs = Math.max(0, timerDurationMs - (Date.now() - timerStartedAt));

  return Math.ceil(remainingMs / 1000);
}

export default function LibraryRoute() {
  const currentSoundId = useAudioStore((state) => state.currentSoundId);
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const timerDurationMs = useAudioStore((state) => state.timerDurationMs);
  const timerSeconds = useAudioStore((state) => state.timerSeconds);
  const timerStartedAt = useAudioStore((state) => state.timerStartedAt);
  const setCurrentSound = useAudioStore((state) => state.setCurrentSound);
  const setIsPlaying = useAudioStore((state) => state.setIsPlaying);
  const setTimer = useAudioStore((state) => state.setTimer);
  const setTimerDuration = useAudioStore((state) => state.setTimerDuration);
  const [statusMessage, setStatusMessage] = useState('Ready for timer and audio verification.');
  const [isBusy, setIsBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const remainingSeconds = getRemainingSeconds(timerStartedAt, timerDurationMs);
  const timerIsRunning = timerStartedAt !== null;

  async function playSound(soundId: string, timerMs: number, selectedSeconds: number | null) {
    const sound = SOUNDS.find((entry) => entry.id === soundId);

    if (!sound) {
      setStatusMessage(`Unable to find catalog sound ${soundId}.`);
      return;
    }

    setIsBusy(true);

    try {
      const localUri = await SoundCacheService.getLocalUri(sound);

      if (!localUri) {
        setStatusMessage(`Failed to prepare ${sound.title} for playback.`);
        return;
      }

      if (!isPlaying || currentSoundId !== sound.id) {
        await AudioService.play(sound.id, localUri);
      }

      setCurrentSound(sound.id);
      setIsPlaying(true);

      if (selectedSeconds !== null) {
        setTimer(selectedSeconds);
      }

      TimerService.start(timerMs as 60000 | 120000 | 180000);
      setStatusMessage(`Playing ${sound.title} with a ${Math.ceil(timerMs / 1000)}-second timer.`);
    } catch (error) {
      setStatusMessage(`Playback failed for ${sound.title}.`);
      console.error('Harness playback failed.', error);
    } finally {
      setIsBusy(false);
    }
  }

  async function handlePrimaryPlay() {
    await playSound(PRIMARY_SOUND.id, PRODUCTION_TIMER_MS, PRODUCTION_TIMER_SECONDS);
  }

  async function handleCrossfade() {
    setIsBusy(true);

    try {
      const localUri = await SoundCacheService.getLocalUri(SECONDARY_SOUND);

      if (!localUri) {
        setStatusMessage(`Failed to prepare ${SECONDARY_SOUND.title} for playback.`);
        return;
      }

      if (!isPlaying || currentSoundId !== SECONDARY_SOUND.id) {
        await AudioService.play(SECONDARY_SOUND.id, localUri);
      }

      setCurrentSound(SECONDARY_SOUND.id);
      setIsPlaying(true);

      if (timerIsRunning) {
        setTimerDuration(getSelectedDurationMs(timerSeconds));
        setStatusMessage(`Crossfaded to ${SECONDARY_SOUND.title} and restarted the active timer.`);
      } else {
        setStatusMessage(`Crossfaded to ${SECONDARY_SOUND.title}. No timer was running.`);
      }
    } catch (error) {
      setStatusMessage(`Crossfade failed for ${SECONDARY_SOUND.title}.`);
      console.error('Harness crossfade failed.', error);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleShortTimer() {
    await playSound(PRIMARY_SOUND.id, FAST_VERIFY_TIMER_MS, PRODUCTION_TIMER_SECONDS);
  }

  function handleStopTimer() {
    TimerService.stop();
    setStatusMessage(
      'Stopped the active timer. Audio playback stays as-is for manual verification.',
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Temporary Verification Harness</Text>
          <Text style={styles.title}>Timer + Audio Runtime Check</Text>
          <Text style={styles.subtitle}>
            Exercise the shared cache, playback, crossfade, and timer runtime before the final
            player UI lands.
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.sectionLabel}>Runtime Snapshot</Text>
          <Text style={styles.statusText}>Status: {statusMessage}</Text>
          <Text style={styles.statusText}>Current sound: {currentSoundId ?? 'none'}</Text>
          <Text style={styles.statusText}>Playback: {isPlaying ? 'playing' : 'stopped'}</Text>
          <Text style={styles.statusText}>
            Selected timer field: {timerSeconds ?? 'none'} seconds
          </Text>
          <Text style={styles.statusText}>Timer running: {timerIsRunning ? 'yes' : 'no'}</Text>
          <Text style={styles.statusText}>
            Time remaining: {timerIsRunning ? remainingSeconds : 0}s
          </Text>
          <Text style={styles.statusHint}>
            Last refreshed: {new Date(now).toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.controlsCard}>
          <Text style={styles.sectionLabel}>Verification Controls</Text>

          <Pressable
            accessibilityLabel="Play first sound and start sixty second timer"
            disabled={isBusy}
            onPress={() => {
              void handlePrimaryPlay();
            }}
            style={[styles.button, styles.primaryButton, isBusy && styles.buttonDisabled]}
          >
            <Text style={styles.primaryButtonText}>Play + 60s Timer</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Crossfade to second sound"
            disabled={isBusy}
            onPress={() => {
              void handleCrossfade();
            }}
            style={[styles.button, styles.secondaryButton, isBusy && styles.buttonDisabled]}
          >
            <Text style={styles.secondaryButtonText}>Crossfade To Sound 2</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Play first sound and start short verification timer"
            disabled={isBusy}
            onPress={() => {
              void handleShortTimer();
            }}
            style={[styles.button, styles.secondaryButton, isBusy && styles.buttonDisabled]}
          >
            <Text style={styles.secondaryButtonText}>Play + 10s Verify</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Stop timer"
            disabled={isBusy}
            onPress={handleStopTimer}
            style={[styles.button, styles.secondaryButton, isBusy && styles.buttonDisabled]}
          >
            <Text style={styles.secondaryButtonText}>Stop Timer</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#04111f',
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#0e2236',
    borderRadius: 24,
    gap: 8,
    padding: 20,
  },
  eyebrow: {
    color: '#7dd3fc',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    gap: 8,
    padding: 18,
  },
  controlsCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    gap: 12,
    padding: 18,
  },
  sectionLabel: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  statusHint: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    alignItems: 'center',
    borderRadius: 16,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: '#38bdf8',
  },
  primaryButtonText: {
    color: '#04111f',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
});
