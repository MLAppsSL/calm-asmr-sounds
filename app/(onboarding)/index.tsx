import { router } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useUIStore } from '@/shared/domain/stores/uiStore';

export default function OnboardingRoute() {
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  const backgroundColor = isDarkMode ? '#020617' : '#e2e8f0';
  const cardColor = isDarkMode ? '#111827' : '#ffffff';
  const subtitleColor = isDarkMode ? '#cbd5e1' : '#475569';
  const titleColor = isDarkMode ? '#f8fafc' : '#0f172a';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={[styles.iconBadge, { backgroundColor: cardColor }]}>
            <View style={styles.iconOrbit} />
            <Text style={styles.iconGlyph}>C</Text>
          </View>
          <Text style={styles.badge}>Ultra-Short Sounds</Text>
          <Text style={[styles.title, { color: titleColor }]}>Find your calm in a minute</Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            Tiny ambient resets for busy days, built to get you breathing and centered fast.
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
  iconBadge: {
    alignItems: 'center',
    borderRadius: 24,
    height: 72,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 72,
  },
  iconOrbit: {
    backgroundColor: 'rgba(139,92,246,0.18)',
    borderRadius: 999,
    height: 52,
    position: 'absolute',
    width: 52,
  },
  iconGlyph: {
    color: '#8b5cf6',
    fontSize: 28,
    fontWeight: '700',
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
    elevation: 2,
    justifyContent: 'center',
    minHeight: 58,
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
});
