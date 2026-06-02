import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useUIStore } from '@/shared/domain/stores/uiStore';

export function EmptyFavoritesState() {
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const iconColor = isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.28)';
  const iconBackgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const iconBorderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)';
  const headingColor = isDarkMode ? '#ffffff' : '#0f172a';
  const subtextColor = isDarkMode ? 'rgba(255,255,255,0.5)' : '#64748b';
  const panelBackgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const ctaLabelColor = isDarkMode ? '#ffffff' : '#0f172a';
  const buttonBackgroundColor = isDarkMode ? '#ffffff' : '#0f172a';
  const buttonTextColor = isDarkMode ? '#0f1115' : '#ffffff';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: iconBackgroundColor, borderColor: iconBorderColor },
        ]}
      >
        <MaterialIcons color={iconColor} name="favorite-border" size={48} />
      </View>

      <Text style={[styles.heading, { color: headingColor }]}>Your sanctuary is empty</Text>
      <Text style={[styles.subtext, { color: subtextColor }]}>
        Tap the heart icon on any sound to save your moments of peace here.
      </Text>

      <View style={[styles.ctaPanel, { backgroundColor: panelBackgroundColor }]}>
        <Text style={[styles.ctaLabel, { color: ctaLabelColor }]}>Find your rhythm</Text>
        <Pressable
          onPress={() => {
            router.navigate('/(tabs)');
          }}
          style={[styles.ctaButton, { backgroundColor: buttonBackgroundColor }]}
        >
          <Text style={[styles.ctaButtonText, { color: buttonTextColor }]}>Explore Sounds</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
    paddingHorizontal: 24,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    paddingHorizontal: 32,
    textAlign: 'center',
  },
  ctaPanel: {
    alignItems: 'center',
    borderRadius: 16,
    gap: 12,
    marginHorizontal: 24,
    marginTop: 32,
    padding: 16,
    width: '100%',
  },
  ctaLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  ctaButton: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
