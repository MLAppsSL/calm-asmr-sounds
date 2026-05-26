import { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';

type VideoBackgroundProps = {
  source: number | string;
};

export function VideoBackground({ source }: VideoBackgroundProps) {
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  useFocusEffect(
    useCallback(() => {
      player.play();

      return () => {
        player.pause();
      };
    }, [player]),
  );

  return (
    <VideoView
      allowsFullscreen={false}
      contentFit="cover"
      nativeControls={false}
      player={player}
      style={StyleSheet.absoluteFill}
    />
  );
}
