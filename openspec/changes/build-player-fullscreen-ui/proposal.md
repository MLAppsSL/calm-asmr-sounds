## Why

Phase `03-01` delivered the library shell and the route path into `/player`, but the app still lacks the main experience users stay on after choosing a sound. Without the immersive player surface, Phase 3 is missing the core visual moment promised by the product: ambient video, calm playback controls, and a true fullscreen mode that removes distraction.

## What Changes

- Add the full Phase `03-02` player screen at `app/player.tsx` with a looping muted ambient video background, top metadata bar, circular progress/play control, and frosted bottom control pill.
- Add reusable player UI components for the video background, circular progress arc, and bottom control pill so the player route stays focused on screen composition and fullscreen behavior.
- Implement fullscreen immersive mode that hides UI chrome, hides the status bar, keeps the device awake, and restores controls when the user taps the screen.
- Preserve safe media lifecycle behavior so navigating away from the player stops the ambient video and avoids leaked playback from `expo-video`.

## Capabilities

### New Capabilities

- `player-fullscreen-ui`: Covers the fullscreen player route, looping muted ambient background video, centered playback progress presentation, frosted bottom controls, and immersive fullscreen toggle behavior.

### Modified Capabilities

None.

## Impact

- Affected code: `app/player.tsx` and new player UI components under `src/player/ui/components/` for video background, progress arc, and bottom controls.
- Affected systems: Expo Router player route composition, `expo-video` playback lifecycle, `expo-status-bar` visibility, `expo-keep-awake` fullscreen behavior, and audio-store-driven play/pause presentation.
- Dependencies: existing Phase `03-01` library-to-player navigation, current Phase 2 audio store contract, ambient video assets in `background_video/`, and installed UI/runtime libraries including `expo-video`, `expo-blur`, `react-native-svg`, and `react-native-reanimated`.
