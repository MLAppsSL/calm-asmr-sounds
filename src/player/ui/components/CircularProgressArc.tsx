import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SVG_SIZE = 200;

type CircularProgressArcProps = {
  progress: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  timerLabel: string;
};

export function CircularProgressArc({
  progress,
  isPlaying,
  onPlayPause,
  timerLabel,
}: CircularProgressArcProps) {
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.container}>
      <Svg height={SVG_SIZE} style={styles.svg} viewBox="0 0 100 100" width={SVG_SIZE}>
        <Circle
          cx={50}
          cy={50}
          fill="none"
          r={RADIUS}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={0.6}
        />
        <Circle
          cx={50}
          cy={50}
          fill="none"
          r={RADIUS}
          stroke="rgba(255,255,255,0.85)"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeWidth={0.8}
        />
      </Svg>

      <Pressable onPress={onPlayPause} style={styles.playButton}>
        <MaterialIcons color="#ffffff" name={isPlaying ? 'pause' : 'play-arrow'} size={48} />
      </Pressable>

      <Text style={styles.timerLabel}>{timerLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    alignItems: 'center',
    height: 80,
    justifyContent: 'center',
    position: 'absolute',
    width: 80,
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '200',
    letterSpacing: 2,
    marginTop: 16,
  },
});
