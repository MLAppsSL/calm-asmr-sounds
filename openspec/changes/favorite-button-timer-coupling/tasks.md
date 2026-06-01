## 1. Favorite Toggle UI

- [ ] 1.1 Create `src/components/FavoriteButton.tsx` with scoped favorites-store selection, direct toggle action access, and the heart scale animation.
- [ ] 1.2 Integrate `FavoriteButton` into `src/components/SoundCard.tsx` with placement that does not obscure existing card text or badges.
- [ ] 1.3 Integrate `FavoriteButton` into `app/player.tsx` so the player controls reflect and toggle the current sound's favorite state.

## 2. Timer Default Synchronization

- [ ] 2.1 Inspect the current player and audio store timer APIs, then add player-focus logic that pre-fills the timer from `uiStore.defaultTimerDuration` only when playback is not already active.
- [ ] 2.2 Update the player timer change handler so every timer selection writes to both the active audio timer state and `uiStore.setDefaultTimerDuration`.

## 3. Verification

- [ ] 3.1 Run the TypeScript verification for the touched files.
- [ ] 3.2 Confirm `src/components/FavoriteButton.tsx` uses a selector scoped to `isFavorite(soundId)` and calls `useFavoritesStore.getState().toggleFavorite(soundId)` directly.
- [ ] 3.3 Confirm `src/components/FavoriteButton.tsx` uses the approved `MaterialIcons` favorite icons and a scale-pop animation sequence.
- [ ] 3.4 Confirm `src/components/SoundCard.tsx` and `app/player.tsx` both render `FavoriteButton`.
- [ ] 3.5 Confirm `app/player.tsx` includes the player-focus timer pre-fill hook and writes timer changes to both the audio timer state and `uiStore.setDefaultTimerDuration`.
