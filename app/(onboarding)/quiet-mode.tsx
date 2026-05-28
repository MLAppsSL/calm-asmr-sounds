import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';

import { useUIStore } from '@/shared/domain/stores/uiStore';

export default function QuietModeRoute() {
  const setHasSeenOnboarding = useUIStore((state) => state.setHasSeenOnboarding);
  const [isQuietModeEnabled, setIsQuietModeEnabled] = useState(true);

  function finishOnboarding() {
    setHasSeenOnboarding(true);
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable
            hitSlop={10}
            onPress={() => {
              router.back();
            }}
            style={styles.iconButton}
          >
            <MaterialIcons color="#ffffff" name="arrow-back" size={30} />
          </Pressable>

          <View style={styles.pagination}>
            <View style={styles.paginationDot} />
            <View style={[styles.paginationDot, styles.paginationDotActive]} />
            <View style={styles.paginationDot} />
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <LinearGradient colors={['#1b1027', '#06020b']} style={styles.heroArtwork}>
            <View style={styles.waveA} />
            <View style={styles.waveB} />
            <View style={styles.waveC} />

            <View style={styles.heroMuteBadge}>
              <LinearGradient colors={['#8f1cf6', '#7027ff']} style={styles.heroMuteIconFill}>
                <MaterialIcons color="#12061d" name="remove" size={26} />
              </LinearGradient>
            </View>
          </LinearGradient>

          <Text style={styles.title}>
            Enable <Text style={styles.titleAccent}>Quiet Mode</Text>
          </Text>

          <Text style={styles.subtitle}>
            To ensure your 3-minute calm isn&apos;t broken, allow us to silence notifications only
            while you listen.
          </Text>
        </View>

        <View style={styles.bottomContent}>
          <View style={styles.toggleCard}>
            <View style={styles.toggleLeadingIcon}>
              <MaterialIcons color="#8e2cff" name="notifications-off" size={28} />
            </View>

            <View style={styles.toggleCopy}>
              <Text style={styles.toggleTitle}>Quiet Mode</Text>
              <Text style={styles.toggleDescription}>Silence interruptions</Text>
            </View>

            <Switch
              ios_backgroundColor="#3a3045"
              onValueChange={setIsQuietModeEnabled}
              thumbColor="#ffffff"
              trackColor={{ false: '#3a3045', true: '#9222ff' }}
              value={isQuietModeEnabled}
            />
          </View>

          <View style={styles.helperRow}>
            <MaterialIcons color="rgba(222,205,236,0.72)" name="info" size={18} />
            <Text style={styles.helperText}>
              We only activate this when you start a session and automatically disable it when you
              finish.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={finishOnboarding} style={styles.primaryButton}>
              <LinearGradient colors={['#7d15ed', '#aa20ff']} style={styles.primaryButtonFill}>
                <Text style={styles.primaryButtonText}>Continue</Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={finishOnboarding} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Not now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#1b0d28',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationDot: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  paginationDotActive: {
    backgroundColor: '#8d1bff',
  },
  headerSpacer: {
    width: 44,
  },
  hero: {
    gap: 18,
    marginTop: 20,
  },
  heroArtwork: {
    backgroundColor: '#0b0513',
    borderRadius: 34,
    height: 300,
    overflow: 'hidden',
  },
  waveA: {
    borderColor: 'rgba(93,42,145,0.18)',
    borderRadius: 320,
    borderWidth: 10,
    height: 430,
    left: -32,
    position: 'absolute',
    top: 112,
    transform: [{ rotate: '-15deg' }],
    width: 470,
  },
  waveB: {
    borderColor: 'rgba(79,29,124,0.26)',
    borderRadius: 320,
    borderWidth: 6,
    height: 340,
    position: 'absolute',
    right: -18,
    top: 92,
    transform: [{ rotate: '-12deg' }],
    width: 360,
  },
  waveC: {
    borderColor: 'rgba(39,14,62,0.75)',
    borderRadius: 280,
    borderWidth: 18,
    height: 300,
    position: 'absolute',
    right: 16,
    top: 116,
    transform: [{ rotate: '-14deg' }],
    width: 320,
  },
  heroMuteBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(26,18,36,0.96)',
    borderColor: 'rgba(125,98,160,0.28)',
    borderRadius: 28,
    borderWidth: 1,
    bottom: 40,
    height: 104,
    justifyContent: 'center',
    left: 42,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: {
      height: 12,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    width: 104,
  },
  heroMuteIconFill: {
    alignItems: 'center',
    borderRadius: 999,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  title: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: -1,
    lineHeight: 44,
  },
  titleAccent: {
    color: '#8f1cff',
  },
  subtitle: {
    color: 'rgba(214,194,227,0.72)',
    fontSize: 16,
    lineHeight: 28,
  },
  bottomContent: {
    gap: 22,
  },
  toggleCard: {
    alignItems: 'center',
    backgroundColor: '#26182f',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  toggleLeadingIcon: {
    alignItems: 'center',
    backgroundColor: '#3a1757',
    borderRadius: 22,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  toggleTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleDescription: {
    color: 'rgba(210,188,226,0.64)',
    fontSize: 14,
    lineHeight: 20,
  },
  helperRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  helperText: {
    color: 'rgba(204,185,221,0.56)',
    flex: 1,
    fontSize: 13,
    lineHeight: 22,
  },
  actions: {
    gap: 18,
    marginTop: 46,
  },
  primaryButton: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  primaryButtonFill: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 100,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 17,
    fontWeight: '600',
  },
});
