import { StyleSheet, View } from 'react-native';

type VideoBackgroundProps = {
  source: number | string;
};

export function VideoBackground({ source }: VideoBackgroundProps) {
  void source;

  return <View pointerEvents="none" style={styles.background} />;
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a',
  },
});
