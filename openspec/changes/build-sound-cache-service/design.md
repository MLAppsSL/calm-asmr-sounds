## Context

Phase `02-02` is the data-layer follow-up to the already implemented `AudioService` playback engine. The app can now play a local `file://` URI, but it still lacks two pieces required for real sound selection: a shared catalog of sound metadata and a service that can resolve Firebase Storage references into permanent local files that survive app restarts.

The repository also now has a project-specific vertical-slice rule that favors shared code under `src/shared/`, then by layer, then by a type-specific subfolder. The source planning artifacts for this phase still reference top-level `src/config/` and `src/services/`, so this change needs an explicit placement decision before implementation starts. The current repo also does not list `expo-file-system` in `package.json`, so the change must treat that dependency as part of the implementation if it remains absent.

## Goals / Non-Goals

**Goals:**

- Define a shared static catalog for the first set of sounds, including IDs, categories, Firebase Storage refs, and default timer metadata.
- Preserve the stronger Phase `02-02` seed-data contract so later UI slices can rely on a stable starter catalog: 9 sounds across the currently supported 6 categories, with rain, fire, and forest each having at least 2 entries.
- Add a shared `SoundCacheService` that returns permanent local playback URIs from Firebase Storage refs and reuses cached files instantly on later plays.
- Keep the cache contract simple enough for later player/library flows to consume while still exposing whether a first-play download is in progress.
- Preserve the separation of responsibilities: `AudioService` handles playback only, while the new cache service handles Firebase and file persistence.

**Non-Goals:**

- Build the library UI, player UI wiring, or timer countdown integration that will consume this data later.
- Add premium gating, dynamic remote catalog management, cache eviction policy, or admin tooling for uploaded sounds.
- Change the existing `AudioService` playback requirements beyond consuming the local URI produced by this slice.

## Decisions

### Keep the sound catalog and cache service under `src/shared/data/`

Following the vertical-slice rule, implementation should place the sound catalog in `src/shared/data/catalogs/sounds.ts` and the cache singleton in `src/shared/data/services/SoundCacheService.ts` instead of creating new top-level `src/config/` or `src/services/` folders. Any tests for the cache service should live under `src/shared/data/services/tests/`.

Rationale: both files are shared application data concerns used across future library, player, timer, and favorites flows. This keeps the plan aligned with the repository's vertical-slice rule and with the existing `AudioService` placement.

Alternative considered: follow the original phase-plan paths exactly at `src/config/sounds.ts` and `src/services/SoundCacheService.ts`.
Rejected because that would introduce a second structural convention into the codebase immediately after the repo standardized shared code placement.

### Model the catalog as static typed metadata with lookup exports

The catalog should export a `SoundConfig` type plus `SOUNDS`, `SOUNDS_BY_ID`, and `SOUNDS_BY_CATEGORY`, with every sound mapped to a Firebase Storage path rather than a download URL. `SoundConfig` should be a shared catalog type that reuses the existing category and timer types but intentionally does not extend the current `Sound` interface directly, because the existing domain `Sound` shape uses `storageUrl` and `durationSeconds` while this slice needs `storageRef` and `defaultTimerSeconds`.

The `SoundConfig` contract should be treated as stable for later slices and should explicitly include `id`, `title`, `category`, `storageRef`, `isPremium`, `defaultTimerSeconds`, and `thumbnailUrl`.

This slice should treat `SoundConfig` as catalog-source data only. Code added in `02-02` should avoid introducing ad hoc conversions or treating `SoundConfig` as the universal runtime sound model. Later slices that combine catalog data with cache results or playback/session state should do so through one explicit mapping boundary instead of spreading conversion logic across screens, stores, and services.

Rationale: the library and player flows need both iteration and O(1) lookup. Keeping only storage refs in the catalog prevents stale tokenized URLs from being embedded in source and keeps Firebase resolution centralized in one place.

Alternative considered: fetch the catalog dynamically from Firestore or store full download URLs directly in the config file.
Rejected because this phase only needs a small curated static set, and storing tokenized download URLs in source would create brittle configuration and bypass the caching service boundary.

Alternative considered: force `SoundConfig` to extend the current `Sound` interface immediately.
Rejected because that would either require placeholder `storageUrl` values that contradict the cache-service boundary or would force a broader domain-type redesign inside a data-layer slice.

Alternative considered: allow each later caller to reshape `SoundConfig` however it needs.
Rejected because repeated ad hoc reshaping would make the boundary between catalog data and runtime playback data inconsistent and hard to maintain.

### Keep the stronger Phase `02-02` catalog seed as an explicit contract

The catalog should ship with 9 sounds across the 6 currently defined categories (`rain`, `fire`, `forest`, `ocean`, `wind`, and `white-noise`), with at least 2 entries each for `rain`, `fire`, and `forest`, and all entries should keep `isPremium: false` for Phase 2.

