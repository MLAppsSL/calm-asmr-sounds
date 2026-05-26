## Context

Phase `03-01` already established the library shell, the four-tab navigation contract, and the route handoff into `app/player.tsx`, but the player route is still a placeholder. The Phase `03-02` plan expects the player to become the app's main immersive experience with a looping ambient video, a centered progress/play control, a frosted control pill, and a fullscreen mode that hides all chrome.

The source plan still references legacy top-level `src/components/` paths. The repository has since standardized on feature-first placement, with feature UI colocated under a dedicated slice and cross-feature concerns left in `src/shared/`. This change needs an explicit placement decision so the player UI does not reintroduce the older flat structure.

This slice also sits at the intersection of several runtime concerns already present in the repo: Expo Router route ownership, the Phase 2 audio store contract, `expo-video` lifecycle quirks on iOS, and fullscreen behavior that combines status-bar visibility with keep-awake state. Those boundaries make a design artifact useful before implementation.

## Goals / Non-Goals

**Goals:**

- Replace the placeholder player route with the real fullscreen-capable Phase `03-02` player surface.
- Add reusable player UI components for the ambient video background, circular progress arc, and frosted bottom controls.
- Keep the player visually driven by current sound metadata and category context already available in shared or library state.
- Ensure fullscreen mode hides screen chrome, keeps the display awake, and restores controls with a single tap.
- Prevent `expo-video` background playback leaks when the user leaves the player route.

**Non-Goals:**

- Wire real countdown animation or timer depletion into the progress arc beyond the static or derived progress surface needed for this slice.
- Add new navigation routes, premium gating flows, AirPlay behavior, or settings logic.
- Introduce a new persisted store contract for fullscreen state; fullscreen remains route-local behavior in this slice.
- Solve per-category ambient video asset completeness beyond the currently available local placeholder assets.

## Decisions

### Place player UI under `src/player/ui/components/` and keep `app/player.tsx` as the composition boundary

The implementation should create a `src/player/` feature slice and place the reusable UI pieces at:

- `src/player/ui/components/VideoBackground.tsx`
- `src/player/ui/components/CircularProgressArc.tsx`
- `src/player/ui/components/BottomControlPill.tsx`

`app/player.tsx` remains the route entry point responsible for screen composition, fullscreen state, and route-level interactions.

Rationale: this follows the repository's vertical-slice rule while still allowing the route file to own the screen composition appropriate for a real product surface.

Alternative considered: follow the source plan literally with top-level `src/components/*.tsx` files.
Rejected because it would conflict with the repo's current feature-first structure and make later player-related work harder to extend coherently.

### Use a hybrid active-sound contract with route params first and audio store fallback

The player route should accept `soundId` from Expo Router params as its primary entry contract and fall back to `useAudioStore().currentSoundId` only when the route param is absent. Once the effective sound ID is resolved, the route should look up browse-facing metadata from `src/library/data/sounds.ts` for the title, subtitle, category, and duration label.

Rationale: this preserves the explicit route contract from the source plan while still supporting the shared playback state already used by the library and now-playing flows.

Alternative considered: rely on `useAudioStore().currentSoundId` only.
Rejected because it weakens the navigation contract, makes direct route entry less deterministic, and changed the plan without enough benefit.

### Show an explicit unavailable state when no valid sound can be resolved

If neither the route params nor the audio store produce a valid sound ID in the library manifest, `app/player.tsx` should render a minimal unavailable state with a clear way back to the library instead of silently substituting a different sound.

Rationale: this keeps incorrect fallback content from masking bugs while still preserving a stable user path out of the player.

Alternative considered: silently fall back to the first sound in the manifest.
Rejected because it can display the wrong sound and make navigation bugs harder to detect.

### Keep fullscreen state local to the player route and drive immersive behavior imperatively

`app/player.tsx` should hold local `isFullscreen` state and use that to conditionally render the top bar and bottom pill. Entering fullscreen should call `setStatusBarHidden(true, 'fade')` and `activateKeepAwakeAsync()`. Exiting fullscreen or unmounting should restore the status bar and release keep-awake.

Rationale: fullscreen is ephemeral route UI state, not a durable app preference. Local state keeps ownership clear and avoids expanding shared store contracts unnecessarily.

