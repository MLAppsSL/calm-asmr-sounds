import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { useAuth } from '@/context/AuthContext';
import { EmptyFavoritesState } from '@/favorites/ui/components/EmptyFavoritesState';
import { useFavoritesStore } from '@/favorites/domain/stores/favoritesStore';
import { SOUNDS } from '@/library/data/sounds';
import type { LibrarySound } from '@/library/data/sounds';
import { SoundCard } from '@/library/ui/components/SoundCard';
import { useUIStore } from '@/shared/domain/stores/uiStore';

const SOUNDS_BY_ID = new Map(SOUNDS.map((sound) => [sound.id, sound]));

export default function FavoritesRoute() {
  const { user } = useAuth();
  const { favorites, hasHydrated } = useFavoritesStore(
    useShallow((state) => ({
      favorites: state.favorites,
      hasHydrated: state._hasHydrated,
    })),
  );
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
  const syncChipBackgroundColor = isDarkMode ? 'rgba(167,139,250,0.14)' : 'rgba(167,139,250,0.12)';
  const syncNudgeBackgroundColor = isDarkMode ? 'rgba(15,23,42,0.56)' : 'rgba(255,255,255,0.92)';
  const syncNudgeBorderColor = isDarkMode ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.08)';

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: titleColor }]}>Your Favorites</Text>
          {user ? (
            <View style={[styles.syncChip, { backgroundColor: syncChipBackgroundColor }]}>
              <Ionicons color="#a78bfa" name="cloud-done-outline" size={14} />
              <Text style={styles.syncChipText}>Cloud sync on</Text>
            </View>
          ) : null}
        </View>
        {hasFavorites ? (
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            {favoriteSounds.length} sounds saved
          </Text>
        ) : null}
      </View>

      {!user ? (
        <Pressable
          onPress={() => {
            router.push('/auth');
          }}
          style={[
            styles.syncNudge,
            {
              backgroundColor: syncNudgeBackgroundColor,
              borderColor: syncNudgeBorderColor,
            },
          ]}
        >
          <View style={styles.syncNudgeInfo}>
            <View style={styles.syncNudgeIcon}>
              <Ionicons color="#a78bfa" name="cloud-upload-outline" size={18} />
            </View>
            <View style={styles.syncNudgeTextGroup}>
              <Text style={[styles.syncNudgeTitle, { color: titleColor }]}>
                Sign in to sync favorites
              </Text>
              <Text style={[styles.syncNudgeSubtitle, { color: subtitleColor }]}>
                Keep your saved sounds ready across devices.
              </Text>
            </View>
          </View>
          <MaterialIcons color={subtitleColor} name="chevron-right" size={22} />
        </Pressable>
      ) : null}

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
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  syncChip: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  syncChipText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '700',
  },
  syncNudge: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  syncNudgeInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  syncNudgeIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  syncNudgeTextGroup: {
    flex: 1,
    gap: 2,
  },
  syncNudgeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  syncNudgeSubtitle: {
    fontSize: 13,
    lineHeight: 18,
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
