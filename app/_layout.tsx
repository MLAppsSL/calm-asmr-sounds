import { useEffect } from 'react';

import { Stack } from 'expo-router';

import { AudioService } from '@/shared/data/services/AudioService';

export default function RootLayout() {
  useEffect(() => {
    void AudioService.initialize().catch((error: unknown) => {
      console.error('AudioService initialization failed.', error);
    });
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="player"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
