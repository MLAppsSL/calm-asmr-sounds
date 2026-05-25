## Why

Phase `02-03` is the slice that makes the audio engine behave correctly over time instead of only at playback start. The app already has playback and local-cache planning in place, but it still lacks drift-safe timer control, startup wiring for timer/background correction, and a temporary screen that exercises the full audio stack on real devices.

## What Changes

- Add a shared `TimerService` that uses timestamp math plus `AppState` recovery to keep countdowns accurate when the app backgrounds and resumes.
- Extend the shared audio store with timer timestamp fields and control actions so timer state survives foreground/background transitions and sound switches.
- Update the root layout to initialize `AudioService` and register the timer service's AppState listener once at app startup.
- Replace the current tab index placeholder with a temporary test harness that exercises play, crossfade, timer start, timer stop, and a short countdown verification path.
- Add a blocking human-verification workflow for real iOS and Android background audio, loop continuity, and timer fade-out behavior.

## Capabilities

### New Capabilities

- `audio-timer-runtime`: Defines the app-level timer service contract, startup AppState correction wiring, and the temporary verification harness used to validate timer-driven audio behavior on device.

### Modified Capabilities

- `state-store-contracts`: Expands the shared audio store contract with timer timestamp fields and timer control actions required by the timer runtime.

## Impact

- Affected files: `src/shared/data/services/TimerService.ts`, `src/shared/domain/stores/audioStore.ts`, `app/_layout.tsx`, `app/(tabs)/index.tsx`, and new OpenSpec artifacts under `openspec/changes/wire-timer-service-and-audio-store/`
- Affected systems: timer state management, AppState handling, timer-driven fade/stop playback behavior, root startup wiring, and temporary device-verification UI flows
- Dependencies: the existing `AudioService`, the planned sound catalog/cache layer from Phase `02-02`, React Native `AppState`, and the shared Zustand store baseline already present in the repository
