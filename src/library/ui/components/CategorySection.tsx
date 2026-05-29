import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { LibrarySound } from '@/library/data/sounds';

import { SoundCard } from './SoundCard';

type CategorySectionProps = {
  label: string;
  sounds: LibrarySound[];
  titleColor: string;
};

export function CategorySection({ label, sounds, titleColor }: CategorySectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: titleColor }]}>{label}</Text>
      <FlatList
        contentContainerStyle={styles.content}
        data={sounds}
        decelerationRate="fast"
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SoundCard sound={item} />}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
});
