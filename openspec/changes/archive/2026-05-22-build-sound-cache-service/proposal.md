## Why

Phase `02-02` needs a data-layer path that turns a tapped sound into a stable local `file://` URI before playback begins. The app already has an `AudioService` playback engine, but it does not yet have a shared sound catalog or a permanent cache flow that can resolve Firebase Storage paths on first play and return cached files instantly on later plays.

## What Changes

- Add a shared static TypeScript sound catalog at `src/shared/data/catalogs/sounds.ts` that defines the initial Phase `02-02` free-tier sound set: 9 sounds across 6 categories, with rain, fire, and forest each represented by at least 2 sounds.
- Add a module-level `SoundCacheService` at `src/shared/data/services/SoundCacheService.ts` that resolves Firebase Storage download URLs, stores files in `documentDirectory`, and returns stable local URIs for playback.
- Require cache hits to return immediately with no network call, and require failed downloads to return `null` after partial-file cleanup so later UI flows can handle the failure.
- Require download deduplication for concurrent requests of the same sound so the app does not start duplicate Firebase downloads during first-play loading.
- Require a caller-readable loading-state API for first-play download UI feedback.
- If `expo-file-system` is not already present in `package.json`, add it as part of this slice because the cache service depends on it.

## Capabilities

### New Capabilities

- `sound-catalog-cache`: Defines the static sound catalog and the permanent local caching contract that resolves Firebase Storage sound references to local playback URIs.

### Modified Capabilities

- None.

## Impact

- Affected files: `package.json`, `src/shared/data/catalogs/sounds.ts`, `src/shared/data/services/SoundCacheService.ts`, tests under `src/shared/data/services/tests/`, and new OpenSpec artifacts under `openspec/changes/build-sound-cache-service/`
- Affected systems: Firebase Storage URL resolution, `expo-file-system` permanent file storage, first-play loading behavior, and future library/player UI flows that need stable sound metadata plus local playback URIs
- Dependencies: existing Firebase Storage module, Expo file-system support, the previously added `AudioService`, and the shared sound/category types already defined in the repository
