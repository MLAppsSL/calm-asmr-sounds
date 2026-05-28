import { useEffect, useState } from 'react';

import { NavigationBar } from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRootNavigationState } from 'expo-router';
import { AppState, Platform } from 'react-native';

import { AudioService } from '@/shared/data/services/AudioService';
import { TimerService } from '@/shared/data/services/TimerService';
import { useUIStore } from '@/shared/domain/stores/uiStore';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if the splash screen was already prevented.
});

function applyImmersiveSystemUI() {
  if (Platform.OS !== 'android') {
    return;
  }

  NavigationBar.setStyle('dark');
  NavigationBar.setHidden(true);
}

export default function RootLayout() {
  const hasHydrated = useUIStore((state) => state._hasHydrated);
  const rootNavigationState = useRootNavigationState();
  const [isStartupReady, setIsStartupReady] = useState(false);

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
    applyImmersiveSystemUI();

    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        applyImmersiveSystemUI();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isStartupReady || !rootNavigationState?.key || !hasHydrated) {
      return;
    }

    setIsStartupReady(true);
  }, [hasHydrated, isStartupReady, rootNavigationState?.key]);

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
      <NavigationBar hidden style="dark" />
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
    </>
  );
}
