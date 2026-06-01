## Why

Phase 4 already introduced persisted favorites data and a saved default timer, but the user-facing controls that expose those behaviors are still missing. This change closes that gap so users can favorite sounds directly from the library and player, and so timer choices reliably carry forward into the next playback session.

## What Changes

- Add a reusable `FavoriteButton` UI component with immediate toggle feedback and a gentle scale animation.
- Add favorite affordances to library sound cards and the player controls so the current sound can be favorited from either surface.
- Pre-fill the player timer from the saved default when the player gains focus and no session is already playing.
- Persist player timer changes back into the saved default preference so future sessions reuse the latest chosen duration.

## Capabilities

### New Capabilities

- `favorites-toggle-ui`: Users can view and toggle favorite state for a sound from both the library and player surfaces, with state reflected correctly on re-render.
- `default-timer-sync`: The player initializes its timer from the saved default for new sessions, and timer changes made in the player become the new saved default.

### Modified Capabilities

- None.

## Impact

- Affected code: `src/components/FavoriteButton.tsx`, `src/components/SoundCard.tsx`, `app/player.tsx`, and the existing favorites and UI stores they consume.
- Dependencies: existing Zustand stores, `@expo/vector-icons`, `react-native-reanimated`, and Expo Router focus hooks already used by the app shell.
- User impact: favorites become directly accessible from core playback surfaces, and timer behavior becomes consistent across sessions without requiring a separate settings step.
