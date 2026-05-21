## Context

Phase `02-03` is the slice that wires playback, caching, timer state, and startup behavior into one runnable audio engine. The branch already has a shared `AudioService`, and the prior planning slice defines a sound catalog plus cache service, but the app still lacks the timer runtime that makes countdowns survive background transitions, stop audio with a fade, and expose a real verification path on devices.

The source phase plan still references older top-level `src/services/` and `src/stores/` paths, while the repository now organizes shared code under `src/shared/` and then by `data`, `domain`, and `ui`. This change therefore needs explicit placement decisions before implementation, especially because it touches a shared service, a shared store, root startup wiring, and a temporary route-level harness.

This slice also depends on the `02-02` catalog/cache work being available in code, because the temporary harness uses `SOUNDS` and `SoundCacheService` directly. Until that prior slice is implemented on the working branch, `02-03` should be treated as planned but not executable end to end.

## Goals / Non-Goals

**Goals:**

- Add a shared timer runtime that uses timestamp math instead of interval counting so timer countdowns stay accurate after foreground/background transitions.
- Expand the shared audio store with the minimum timer timestamp fields and actions needed by the timer runtime while preserving the existing store baseline.
- Ensure app startup initializes audio mode and registers timer AppState correction exactly once.
- Provide a temporary route-level harness that exercises playback, timer start/stop, crossfade, and short countdown verification on device.
- Preserve the locked timer behaviors from the phase plan: gentle fade then stop at zero, timer reset on sound switch, and immediate effect when timer duration changes mid-session.

**Non-Goals:**

- Build the final Phase 3 library/player UI or long-term visual design for the audio experience.
- Replace the current playback engine contract or redesign the sound catalog/cache service boundary from the prior slices.
- Add lock-screen metadata, notifications, analytics instrumentation, or persistence beyond the in-memory shared store already present.

## Decisions

### Keep timer runtime code under shared data/services and shared domain/stores

Following the vertical-slice rule, implementation should place the timer singleton at `src/shared/data/services/TimerService.ts` and update `src/shared/domain/stores/audioStore.ts` rather than creating new top-level `src/services/` or `src/stores/` files.

Rationale: both timer coordination and audio timer state are shared engine concerns used across screens. This keeps the slice aligned with the existing `AudioService` and the repo's shared layering rules.

Alternative considered: follow the source phase-plan paths exactly under top-level `src/services/` and `src/stores/`.
Rejected because those paths no longer match the repository structure already used by shared services and stores.

### Use timestamp math as the timer source of truth

The timer runtime should treat `timerStartedAt` and `timerDurationMs` in the audio store as the source of truth and compute remaining time from `Date.now() - timerStartedAt`, using the interval only as a periodic trigger to recalculate.

Within that model, the legacy `timerSeconds` field should remain a UI-facing selected/default timer value preserved for compatibility with earlier scaffolding, not the authoritative countdown state. Countdown correctness should come from `timerStartedAt` plus `timerDurationMs`.

Rationale: JavaScript intervals pause in the background on iOS, so counting ticks directly would drift. Timestamp math preserves correctness across backgrounding without adding extra native timer dependencies.

Alternative considered: store remaining time only and decrement it each second.
Rejected because that model drifts when the app backgrounds and would violate the phase's locked timer accuracy requirement.

### Keep timer options locked in the store contract while allowing a dev-only harness bypass

The shared store should expose `timerDurationMs` as the production union `60000 | 120000 | 180000`, and its timer actions should work against that contract. The temporary harness may still use a local `10_000 as any` bypass solely for fast verification of timer expiry.

Rationale: the product contract is fixed at 1, 2, or 3 minutes, but the human verification loop benefits from a fast countdown that does not weaken the production store API.

Alternative considered: widen the production store type to any number for convenience.
Rejected because that would silently loosen a locked product constraint just to support a temporary harness.

### Make TimerService responsible for AppState recovery and fade-then-stop expiry behavior

`TimerService` should own the interval, the AppState listener, and the timer-expiry path that calls `AudioService.fadeOut(1500)` and then `AudioService.stop()`. It should also guard against duplicate expiry handling during an in-flight fade.

Rationale: keeping these responsibilities inside one shared singleton prevents duplicate timer logic from leaking into screens or the store and keeps the fade-then-stop contract enforceable in one place.

Alternative considered: put AppState handling in the root layout or keep expiry logic inside components.
Rejected because that would spread runtime timer concerns across unrelated layers and make behavior harder to reason about.

### Keep timer reset on sound switch as an explicit shared contract

Switching to a different sound should reset the active timer back to the currently selected duration by calling the store's `resetTimer()` behavior rather than continuing from the old elapsed time.

Rationale: this is a locked product rule in the source phase plan, and later UI slices need to rely on it explicitly instead of inferring it from general timer actions.

Alternative considered: let the timer continue counting across sound switches.
Rejected because that would violate the locked behavior for this phase.

### Treat the root layout as startup wiring only

`app/_layout.tsx` should continue to own one-time startup initialization, calling `AudioService.initialize()` and `TimerService.initAppStateListener()` in one effect while preserving the existing route stack configuration exactly.

Rationale: startup audio policy and global AppState listener registration are application-lifetime concerns, not screen concerns.

Alternative considered: lazily initialize the timer listener from the first screen that needs it.
Rejected because the timer contract is app-wide and should not depend on a particular route mounting first.

### Keep the temporary harness under the route file and separate from reusable UI

The verification harness should replace `app/(tabs)/index.tsx` directly for this slice rather than introducing new reusable components in shared UI. It is a temporary execution tool, not a long-lived design-system surface.

Rationale: the phase plan explicitly treats this screen as a temporary test harness that will be replaced in Phase 3. Keeping it route-local reduces cleanup cost later.

Alternative considered: build the harness as a reusable shared view.
Rejected because that would over-invest in temporary scaffolding and blur the line between verification code and product UI.

## Risks / Trade-offs

- [Timer runtime depends on not-yet-implemented sound catalog/cache code] -> Mitigation: document the dependency explicitly and keep the timer slice focused on store/runtime wiring so it can integrate cleanly once `02-02` lands.
- [Temporary harness introduces dev-only behavior such as a 10-second timer bypass] -> Mitigation: keep the bypass route-local and avoid widening production store types or service APIs to support it.
- [AppState listener leaks or duplicates could create multiple timer corrections] -> Mitigation: make listener registration idempotent inside `TimerService` and unregister on cleanup from the root layout effect.
- [Timer expiry could double-trigger during async fade handling] -> Mitigation: keep an internal fade-in-progress guard and clear interval state before starting the fade.

## Migration Plan

1. Add a new `audio-timer-runtime` capability spec for the timer service, startup wiring, and temporary harness behavior.
2. Modify the existing `state-store-contracts` spec so the audio store contract includes timer timestamp fields and timer control actions while preserving prior defaults and store structure.
3. Implement `TimerService` under `src/shared/data/services/` and augment `src/shared/domain/stores/audioStore.ts` with the timer runtime fields/actions.
4. Update `app/_layout.tsx` and `app/(tabs)/index.tsx` to wire startup initialization and the temporary verification harness.
5. Run project checks and complete the planned human verification pass on real devices before considering the slice complete.

Rollback strategy: remove the temporary harness and timer runtime changes if the behavior proves unstable, while leaving the lower-level playback and cache slices intact.

## Open Questions

- None.
