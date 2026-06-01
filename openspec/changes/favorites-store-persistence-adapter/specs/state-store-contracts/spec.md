## MODIFIED Requirements

### Requirement: Favorites state store exposes the initial favorites contract

The project SHALL provide `src/favorites/domain/stores/favoritesStore.ts` exporting `useFavoritesStore`, and that store SHALL define the favorites-slice local favorites contract with persisted `favorites: Favorite[]`, hydration visibility through `_hasHydrated`, and the synchronous actions `toggleFavorite`, `isFavorite`, `setFavorites`, `setHasHydrated`, and `getSortedFavorites`.

#### Scenario: Favorites store lives in the dedicated favorites slice

- **WHEN** a developer reviews the favorites state implementation
- **THEN** the favorites store lives under `src/favorites/domain/stores/favoritesStore.ts`
- **AND** favorites-specific state is not kept under `shared/` as though it were cross-feature infrastructure

#### Scenario: Favorites store persists metadata-rich favorites

- **WHEN** a developer reviews `src/favorites/domain/stores/favoritesStore.ts`
- **THEN** the store exposes `favorites: Favorite[]` instead of `favoriteIds: string[]`
- **AND** the persisted favorite item shape includes `id` and `addedAt`

#### Scenario: Legacy persisted favorites are migrated forward

- **WHEN** the store rehydrates previously persisted favorites in the old `favoriteIds: string[]` shape
- **THEN** the store migrates them into `Favorite[]` records instead of silently discarding them
- **AND** the migrated records include deterministic `addedAt` values suitable for later sorting and migration work

#### Scenario: Favorites store persists only durable favorites data

- **WHEN** the favorites store is configured with persistence
- **THEN** only the `favorites` collection is written to persisted storage
- **AND** hydration bookkeeping such as `_hasHydrated` is not treated as durable user data

#### Scenario: Favorites hydration readiness is exposed after rehydrate

- **WHEN** the app starts before persisted favorites finish loading
- **THEN** `_hasHydrated` starts as `false`
- **AND** the store lifecycle sets it to `true` after persisted favorites rehydrate

#### Scenario: Favorites writes use toggle semantics and sorted reads

- **WHEN** a caller toggles a favorite sound on or off
- **THEN** the store adds or removes the corresponding `Favorite` record without requiring separate add and remove actions
- **AND** `getSortedFavorites()` returns favorites ordered by most recently added first

### Requirement: UI state store exposes the Phase 3 shell preferences contract

The project SHALL provide `src/shared/domain/stores/uiStore.ts` exporting `useUIStore`, and that store SHALL preserve the existing shell fields while defining the shell preferences contract with persisted `isDarkMode`, persisted `defaultTimerDuration`, hydration visibility through `_hasHydrated`, and the synchronous actions needed to toggle dark mode, update the default timer preference, and report hydration readiness at startup.

#### Scenario: UI store provides dark-mode shell state

- **WHEN** a developer imports from `src/shared/domain/stores/uiStore.ts`
- **THEN** the file exports `useUIStore` with a readable `isDarkMode` field that any shell screen can consume

#### Scenario: Existing shell fields remain available

- **WHEN** a developer reviews the shared `useUIStore` contract
- **THEN** the store still exposes the previously established shell fields needed for onboarding and player visibility concerns
- **AND** the shell preference additions do not remove those existing fields from the shared store surface

#### Scenario: UI store exposes hydration readiness

- **WHEN** startup code or a screen reads the UI store before persisted preferences finish loading
- **THEN** the store exposes `_hasHydrated` or an equivalent hydration-ready signal so the shell can avoid rendering with the wrong theme briefly

#### Scenario: UI store exposes a persisted default timer preference

- **WHEN** a screen reads or updates the default timer preference
- **THEN** the store exposes `defaultTimerDuration` and `setDefaultTimerDuration`
- **AND** that preference participates in the store's persisted durable settings

#### Scenario: Sound-specific defaults remain authoritative where already defined

- **WHEN** a flow already has an explicit sound or catalog default duration
- **THEN** that sound-specific default remains authoritative
- **AND** `defaultTimerDuration` acts only as a fallback for flows that do not already define a duration

### Requirement: Shared app-shell types are centralized

