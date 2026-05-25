import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { CATEGORIES, getSoundsByCategory } from '@/library/data/sounds';
import { CategorySection } from '@/library/ui/components/CategorySection';
import { useUIStore } from '@/shared/domain/stores/uiStore';

export default function LibraryRoute() {
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  const backgroundColor = isDarkMode ? '#020617' : '#e2e8f0';
  const subtitleColor = isDarkMode ? '#cbd5e1' : '#475569';
  const titleColor = isDarkMode ? '#f8fafc' : '#0f172a';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Library</Text>
            <Text style={[styles.title, { color: titleColor }]}>Find your calm in a minute</Text>
            <Text style={[styles.subtitle, { color: subtitleColor }]}>
              Browse by atmosphere and jump into the player when a sound feels right.
            </Text>
          </View>
        }
        contentContainerStyle={styles.content}
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategorySection
            label={item.label}
            sounds={getSoundsByCategory(item.id)}
            titleColor={titleColor}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 26,
    paddingBottom: 120,
    paddingTop: 12,
  },
  header: {
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  eyebrow: {
    color: '#8b5cf6',
    fontSize: 12,
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
});
