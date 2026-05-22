## 1. Shared Sound Catalog

- [x] 1.1 Create `src/shared/data/catalogs/sounds.ts` with a typed `SoundConfig` contract that reuses the shared sound/category types, keeps `thumbnailUrl` typed as `string | null`, and intentionally keeps `storageRef` and `defaultTimerSeconds` separate from the current domain `Sound` shape.
- [x] 1.2 Populate the initial catalog with 9 sounds across the 6 supported categories, ensuring `rain`, `fire`, and `forest` each have at least 2 entries, every entry uses only Firebase Storage `storageRef` paths, and every Phase 2 entry keeps `isPremium: false`.
- [x] 1.3 Export `SOUNDS`, `SOUNDS_BY_ID`, and `SOUNDS_BY_CATEGORY` from the shared catalog so later library and player flows can iterate and resolve sounds without a network call.
- [x] 1.4 Keep `SoundConfig` scoped to catalog-source concerns only and avoid introducing parallel runtime sound reshaping inside this slice.

## 2. Permanent Cache Service

- [x] 2.1 Add `expo-file-system` to `package.json` if it is not already declared, since this slice depends on `expo-file-system/legacy` for permanent-file downloads.
- [x] 2.2 Create `src/shared/data/services/SoundCacheService.ts` as a module-level singleton that checks `documentDirectory` for an existing cached file before attempting any Firebase work.
- [x] 2.3 Implement first-play download behavior with `expo-file-system/legacy` and `storage().ref(sound.storageRef).getDownloadURL()`, storing files under a dedicated `sounds/` subdirectory in `documentDirectory` using the stable local path pattern `sounds/{soundId}.mp3`.
- [x] 2.4 Add duplicate-download protection and an explicit `isLoading(soundId)`-style caller-readable loading-state API by tracking in-flight downloads per sound ID.
- [x] 2.5 Implement safe failure handling so download or URL-resolution errors clean up any partial file and return `null` without leaving the sound marked as cached.

## 3. Validation

- [x] 3.1 Add focused test coverage under `src/shared/data/services/tests/` for the catalog and cache-service contracts, including cache hits, deduplicated downloads, `isLoading(soundId)` reads, failed-download cleanup behavior, and catalog export assertions without introducing a separate catalog test folder in this slice.
- [x] 3.2 Run the relevant project checks after `package.json`, the new shared data files, and tests are added, and fix any lint, formatting, or type regressions introduced by this slice.
- [x] 3.3 Manually review the implementation against the OpenSpec requirements for shared file placement, explicit dependency setup, static catalog exports, permanent caching, first-play loading visibility, duplicate-download prevention, and safe failure handling.
- [x] 3.4 Manually review the implementation to confirm the `SoundConfig` versus domain `Sound` split remains explicit and that no ad hoc conversion layer was introduced across multiple files.
- [x] 3.5 Create `.planning/phases/02-audio-engine/02-02-SUMMARY.md` after implementation, following the phase summary template required by the source plan.
