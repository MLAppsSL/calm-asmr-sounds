## Context

Phase 4 already established the underlying favorites and UI preference state, but the current Favorites tab is still a placeholder route and the phase-completion behavior has not been captured in mainline OpenSpec artifacts. The current codebase uses vertical-slice paths: favorites state lives in `src/favorites/domain/stores/favoritesStore.ts`, library sound metadata lives in `src/library/data/sounds.ts`, the reusable card UI lives in `src/library/ui/components/SoundCard.tsx`, and the Settings route already consumes `uiStore.defaultTimerDuration` through `src/shared/domain/timerOptions.ts`.

The primary implementation gap is the Favorites tab. The Settings timer control is already wired in code on this branch, but this change still needs to preserve that behavior, bring it under spec coverage, and include it in Phase 4 verification so the phase can be completed without regressing timer or theme behavior. This is a deliberate branch-state deviation from the original plan, which assumed the Settings timer wiring still needed to be implemented in this slice.

## Goals / Non-Goals

**Goals:**

- Replace `app/(tabs)/favorites.tsx` with a real Favorites route backed by the persisted favorites store.
- Add an illustrated empty state component in the favorites slice and provide a one-tap path back to the Library tab.
- Reuse the existing library sound manifest and `SoundCard` UI so the Favorites route stays consistent with the rest of the app.
- Preserve the user-visible Favorites contract from the plan, including the saved-count summary and the list behavior needed for an empty-state-centered layout.
- Preserve and verify the persisted Settings session-duration behavior, including its shared-store synchronization.
- Capture the required human verification steps for closing Phase 4.

**Non-Goals:**

- Changing the favorites persistence model, migration behavior, or sync architecture.
- Redesigning `SoundCard`, the timer runtime, or the Settings visual system beyond targeted timer-preference adjustments.
- Adding auth, cloud sync, premium upsells, or any Phase 5/6 entry points.

## Decisions

### Implement the Favorites route on top of the existing favorites-store hydration contract

The route will read `_hasHydrated` and `getSortedFavorites()` from `useFavoritesStore` and render nothing until hydration completes. This matches the store contract already present in the favorites slice and avoids the known cold-start flash where an empty state appears briefly before persisted favorites load.

Alternative considered: render a loading indicator or shimmer before hydration. Rejected because the current startup window is expected to be short, and Phase 4 explicitly prefers no visible loading treatment over a transient but misleading empty state.

### Join saved favorites against the library manifest and skip stale IDs safely

The Favorites route will resolve each saved favorite ID against `src/library/data/sounds.ts` and pass the resulting `LibrarySound` objects into the existing `SoundCard` component. Missing manifest entries will be filtered out rather than treated as fatal. This keeps one canonical display-data source and prevents the favorites slice from forking its own sound metadata model.

Alternative considered: duplicate sound display fields into the favorites store. Rejected because it would couple persisted favorites to presentation data, increase migration surface, and create multiple sources of truth for the same sound metadata.

### Preserve the planned Favorites list affordances rather than shipping a minimal list

The Favorites route will keep the plan's visible affordances by showing a saved-count summary when favorites exist and by using a list setup that supports `ListEmptyComponent` plus centered empty-state layout. This keeps the OpenSpec contract aligned with the planned Phase 4 screen instead of allowing an underspecified generic list.

Alternative considered: specify only recency ordering and leave count and empty-state layout details to implementation. Rejected because the source plan treats those behaviors as part of the visible acceptance contract.

### Place the empty-state component inside the favorites slice

The empty-state UI will live under `src/favorites/ui/components/EmptyFavoritesState.tsx` instead of a top-level shared components folder. This follows the repo's vertical-slice rule and keeps Favorites-specific presentation with the rest of the favorites feature.

Alternative considered: add the component to a generic shared components directory. Rejected because the UI is specific to the Favorites tab and has no demonstrated reuse outside that feature.

### Preserve the current Settings timer mapping pattern and audit before editing

The current Settings route already maps between `uiStore.defaultTimerDuration` and the audio timer duration by using `TIMER_DURATION_OPTIONS`, `timerDurationMsFromSeconds`, and `timerDurationSecondsFromMs`. Implementation work for this change should begin with an audit of that route and only make code changes if the current behavior diverges from the new spec. This avoids unnecessary churn in a screen that already appears to satisfy the planned Phase 4 timer behavior, while explicitly recording that the original plan expected this work to land in the current slice.

Alternative considered: rewrite the Settings segmented control around a new abstraction. Rejected because the current mapping utilities already encode the required conversion rules and a rewrite would add risk without solving a demonstrated problem.

### Treat the plan's detailed verification checklist as a first-class completion gate

Because the feature spans persisted local state, tab navigation, and cross-screen preference behavior, the task list will include the plan's concrete static checks plus a blocking human-verification pass after code work. The verification will cover favorites ordering, saved-count visibility, no-hydration-flash behavior, empty-state navigation, timer-preference persistence, player coupling, and dark-mode regression checks.

Alternative considered: rely only on static verification. Rejected because the highest-risk failures in this slice are runtime and navigation behaviors that TypeScript and linting cannot prove.

## Risks / Trade-offs

- [Favorites route could flash incorrect empty content on cold start] -> Mitigation: gate user-visible rendering on `favoritesStore._hasHydrated` and verify the behavior during a cold-launch device check.
- [Saved favorite IDs could outlive manifest entries] -> Mitigation: resolve against `SOUNDS` defensively and filter missing entries before rendering cards.
- [Settings work could duplicate or destabilize behavior that already exists] -> Mitigation: audit `app/(tabs)/settings.tsx` first and restrict edits to cases where current behavior diverges from the new spec.
- [Expo Router tab navigation from the empty-state CTA may vary by path form] -> Mitigation: verify the target tab path used by the current router setup during implementation and confirm it in the device check.

## Migration Plan

No data migration is required. The change consumes the already-persisted favorites and UI-store contracts. Rollback is limited to restoring the Favorites placeholder route and removing any new favorites-slice UI component or targeted Settings adjustments if runtime issues are found.

## Open Questions

- Which exact Expo Router path form should the empty-state CTA use to land on the Library tab in this app's current tab configuration: `/`, `/(tabs)`, or a named tab route?
- Should the Favorites route reuse the existing card spacing as-is, or add a Favorites-specific list wrapper for full-width vertical presentation while still rendering the same `SoundCard` component?
