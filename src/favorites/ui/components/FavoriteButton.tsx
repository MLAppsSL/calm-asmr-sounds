import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { useFavoritesStore } from '@/favorites/domain/stores/favoritesStore';

type FavoriteButtonProps = {
  soundId: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function FavoriteButton({ soundId, size = 22, style }: FavoriteButtonProps) {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(soundId));
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    useFavoritesStore.getState().toggleFavorite(soundId);
    scale.value = withSequence(
      withSpring(1.3, { stiffness: 200, damping: 10, mass: 1 }),
      withSpring(1, { stiffness: 150, damping: 14, mass: 1 }),
    );
  }

  return (
    <Pressable hitSlop={8} onPress={handlePress} style={style}>
      <Animated.View style={animatedStyle}>
        <MaterialIcons
          color={isFavorite ? '#f43f5e' : '#94a3b8'}
          name={isFavorite ? 'favorite' : 'favorite-border'}
          size={size}
        />
      </Animated.View>
    </Pressable>
  );
}