The project SHALL provide `src/shared/domain/types/index.ts` exporting the shared scaffold types used by the stores and later UI work, including `SoundCategory`, `TimerDuration`, `Sound`, and `User`.

#### Scenario: Shared types can be imported from one module

- **WHEN** a developer imports shared app-shell types
- **THEN** `src/shared/domain/types/index.ts` provides named exports for `SoundCategory`, `TimerDuration`, `Sound`, and `User`

#### Scenario: Shared scaffold types match the Phase 1 baseline contract

- **WHEN** a developer reviews `src/shared/domain/types/index.ts`
- **THEN** `SoundCategory` is defined as `'rain' | 'fire' | 'forest' | 'ocean' | 'wind' | 'white-noise'`
- **AND** `TimerDuration` is defined as `60 | 120 | 180`
- **AND** `Sound` includes `id`, `title`, `category`, `durationSeconds`, `isPremium`, `storageUrl`, and `thumbnailUrl`
- **AND** `Sound.durationSeconds` uses the `TimerDuration` type
- **AND** `Sound.storageUrl` and `Sound.thumbnailUrl` are nullable until later phases resolve them
- **AND** `User` includes `uid`, `email`, and `isAnonymous`
- **AND** `User.email` is nullable for anonymous or signed-out startup states

## ADDED Requirements

### Requirement: Favorites slice owns the typed favorites domain model

The project SHALL provide `src/favorites/domain/types/index.ts` exporting the favorites-slice domain model used by the favorites store and local favorites adapter, including `Favorite`.

#### Scenario: Favorites domain type is feature-local

- **WHEN** a developer reviews the favorites domain types
- **THEN** `Favorite` is defined under `src/favorites/domain/types/index.ts`
- **AND** the type lives with the favorites slice instead of being added to shared app-shell types

#### Scenario: Favorite captures migration-safe metadata

- **WHEN** a developer reviews the `Favorite` type
- **THEN** it includes `id: string`
- **AND** it includes `addedAt: number`

### Requirement: Store defaults match the locked Phase 1 scaffold baseline

The scaffold stores SHALL preserve stable startup defaults unless a later approved slice intentionally changes them, and this change SHALL update the UI-store shell baseline so first-install theme choice comes from system appearance while the default timer preference starts from the agreed one-minute value.

#### Scenario: Audio store starts from the agreed playback baseline

- **WHEN** a developer reviews `src/shared/domain/stores/audioStore.ts`
- **THEN** the store initializes with `currentSoundId` set to `null`, `isPlaying` set to `false`, `isLooping` set to `false`, `timerSeconds` set to `60`, `timerStartedAt` set to `null`, `timerDurationMs` set to `60000`, and `volume` set to `1.0`

#### Scenario: UI store starts from the Phase 4 shell baseline

- **WHEN** a developer reviews `src/shared/domain/stores/uiStore.ts`
- **THEN** `isDarkMode` initializes from the current system appearance when no persisted preference exists
- **AND** `defaultTimerDuration` initializes to `60`
- **AND** existing shell defaults such as onboarding and visibility fields remain compatible with the pre-Phase-4 baseline unless a later slice changes them intentionally
- **AND** the hydration-ready signal starts in the non-hydrated state until persisted preferences are restored

### Requirement: UI preferences persist only the durable shell settings

The UI store SHALL persist durable shell preferences such as dark mode and the default timer duration across app launches, and it SHALL avoid treating hydration bookkeeping as a user preference that survives independently of store restoration.

#### Scenario: Durable UI preferences survive an app restart

- **WHEN** a user changes dark mode or the default timer preference and later reopens the app
- **THEN** the store restores the previously selected durable shell preference values from persisted storage

#### Scenario: Ephemeral UI fields are not over-persisted accidentally

- **WHEN** the UI store persists shell preference state
- **THEN** only the durable fields intended to survive app restarts are persisted
- **AND** ephemeral UI state is not blindly restored as though it were a long-lived user preference

#### Scenario: Hydration bookkeeping is managed by startup, not by user preference state

- **WHEN** the persisted UI store rehydrates at startup
- **THEN** the hydration-ready signal is set by the store lifecycle rather than being treated as an independently authored persisted user choice