Alternative considered: add fullscreen state to `uiStore`.
Rejected because the state should not survive route changes or app restarts, and moving it into shared persistence would add coupling without improving the player behavior.

### Wrap `expo-video` in a focused `VideoBackground` component with explicit lifecycle cleanup

The video background component should own the `useVideoPlayer` setup, set `player.loop = true` and `player.muted = true`, and use `useFocusEffect` cleanup to call `player.pause()` when the route blurs or unmounts.

Rationale: the known iOS risk is leaked video playback after navigation, and keeping the lifecycle inside one component makes the requirement easy to verify and reuse.

Alternative considered: initialize the video player directly inside `app/player.tsx`.
Rejected because it would mix media lifecycle code with route-level UI state and make cleanup requirements harder to isolate and test.

### Keep the progress arc contract presentation-first for this slice

`CircularProgressArc` should accept `progress`, `isPlaying`, `timerLabel`, and `onPlayPause` props and render the SVG ring plus the central play/pause control. In this slice, `progress` may stay static or be derived from the current selected timer value without promising a fully wired runtime countdown animation.

Rationale: the plan explicitly allows a static or full progress value in Phase 3 before full audio integration, while still requiring the player shell to look complete.

Alternative considered: fully bind the component to the timer runtime and animate true countdown depletion now.
Rejected because it would pull extra timer-integration work into a UI slice whose main responsibility is the immersive player surface.

### Use `background_video/forest.mp4` for all categories in Phase `03-02`

The player route should use the existing local asset `background_video/forest.mp4` as the ambient background for every category in this slice, without adding category-to-video mapping scaffolding yet.

Rationale: the repository currently has one confirmed video asset, and the source plan explicitly allows that file to act as the placeholder background for all categories in Phase `03-02`.

Alternative considered: add category-aware mapping now even if every category still resolves to the same file.
Rejected because it adds abstraction before the asset set requires it.

### Keep loop and fullscreen functional, while AirPlay and favorite remain explicit shell-only controls

The bottom control pill should wire fullscreen and loop to real callbacks in this slice. Loop should reflect and update the shared loop playback state, while AirPlay and favorite should render as visible controls with intentional no-op handlers until later slices implement those behaviors.

Rationale: this matches the Phase `03-02` scope closely and gives the player one meaningful playback toggle beyond fullscreen without pulling favorites or casting behavior into this change.

Alternative considered: make only fullscreen functional and leave loop visual-only too.
Rejected because it weakens the player contract compared with the plan without a strong scope or architecture reason.

## Risks / Trade-offs

- [The repository only has one ambient video asset today] -> Mitigation: use `background_video/forest.mp4` explicitly for all categories in this slice and defer category-specific mapping until more assets exist.
- [Fullscreen cleanup could leave the status bar hidden or keep-awake active after navigation] -> Mitigation: centralize enter/exit behavior in `app/player.tsx` and restore both in route cleanup as well as explicit exit paths.
- [`expo-video` can leak playback on iOS if cleanup is missed] -> Mitigation: require `player.pause()` inside `useFocusEffect` cleanup in the dedicated video component.
- [Using library-manifest metadata for the player couples browse and player display fields] -> Mitigation: treat the library manifest as the display source only for this slice and defer any broader metadata unification decision to later Phase 3 or Phase 4 work.
- [Hybrid sound resolution can drift if param and store disagree] -> Mitigation: define params as the primary source, use store only as fallback, and show an unavailable state instead of guessing when neither resolves to a valid sound.

## Migration Plan

1. Add the new `player-fullscreen-ui` capability spec that defines the player route behavior, media lifecycle, progress presentation, and fullscreen interaction contract.
2. Replace `app/player.tsx` placeholder rendering with the real player composition.
3. Add the player feature components under `src/player/ui/components/` and wire them into the route.
4. Validate that entering the player from the library shows ambient video and controls, fullscreen hides chrome and restores on tap, loop reflects the shared playback state, invalid sound entry shows the unavailable state, and leaving the player pauses the ambient video.

Rollback strategy: restore `app/player.tsx` to the placeholder screen and remove the new `src/player/` feature slice if the immersive player proves unstable, leaving the Phase `03-01` library shell intact.

## Open Questions

- Whether the player should continue to read display metadata from the library manifest long term or gain its own shared playback-facing metadata boundary in a later slice.
