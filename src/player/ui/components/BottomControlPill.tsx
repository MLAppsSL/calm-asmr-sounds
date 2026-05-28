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
          color={loopActive ? '#ffffff' : 'rgba(255,255,255,0.66)'}
          name="loop"
          size={28}
        />
      </Pressable>
      <Pressable onPress={() => {}} style={styles.iconButton}>
        <MaterialIcons color="rgba(255,255,255,0.66)" name="bookmark-border" size={28} />
      </Pressable>
      <Pressable onPress={() => {}} style={styles.iconButton}>
        <MaterialIcons color="rgba(255,255,255,0.66)" name="favorite-border" size={28} />
      </Pressable>
      <Pressable onPress={onFullscreen} style={styles.iconButton}>
        <MaterialIcons color="rgba(255,255,255,0.66)" name="fullscreen" size={28} />
      </Pressable>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 10,
  },
  pill: {
    alignItems: 'center',
    backgroundColor: 'rgba(15,15,18,0.8)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 50,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 320,
    overflow: 'hidden',
    paddingHorizontal: 26,
    paddingVertical: 18,
  },
});
