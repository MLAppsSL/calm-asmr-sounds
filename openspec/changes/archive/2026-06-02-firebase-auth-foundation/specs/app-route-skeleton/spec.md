## MODIFIED Requirements

### Requirement: Expo Router defines the complete Phase 1 route graph

The project SHALL define a complete Phase 3 Expo Router route graph with `app/_layout.tsx` as the root stack, `app/(tabs)/_layout.tsx` as a tab navigator, tab routes at `app/(tabs)/index.tsx`, `app/(tabs)/now-playing.tsx`, `app/(tabs)/favorites.tsx`, and `app/(tabs)/settings.tsx`, onboarding routes at `app/(onboarding)/_layout.tsx`, `app/(onboarding)/index.tsx`, and `app/(onboarding)/quiet-mode.tsx`, a modal auth route at `app/auth.tsx`, and a modal or fullscreen player route at `app/player.tsx`.

#### Scenario: Route files exist for the Phase 3 shell

- **WHEN** a developer inspects the `app/` directory after applying this change
- **THEN** the project contains the root layout, four tab routes, the two-screen onboarding flow required for the Phase 3 shell, the modal auth route, and the player route required for the library-to-player flow
- **AND** later phases may add additional routes without violating this requirement as long as these required Core UI routes remain present

### Requirement: Root navigation preserves the agreed navigator boundaries

The root layout SHALL register `(tabs)` and `(onboarding)` as stack screens with headers hidden, it SHALL register `auth` as a modal stack screen presented from the root stack, and it SHALL register `player` as a sibling stack screen presented without the tab bar while preserving hidden header behavior.

#### Scenario: Player stays outside the tab navigator

- **WHEN** a developer reviews `app/_layout.tsx`
- **THEN** the `player` screen is declared in the root stack as a sibling of `(tabs)` instead of as a nested tab route

#### Scenario: Route groups and modal auth are mounted from the root stack

- **WHEN** a developer reviews `app/_layout.tsx`
- **THEN** the `(tabs)` and `(onboarding)` route groups are each declared as stack screens with `headerShown: false`
- **AND** the `auth` screen is declared from the same root stack with modal presentation semantics
