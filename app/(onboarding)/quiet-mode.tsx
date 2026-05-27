import { router } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';

import { useUIStore } from '@/shared/domain/stores/uiStore';

export default function QuietModeRoute() {
  const setHasSeenOnboarding = useUIStore((state) => state.setHasSeenOnboarding);
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  const backgroundColor = isDarkMode ? '#020617' : '#e2e8f0';
  const cardColor = isDarkMode ? '#111827' : '#ffffff';
  const secondaryButtonColor = isDarkMode ? '#111827' : '#ffffff';
  const subtitleColor = isDarkMode ? '#cbd5e1' : '#475569';
  const titleColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const toggleDescriptionColor = isDarkMode ? '#94a3b8' : '#64748b';

  function finishOnboarding() {
    setHasSeenOnboarding(true);
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.badge}>Quiet Mode</Text>
          <Text style={[styles.title, { color: titleColor }]}>Enable Quiet Mode</Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            Start with a calmer shell before your first session. Quiet Mode is shown as enabled
            here, and the real do-not-disturb behavior will be wired in a later phase.
          </Text>
        </View>

        <View style={[styles.toggleCard, { backgroundColor: cardColor }]}>
          <View style={styles.toggleCopy}>
            <Text style={[styles.toggleTitle, { color: titleColor }]}>Silence distractions</Text>
            <Text style={[styles.toggleDescription, { color: toggleDescriptionColor }]}>
              Recommended before starting a short reset session. The toggle stays on in this shell
              preview.
            </Text>
          </View>
          <Switch thumbColor="#f8fafc" trackColor={{ false: '#334155', true: '#8b5cf6' }} value />
        </View>

        <View style={styles.actions}>
          <Pressable onPress={finishOnboarding} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
          <Pressable
            onPress={finishOnboarding}
            style={[styles.secondaryButton, { backgroundColor: secondaryButtonColor }]}
          >
            <Text style={[styles.secondaryButtonText, { color: subtitleColor }]}>Not now</Text>
          </Pressable>
        </View>
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
    gap: 14,
    marginTop: 40,
  },
  badge: {
    color: '#8b5cf6',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  toggleCard: {
    alignItems: 'center',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  toggleCopy: {
    flex: 1,
    gap: 6,
  },
  toggleTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  toggleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
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
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#1f2937',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 58,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
