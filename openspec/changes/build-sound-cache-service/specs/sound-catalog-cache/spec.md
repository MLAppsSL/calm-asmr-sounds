## ADDED Requirements

### Requirement: The app exposes a shared static sound catalog

The app SHALL define a shared static sound catalog at `src/shared/data/catalogs/sounds.ts` that is importable anywhere, contains 9 initial sounds across the 6 supported categories (`rain`, `fire`, `forest`, `ocean`, `wind`, and `white-noise`), includes at least 2 entries each for `rain`, `fire`, and `forest`, and stores Firebase Storage references as `storageRef` paths rather than full download URLs. All Phase 2 catalog entries MUST keep `isPremium: false`.

#### Scenario: Catalog exports initial sound metadata

- **WHEN** application code imports the shared sound catalog
- **THEN** it can read typed sound entries that include sound identity, category, default timer metadata, premium flag, thumbnail metadata, and a Firebase Storage path for each sound

#### Scenario: Catalog supports iteration and lookup access

- **WHEN** library or player flows need to render sounds by category or resolve one sound by ID
- **THEN** the catalog exposes `SOUNDS`, `SOUNDS_BY_ID`, and `SOUNDS_BY_CATEGORY` without requiring a network call

#### Scenario: Catalog keeps Firebase references instead of resolved URLs

- **WHEN** application code reads a sound entry from the shared catalog
- **THEN** the entry provides a Firebase Storage `storageRef` path and does not require a pre-resolved download URL field

### Requirement: SoundConfig has a stable exported contract

The app SHALL export a `SoundConfig` type from `src/shared/data/catalogs/sounds.ts` with the fields `id`, `title`, `category`, `storageRef`, `isPremium`, `defaultTimerSeconds`, and `thumbnailUrl`. `SoundConfig` MUST reuse the shared sound-category and timer types, and it MUST remain separate from any domain shape that depends on resolved playback URLs.

#### Scenario: SoundConfig exposes the agreed field names

- **WHEN** implementation code imports `SoundConfig` from the shared catalog module
- **THEN** the type provides exactly the catalog-facing fields `id`, `title`, `category`, `storageRef`, `isPremium`, `defaultTimerSeconds`, and `thumbnailUrl`

#### Scenario: SoundConfig does not require a resolved storage URL

- **WHEN** a sound entry is represented as `SoundConfig`
- **THEN** the type does not require a resolved `storageUrl` field before cache lookup or playback preparation

### Requirement: Sound cache dependencies and placement are explicit

The app SHALL place the cache service at `src/shared/data/services/SoundCacheService.ts`, place its tests under `src/shared/data/services/tests/`, and add `expo-file-system` to `package.json` if that dependency is not already installed when the slice is implemented.

#### Scenario: Cache service depends on expo-file-system explicitly

- **WHEN** the repository does not already declare `expo-file-system` in `package.json`
- **THEN** implementing this slice adds the dependency before or alongside the cache service code so the service can compile and run

### Requirement: SoundCacheService returns permanent local URIs for playback

The app SHALL expose a shared `SoundCacheService` that resolves a catalog sound into a local `file://` URI stored in `documentDirectory`, and cached files MUST remain available across app restarts until the app is removed.

#### Scenario: Cached sound returns immediately

- **WHEN** `SoundCacheService.getLocalUri(sound)` is called for a sound whose file already exists in local storage
- **THEN** the service returns the existing local `file://` URI without starting a Firebase request or redownloading the file

#### Scenario: First-play download stores a permanent file

- **WHEN** `SoundCacheService.getLocalUri(sound)` is called for a sound that is not yet cached locally
- **THEN** the service resolves the Firebase Storage download URL, downloads the file into `documentDirectory`, and returns the resulting stable local `file://` URI for playback

### Requirement: SoundCacheService exposes first-play download state and avoids duplicate downloads

The app SHALL allow callers to observe whether a sound is currently being downloaded for first play via a caller-readable loading-state API, and concurrent requests for the same sound MUST reuse the same in-flight download work instead of starting duplicate Firebase downloads.

#### Scenario: Caller can read first-play loading state

- **WHEN** a sound download is in progress for a given sound ID
- **THEN** later UI flows can read that loading state for the sound ID while awaiting the local playback URI

#### Scenario: Concurrent requests reuse the same download

- **WHEN** multiple callers request the same uncached sound before the first download finishes
- **THEN** the service waits on the same in-flight download result and creates only one Firebase download for that sound

### Requirement: SoundCacheService fails safely on download problems

If Firebase URL resolution or file download fails, `SoundCacheService` MUST clean up any partial file and return `null` instead of leaving a broken cache entry behind.

#### Scenario: Failed download leaves no partial cached file

- **WHEN** a download fails after the local target file has been created or partially written
- **THEN** the service removes the partial file and returns `null`

#### Scenario: Failed URL resolution returns no local URI

- **WHEN** Firebase Storage denies access or cannot provide a download URL for the requested sound
- **THEN** the service returns `null` and does not mark the sound as cached
