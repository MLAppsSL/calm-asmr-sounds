## 1. Favorite Toggle UI

- [ ] 1.1 Create `src/components/FavoriteButton.tsx` with scoped favorites-store selection, direct toggle action access, and the heart scale animation.
- [ ] 1.2 Integrate `FavoriteButton` into `src/components/SoundCard.tsx` with placement that does not obscure existing card text or badges.
- [ ] 1.3 Integrate `FavoriteButton` into `app/player.tsx` so the player controls reflect and toggle the current sound's favorite state.

## 2. Timer Default Synchronization

- [ ] 2.1 Inspect the current player and audio store timer APIs, then add player-focus logic that pre-fills the timer from `uiStore.defaultTimerDuration` only when playback is not already active.
- [ ] 2.2 Update the player timer change handler so every timer selection writes to both the active audio timer state and `uiStore.setDefaultTimerDuration`.

## 3. Verification

- [ ] 3.1 Run the TypeScript verification for the touched files and confirm the new favorite button usage and timer-sync hooks are present in the library card and player surfaces.
