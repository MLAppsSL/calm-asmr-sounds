import { StyleSheet, Text, View } from 'react-native';

import { useUIStore } from '@/shared/domain/stores/uiStore';

type ScaffoldPlaceholderScreenProps = {
  title: string;
  subtitle?: string;
};

export function ScaffoldPlaceholderScreen({ title, subtitle }: ScaffoldPlaceholderScreenProps) {
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const backgroundColor = isDarkMode ? '#000000' : '#f8fafc';
  const titleColor = isDarkMode ? '#ffffff' : '#0f172a';
  const subtitleColor = isDarkMode ? '#9ca3af' : '#64748b';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});
