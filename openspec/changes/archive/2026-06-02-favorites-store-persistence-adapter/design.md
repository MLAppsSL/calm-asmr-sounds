## Context

The current repo still uses the Phase 1 favorites scaffold in `src/shared/domain/stores/favoritesStore.ts`: an in-memory `favoriteIds: string[]` contract with separate `addFavorite` and `removeFavorite` actions and no persistence. The current UI store in `src/shared/domain/stores/uiStore.ts` already persists dark mode and onboarding state, but it still hardcodes dark mode to `true` on first install and does not persist a default timer preference.

Phase `04-01` is the data-layer prerequisite for the rest of the favorites work. The next favorites UI slices need durable favorites state that survives app restarts and preserves add order, while Phase 5 needs a service boundary that can later swap a local implementation for a cloud-backed adapter without changing higher-level migration flow. The source planning file uses older `src/stores` and `src/types` paths, and the repo's slice rule requires feature-first placement, so this change should establish a dedicated `src/favorites/` slice instead of extending `shared/` for favorites-only code.

## Goals / Non-Goals

**Goals:**

- Create a dedicated favorites slice and replace the scaffold favorites contract with a persisted `Favorite[]` model that carries `addedAt` metadata and a hydration-ready signal.
- Keep the favorites API small by exposing `toggleFavorite`, `isFavorite`, `setFavorites`, and sorted reads from the store.
- Extend the persisted UI store with `defaultTimerDuration` and a system dark-mode fallback for first install.
- Add a local favorites adapter with fully async-compatible methods so Phase 5 can add a cloud adapter against the same surface.
- Update the OpenSpec store contract so the breaking favorites change and the UI preference additions are explicit and testable.

**Non-Goals:**

- Build the favorites UI screens or tabs that consume this data layer.
- Implement cloud sync, signed-in favorites ownership, or Firestore migration logic.
- Redesign unrelated audio, auth, onboarding, or player store contracts.
- Introduce direct AsyncStorage access in the adapter layer or a second persistence path outside the store.
- Perform a broad repo-wide cleanup of historical shared-type/spec mismatches beyond what this slice needs.

## Decisions

### Store favorites as persisted `Favorite[]` records with timestamps

The favorites store will change from `favoriteIds: string[]` to `favorites: Favorite[]`, where each item includes `id` and `addedAt`. The store will persist only the `favorites` array through Zustand `persist` and `createJSONStorage`, while `_hasHydrated` remains session-only state set by `onRehydrateStorage`. If persisted local data already exists in the old `string[]` format, the store should migrate it into `Favorite[]` records during rehydration rather than silently dropping it.

Rationale: the UI needs durable favorites across restarts, and Phase 5 migration needs more than a bare ID list so it can preserve add order and migration semantics. Keeping `_hasHydrated` out of persisted state matches the existing UI-store hydration pattern and avoids restoring bookkeeping as though it were user data. Adding a migration avoids turning this breaking API change into avoidable local user-data loss.

Alternative considered: keep `string[]` IDs and derive ordering elsewhere.
Rejected because it would leave the Phase 4 data layer unable to express add timestamps and would force a second migration later.

Alternative considered: treat the persisted store change as a local-state reset.
Rejected because it would discard existing local favorites when the old format can be migrated deterministically.

### Replace add/remove store actions with toggle semantics and let the adapter expose directional writes

The store surface will expose `toggleFavorite(id)` instead of separate `addFavorite` and `removeFavorite` methods, plus `isFavorite`, `setFavorites(Favorite[])`, and `getSortedFavorites()`. The local adapter will reintroduce `addFavorite` and `removeFavorite` as conditional wrappers over `toggleFavorite` so higher-level code can use directional semantics without duplicating state rules.

Rationale: toggle semantics keep the store focused and easy to consume from UI interactions, while the adapter surface stays compatible with a later cloud implementation that will likely have explicit add and remove methods.

Alternative considered: keep separate add/remove actions in the store and also expose toggle.
Rejected because it would enlarge the shared store contract unnecessarily and create overlapping write paths.

### Move favorites-specific code into a dedicated favorites slice

Favorites-specific code should live under `src/favorites/`, with the store at `src/favorites/domain/stores/favoritesStore.ts`, the type at `src/favorites/domain/types/index.ts`, and the adapter at `src/favorites/data/services/LocalFavoritesAdapter.ts`. Only the cross-feature UI store should remain under `src/shared/domain/stores/uiStore.ts`.

Rationale: the vertical-slice rule says feature code belongs under its feature first and should use `shared/` only for genuinely cross-feature modules. Favorites state, types, and adapter behavior are feature-specific, so keeping them in `shared/` would continue the architectural drift that this slice can correct.

Alternative considered: keep the existing shared-domain/shared-data locations and only move the adapter.
Rejected because the same architectural argument applies to the favorites store and `Favorite` type, not just the adapter.

### Keep the slice move narrow and avoid compatibility re-exports

This change should move only favorites-specific types, state, adapter code, direct callers, and any required top-level barrel exports. It should not add temporary compatibility re-exports from `shared/` back to the new favorites slice.

Rationale: the architectural move is deliberate, and compatibility re-exports would keep the wrong dependency direction alive after the slice exists. Limiting the move to direct favorites code and direct callers keeps scope controlled without preserving stale structure.

Alternative considered: add temporary `shared/` re-exports to reduce caller churn.
Rejected because it prolongs the architectural inconsistency and makes it easier for new code to keep importing from the wrong place.

