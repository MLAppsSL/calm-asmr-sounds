## ADDED Requirements

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

### Requirement: Tab layout exposes the agreed four-tab Phase 3 shell

The tab layout SHALL expose exactly four tabs named `index`, `now-playing`, `favorites`, and `settings`, and the shell SHALL present them as the Home or Library tab, the now-playing shortcut tab, the Favorites tab, and the Settings tab respectively.

#### Scenario: Tab contract matches the Phase 3 shell

- **WHEN** a developer reviews `app/(tabs)/_layout.tsx`
- **THEN** the tab navigator contains exactly four `Tabs.Screen` entries named `index`, `now-playing`, `favorites`, and `settings`

#### Scenario: Tab bar uses the planned frosted presentation

- **WHEN** a developer reviews the Phase 3 tab layout
- **THEN** the tab bar uses a blur-backed frosted visual treatment and absolute positioning so route content can extend beneath it

### Requirement: The now-playing tab behaves as a minimal player shortcut

The `now-playing` tab SHALL act as a lightweight shortcut into the player flow when a sound is active, and it SHALL render an inactive shell state when no sound is active.

#### Scenario: Active playback allows the now-playing tab to enter the player route

- **WHEN** a user opens the `now-playing` tab while a sound is active
- **THEN** the tab route can navigate the user into the `/player` flow for the active sound

#### Scenario: Inactive playback shows a shell state instead of fake player behavior

- **WHEN** a user opens the `now-playing` tab while no sound is active
- **THEN** the route renders a minimal inactive state rather than pretending playback is available

### Requirement: Route files may own real product UI when they stop being placeholders

Each route file under `app/` SHALL remain focused on navigation and screen composition concerns, but once a route becomes a real product surface it MAY own its product UI directly instead of being forced to delegate through placeholder wrappers in `src/`.

#### Scenario: Product routes are not constrained to placeholder-only wrappers

- **WHEN** a developer reviews a real Core UI route such as the library tab route
- **THEN** the route file may contain the actual screen composition needed for that product surface
- **AND** reusable subcomponents still live outside `app/` instead of being duplicated inline across routes

#### Scenario: Layout files remain navigation-focused

- **WHEN** a developer reviews `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(onboarding)/_layout.tsx`, or `app/auth.tsx`
- **THEN** each file still primarily contains navigator configuration and startup wiring relevant to its route group

### Requirement: Root startup can hold splash visibility while shell gating resolves

The root layout SHALL allow the shell startup flow to prevent the splash screen from auto-hiding until startup gating for the Phase 3 shell has had a chance to resolve.

#### Scenario: Splash gating is configured from the root layout module

- **WHEN** a developer reviews the root layout for the Phase 3 shell
- **THEN** the startup flow includes root-level splash-screen hold behavior that can support onboarding or shell gating without flashing incomplete UI
