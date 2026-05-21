## 1. Audio Store Timer Runtime

- [ ] 1.1 Augment `src/shared/domain/stores/audioStore.ts` with `timerStartedAt`, `timerDurationMs`, and the `startTimer`, `resetTimer`, `stopTimer`, and `setTimerDuration` actions while preserving the existing playback fields and Zustand v5 store shape.
- [ ] 1.2 Update the store defaults and `reset()` behavior so the timer runtime starts from the locked 60-second baseline, keeps `timerSeconds` as a selected/default timer field, and clears active countdown state correctly.

## 2. Timer Service And Startup Wiring

- [ ] 2.1 Confirm the `02-02` catalog/cache code is available on the working branch before wiring the temporary harness that depends on `SOUNDS` and `SoundCacheService`.
- [ ] 2.2 Create `src/shared/data/services/TimerService.ts` as a module-level singleton that uses timestamp math from the shared audio store instead of interval counting as the source of truth.
- [ ] 2.3 Implement AppState listener registration, immediate foreground recalculation, duplicate-expiry protection, and timer restart-on-sound-switch support inside `TimerService`.
- [ ] 2.4 Implement timer expiry so it calls `AudioService.fadeOut(1500)` and then `AudioService.stop()` before clearing timer-running state.
- [ ] 2.5 Update `app/_layout.tsx` to initialize `AudioService` and `TimerService.initAppStateListener()` once on mount while preserving the current stack configuration.

## 3. Temporary Verification Harness

- [ ] 3.1 Replace `app/(tabs)/index.tsx` with the temporary timer/audio verification harness that exposes exactly four controls: play plus 60-second timer start, crossfade to a second sound, play plus 10-second timer verification, and timer stop.
- [ ] 3.2 Keep the 10-second timer bypass route-local to the harness so production timer store/service contracts remain locked to 1, 2, or 3 minutes.

## 4. Validation And Device Verification

- [ ] 4.1 Run the relevant project checks after the store, timer service, startup wiring, and harness changes are added, and fix any lint, formatting, or type regressions introduced by this slice.
- [ ] 4.2 Manually review the implementation against the OpenSpec requirements for timer timestamp math, fade-then-stop expiry, one-time startup listener wiring, and temporary harness behavior.
- [ ] 4.3 Complete the planned real-device verification for iOS and Android background audio, loop continuity, timer fade-out, and background timer correction before treating the slice as complete.
- [ ] 4.4 Create `.planning/phases/02-audio-engine/02-03-SUMMARY.md` after implementation and device verification, following the phase summary template.
