import { useEffect, useState } from 'react';

import * as SplashScreen from 'expo-splash-screen';
import { Stack, router, useRootNavigationState, useSegments } from 'expo-router';

import { AudioService } from '@/shared/data/services/AudioService';
import { TimerService } from '@/shared/data/services/TimerService';
import { useUIStore } from '@/shared/domain/stores/uiStore';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if the splash screen was already prevented.
});

export default function RootLayout() {
  const hasSeenOnboarding = useUIStore((state) => state.hasSeenOnboarding);
  const hasHydrated = useUIStore((state) => state._hasHydrated);
  const rootNavigationState = useRootNavigationState();
  const segments = useSegments();
  const [isStartupReady, setIsStartupReady] = useState(false);

  const currentGroup = segments[0];
  const isStartupRouteResolved =
    currentGroup === '(auth)' ||
    currentGroup === 'player' ||
    currentGroup === (hasSeenOnboarding ? '(tabs)' : '(onboarding)');

  useEffect(() => {
    void AudioService.initialize().catch((error: unknown) => {
      console.error('AudioService initialization failed.', error);
    });

    TimerService.initAppStateListener();

    return () => {
      TimerService.removeAppStateListener();
    };
  }, []);

  useEffect(() => {
    if (isStartupReady || !rootNavigationState?.key || !hasHydrated) {
      return;
    }

    if (isStartupRouteResolved) {
      setIsStartupReady(true);
      return;
    }

    try {
      router.replace(hasSeenOnboarding ? '/(tabs)' : '/(onboarding)');
    } catch (error) {
      console.error('Startup routing failed. Falling back to tabs shell.', error);
      router.replace('/(tabs)');
    }
  }, [
    hasHydrated,
    hasSeenOnboarding,
    isStartupReady,
    isStartupRouteResolved,
    rootNavigationState?.key,
  ]);

  useEffect(() => {
    if (!isStartupReady) {
      return;
    }

    void SplashScreen.hideAsync().catch(() => {
      // Ignore hide races during development reloads.
    });
  }, [isStartupReady]);

  if (!isStartupReady) {
    return null;
  }

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
