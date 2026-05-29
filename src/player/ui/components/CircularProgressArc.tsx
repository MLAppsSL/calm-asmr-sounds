import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SVG_SIZE = 288;

type CircularProgressArcProps = {
  progress: number;
  isPlaying: boolean;
  onPlayPause: () => void;
};

export function CircularProgressArc({
  progress,
  isPlaying,
  onPlayPause,
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
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={0.5}
        />
        <Circle
          cx={50}
          cy={50}
          fill="none"
          r={RADIUS}
          stroke="rgba(255,255,255,0.8)"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeWidth={0.8}
        />
      </Svg>

      <Pressable onPress={onPlayPause} style={styles.playButton}>
        <View style={styles.playButtonGlass}>
          <MaterialIcons color="#ffffff" name={isPlaying ? 'pause' : 'play-arrow'} size={42} />
        </View>
      </Pressable>
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
    justifyContent: 'center',
    position: 'absolute',
  },
  playButtonGlass: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    borderWidth: 1,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
});
