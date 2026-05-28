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

  const safelyControlPlayer = useCallback(
    (action: 'play' | 'pause') => {
      try {
        if (action === 'play') {
          player.play();
          return;
        }

        player.pause();
      } catch (error) {
        if (error instanceof Error && /released|Cannot use shared object/i.test(error.message)) {
          return;
        }

        console.warn(`Video background ${action} failed.`, error);
      }
    },
    [player],
  );

  useFocusEffect(
    useCallback(() => {
      safelyControlPlayer('play');

      return () => {
        safelyControlPlayer('pause');
      };
    }, [safelyControlPlayer]),
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
