## ADDED Requirements

### Requirement: TimerService runs drift-safe audio countdowns

The app SHALL expose a shared `TimerService` at `src/shared/data/services/TimerService.ts` that uses timestamp math from shared store state instead of interval counting alone, so timer countdowns remain accurate after the app backgrounds and resumes.

#### Scenario: Timer tick uses timestamp math

- **WHEN** `TimerService` evaluates an active countdown
- **THEN** it computes elapsed time from `Date.now() - timerStartedAt` and derives remaining time from the stored `timerDurationMs` instead of trusting counted interval ticks

#### Scenario: Returning to foreground recalculates immediately

- **WHEN** the app transitions back to `active`
- **THEN** `TimerService` immediately recalculates the timer state without waiting for the next interval cycle

### Requirement: Timer expiry fades audio before stopping

When an active timer reaches zero, `TimerService` SHALL fade the current audio out gently and then stop playback completely.

#### Scenario: Timer zero fades then stops playback

- **WHEN** the active timer reaches zero while audio is playing
- **THEN** `TimerService` calls `AudioService.fadeOut(1500)` and then `AudioService.stop()`

#### Scenario: Timer expiry does not re-enter during fade

- **WHEN** timer expiry handling is already running for the current countdown
- **THEN** the service avoids starting a second fade-or-stop sequence for the same expiry event

### Requirement: Switching sounds resets the active timer duration

When playback switches to a different sound while a timer is active, the timer runtime MUST restart the countdown from the currently selected duration instead of continuing the elapsed time from the previous sound. In this slice, that restart MUST be triggered by the caller flow for the sound switch rather than by `TimerService` inferring sound-change events on its own.

#### Scenario: Sound switch restarts countdown from selected duration

- **WHEN** a different sound becomes the active playback target while a timer is already running
- **THEN** the timer restarts from the selected timer duration for the new sound session instead of continuing the previous countdown

### Requirement: App startup wires timer AppState recovery once

The app SHALL initialize timer AppState recovery once at startup from the root layout, alongside the one-time audio initialization path.

#### Scenario: Root startup registers timer listener

- **WHEN** the app root layout mounts for startup
- **THEN** it calls `TimerService.initAppStateListener()` exactly once while preserving the existing route stack structure

### Requirement: Temporary harness verifies the timer runtime end to end

The app SHALL replace `app/(tabs)/index.tsx` with a temporary verification harness for this slice that exercises shared timer, playback, and cache wiring before the final Phase 3 UI replaces it.

#### Scenario: Harness starts playback and production timer together

- **WHEN** a tester triggers the primary play action in the temporary harness
- **THEN** the screen resolves a local sound URI, starts playback, and starts a 60-second timer through the shared runtime services

#### Scenario: Harness exposes the four verification controls

- **WHEN** a tester opens the temporary harness screen
- **THEN** the screen provides controls for play plus 60-second timer start, crossfade to a second sound, play plus 10-second timer verification, and timer stop

#### Scenario: Harness supports fast expiry verification

- **WHEN** a tester triggers the short-timer verification path in the temporary harness
- **THEN** the screen uses a dev-only 10-second bypass to exercise timer expiry and fade-out behavior without changing the production timer contract
