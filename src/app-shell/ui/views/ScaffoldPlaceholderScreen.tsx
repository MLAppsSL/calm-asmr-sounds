import { StyleSheet, Text, View } from 'react-native';

type ScaffoldPlaceholderScreenProps = {
  title: string;
  subtitle?: string;
};

export function ScaffoldPlaceholderScreen({ title, subtitle }: ScaffoldPlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#000000',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
  },
});
