## MODIFIED Requirements

### Requirement: UI state store exposes the Phase 3 shell preferences contract

The project SHALL provide `src/shared/domain/stores/uiStore.ts` exporting `useUIStore`, and that store SHALL preserve the existing shell fields while defining the Phase 3 shell preferences contract with persisted `isDarkMode`, hydration visibility through `_hasHydrated`, and the synchronous actions needed to toggle dark mode and report hydration readiness at startup.

#### Scenario: UI store provides dark-mode shell state

- **WHEN** a developer imports from `src/shared/domain/stores/uiStore.ts`
- **THEN** the file exports `useUIStore` with a readable `isDarkMode` field that any Phase 3 screen can consume

#### Scenario: Existing shell fields remain available

- **WHEN** a developer reviews the Phase 3 `useUIStore` contract
- **THEN** the store still exposes the previously established shell fields needed for onboarding and player visibility concerns
- **AND** the Phase 3 hydration additions do not remove those existing fields from the shared store surface

#### Scenario: UI store exposes hydration readiness

- **WHEN** startup code or a screen reads the UI store before persisted preferences finish loading
- **THEN** the store exposes `_hasHydrated` or an equivalent hydration-ready signal so the shell can avoid rendering with the wrong theme briefly

### Requirement: Store defaults match the locked Phase 1 scaffold baseline

The scaffold stores SHALL preserve the exact startup defaults from the Phase 1 plan so later phases extend a stable baseline instead of redefining it.

#### Scenario: Audio store starts from the agreed playback baseline

- **WHEN** a developer reviews `src/shared/domain/stores/audioStore.ts`
- **THEN** the store initializes with `currentSoundId` set to `null`, `isPlaying` set to `false`, `isLooping` set to `false`, `timerSeconds` set to `60`, `timerStartedAt` set to `null`, `timerDurationMs` set to `60000`, and `volume` set to `1.0`

#### Scenario: UI store starts from the agreed shell baseline

- **WHEN** a developer reviews `src/shared/domain/stores/uiStore.ts`
- **THEN** the store initializes with dark mode enabled by default
- **AND** existing shell defaults such as onboarding and visibility fields remain compatible with the pre-Phase-3 baseline unless a later slice changes them intentionally
- **AND** the hydration-ready signal starts in the non-hydrated state until persisted preferences are restored

### Requirement: UI preferences persist only the durable shell settings

The UI store SHALL persist durable shell preferences such as dark mode across app launches, and it SHALL avoid treating hydration bookkeeping as a user preference that survives independently of store restoration.

#### Scenario: Dark mode survives an app restart

- **WHEN** a user changes the dark mode preference and later reopens the app
- **THEN** the store restores the previously selected dark mode value from persisted storage

#### Scenario: Ephemeral UI fields are not over-persisted accidentally

- **WHEN** the Phase 3 UI store persists shell preference state
- **THEN** only the durable fields intended to survive app restarts are persisted
- **AND** ephemeral UI state is not blindly restored as though it were a long-lived user preference

#### Scenario: Hydration bookkeeping is managed by startup, not by user preference state

- **WHEN** the persisted UI store rehydrates at startup
- **THEN** the hydration-ready signal is set by the store lifecycle rather than being treated as an independently authored persisted user choice
