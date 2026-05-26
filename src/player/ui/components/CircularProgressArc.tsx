import { MaterialIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  timerLabel: string;
};

export function CircularProgressArc({
  progress,
  isPlaying,
  onPlayPause,
  timerLabel,
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
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={0.6}
        />
        <AnimatedCircle
          animatedProps={animatedProps}
          cx={50}
          cy={50}
          fill="none"
          r={RADIUS}
          stroke="rgba(255,255,255,0.85)"
          strokeDasharray={CIRCUMFERENCE}
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
