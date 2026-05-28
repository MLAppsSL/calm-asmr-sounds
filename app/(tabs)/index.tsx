import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getSoundsByCategory } from '@/library/data/sounds';
import { SoundCard } from '@/library/ui/components/SoundCard';

export default function LibraryRoute() {
  const natureSounds = getSoundsByCategory('nature');
  const ambientSounds = getSoundsByCategory('ambient');

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Library</Text>
            <Text style={styles.subtitle}>Find your instant calm</Text>
          </View>

          <View style={styles.profileButton}>
            <Ionicons color="#cbd5e1" name="person" size={20} />
          </View>
        </View>

        <View style={styles.searchBar}>
          <MaterialIcons color="#64748b" name="search" size={22} />
          <TextInput
            editable={false}
            placeholder="Search sounds..."
            placeholderTextColor="#64748b"
            style={styles.searchInput}
            value=""
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nature</Text>
          <Text style={styles.sectionAction}>View all</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalRow}>
          {natureSounds.map((sound) => (
            <SoundCard key={sound.id} sound={sound} />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ambient</Text>
          <Text style={styles.sectionAction}>View all</Text>
        </View>

        <View style={styles.grid}>
          {ambientSounds.map((sound) => (
            <SoundCard key={sound.id} sound={sound} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0c0f15',
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
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '600',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  profileButton: {
    alignItems: 'center',
    backgroundColor: '#181b22',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)',
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
    color: '#64748b',
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  sectionAction: {
    color: '#8b5cf6',
    fontSize: 13,
    fontWeight: '600',
  },
  horizontalRow: {
    marginTop: 16,
    paddingLeft: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 24,
  },
});
