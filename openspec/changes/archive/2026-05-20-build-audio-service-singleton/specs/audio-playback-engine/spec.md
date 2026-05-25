## ADDED Requirements

### Requirement: AudioService is a module-lifetime singleton

The app SHALL expose a shared `AudioService` instance whose playback state persists for the lifetime of the JavaScript module and MUST NOT be recreated as a side effect of screen navigation or component unmounting.

#### Scenario: Navigation does not create a second service instance

- **WHEN** playback has been started and the user navigates between app screens
- **THEN** the app continues using the same `AudioService` instance instead of constructing a new playback controller

### Requirement: AudioService configures background-capable audio mode once at startup

The app SHALL initialize `AudioService` once during app startup so the audio session is configured for silent-mode bypass on iOS and background playback on supported platforms before playback begins.

#### Scenario: Root startup configures audio mode before first play

- **WHEN** the app root layout mounts for startup
- **THEN** it invokes the one-time `AudioService.initialize()` path that applies the required background-capable audio mode

#### Scenario: Initialized audio continues across background transitions

- **WHEN** a sound is playing and the user locks the screen on iOS or switches apps on Android
- **THEN** playback continues instead of stopping only because the app left the foreground

### Requirement: AudioService starts selected sounds immediately in loop mode

`AudioService.play(soundId, localUri)` SHALL begin playback for the provided local sound URI without requiring any extra confirmation step, and the active player MUST loop until the sound is switched or stopped.

#### Scenario: Fresh playback starts immediately

- **WHEN** no sound is active and `AudioService.play(soundId, localUri)` is called with a valid local URI
- **THEN** the requested sound begins playing immediately and becomes the active looping sound

### Requirement: AudioService handles switching and manual stop with distinct behavior

If `AudioService.play(...)` is called for a different `soundId` while another sound is active, the service SHALL crossfade from the old sound to the new sound over 700 milliseconds and MUST release the outgoing playback instance after the fade completes. If `AudioService.play(...)` is called for the currently active `soundId`, or if `AudioService.stop()` is called directly, the service MUST stop playback immediately with no fade.

#### Scenario: Switching sounds crossfades and cleans up the old player

- **WHEN** one sound is already playing and `AudioService.play(...)` is called with a different `soundId`
- **THEN** the outgoing sound fades out while the incoming sound fades in for 700 milliseconds, after which the outgoing playback instance is released and only the new sound remains active

#### Scenario: Tapping the active sound toggles playback off immediately

- **WHEN** `AudioService.play(...)` is called with the same `soundId` that is already active
- **THEN** playback stops immediately without running the crossfade path

#### Scenario: Explicit stop clears active playback immediately

- **WHEN** `AudioService.stop()` is called while a sound is active or a crossfade is in progress
- **THEN** the service cancels any in-flight fade timing, unloads the active `expo-av` sound instance, and leaves no sound marked as active

### Requirement: AudioService exposes timer-oriented fade-out without implicit stop

`AudioService.fadeOut(durationMs)` SHALL reduce the active player's volume from its current level to silence over the requested duration so timer-owned flows can perform a fade before calling `AudioService.stop()`. This fade path MUST NOT by itself clear the active sound identity or release the player.

#### Scenario: Timer flow fades the active player before explicit stop

- **WHEN** `AudioService.fadeOut(durationMs)` is called while a sound is active
- **THEN** the active player's volume ramps down to zero over the requested duration while the same sound remains the active playback target until a later explicit stop

#### Scenario: Fade-out is a no-op when nothing is active

- **WHEN** `AudioService.fadeOut(durationMs)` is called and no sound is active
- **THEN** the service completes without error and without creating a new player
