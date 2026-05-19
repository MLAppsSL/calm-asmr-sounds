## Why

Phase 2 starts with the audio engine because every later playback, timer, and player-screen workflow depends on a single service that can start sounds immediately and keep them alive outside React navigation lifecycles. The current foundation branch has routing and shared stores in place, but it does not yet define the playback contract for background audio, instant toggle-off, or crossfade switching.

## What Changes

- Add a dedicated audio playback engine capability centered on a module-lifetime `AudioService` singleton built on `expo-av`.
- Require the service to configure background playback and silent-mode bypass during one-time initialization at app startup.
- Require `AudioService.play(soundId, localUri)` to auto-play immediately, toggle the active sound off with an instant stop, and crossfade when switching to a different sound.
- Require the service to loop active sounds continuously, expose an explicit `stop()` API for instant playback termination, and provide `fadeOut(durationMs)` for later timer-driven fade-then-stop behavior.

## Capabilities

### New Capabilities

- `audio-playback-engine`: Defines the singleton playback service contract for one-time audio session initialization, immediate play, background playback continuity, looping, `fadeOut(durationMs)`, crossfade switching, and explicit stop behavior.

### Modified Capabilities

None.

## Impact

- Affected files: `src/services/AudioService.ts`, `app/_layout.tsx`, and new OpenSpec artifacts under `openspec/changes/build-audio-service-singleton/`
- Affected systems: `expo-av` player lifecycle management, app-wide audio session configuration, background playback behavior, and future timer/player UI integrations that depend on `AudioService`
- Dependencies: existing Expo development-build foundation, `UIBackgroundModes` already configured in `app.json`, and `expo-av` as the playback library for this phase
