import { Redirect } from 'expo-router';

import { useUIStore } from '@/shared/domain/stores/uiStore';

export default function IndexRoute() {
  const hasSeenOnboarding = useUIStore((state) => state.hasSeenOnboarding);
  const hasHydrated = useUIStore((state) => state._hasHydrated);

  if (!hasHydrated) {
    return null;
  }

  return <Redirect href={hasSeenOnboarding ? '/(tabs)' : '/(onboarding)'} />;
}
