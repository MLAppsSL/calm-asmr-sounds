import { MaterialIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SVG_SIZE = 200;

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
  const progressValue = useSharedValue(progress);

  useEffect(() => {
    progressValue.value = progress;
  }, [progress, progressValue]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progressValue.value),
  }));

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
        <AnimatedCircle
          animatedProps={animatedProps}
          cx={50}
          cy={50}
          fill="none"
          r={RADIUS}
          stroke="rgba(255,255,255,0.9)"
          strokeDasharray={CIRCUMFERENCE}
          strokeLinecap="round"
          strokeWidth={0.9}
        />
      </Svg>

      <Pressable onPress={onPlayPause} style={styles.playButton}>
        <View style={styles.playButtonGlass}>
          <MaterialIcons color="#ffffff" name={isPlaying ? 'pause' : 'play-arrow'} size={56} />
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
    backgroundColor: 'rgba(156,175,186,0.14)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    borderWidth: 1,
    height: 118,
    justifyContent: 'center',
    width: 118,
  },
  svg: {
    height: 340,
    transform: [{ rotate: '-90deg' }],
    width: 340,
  },
});
