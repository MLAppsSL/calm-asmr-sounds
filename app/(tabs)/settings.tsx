import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { useUIStore } from '@/shared/domain/stores/uiStore';

const SHELL_ROWS = [
  'Session Duration',
  'Loop Mode',
  'Auto-play Next',
  'Silence Notifications',
  'Support and FAQ',
  'Share with Friends',
] as const;

export default function SettingsRoute() {
  const { isDarkMode, toggleDarkMode } = useUIStore(
    useShallow((state) => ({
      isDarkMode: state.isDarkMode,
      toggleDarkMode: state.toggleDarkMode,
    })),
  );
  const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null);

  const backgroundColor = isDarkMode ? '#020617' : '#e2e8f0';
  const cardColor = isDarkMode ? '#111827' : '#ffffff';
  const dividerColor = isDarkMode ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.08)';
  const helperColor = isDarkMode ? '#94a3b8' : '#64748b';
  const titleColor = isDarkMode ? '#f8fafc' : '#0f172a';

  function showComingSoon(label: string) {
    setComingSoonMessage(`${label} is coming soon.`);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Settings</Text>
          <Text style={[styles.title, { color: titleColor }]}>Shape your calm</Text>
          <Text style={[styles.subtitle, { color: helperColor }]}>
            Dark Mode works today. The remaining controls stay interactive so you can preview the
            full shell.
          </Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: cardColor }]}>
          <View style={styles.row}>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: titleColor }]}>Dark Mode</Text>
              <Text style={[styles.rowHelper, { color: helperColor }]}>
                Switch the shell between dark and light presentation.
              </Text>
            </View>
            <Switch
              onValueChange={() => {
                setComingSoonMessage(null);
                toggleDarkMode();
              }}
              thumbColor="#f8fafc"
              trackColor={{ false: '#94a3b8', true: '#8b5cf6' }}
              value={isDarkMode}
            />
          </View>

          {SHELL_ROWS.map((label, index) => (
            <Pressable
              key={label}
              onPress={() => {
                showComingSoon(label);
              }}
              style={[
                styles.row,
                index > 0 && {
                  borderTopColor: dividerColor,
                  borderTopWidth: StyleSheet.hairlineWidth,
                },
              ]}
            >
              <View style={styles.rowCopy}>
                <Text style={[styles.rowTitle, { color: titleColor }]}>{label}</Text>
                <Text style={[styles.rowHelper, { color: helperColor }]}>
                  Tap to preview this shell control.
                </Text>
              </View>
              <Text style={[styles.rowMeta, { color: helperColor }]}>Coming soon</Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.feedbackCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.feedbackTitle, { color: titleColor }]}>Shell feedback</Text>
          <Text style={[styles.feedbackBody, { color: helperColor }]}>
            {comingSoonMessage ??
              'Tap any unfinished row to confirm it is still a shell-only affordance.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    gap: 10,
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
    fontSize: 15,
    lineHeight: 22,
  },
  sectionCard: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    minHeight: 84,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  rowHelper: {
    fontSize: 13,
    lineHeight: 18,
  },
  rowMeta: {
    fontSize: 13,
    fontWeight: '600',
  },
  feedbackCard: {
    borderRadius: 22,
    gap: 8,
    padding: 18,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  feedbackBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
