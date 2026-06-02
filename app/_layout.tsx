import { useEffect, useState } from 'react';

import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRootNavigationState } from 'expo-router';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useFavoritesSync } from '@/favorites/data/hooks/useFavoritesSync';
import { AudioService } from '@/shared/data/services/AudioService';
import { TimerService } from '@/shared/data/services/TimerService';
import { useUIStore } from '@/shared/domain/stores/uiStore';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if the splash screen was already prevented.
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

function RootLayoutContent() {
  const hasHydrated = useUIStore((state) => state._hasHydrated);
  const { isLoading: isAuthLoading } = useAuth();
  const rootNavigationState = useRootNavigationState();
  const [isStartupReady, setIsStartupReady] = useState(false);

  useFavoritesSync();

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
    if (isStartupReady || !rootNavigationState?.key || !hasHydrated || isAuthLoading) {
      return;
    }

    setIsStartupReady(true);
  }, [hasHydrated, isAuthLoading, isStartupReady, rootNavigationState?.key]);

  useEffect(() => {
    if (!isStartupReady) {
      return;
    }

    void SplashScreen.hideAsync().catch(() => {
      // Ignore hide races during development reloads.
    });
  }, [isStartupReady]);

  return (
    <>
      <StatusBar hidden style="light" translucent />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen
          name="player"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
