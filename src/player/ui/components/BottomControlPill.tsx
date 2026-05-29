import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

type BottomControlPillProps = {
  loopActive: boolean;
  onLoop: () => void;
  onFullscreen: () => void;
};

export function BottomControlPill({ loopActive, onLoop, onFullscreen }: BottomControlPillProps) {
  return (
    <View style={styles.pill}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
  },
  pill: {
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.72)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 240,
    overflow: 'hidden',
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
});
