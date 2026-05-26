## 1. Player Feature Structure And Metadata

- [ ] 1.1 Create the `src/player/ui/components/` slice for `VideoBackground`, `CircularProgressArc`, and `BottomControlPill` so the player UI follows the repository's feature-first structure.
- [ ] 1.2 Add the player-facing metadata lookup needed by `app/player.tsx` to resolve the active sound from `soundId` route params first, then `useAudioStore().currentSoundId` as fallback, and map it to the existing library manifest.
- [ ] 1.3 Add the minimal unavailable player state used when neither route params nor shared playback state resolve to a valid sound.

## 2. Ambient Video And Reusable Controls

- [ ] 2.1 Implement `VideoBackground` with `expo-video` muted looping playback and `useFocusEffect` cleanup that pauses the player on blur or unmount.
- [ ] 2.2 Implement `CircularProgressArc` with the SVG progress ring, centered play or pause button, and timer label using the presentation-first progress contract from the spec and shared play or pause state wiring.
- [ ] 2.3 Implement `BottomControlPill` with the frosted container, functional loop and fullscreen callbacks, explicit no-op AirPlay and favorite actions, and loop active-state presentation.

## 3. Player Route Composition And Fullscreen Behavior

- [ ] 3.1 Replace the placeholder in `app/player.tsx` with the real player composition using the resolved active sound metadata, `background_video/forest.mp4` as the Phase `03-02` ambient placeholder, top bar, center progress control, and bottom control pill.
- [ ] 3.2 Add route-local fullscreen state in `app/player.tsx` so entering fullscreen hides the status bar and player chrome, activates keep-awake, and tapping the immersive surface restores the controls.
- [ ] 3.3 Ensure player route cleanup restores status bar visibility, releases keep-awake, and leaves the route without ambient video playback continuing in the background.
- [ ] 3.4 Wire the player's loop and play or pause interactions to the existing shared audio store contract without expanding scope into AirPlay or favorites behavior.

## 4. Validation

- [ ] 4.1 Run the relevant project checks after the player work lands and fix any type, lint, or formatting regressions introduced by this slice.
- [ ] 4.2 Manually review the implementation against the `player-fullscreen-ui` requirements for param-first sound resolution, invalid-sound fallback behavior, muted looping video, center control presentation, frosted bottom controls, fullscreen hide and restore behavior, loop-state wiring, and player cleanup on navigation away.
- [ ] 4.3 Create the Phase `03-02` summary artifact after implementation using the project planning summary format.
