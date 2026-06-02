import { FavoriteButton } from '@/favorites/ui/components/FavoriteButton';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

type BottomControlPillProps = {
  favoriteSoundId: string | null;
  loopActive: boolean;
  onLoop: () => void;
  onFullscreen: () => void;
};

export function BottomControlPill({
  favoriteSoundId,
  loopActive,
  onLoop,
  onFullscreen,
}: BottomControlPillProps) {
  return (
    <BlurView style={styles.pill} intensity={60} tint="dark">
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
      {favoriteSoundId ? (
        <FavoriteButton size={24} soundId={favoriteSoundId} style={styles.iconButton} />
      ) : null}
      <Pressable onPress={onFullscreen} style={styles.iconButton}>
        <MaterialIcons color="rgba(255,255,255,0.5)" name="fullscreen" size={24} />
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
    backgroundColor: 'rgba(255,255,255,0.03)',
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
