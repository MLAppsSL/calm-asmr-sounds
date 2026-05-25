import { router } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useUIStore } from '@/shared/domain/stores/uiStore';

export default function OnboardingRoute() {
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  const backgroundColor = isDarkMode ? '#020617' : '#e2e8f0';
  const subtitleColor = isDarkMode ? '#cbd5e1' : '#475569';
  const titleColor = isDarkMode ? '#f8fafc' : '#0f172a';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.badge}>Calm Sounds</Text>
          <Text style={[styles.title, { color: titleColor }]}>Find your calm in a minute</Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            Ultra-short ambient sound sessions built for quick reset moments.
          </Text>
        </View>

        <Pressable
          onPress={() => {
            router.push('./quiet-mode');
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Begin</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  hero: {
    gap: 16,
    marginTop: 64,
  },
  badge: {
    color: '#8b5cf6',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 46,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 25,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 58,
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
});
