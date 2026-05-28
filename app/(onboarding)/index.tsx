import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function OnboardingRoute() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.backgroundGlow} />

      <View style={styles.content}>
        <View style={styles.hero}>
          <LinearGradient colors={['#0d8eb6', '#1fd4ff']} style={styles.logoTile}>
            <View style={styles.logoOuterRing}>
              <View style={styles.logoInnerRing} />
            </View>
            <View style={styles.logoHighlight} />
          </LinearGradient>

          <View style={styles.copyGroup}>
            <Text style={styles.title}>Find your calm</Text>
            <Text style={styles.titleMuted}>in a minute</Text>
            <Text style={styles.badge}>ULTRA-SHORT SOUNDS</Text>
          </View>
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
    backgroundColor: '#111827',
    flex: 1,
  },
  backgroundGlow: {
    backgroundColor: 'rgba(74,222,255,0.08)',
    borderRadius: 420,
    height: 420,
    left: -24,
    position: 'absolute',
    right: -24,
    top: 120,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  hero: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoTile: {
    alignItems: 'center',
    borderRadius: 2,
    height: 142,
    justifyContent: 'center',
    shadowColor: '#31d4ff',
    shadowOffset: {
      height: 0,
      width: 0,
    },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    width: 142,
  },
  logoOuterRing: {
    alignItems: 'center',
    borderColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 5,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  logoInnerRing: {
    borderColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 2.5,
    height: 40,
    marginLeft: 6,
    width: 40,
  },
  logoHighlight: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    bottom: 22,
    height: 76,
    position: 'absolute',
    width: 76,
  },
  copyGroup: {
    alignItems: 'center',
    marginTop: 158,
  },
  title: {
    color: '#f8fafc',
    fontSize: 46,
    fontWeight: '300',
    letterSpacing: -1.2,
    lineHeight: 54,
    textAlign: 'center',
  },
  titleMuted: {
    color: 'rgba(248,250,252,0.55)',
    fontSize: 44,
    fontWeight: '300',
    letterSpacing: -1,
    lineHeight: 52,
    textAlign: 'center',
  },
  badge: {
    color: 'rgba(203,213,225,0.28)',
    fontSize: 15,
    letterSpacing: 6,
    marginTop: 36,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 38,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 18,
    minHeight: 82,
    shadowColor: '#000000',
    shadowOffset: {
      height: 10,
      width: 0,
    },
    shadowOpacity: 0.22,
    shadowRadius: 22,
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '400',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {
      height: 1,
      width: 0,
    },
    textShadowRadius: 4,
  },
});