Rationale: later library and player slices benefit from a stable starter catalog instead of a minimum-only placeholder requirement. The stronger seed contract is already embedded in the source phase plan and should remain true in the OpenSpec artifacts.

Alternative considered: loosen the requirement to only six sounds across any set of categories.
Rejected because that weakens the original plan and makes later UI expectations less predictable.

### Use `documentDirectory` with a stable `sounds/` subdirectory for permanent cache storage

The cache service should store downloaded files under `FileSystem.documentDirectory` inside a dedicated `sounds/` folder and treat those files as permanent until uninstall.

Rationale: the phase requirement explicitly locks cache persistence across app restarts. `documentDirectory` matches that contract, while `cacheDirectory` does not.

Alternative considered: use `cacheDirectory` for simpler temporary-file semantics.
Rejected because the OS can purge `cacheDirectory`, which would break the requirement that previously cached sounds return instantly with no new network call.

### Keep Firebase resolution and duplicate-download protection inside the cache service

`SoundCacheService.getLocalUri(sound)` should first check for an existing local file, then reuse a stored in-flight promise for that sound ID if a download is already running, and only otherwise resolve `storage().ref(sound.storageRef).getDownloadURL()` and download the file.

Rationale: the service should be the single authority for whether a sound is local, downloading, or needs a network fetch. The in-flight promise map prevents repeated taps or multiple screens from creating duplicate Firebase downloads for the same asset.

Alternative considered: let each caller handle its own download deduplication.
Rejected because duplicated coordination logic would be error-prone and would undermine the service abstraction.

### Expose lightweight loading-state reads for first-play UI feedback

The cache service should expose a synchronous `isLoading(soundId)` read backed by the in-flight download map so later UI slices can show loading feedback while awaiting `getLocalUri(sound)`.

Rationale: the phase requirement says first-play loading state must be available to the caller. A simple read method satisfies that requirement without forcing this slice to define UI state management or event subscriptions prematurely.

Alternative considered: rely only on awaiting `getLocalUri(sound)` with no explicit service state, or add a full observable/store integration now.
Rejected because the first option gives later UI no shared loading source, while the second would over-expand this slice into broader state architecture.

### Add `expo-file-system` to `package.json` if it is not already installed

Implementation should explicitly add `expo-file-system` to `package.json` if the dependency is not already present when this slice begins.

Rationale: `SoundCacheService` depends on `expo-file-system/legacy` and the current repository dependency list does not yet include `expo-file-system`. Treating it as an explicit slice dependency prevents a hidden compile blocker.

Alternative considered: assume the dependency exists indirectly or leave installation to a later branch.
Rejected because the service cannot be implemented safely on assumption alone.

### Return `null` on cache/download failure after cleaning up partial files

The cache service should swallow download errors internally, remove any partially written file, and return `null` so later UI flows can decide how to message failure.

Rationale: this keeps the service contract predictable for first-play flows and prevents corrupt partial files from looking like valid cache hits later.

Alternative considered: throw errors to every caller.
Rejected because the immediate consumer path mainly needs a success-or-no-local-file result, and the plan already reserves user-facing failure handling for later slices.

## Risks / Trade-offs

- [Static catalog can drift from the actual uploaded Firebase assets] -> Mitigation: keep storage refs explicit and human-readable, and treat upload validation as a follow-up operational check when assets are added.
- [Permanent caching increases local disk usage over time] -> Mitigation: Phase `02-02` deliberately chooses persistence over eviction; cache management can be added later only if product needs justify it.
- [Unauthenticated Firebase Storage reads may fail if rules are not configured for the `sounds/` prefix] -> Mitigation: call this out directly in service comments and rely on later manual verification during playback/UI slices.
- [Sound ID based filenames can collide if the catalog changes IDs carelessly later] -> Mitigation: keep IDs unique and stable, and use the catalog as the single source of truth for file identity.

## Migration Plan

1. Create a new `sound-catalog-cache` capability spec describing the catalog contract, stronger seed data, permanent caching behavior, deduplicated first-play downloads, loading-state visibility, and failure handling.
2. Add `expo-file-system` to `package.json` if it is not already installed.
3. Implement the shared sound catalog under `src/shared/data/catalogs/` with the full Phase `02-02` starter sound set and grouping exports.
4. Implement `SoundCacheService` under `src/shared/data/services/` using Firebase Storage URL resolution plus `expo-file-system/legacy` downloads into `documentDirectory`.
5. Verify the new types and service behavior with project checks and focused tests before later UI or timer slices consume them.

Rollback strategy: remove the new catalog and cache service files if the data-layer contract proves unstable, leaving the already-landed playback engine intact.

## Open Questions

- None.
