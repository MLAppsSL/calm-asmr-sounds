import { router } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function OnboardingRoute() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background} />
      <View style={styles.radialGlow} />

      <View style={styles.content}>
        <View style={styles.topSpacer} />

        <View style={styles.logoBlock}>
          <View style={styles.logoGlow} />
          <View style={styles.logoBox}>
            <View style={styles.logoOuterRing}>
              <View style={styles.logoInnerRing} />
            </View>
          </View>
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.title}>Find your calm</Text>
          <Text style={styles.titleMuted}>in a minute</Text>
          <Text style={styles.badge}>Ultra-short sounds</Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={() => {
              router.push('./quiet-mode');
            }}
            style={styles.primaryButton}
          >
            <View style={styles.primaryButtonOverlay} />
            <Text style={styles.primaryButtonText}>Begin</Text>
          </Pressable>
          <View style={styles.footerSpacer} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0a0e17',
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f141d',
  },
  radialGlow: {
    backgroundColor: 'rgba(30,58,138,0.12)',
    borderRadius: 999,
    height: '60%',
    left: '-10%',
    position: 'absolute',
    top: '-10%',
    width: '120%',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  topSpacer: {
    height: 12,
  },
  logoBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
  },
  logoGlow: {
    backgroundColor: 'rgba(59,130,246,0.12)',
    borderRadius: 999,
    height: 128,
    position: 'absolute',
    width: 128,
  },
  logoBox: {
    alignItems: 'center',
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  logoOuterRing: {
    alignItems: 'center',
    borderColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 4,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  logoInnerRing: {
    borderColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 2,
    height: 36,
    marginLeft: 6,
    width: 36,
  },
  copyBlock: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: -0.8,
    lineHeight: 42,
    textAlign: 'center',
  },
  titleMuted: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '200',
  },
  badge: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  footer: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  primaryButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    maxWidth: 320,
    overflow: 'hidden',
    width: '100%',
  },
  primaryButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '400',
  },
  footerSpacer: {
    height: 8,
  },
});
