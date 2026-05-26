import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet } from 'react-native';

type BottomControlPillProps = {
  loopActive: boolean;
  onLoop: () => void;
  onFullscreen: () => void;
};

export function BottomControlPill({ loopActive, onLoop, onFullscreen }: BottomControlPillProps) {
  return (
    <BlurView
      experimentalBlurMethod="dimezisBlurView"
      intensity={70}
      style={styles.pill}
      tint="dark"
    >
      <Pressable onPress={onLoop} style={styles.iconButton}>
        <MaterialIcons
          color={loopActive ? '#8b5cf6' : 'rgba(255,255,255,0.7)'}
          name="loop"
          size={24}
        />
      </Pressable>
      <Pressable onPress={() => {}} style={styles.iconButton}>
        <MaterialIcons color="rgba(255,255,255,0.7)" name="cast" size={24} />
      </Pressable>
      <Pressable onPress={() => {}} style={styles.iconButton}>
        <MaterialIcons color="rgba(255,255,255,0.7)" name="favorite-border" size={24} />
      </Pressable>
      <Pressable onPress={onFullscreen} style={styles.iconButton}>
        <MaterialIcons color="rgba(255,255,255,0.7)" name="fullscreen" size={24} />
      </Pressable>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
  },
  pill: {
    alignItems: 'center',
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 240,
    overflow: 'hidden',
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
});
