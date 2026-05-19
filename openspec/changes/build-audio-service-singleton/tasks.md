## 1. Playback Dependency Setup

- [ ] 1.1 Confirm `expo-av` remains the playback dependency for Phase `02-01` and avoid introducing `expo-audio` in this slice.
- [ ] 1.2 Audit the repository for current `expo-av` baseline assumptions so the new audio-engine implementation stays aligned with the reviewed foundation decision.

## 2. AudioService Singleton Implementation

- [ ] 2.1 Create `src/services/AudioService.ts` as a module-lifetime singleton with private active-player state and an idempotent `initialize()` method.
- [ ] 2.2 Implement fresh playback in `AudioService.play(soundId, localUri)` so a valid local URI starts immediately and loops continuously when no sound is active.
- [ ] 2.3 Implement the 700 ms crossfade path for switching sounds, including temporary overlap handling and guaranteed cleanup of the outgoing sound instance with the appropriate `expo-av` unload path.
- [ ] 2.4 Implement instant manual stop behavior so tapping the active sound or calling `AudioService.stop()` cancels any in-flight fade work and stops playback with no fade.
- [ ] 2.5 Implement `AudioService.fadeOut(durationMs)` so later timer flows can fade the active player volume to zero before calling `stop()`.

## 3. App Startup Wiring And Validation

- [ ] 3.1 Update `app/_layout.tsx` to call `AudioService.initialize()` once at app startup without tying playback lifecycle to any individual screen.
- [ ] 3.2 Run the relevant project checks after the service and root-layout changes, and fix any lint, formatting, or type regressions introduced by the new audio-engine code.
- [ ] 3.3 Manually review the resulting implementation against the OpenSpec requirements for singleton lifetime, immediate play, background-capable initialization, looping, crossfade switching, `fadeOut(durationMs)`, and instant stop behavior.