### Keep shared store/type guarantees intact while extending them for favorites and timer preference work

The `state-store-contracts` delta should preserve the existing exact shared-type and startup-baseline guarantees unless this slice is intentionally changing them, and it should add only the new favorites-slice, hydration, and timer-preference behavior required for Phase `04-01`.

Rationale: this change is about favorites persistence and UI preference extensions, not about relaxing the existing app-shell type contract. Preserving the prior guarantees avoids accidental spec erosion when the change is archived.

Alternative considered: simplify the existing spec text while editing it.
Rejected because it would mix an unrelated spec cleanup into a behavior change and risks silently removing constraints the repo still depends on.

### Use `defaultTimerDuration` as a fallback, not an override of sound-specific defaults

The new persisted `defaultTimerDuration` should apply only when a flow needs a generic timer preference and no sound-specific default duration is already defined. Catalog or sound-level default durations remain authoritative for sound flows that already have an explicit default.

Rationale: the repo already stores curated per-sound default durations such as `90`, `130`, and `150`. Treating the new setting as a global override would change existing playback behavior and devalue the catalog data in the same slice that is supposed to be a data-layer prerequisite.

Alternative considered: make the setting override every sound's default.
Rejected because it would be a broader product behavior change than this slice justifies and would increase regression risk.

### Use `Appearance.getColorScheme()` only as the first-install fallback

The UI store will initialize `isDarkMode` from `Appearance.getColorScheme() === 'dark'` at module load, while persisted storage continues to override that value after hydration. The same persisted store will also gain a durable `defaultTimerDuration` field.

Rationale: this preserves the current persisted theme contract for returning users while improving first-install behavior to match the system preference. Keeping the timer preference in the same store avoids adding another persistence boundary for one shell setting.

Alternative considered: read system appearance at runtime on every launch and overwrite persisted dark mode.
Rejected because it would discard the user's explicit in-app preference after they have already chosen one.

### Make the local adapter store-backed and uniformly async-shaped

`LocalFavoritesAdapter` will call `useFavoritesStore.getState()` for all reads and writes and will not touch AsyncStorage directly. Both read and write methods should return Promises so Phase 5 can substitute a cloud adapter without changing call sites or method expectations.

Rationale: the persisted Zustand store is already the single source of truth for local favorites. A uniformly async interface avoids contract churn later and makes local and cloud adapters interchangeable at the call-site level.

Alternative considered: keep reads synchronous and make only writes async.
Rejected because it leaves the adapter surface internally inconsistent and pushes the later migration cost onto every consumer.

### Treat `expo-system-ui` as a required dependency update for Android system-theme support

This slice should verify whether `expo-system-ui` is required for Android system-theme support in the current Expo/native setup and add it only if that verification confirms the dependency is needed for the planned dark-mode behavior.

Rationale: the source plan explicitly ties Android system preference support to that dependency, but the implementation should still confirm the dependency's role rather than cargo-culting a package addition.

Alternative considered: defer the dependency until a later UI slice.
Rejected because it would leave the new first-install dark-mode contract partly unsupported on one target platform.

## Risks / Trade-offs

- [The favorites store change is breaking for existing callers] -> Mitigation: search for `favoriteIds`, `addFavorite`, and `removeFavorite` references during implementation and update them in the same slice.
- [Persisted favorites data could become harder to evolve later] -> Mitigation: keep the stored shape minimal with only `id` and `addedAt`, and centralize access through the store and adapter.
- [Theme behavior could momentarily differ before hydration completes] -> Mitigation: preserve the existing `_hasHydrated` contract so startup code can continue gating on store hydration.
- [The adapter could become a redundant abstraction if consumers bypass it] -> Mitigation: document it as the Phase 5 migration boundary and keep its surface intentionally narrow.
- [Moving favorites code into a new slice can expand the change beyond a pure store edit] -> Mitigation: limit the slice move to favorites-specific files and caller imports only, while leaving genuinely shared shell state in `src/shared/`.
- [Persisted favorites migration could produce inconsistent timestamps for legacy data] -> Mitigation: define a deterministic migration strategy for legacy `string[]` entries, such as preserving source order and assigning stable migration-time `addedAt` values.
- [Conditional `expo-system-ui` adoption could leave Android theme assumptions unclear] -> Mitigation: record the verification outcome during implementation and add the dependency only when the current app setup demonstrably requires it.

## Migration Plan

1. Update the OpenSpec proposal and specs so the breaking favorites contract and the new adapter capability are explicit.
2. Create the `src/favorites/` slice, add the feature-local `Favorite` type, and replace the favorites store implementation with the persisted `Favorite[]` model plus hydration bookkeeping.
3. Upgrade the shared UI store to use system dark-mode fallback and persist `defaultTimerDuration` as a fallback preference.
4. Add `LocalFavoritesAdapter` in `src/favorites/data/services/` and route all behavior through `useFavoritesStore.getState()` with a fully async interface.
5. Update direct callers and any required barrel exports so favorites imports resolve from the new slice without compatibility re-exports from `shared/`.
6. Run type checks and targeted verification for persistence migration, hydration, timer-default precedence behavior, and the need for `expo-system-ui` in the current native setup.

Rollback strategy: restore the previous shared favorites store shape and UI-store initialization contract, remove the new favorites-slice files, and revert any caller updates that depended on the new favorites API or import paths.

## Open Questions

- None.
