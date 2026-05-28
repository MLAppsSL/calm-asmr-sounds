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
            <Ionicons color="#dce3ef" name="person" size={24} />
          </View>
        </View>

        <View style={styles.searchBar}>
          <MaterialIcons color="#64748b" name="search" size={26} />
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
    paddingTop: 12,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: '#93a1b4',
    fontSize: 14,
    marginTop: 4,
  },
  profileButton: {
    alignItems: 'center',
    backgroundColor: '#181b22',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: '#181b22',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 26,
    minHeight: 68,
    paddingHorizontal: 22,
  },
  searchInput: {
    color: '#64748b',
    flex: 1,
    fontSize: 16,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 34,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  sectionAction: {
    color: '#9463ff',
    fontSize: 15,
    fontWeight: '600',
  },
  horizontalRow: {
    marginTop: 18,
    paddingLeft: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingHorizontal: 20,
  },
});
