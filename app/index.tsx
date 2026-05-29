import { Redirect } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';

import { useUIStore } from '@/shared/domain/stores/uiStore';

export default function IndexRoute() {
  const { hasSeenOnboarding, hasHydrated } = useUIStore(
    useShallow((state) => ({
      hasSeenOnboarding: state.hasSeenOnboarding,
      hasHydrated: state._hasHydrated,
    })),
  );

  if (!hasHydrated) {
    return null;
  }

  return <Redirect href={hasSeenOnboarding ? '/(tabs)' : '/(onboarding)'} />;
}
