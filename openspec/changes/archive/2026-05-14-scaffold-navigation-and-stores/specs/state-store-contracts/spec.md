## ADDED Requirements

### Requirement: Audio state store exposes the initial playback contract

The project SHALL provide `src/stores/audioStore.ts` exporting `useAudioStore`, and that store SHALL define the initial playback contract for the scaffold with `currentSoundId: string | null`, `isPlaying: boolean`, `isLooping: boolean`, `timerSeconds: number | null`, `volume: number`, and the synchronous actions `setCurrentSound`, `setIsPlaying`, `setIsLooping`, `setTimer`, `setVolume`, and `reset`.

#### Scenario: Audio store exports a typed hook

- **WHEN** a developer imports from `src/stores/audioStore.ts`
- **THEN** the file exports `useAudioStore` as the route shell's shared audio state hook

### Requirement: Auth state store exposes the initial authentication contract

The project SHALL provide `src/stores/authStore.ts` exporting `useAuthStore`, and that store SHALL define the initial authentication contract for anonymous or signed-out startup with `user: User | null`, `isLoading: boolean`, and the synchronous actions `setUser` and `setLoading`.

#### Scenario: Auth store provides startup-safe defaults

- **WHEN** a developer reviews `src/stores/authStore.ts`
- **THEN** the store initializes with `user` set to `null` and `isLoading` set to `true`
- **AND** that baseline is suitable for app startup before real auth integration exists

### Requirement: Favorites state store exposes the initial favorites contract

The project SHALL provide `src/stores/favoritesStore.ts` exporting `useFavoritesStore`, and that store SHALL define typed local favorites state with `favoriteIds: string[]` and the synchronous actions `addFavorite`, `removeFavorite`, `isFavorite`, and `setFavorites` without depending on persistence or cloud sync.

#### Scenario: Favorites store remains local-contract only

- **WHEN** a developer reviews `src/stores/favoritesStore.ts`
- **THEN** the store exposes typed favorites state and synchronous update actions without any persistence or remote sync behavior

### Requirement: UI state store exposes the initial shell preferences contract

The project SHALL provide `src/stores/uiStore.ts` exporting `useUIStore`, and that store SHALL define the app-shell UI preferences needed by later phases with `isDarkMode: boolean`, `hasSeenOnboarding: boolean`, `isImmersiveMode: boolean`, `isPlayerVisible: boolean`, and the synchronous actions `setDarkMode`, `setHasSeenOnboarding`, `setImmersiveMode`, and `setPlayerVisible`.

#### Scenario: UI store starts in dark mode with onboarding incomplete

- **WHEN** a developer reviews `src/stores/uiStore.ts`
- **THEN** the store defaults dark mode to enabled and onboarding completion to false unless a later phase changes those values intentionally

### Requirement: Shared app-shell types are centralized

The project SHALL provide `src/types/index.ts` exporting the shared scaffold types used by the stores and later UI work, including `SoundCategory`, `TimerDuration`, `Sound`, and `User`.

#### Scenario: Shared types can be imported from one module

- **WHEN** a developer imports shared app-shell types
- **THEN** `src/types/index.ts` provides named exports for `SoundCategory`, `TimerDuration`, `Sound`, and `User`

#### Scenario: Shared scaffold types match the Phase 1 baseline contract

- **WHEN** a developer reviews `src/types/index.ts`
- **THEN** `SoundCategory` is defined as `'rain' | 'fire' | 'forest' | 'ocean' | 'wind' | 'white-noise'`
- **AND** `TimerDuration` is defined as `60 | 120 | 180`
- **AND** `Sound` includes `id`, `title`, `category`, `durationSeconds`, `isPremium`, `storageUrl`, and `thumbnailUrl`
- **AND** `Sound.durationSeconds` uses the `TimerDuration` type
- **AND** `Sound.storageUrl` and `Sound.thumbnailUrl` are nullable until later phases resolve them
- **AND** `User` includes `uid`, `email`, and `isAnonymous`
- **AND** `User.email` is nullable for anonymous or signed-out startup states

### Requirement: Zustand scaffolding follows the agreed TypeScript baseline

Each scaffold store SHALL use the Zustand v5 TypeScript `create<State>()((set) => ...)` pattern, export a single hook named `use...Store`, and remain compatible with the project's moderate TypeScript strictness baseline.

#### Scenario: Store implementation matches the agreed Zustand pattern

- **WHEN** a developer reviews any scaffold store file
- **THEN** the store uses the Zustand v5 double-call `create<State>()((set) => ...)` form and exports its hook with the expected `use...Store` name

### Requirement: Store defaults match the locked Phase 1 scaffold baseline

The scaffold stores SHALL preserve the exact startup defaults from the Phase 1 plan so later phases extend a stable baseline instead of redefining it.

#### Scenario: Audio store starts from the agreed playback baseline

- **WHEN** a developer reviews `src/stores/audioStore.ts`
- **THEN** the store initializes with `currentSoundId` set to `null`, `isPlaying` set to `false`, `isLooping` set to `false`, `timerSeconds` set to `60`, and `volume` set to `1.0`

#### Scenario: UI store starts from the agreed shell baseline

- **WHEN** a developer reviews `src/stores/uiStore.ts`
- **THEN** the store initializes with `isDarkMode` set to `true`, `hasSeenOnboarding` set to `false`, `isImmersiveMode` set to `false`, and `isPlayerVisible` set to `false`

### Requirement: Store files document multi-selector safety for later UI work

The scaffold store files SHALL document that components selecting multiple store values simultaneously should use `useShallow` from `zustand/react/shallow` when needed, so later phases avoid common re-render pitfalls without introducing that selector logic prematurely in the scaffold.

#### Scenario: Store guidance exists for future multi-value selectors

- **WHEN** a developer reviews the scaffold store files
- **THEN** they can see guidance that `useShallow` should be used when selecting multiple values from a store in a component

### Requirement: Scaffold verification uses repo-supported tooling and runtime assumptions

The scaffold verification for this change SHALL use the repository's supported commands and runtime expectations: `npx tsc --noEmit` for TypeScript, `npm run lint` for linting, and `npm run start` for Metro and route-resolution checks.

#### Scenario: Verification commands match the repository

- **WHEN** a developer follows the change verification steps
- **THEN** the commands align with the repository's defined scripts instead of assuming a generic standalone ESLint invocation

#### Scenario: Runtime checks avoid unsupported Expo Go assumptions

- **WHEN** a developer performs route-resolution checks for this scaffold
- **THEN** they treat the project as `expo-dev-client` plus native Firebase compatible and do not rely on Expo Go as the validation runtime
