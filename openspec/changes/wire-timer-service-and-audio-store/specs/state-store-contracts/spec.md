## MODIFIED Requirements

### Requirement: Audio state store exposes the initial playback contract

The project SHALL provide `src/shared/domain/stores/audioStore.ts` exporting `useAudioStore`, and that store SHALL define the shared playback and timer contract for the audio engine with `currentSoundId: string | null`, `isPlaying: boolean`, `isLooping: boolean`, `timerSeconds: number | null`, `timerStartedAt: number | null`, `timerDurationMs: 60000 | 120000 | 180000`, `volume: number`, and the synchronous actions `setCurrentSound`, `setIsPlaying`, `setIsLooping`, `setTimer`, `setVolume`, `startTimer`, `resetTimer`, `stopTimer`, `setTimerDuration`, and `reset`.

#### Scenario: Audio store exports a typed hook

- **WHEN** a developer imports from `src/shared/domain/stores/audioStore.ts`
- **THEN** the file exports `useAudioStore` as the route shell's shared audio state hook

### Requirement: Store defaults match the locked Phase 1 scaffold baseline

The scaffold stores SHALL preserve the exact startup defaults from the Phase 1 plan so later phases extend a stable baseline instead of redefining it.

#### Scenario: Audio store starts from the agreed playback baseline

- **WHEN** a developer reviews `src/shared/domain/stores/audioStore.ts`
- **THEN** the store initializes with `currentSoundId` set to `null`, `isPlaying` set to `false`, `isLooping` set to `false`, `timerSeconds` set to `60`, `timerStartedAt` set to `null`, `timerDurationMs` set to `60000`, and `volume` set to `1.0`

#### Scenario: UI store starts from the agreed shell baseline

- **WHEN** a developer reviews `src/shared/domain/stores/uiStore.ts`
- **THEN** the store initializes with `isDarkMode` set to `true`, `hasSeenOnboarding` set to `false`, `isImmersiveMode` set to `false`, and `isPlayerVisible` set to `false`

### Requirement: Audio store timer actions support runtime countdown control

The audio store SHALL expose timer control actions that support drift-safe timer runtime behavior without replacing the existing playback fields or setters.

#### Scenario: timerSeconds remains a selected/default timer field

- **WHEN** the timer runtime uses `timerStartedAt` and `timerDurationMs` as its countdown source of truth
- **THEN** the preserved `timerSeconds` field remains a compatibility and UI-facing selected/default timer value rather than the authoritative remaining-time source

#### Scenario: Starting a timer stores start timestamp and duration

- **WHEN** `startTimer(durationMs)` is called with one of the allowed production timer durations
- **THEN** the store sets `timerStartedAt` to the current timestamp and `timerDurationMs` to the requested duration

#### Scenario: Resetting a timer restarts the existing duration

- **WHEN** `resetTimer()` is called while a timer duration is already selected
- **THEN** the store sets `timerStartedAt` to a fresh current timestamp and keeps `timerDurationMs` unchanged

#### Scenario: Stopping a timer clears active countdown state

- **WHEN** `stopTimer()` is called
- **THEN** the store sets `timerStartedAt` to `null` without removing the currently selected timer duration

#### Scenario: Changing timer duration mid-session takes effect immediately

- **WHEN** `setTimerDuration(durationMs)` is called while a timer is already running
- **THEN** the store updates `timerDurationMs` and resets `timerStartedAt` to the current timestamp so the new duration applies from that moment

#### Scenario: Reset restores the timer runtime baseline

- **WHEN** `reset()` is called on the audio store
- **THEN** the store clears `timerStartedAt` back to `null` and restores `timerDurationMs` to the 60-second default alongside the original playback defaults
