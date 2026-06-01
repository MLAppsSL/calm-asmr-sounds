import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';

type VideoBackgroundProps = {
  source: number | string;
};

export function VideoBackground({ source }: VideoBackgroundProps) {
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = true;
  });

  useFocusEffect(
    useCallback(() => {
      player.play();

      return () => {};
    }, [player]),
  );

  return (
    <VideoView
      contentFit="cover"
      nativeControls={false}
      pointerEvents="none"
      player={player}
      style={styles.background}
    />
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a',
  },
});
