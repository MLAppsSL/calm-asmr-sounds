## ADDED Requirements

### Requirement: Expo Router defines the complete Phase 1 route graph

The project SHALL define a complete Phase 1 Expo Router route graph with `app/_layout.tsx` as the root stack, `app/(tabs)/_layout.tsx` as a tab navigator, tab routes at `app/(tabs)/index.tsx`, `app/(tabs)/favorites.tsx`, and `app/(tabs)/settings.tsx`, onboarding routes at `app/(onboarding)/_layout.tsx` and `app/(onboarding)/index.tsx`, auth routes at `app/(auth)/_layout.tsx`, `app/(auth)/sign-in.tsx`, and `app/(auth)/sign-up.tsx`, and a modal player route at `app/player.tsx`.

#### Scenario: Route files exist for the initial app shell

- **WHEN** a developer inspects the `app/` directory after applying this change
- **THEN** the project contains exactly the root layout, three tab routes, two onboarding routes, three auth routes, and the player route required for the Phase 1 scaffold

### Requirement: Root navigation preserves the agreed navigator boundaries

The root layout SHALL register `(tabs)`, `(onboarding)`, and `(auth)` as stack screens with headers hidden, and it SHALL register `player` as a stack screen presented modally with its header hidden.

#### Scenario: Player is configured as a modal route

- **WHEN** a developer reviews `app/_layout.tsx`
- **THEN** the `player` screen is declared in the root stack with `presentation: 'modal'` and `headerShown: false`

#### Scenario: Route groups are mounted from the root stack

- **WHEN** a developer reviews `app/_layout.tsx`
- **THEN** the `(tabs)`, `(onboarding)`, and `(auth)` route groups are each declared as stack screens with `headerShown: false`

### Requirement: Tab layout exposes exactly the agreed three tabs

The tab layout SHALL expose exactly three tabs named `index`, `favorites`, and `settings`, and their visible titles SHALL be `Library`, `Favorites`, and `Settings` respectively.

#### Scenario: Tab contract matches the Phase 1 shell

- **WHEN** a developer reviews `app/(tabs)/_layout.tsx`
- **THEN** the tab navigator contains exactly three `Tabs.Screen` entries named `index`, `favorites`, and `settings` with titles `Library`, `Favorites`, and `Settings`

### Requirement: Route files stay route-only and delegate UI to `src/`

Each route file under `app/` SHALL remain a thin Expo Router entry point that exports a default component and imports its rendered placeholder screen component from `src/`, instead of defining placeholder screen markup inline inside the route file.

#### Scenario: Route shell imports screen implementation from src

- **WHEN** a developer reviews any non-layout route file under `app/`
- **THEN** the file exports a default route component that renders a screen component imported from `src/`

#### Scenario: Layout files focus on navigation configuration only

- **WHEN** a developer reviews `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(onboarding)/_layout.tsx`, or `app/(auth)/_layout.tsx`
- **THEN** each file contains navigator configuration for its route group and does not embed unrelated product logic

### Requirement: Placeholder screens are valid app-shell stand-ins

The placeholder screens rendered from `src/` SHALL provide valid default-rendered screens for library, favorites, settings, onboarding, auth, and player flows so Expo Router can resolve every Phase 1 route without runtime export errors.

#### Scenario: All scaffolded routes resolve to placeholder screens

- **WHEN** the app launches after this change and Expo Router resolves the declared routes
- **THEN** every scaffolded route renders a valid placeholder screen instead of failing because a screen implementation is missing
