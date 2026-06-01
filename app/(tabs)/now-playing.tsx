import { router } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { useAudioStore } from '@/shared/domain/stores/audioStore';
import { useUIStore } from '@/shared/domain/stores/uiStore';

export default function NowPlayingRoute() {
  const { currentSoundId } = useAudioStore(
    useShallow((state) => ({
      currentSoundId: state.currentSoundId,
    })),
  );
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  const backgroundColor = isDarkMode ? '#020617' : '#e2e8f0';
  const subtitleColor = isDarkMode ? '#cbd5e1' : '#475569';
  const titleColor = isDarkMode ? '#f8fafc' : '#0f172a';

  if (!currentSoundId) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.title, { color: titleColor }]}>Nothing playing yet</Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            Start a sound from the library and this shortcut will take you straight to the player.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.activeState}>
        <Text style={[styles.title, { color: titleColor }]}>Resume your current session</Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>
          Active sound: {currentSoundId}
        </Text>
        <Pressable
          onPress={() => {
            router.push('/player');
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Open Player</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  activeState: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 54,
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
});
