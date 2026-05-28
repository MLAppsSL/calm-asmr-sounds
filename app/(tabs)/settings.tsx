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
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              router.back();
            }}
            style={styles.backButton}
          >
            <MaterialIcons color="rgba(255,255,255,0.7)" name="arrow-back-ios-new" size={18} />
          </Pressable>
          <Text style={styles.screenTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Session Duration</Text>
          <View style={styles.segmentedCard}>
            {durationOptions.map((option) => {
              const isActive = option.value === timerDurationMs;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    setTimerDuration(option.value);
                  }}
                  style={[styles.segmentItem, isActive && styles.segmentItemActive]}
                >
                  <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Playback Control</Text>
          <View style={styles.groupCard}>
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <View style={styles.rowIcon}>
                  <Ionicons color="#a78bfa" name="infinite" size={22} />
                </View>
                <Text style={styles.rowTitle}>Loop Mode</Text>
              </View>
              <Switch
                ios_backgroundColor="rgba(255,255,255,0.1)"
                onValueChange={setIsLooping}
                thumbColor="#ffffff"
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#a78bfa' }}
                value={isLooping}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <View style={styles.rowIcon}>
                  <MaterialIcons color="#a78bfa" name="autorenew" size={22} />
                </View>
                <Text style={styles.rowTitle}>Auto-play Next</Text>
              </View>
              <Switch
                ios_backgroundColor="rgba(255,255,255,0.1)"
                onValueChange={setIsAutoPlayNextEnabled}
                thumbColor="#ffffff"
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#a78bfa' }}
                value={isAutoPlayNextEnabled}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Deep Focus</Text>
          <View style={styles.groupCard}>
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <View style={styles.rowIcon}>
                  <MaterialIcons color="#a78bfa" name="do-not-disturb-on" size={22} />
                </View>
                <Text style={styles.rowTitle}>Silence Notifications</Text>
              </View>
              <Switch
                ios_backgroundColor="rgba(255,255,255,0.1)"
                onValueChange={setIsSilenceNotificationsEnabled}
                thumbColor="#ffffff"
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#a78bfa' }}
                value={isSilenceNotificationsEnabled}
              />
            </View>
          </View>
          <Text style={styles.helperText}>
            Automatically activate Focus Mode when a session begins to eliminate distractions.
          </Text>
        </View>

        <View style={styles.groupCard}>
          <Pressable style={styles.rowAction}>
            <View style={styles.rowInfo}>
              <View style={styles.rowIconMuted}>
                <Ionicons color="rgba(255,255,255,0.6)" name="help" size={20} />
              </View>
              <Text style={styles.rowTitle}>Support &amp; FAQ</Text>
            </View>
            <MaterialIcons color="rgba(255,255,255,0.2)" name="chevron-right" size={24} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.rowAction}>
            <View style={styles.rowInfo}>
              <View style={styles.rowIconMuted}>
                <Ionicons color="rgba(255,255,255,0.6)" name="share-social" size={20} />
              </View>
              <Text style={styles.rowTitle}>Share with Friends</Text>
            </View>
            <MaterialIcons color="rgba(255,255,255,0.2)" name="chevron-right" size={24} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0b0b0f',
    flex: 1,
  },
  content: {
    gap: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerSpacer: {
    height: 40,
    width: 40,
  },
  screenTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 24,
    fontWeight: '600',
  },
  section: {
    gap: 16,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.4,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  segmentedCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    padding: 6,
  },
  segmentItem: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  segmentText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  groupCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  rowAction: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  rowInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  rowIconMuted: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  rowTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  helperText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontWeight: '300',
    lineHeight: 20,
    paddingHorizontal: 4,
  },
});
