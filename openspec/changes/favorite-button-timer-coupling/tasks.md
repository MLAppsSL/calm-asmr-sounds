## 1. Favorite Toggle UI

- [x] 1.1 Create `src/favorites/ui/components/FavoriteButton.tsx` with scoped favorites-store selection, direct toggle action access, and the heart scale animation.
- [x] 1.2 Integrate `FavoriteButton` into `src/library/ui/components/SoundCard.tsx` with placement that does not obscure existing card text or badges.
- [x] 1.3 Integrate `FavoriteButton` into `app/player.tsx` so the player controls reflect and toggle the current sound's favorite state.

## 2. Timer Default Synchronization

- [x] 2.1 Inspect the current player and audio store timer APIs, then add player-focus logic that pre-fills the timer from `uiStore.defaultTimerDuration` only when playback is not already active.
- [x] 2.2 Update the player timer change handler so every timer selection writes to both the active audio timer state and `uiStore.setDefaultTimerDuration`.
- [x] 2.3 Update `app/(tabs)/settings.tsx` so the existing timer selector reflects `uiStore.defaultTimerDuration` and writes both the audio timer state and `uiStore.setDefaultTimerDuration` on change.

## 3. Verification

- [x] 3.1 Run the TypeScript verification for the touched files.
- [x] 3.2 Confirm `src/favorites/ui/components/FavoriteButton.tsx` uses a selector scoped to `isFavorite(soundId)` and calls `useFavoritesStore.getState().toggleFavorite(soundId)` directly.
- [x] 3.3 Confirm `src/favorites/ui/components/FavoriteButton.tsx` uses the approved `MaterialIcons` favorite icons and a scale-pop animation sequence.
- [x] 3.4 Confirm `src/library/ui/components/SoundCard.tsx` and `app/player.tsx` both render `FavoriteButton`.
- [x] 3.5 Confirm `app/player.tsx` includes the player-focus timer pre-fill hook and writes timer changes to both the audio timer state and `uiStore.setDefaultTimerDuration`.
- [x] 3.6 Confirm `app/(tabs)/settings.tsx` derives its selected timer value from `uiStore.defaultTimerDuration` and writes timer changes to both stores.
