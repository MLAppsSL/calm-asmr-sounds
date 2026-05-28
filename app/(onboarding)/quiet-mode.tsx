import { MaterialIcons } from '@expo/vector-icons';
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
            onPress={() => {
              router.back();
            }}
            style={styles.headerButton}
          >
            <MaterialIcons color="rgba(255,255,255,0.8)" name="arrow-back" size={24} />
          </Pressable>

          <View style={styles.pagination}>
            <View style={styles.paginationDot} />
            <View style={[styles.paginationDot, styles.paginationDotActive]} />
            <View style={styles.paginationDot} />
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.mainContent}>
          <View style={styles.heroCard}>
            <View style={styles.heroGradient} />
            <View style={styles.heroTextureA} />
            <View style={styles.heroTextureB} />
            <View style={styles.heroTextureC} />
            <View style={styles.heroIconBadge}>
              <MaterialIcons color="#7f13ec" name="do-not-disturb-on" size={28} />
            </View>
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.title}>
              Enable <Text style={styles.titleAccent}>Quiet Mode</Text>
            </Text>
            <Text style={styles.subtitle}>
              To ensure your 3-minute calm isn&apos;t broken, allow us to silence notifications only
              while you listen.
            </Text>
          </View>

          <View style={styles.permissionPanel}>
            <View style={styles.permissionCard}>
              <View style={styles.permissionInfo}>
                <View style={styles.permissionIconWrap}>
                  <MaterialIcons color="#7f13ec" name="notifications-off" size={20} />
                </View>
                <View>
                  <Text style={styles.permissionTitle}>Quiet Mode</Text>
                  <Text style={styles.permissionSubtitle}>Silence interruptions</Text>
                </View>
              </View>

              <Switch
                ios_backgroundColor="#2a1f36"
                onValueChange={setIsQuietModeEnabled}
                thumbColor="#ffffff"
                trackColor={{ false: '#2a1f36', true: '#7f13ec' }}
                value={isQuietModeEnabled}
              />
            </View>

            <View style={styles.helperRow}>
              <MaterialIcons color="rgba(171,157,185,0.75)" name="info" size={14} />
              <Text style={styles.helperText}>
                We only activate this when you start a session and automatically disable it when you
                finish.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable onPress={finishOnboarding} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
          <Pressable onPress={finishOnboarding} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#191022',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  pagination: {
    flexDirection: 'row',
    gap: 4,
  },
  paginationDot: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  paginationDotActive: {
    backgroundColor: '#7f13ec',
  },
  headerSpacer: {
    height: 40,
    width: 40,
  },
  mainContent: {
    flex: 1,
    paddingTop: 8,
  },
  heroCard: {
    borderRadius: 24,
    height: 280,
    marginBottom: 32,
    overflow: 'hidden',
    width: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#140d1a',
  },
  heroTextureA: {
    borderColor: 'rgba(127,19,236,0.12)',
    borderRadius: 280,
    borderWidth: 8,
    height: 340,
    left: -36,
    position: 'absolute',
    top: 70,
    transform: [{ rotate: '-14deg' }],
    width: 380,
  },
  heroTextureB: {
    borderColor: 'rgba(127,19,236,0.1)',
    borderRadius: 280,
    borderWidth: 5,
    height: 300,
    position: 'absolute',
    right: -18,
    top: 96,
    transform: [{ rotate: '-14deg' }],
    width: 320,
  },
  heroTextureC: {
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 280,
    borderWidth: 3,
    height: 260,
    position: 'absolute',
    right: 6,
    top: 116,
    transform: [{ rotate: '-14deg' }],
    width: 300,
  },
  heroIconBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(25,16,34,0.8)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    borderWidth: 1,
    bottom: 24,
    height: 56,
    justifyContent: 'center',
    left: 24,
    position: 'absolute',
    width: 56,
  },
  copyBlock: {
    gap: 12,
    marginBottom: 28,
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '300',
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  titleAccent: {
    color: '#7f13ec',
    fontWeight: '400',
  },
  subtitle: {
    color: '#ab9db9',
    fontSize: 16,
    fontWeight: '300',
    lineHeight: 28,
  },
  permissionPanel: {
    gap: 16,
  },
  permissionCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(42,31,54,0.5)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  permissionInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  permissionIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(127,19,236,0.2)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  permissionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  permissionSubtitle: {
    color: '#ab9db9',
    fontSize: 14,
    fontWeight: '300',
    marginTop: 4,
  },
  helperRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
  },
  helperText: {
    color: 'rgba(171,157,185,0.6)',
    flex: 1,
    fontSize: 12,
    fontWeight: '300',
    lineHeight: 18,
  },
  footer: {
    gap: 12,
    paddingTop: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#7f13ec',
    borderRadius: 999,
    height: 56,
    justifyContent: 'center',
    shadowColor: '#7f13ec',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 48,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#ab9db9',
    fontSize: 14,
    fontWeight: '500',
  },
});
