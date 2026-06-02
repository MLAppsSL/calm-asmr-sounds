import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const screenLinks = [
  { href: '/(tabs)', label: 'Library' },
  { href: '/(tabs)/favorites', label: 'Favorites' },
  { href: '/(tabs)/settings', label: 'Settings' },
  { href: '/player', label: 'Player' },
  { href: '/(onboarding)', label: 'Onboarding' },
  { href: '/auth', label: 'Auth' },
] as const;

export function ScreenAccessPanel() {
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.label}>Screen access</Text>
      <View style={styles.links}>
        {screenLinks.map((link) => (
          <Link asChild href={link.href} key={link.href}>
            <Pressable style={styles.linkButton}>
              <Text style={styles.linkText}>{link.label}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    maxWidth: 420,
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 16,
    backgroundColor: '#111111',
  },
  label: {
    color: '#8f8f8f',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.6,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  linkButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#1d1d1d',
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  linkText: {
    color: '#ffffff',
    fontSize: 13,
  },
});
