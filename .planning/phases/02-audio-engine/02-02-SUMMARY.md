# 02-02 Summary

## Implemented

- Added `src/shared/data/catalogs/sounds.ts` with a catalog-only `SoundConfig` contract that reuses `SoundCategory` and `TimerDuration` while keeping `storageRef`, `defaultTimerSeconds`, and `thumbnailUrl: string | null` separate from the runtime `Sound` model.
- Populated the initial Phase 2 catalog with 9 free sounds across `rain`, `fire`, `forest`, `ocean`, `wind`, and `white-noise`.
- Exported `SOUNDS`, `SOUNDS_BY_ID`, and `SOUNDS_BY_CATEGORY` for iteration and O(1) lookup.
- Added `expo-file-system` to `package.json` at the SDK-compatible version `~19.0.22`.
- Added `src/shared/data/services/SoundCacheService.ts` as a module-level singleton.

## SoundCacheService Notes

- Cache hits return immediately by checking `documentDirectory/sounds/{soundId}.mp3` before any Firebase work.
- First-play downloads use `expo-file-system/legacy` plus `storage().ref(sound.storageRef).getDownloadURL()`.
- Cached files are written under the fixed local path pattern `documentDirectory/sounds/{soundId}.mp3`.
- Concurrent requests for the same sound are deduplicated with an internal `Map<string, Promise<string | null>>`.
- Callers can read first-play loading state through `SoundCacheService.isLoading(soundId)`.
- Failures return `null`, log a warning, and remove any partial file before exiting.
- The service includes a note that Firebase Storage rules must allow reads for the `sounds/` prefix.

## Validation

- Added focused tests under `src/shared/data/services/tests/` for:
  - catalog exports
  - cache hits without network calls
  - loading-state visibility during first-play download
  - deduplicated concurrent downloads
  - failed-download cleanup
  - failed URL resolution returning `null`
- Extended the existing Node test loader with mocks for `expo-file-system/legacy` and `@react-native-firebase/storage`.
- Ran `npm test` successfully.
- Ran `npx tsc --noEmit` successfully.
- Ran `npm run lint` successfully.

## Review Notes

- Shared file placement follows the current `src/shared/data/` structure from the repo rules.
- The catalog stays source-only; no ad hoc conversion layer or runtime reshaping was introduced in this slice.
- The runtime `Sound` interface in `src/shared/domain/types/index.ts` remains separate and continues to represent resolved playback state.

## Follow-Up

- Real playback verification still depends on the Firebase Storage `sounds/` objects existing and the corresponding read rules being configured in the Firebase project.
