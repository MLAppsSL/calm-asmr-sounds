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
          color={loopActive ? '#ffffff' : 'rgba(255,255,255,0.5)'}
          name="loop"
          size={24}
        />
      </Pressable>
      <Pressable onPress={() => {}} style={styles.iconButton}>
        <MaterialIcons color="rgba(255,255,255,0.5)" name="airplay" size={24} />
      </Pressable>
      <Pressable onPress={() => {}} style={styles.iconButton}>
        <MaterialIcons color="rgba(255,255,255,0.5)" name="favorite-border" size={24} />
      </Pressable>
      <Pressable onPress={onFullscreen} style={styles.iconButton}>
        <MaterialIcons color="rgba(255,255,255,0.5)" name="fullscreen" size={24} />
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 300,
    overflow: 'hidden',
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
});
