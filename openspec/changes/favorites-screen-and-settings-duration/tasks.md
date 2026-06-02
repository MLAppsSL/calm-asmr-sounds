## 1. Audit Current Phase 4 Surfaces

- [x] 1.1 Audit `app/(tabs)/favorites.tsx`, `app/(tabs)/settings.tsx`, `src/library/data/sounds.ts`, and the relevant stores to confirm the real integration points and note any divergence from the plan's older paths.
- [x] 1.2 Confirm the Expo Router path needed for the empty-state `Explore Sounds` CTA to land on the Library tab in one tap.
- [x] 1.3 Record in implementation notes that the current branch already appears to satisfy the planned Settings timer wiring so this slice treats Settings as preserve-and-verify work unless the audit finds a spec gap.

## 2. Build the Favorites Tab

- [x] 2.1 Replace the Favorites placeholder route in `app/(tabs)/favorites.tsx` with a hydrated favorites list that reads `getSortedFavorites()`, waits for `_hasHydrated`, and resolves favorite IDs against the library sound manifest.
- [x] 2.2 Add `src/favorites/ui/components/EmptyFavoritesState.tsx` with the illustrated empty-state content and wire it into the Favorites route as the empty-list fallback.
- [x] 2.3 Ensure the Favorites route renders saved sounds in most-recently-added-first order, shows a saved-count summary above the list when favorites exist, and skips stale favorite IDs safely.
- [x] 2.4 Use list wiring that keeps the empty state centered and user-visible, including the `ListEmptyComponent` path and the content-container behavior needed for full-height empty rendering.

## 3. Preserve Settings Timer Preferences

- [x] 3.1 Audit the current Settings session-duration control against the new spec and keep the existing `uiStore.defaultTimerDuration` plus shared audio-timer synchronization if it already matches.
- [x] 3.2 Make only the targeted Settings changes needed to satisfy the timer-preference spec without regressing the existing dark-mode toggle or unrelated rows.

## 4. Verify and Close the Slice

- [x] 4.1 Run `npx tsc --noEmit` and the targeted static checks for the hydration guard in `app/(tabs)/favorites.tsx`, `ListEmptyComponent` wiring, `defaultTimerDuration` plus `setDefaultTimerDuration` usage in `app/(tabs)/settings.tsx`, `FavoriteButton` presence on cards and player, and absence of legacy `favoriteIds` runtime usage outside the persisted-state migration compatibility path.
- [ ] 4.2 Perform a human verification pass on device or simulator covering library-card favorite toggles, player favorite toggles, Favorites ordering, saved-count visibility, persistence across restart without empty-state flash, empty-state CTA navigation, Settings timer persistence, player timer coupling, and dark-mode behavior.
- [ ] 4.3 Document the Phase 4 implementation outcome in `.planning/phases/04-favorites/04-03-SUMMARY.md` after verification is approved.
