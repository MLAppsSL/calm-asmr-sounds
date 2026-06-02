import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyFavoritesState } from '@/favorites/ui/components/EmptyFavoritesState';
import { useFavoritesStore } from '@/favorites/domain/stores/favoritesStore';
import { SOUNDS } from '@/library/data/sounds';
import type { LibrarySound } from '@/library/data/sounds';
import { SoundCard } from '@/library/ui/components/SoundCard';
import { useUIStore } from '@/shared/domain/stores/uiStore';

const SOUNDS_BY_ID = new Map(SOUNDS.map((sound) => [sound.id, sound]));

export default function FavoritesRoute() {
  const favorites = useFavoritesStore((state) => state.favorites);
  const hasHydrated = useFavoritesStore((state) => state._hasHydrated);
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  const sortedFavorites = useMemo(
    () => [...favorites].sort((left, right) => right.addedAt - left.addedAt),
    [favorites],
  );
  const favoriteSounds = useMemo(
    () =>
      sortedFavorites.reduce<LibrarySound[]>((sounds, favorite) => {
        const sound = SOUNDS_BY_ID.get(favorite.id);

        if (sound) {
          sounds.push(sound);
        }

        return sounds;
      }, []),
    [sortedFavorites],
  );

  if (!hasHydrated) {
    return null;
  }

  const hasFavorites = favoriteSounds.length > 0;
  const backgroundColor = isDarkMode ? '#0c0f15' : '#f8fafc';
  const titleColor = isDarkMode ? '#ffffff' : '#0f172a';
  const subtitleColor = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: titleColor }]}>Your Favorites</Text>
        {hasFavorites ? (
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            {favoriteSounds.length} sounds saved
          </Text>
        ) : null}
      </View>

      <FlatList
        columnWrapperStyle={hasFavorites ? styles.row : undefined}
        data={favoriteSounds}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyFavoritesState />}
        contentContainerStyle={hasFavorites ? styles.listContent : styles.emptyListContent}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.cardRow}>
            <SoundCard sound={item} style={styles.gridCard} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0c0f15',
    flex: 1,
  },
  header: {
    paddingBottom: 8,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '600',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 120,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  row: {
    gap: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  cardRow: {
    flex: 1,
    marginBottom: 4,
  },
  gridCard: {
    width: '100%',
  },
});
