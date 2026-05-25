## Context

Phase `02-01` is the first execution slice in the audio-engine phase. The repository already has an Expo Router root layout and shared Zustand state, but it does not yet have any playback service that can survive route changes or manage background audio. The reviewed project baseline already uses `expo-av`, so this change should build the engine on that accepted foundation instead of introducing a second audio-library direction.

This change is small in file count but architectural in impact because every later sound-selection, timer, and player-screen flow depends on a single playback authority with predictable lifecycle rules. The plan also carries two platform-sensitive constraints that should be decided before coding: playback must continue when the app backgrounds, and switching sounds must crossfade for exactly 700 ms without leaking old players.

## Goals / Non-Goals

**Goals:**

- Introduce a single `AudioService` instance that can be imported anywhere without being recreated by React navigation or component unmounts.
- Establish one-time audio session initialization for silent-mode bypass and background playback before the first sound plays.
- Define the service contract for immediate play, looped playback, instant toggle-off, `fadeOut(durationMs)`, and 700 ms crossfade when switching sounds.
- Keep the implementation ready for later timer and UI wiring without requiring those later phases to redesign playback lifecycle management.

**Non-Goals:**

- Build the sound catalog, remote URL resolution, or permanent local cache flow from later Phase 2 plans.
- Add player UI, timer countdown logic, lock-screen metadata, or favorites integration.
- Solve gapless-loop file preparation in code; audio asset formatting remains an asset-production concern outside this change.

## Decisions

### Use `expo-av` and keep the engine aligned with the accepted foundation baseline

Implementation should build the new service on `expo-av` rather than introducing a parallel `expo-audio` migration inside this slice.

Rationale: the latest reviewed OpenSpec foundation change selected `expo-av` for the SDK and the repository already depends on it today. Keeping Phase `02-01` on that same library avoids silently overriding the accepted baseline while still supporting the singleton lifecycle, background playback setup, looping, crossfade, and fade-out contract this slice needs.

Alternative considered: switch this slice to `expo-audio` because earlier pre-build planning preferred it.
Rejected because those earlier plans predate the reviewed OpenSpec foundation decision. Changing libraries now would create a cross-spec conflict and expand this slice from audio-engine implementation into audio-library migration.

### Keep `AudioService` as a module-lifetime singleton class in `src/shared/data/services/AudioService.ts`

The change should export one shared `AudioService` instance from `src/shared/data/services/AudioService.ts`, backed by private mutable player state instead of a React hook or a factory that creates per-screen players.

Rationale: background audio and navigation-stable playback require a lifecycle that is independent from route mounts. A class instance also keeps crossfade timers, active player references, and current sound identity in one place. Placing the service under `src/shared/data/services/` also keeps the implementation aligned with the repository's vertical-slice rule for shared application code instead of introducing a new top-level `src/services/` folder.

Alternative considered: build playback directly inside the player screen with route-local `expo-av` sound instances.
Rejected because that lifecycle is tied to React rendering and would make playback teardown too easy to trigger accidentally during navigation.

### Initialize the audio session once from `app/_layout.tsx`

The root layout should call `AudioService.initialize()` once on mount so the one-time `expo-av` audio mode setup runs before any playback request and is not repeated on every sound tap.

Rationale: audio session configuration is app-level policy, not per-sound behavior. Root initialization keeps the behavior deterministic and matches the phase requirement that background audio works no matter which screen starts playback later.

Alternative considered: call `initialize()` lazily inside `play()`.
Rejected because it mixes setup with action execution, complicates failure handling, and makes first-play timing less predictable.

### Model switching as a temporary two-player crossfade with explicit cleanup

When a new sound is selected while another one is active, the service should create a second playback instance for the incoming sound, start it at low volume, fade the old sound down while fading the new one up for 700 ms, then unload the outgoing sound instance and clear any crossfade bookkeeping.

Rationale: a true crossfade requires overlap between outgoing and incoming playback. Explicit cleanup is required because the plan and research both call out leaked players as a concrete risk.

Alternative considered: stop the old player first and then start the new one.
Rejected because it would create an audible cut instead of the locked crossfade behavior.

### Keep stop behavior explicit and immediate

`AudioService.stop()` should cancel any in-flight crossfade timing, unload the active `expo-av` sound instance immediately, and clear the active sound identity. Calling `play()` with the currently active `soundId` should route through that same immediate-stop behavior.

Rationale: the plan locks manual stop and toggle-off to an instant cut with no fade. Using the same stop path for both behaviors reduces branching and makes later timer-driven fade-out logic separate by design.

Alternative considered: reuse the crossfade fade-out path for manual stop.
Rejected because it would violate the locked interaction rule and blur the distinction between explicit stop and timed fade-out.

### Include a reusable `fadeOut(durationMs)` path for timer-owned stop flows

The service should expose `fadeOut(durationMs)` that reduces the active player's volume to zero over the requested duration without implicitly clearing playback state or removing the player. Later timer logic can call `fadeOut(...)` first and then `stop()` once the fade completes.

Rationale: the original Phase `02-01` plan includes timer-oriented fade support in the engine slice so Phase `02-03` can build timer expiry on top of the same playback authority instead of inventing a second fade utility elsewhere.

Alternative considered: defer all fade-out support to the later timer service change.
Rejected because that would silently narrow the existing service contract from the original plan and force later timer work to either expand this API retroactively or duplicate volume-animation behavior outside the playback engine.

### Keep store integration out of this first engine slice

The service should own its internal playback state directly and only expose the minimum public API needed for this slice, leaving Zustand synchronization to later plans when timer and UI wiring are introduced.

Rationale: Phase `02-01` is about establishing the engine contract, not the full app state contract. Avoiding early store coupling keeps this slice smaller and reduces the chance of encoding Phase `02-03` decisions too soon.

Alternative considered: mutate the audio store directly from the service in this change.
Rejected because the current plan only commits to the playback engine, and store shape changes are scheduled in a later plan.

## Risks / Trade-offs

- [Crossfade overlap depends on platform audio focus behavior] -> Mitigation: temporarily use mixing-compatible audio mode during the fade window, then restore the default non-mixing mode after cleanup.
- [First-play failures could surface from invalid local URIs or session setup errors] -> Mitigation: keep initialization and playback as explicit async boundaries so later UI layers can handle rejections cleanly.
- [The repository currently references a different store path than the planning notes] -> Mitigation: scope this change to the service contract and root initialization only, leaving store reshaping to its dedicated follow-up plan.
- [Repeated root-layout mounts in development could call initialization more than intended] -> Mitigation: make `initialize()` idempotent inside the service so remounts do not create inconsistent session state.

## Migration Plan

1. Confirm the existing `expo-av` dependency and build the playback engine on that baseline without introducing a second audio library.
2. Create `src/shared/data/services/AudioService.ts` with singleton lifecycle, one-time initialization, play, `fadeOut(durationMs)`, stop, and crossfade behavior.
3. Update `app/_layout.tsx` to call `AudioService.initialize()` once at app startup.
4. Run local lint and targeted verification for the new service module.
5. Leave timer integration, sound caching, and device verification for the next Phase 2 slices that already own those responsibilities, while preserving the timer-facing `fadeOut(durationMs)` hook in the engine API.

Rollback strategy: revert the new service module and root-layout initialization if playback setup proves unstable, while keeping the rest of the navigation and store scaffold intact.

## Open Questions

- None.
