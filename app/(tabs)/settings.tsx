import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useAudioStore, type TimerDurationMs } from '@/shared/domain/stores/audioStore';

export default function SettingsRoute() {
  const timerDurationMs = useAudioStore((state) => state.timerDurationMs);
  const isLooping = useAudioStore((state) => state.isLooping);
  const setIsLooping = useAudioStore((state) => state.setIsLooping);
  const setTimerDuration = useAudioStore((state) => state.setTimerDuration);
  const [isAutoPlayNextEnabled, setIsAutoPlayNextEnabled] = useState(false);
  const [isSilenceNotificationsEnabled, setIsSilenceNotificationsEnabled] = useState(false);

  const durationOptions: { label: string; value: TimerDurationMs }[] = [
    { label: '1m', value: 60000 },
    { label: '2m', value: 120000 },
    { label: '3m', value: 180000 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable
            hitSlop={10}
            onPress={() => {
              router.back();
            }}
            style={styles.backButton}
          >
            <MaterialIcons color="#ffffff" name="chevron-left" size={34} />
          </Pressable>

          <Text style={styles.title}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SESSION DURATION</Text>

          <View style={styles.segmentedControl}>
            {durationOptions.map((option) => {
              const isActive = option.value === timerDurationMs;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    setTimerDuration(option.value);
                  }}
                  style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
                >
                  <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PLAYBACK CONTROL</Text>

          <View style={styles.groupCard}>
            <View style={styles.row}>
              <View style={[styles.rowIcon, styles.rowIconPurple]}>
                <Ionicons color="#b38bff" name="infinite" size={28} />
              </View>
              <Text style={styles.rowTitle}>Loop Mode</Text>
              <Switch
                ios_backgroundColor="#2d2d33"
                onValueChange={setIsLooping}
                thumbColor="#ffffff"
                trackColor={{ false: '#2d2d33', true: '#af8bff' }}
                value={isLooping}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={[styles.rowIcon, styles.rowIconPurple]}>
                <MaterialIcons color="#b38bff" name="autorenew" size={27} />
              </View>
              <Text style={styles.rowTitle}>Auto-play Next</Text>
              <Switch
                ios_backgroundColor="#2d2d33"
                onValueChange={setIsAutoPlayNextEnabled}
                thumbColor="#ffffff"
                trackColor={{ false: '#2d2d33', true: '#af8bff' }}
                value={isAutoPlayNextEnabled}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DEEP FOCUS</Text>

          <View style={styles.groupCard}>
            <View style={styles.row}>
              <View style={[styles.rowIcon, styles.rowIconPurple]}>
                <MaterialIcons color="#b38bff" name="remove" size={28} />
              </View>
              <Text style={styles.rowTitle}>Silence Notifications</Text>
              <Switch
                ios_backgroundColor="#2d2d33"
                onValueChange={setIsSilenceNotificationsEnabled}
                thumbColor="#ffffff"
                trackColor={{ false: '#2d2d33', true: '#af8bff' }}
                value={isSilenceNotificationsEnabled}
              />
            </View>
          </View>

          <Text style={styles.helperText}>
            Automatically activate Focus Mode when a session begins to eliminate distractions.
          </Text>
        </View>

        <View style={styles.groupCard}>
          <Pressable style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons color="#d5d5d7" name="help" size={24} />
            </View>
            <Text style={styles.rowTitle}>Support &amp; FAQ</Text>
            <MaterialIcons color="rgba(255,255,255,0.24)" name="chevron-right" size={30} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons color="#d5d5d7" name="share-social" size={24} />
            </View>
            <Text style={styles.rowTitle}>Share with Friends</Text>
            <MaterialIcons color="rgba(255,255,255,0.24)" name="chevron-right" size={30} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0c0c12',
    flex: 1,
  },
  content: {
    gap: 34,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 120,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerSpacer: {
    width: 42,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '500',
  },
  section: {
    gap: 18,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.36)',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4,
  },
  segmentedControl: {
    backgroundColor: '#101118',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 30,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 10,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 24,
    flex: 1,
    justifyContent: 'center',
    minHeight: 68,
  },
  segmentButtonActive: {
    backgroundColor: '#2a2b33',
  },
  segmentLabel: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 18,
    fontWeight: '500',
  },
  segmentLabelActive: {
    color: '#ffffff',
  },
  groupCard: {
    backgroundColor: '#101118',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 30,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    minHeight: 102,
    paddingHorizontal: 20,
  },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: '#1f2028',
    borderRadius: 22,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  rowIconPurple: {
    backgroundColor: '#1f2026',
  },
  rowTitle: {
    color: '#f8fafc',
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  helperText: {
    color: 'rgba(255,255,255,0.24)',
    fontSize: 16,
    lineHeight: 28,
    marginTop: 6,
    paddingHorizontal: 6,
  },
});
