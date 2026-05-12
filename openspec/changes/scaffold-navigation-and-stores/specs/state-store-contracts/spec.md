## ADDED Requirements

### Requirement: Audio state store exposes the initial playback contract

The project SHALL provide `src/stores/audioStore.ts` exporting `useAudioStore`, and that store SHALL define the initial playback contract for the scaffold, including typed state for the current sound selection, playback status, looping state, timer selection, and synchronous setter actions for those fields.

#### Scenario: Audio store exports a typed hook

- **WHEN** a developer imports from `src/stores/audioStore.ts`
- **THEN** the file exports `useAudioStore` as the route shell's shared audio state hook

### Requirement: Auth state store exposes the initial authentication contract

The project SHALL provide `src/stores/authStore.ts` exporting `useAuthStore`, and that store SHALL define the initial authentication contract for anonymous or signed-out startup, loading status needed for future auth wiring, and synchronous setter actions for those fields.

#### Scenario: Auth store provides startup-safe defaults

- **WHEN** a developer reviews `src/stores/authStore.ts`
- **THEN** the store initializes to a non-authenticated baseline suitable for app startup before real auth integration exists

### Requirement: Favorites state store exposes the initial favorites contract

The project SHALL provide `src/stores/favoritesStore.ts` exporting `useFavoritesStore`, and that store SHALL define typed local favorites state and synchronous actions for adding, removing, or replacing favorites without depending on persistence or cloud sync.

#### Scenario: Favorites store remains local-contract only

- **WHEN** a developer reviews `src/stores/favoritesStore.ts`
- **THEN** the store exposes typed favorites state and synchronous update actions without any persistence or remote sync behavior

### Requirement: UI state store exposes the initial shell preferences contract

The project SHALL provide `src/stores/uiStore.ts` exporting `useUIStore`, and that store SHALL define the app-shell UI preferences needed by later phases, including dark mode enabled by default and onboarding completion state, with synchronous setter actions.

#### Scenario: UI store starts in dark mode with onboarding incomplete

- **WHEN** a developer reviews `src/stores/uiStore.ts`
- **THEN** the store defaults dark mode to enabled and onboarding completion to false unless a later phase changes those values intentionally

### Requirement: Shared app-shell types are centralized

The project SHALL provide `src/types/index.ts` exporting the shared scaffold types used by the stores and later UI work, including `Sound`, `SoundCategory`, and `TimerDuration`.

#### Scenario: Shared types can be imported from one module

- **WHEN** a developer imports shared app-shell types
- **THEN** `src/types/index.ts` provides named exports for `Sound`, `SoundCategory`, and `TimerDuration`

### Requirement: Zustand scaffolding follows the agreed TypeScript baseline

Each scaffold store SHALL use the Zustand v5 TypeScript `create<State>()((set) => ...)` pattern, export a single hook named `use...Store`, and remain compatible with the project's moderate TypeScript strictness baseline.

#### Scenario: Store implementation matches the agreed Zustand pattern

- **WHEN** a developer reviews any scaffold store file
- **THEN** the store uses the Zustand v5 double-call `create<State>()((set) => ...)` form and exports its hook with the expected `use...Store` name

### Requirement: Store files document multi-selector safety for later UI work

The scaffold store files SHALL document that components selecting multiple store values simultaneously should use `useShallow` from `zustand/react/shallow` when needed, so later phases avoid common re-render pitfalls without introducing that selector logic prematurely in the scaffold.

#### Scenario: Store guidance exists for future multi-value selectors

- **WHEN** a developer reviews the scaffold store files
- **THEN** they can see guidance that `useShallow` should be used when selecting multiple values from a store in a component
