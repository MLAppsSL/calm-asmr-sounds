import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '@/shared/domain/stores/uiStore';

import {
  getSoundsByCategory,
  LIBRARY_CATEGORY_LABELS,
  LIBRARY_CATEGORY_ORDER,
} from '@/library/data/sounds';
import { SoundCard } from '@/library/ui/components/SoundCard';

export default function LibraryRoute() {
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const sections = LIBRARY_CATEGORY_ORDER.map((category) => ({
    category,
    label: LIBRARY_CATEGORY_LABELS[category],
    sounds: getSoundsByCategory(category),
  }));
  const backgroundColor = isDarkMode ? '#0c0f15' : '#f8fafc';
  const titleColor = isDarkMode ? '#ffffff' : '#0f172a';
  const subtitleColor = isDarkMode ? '#94a3b8' : '#475569';
  const profileButtonBackgroundColor = isDarkMode ? '#181b22' : '#ffffff';
  const profileButtonBorderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const profileIconColor = isDarkMode ? '#cbd5e1' : '#334155';
  const searchBarBackgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const searchBarBorderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const searchIconColor = isDarkMode ? '#64748b' : '#94a3b8';
  const searchTextColor = isDarkMode ? '#64748b' : '#64748b';

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: titleColor }]}>Library</Text>
            <Text style={[styles.subtitle, { color: subtitleColor }]}>Find your instant calm</Text>
          </View>

          <View
            style={[
              styles.profileButton,
              {
                backgroundColor: profileButtonBackgroundColor,
                borderColor: profileButtonBorderColor,
              },
            ]}
          >
            <Ionicons color={profileIconColor} name="person" size={20} />
          </View>
        </View>

        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: searchBarBackgroundColor,
              borderColor: searchBarBorderColor,
            },
          ]}
        >
          <MaterialIcons color={searchIconColor} name="search" size={22} />
          <TextInput
            editable={false}
            placeholder="Search sounds..."
            placeholderTextColor={searchTextColor}
            style={[styles.searchInput, { color: searchTextColor }]}
            value=""
          />
        </View>

        {sections.map((section) => (
          <View key={section.category}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: titleColor }]}>{section.label}</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalRow}
            >
              {section.sounds.map((sound) => (
                <SoundCard key={sound.id} sound={sound} />
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingBottom: 140,
    paddingTop: 8,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  profileButton: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  searchBar: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 24,
    marginTop: 24,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 28,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  horizontalRow: {
    marginTop: 16,
    paddingLeft: 24,
  },
});
