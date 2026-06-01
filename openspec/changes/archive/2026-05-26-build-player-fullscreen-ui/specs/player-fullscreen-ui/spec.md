## ADDED Requirements

### Requirement: The app exposes the Phase 3 player screen as the immersive playback surface

The app SHALL implement `app/player.tsx` as the Phase 3 player route that renders the active sound's playback surface with an ambient background visual, a top metadata bar, a centered play or pause progress control, and a bottom control pill instead of a placeholder screen.

#### Scenario: Player route renders the real Phase 3 surface

- **WHEN** a user enters the `/player` route after selecting a sound
- **THEN** the route renders the selected sound's playback surface rather than a placeholder view
- **AND** the screen includes the sound identity, central progress or play control, and bottom playback controls needed for the immersive player shell

### Requirement: The player resolves the active sound from route params first and shared playback state second

The player SHALL treat the `soundId` route param as the primary source for the active sound identity, and it SHALL fall back to `useAudioStore().currentSoundId` only when the route param is absent.

#### Scenario: Route param takes precedence when present

- **WHEN** `app/player.tsx` is opened with a valid `soundId` route param
- **THEN** the player uses that sound identity for its displayed metadata and playback surface
- **AND** a different or stale shared store value does not override the explicit route entry

#### Scenario: Shared playback state supports player re-entry when params are absent

- **WHEN** the player is opened without a `soundId` route param but `useAudioStore().currentSoundId` is available and valid
- **THEN** the player uses the shared store sound identity as its fallback active sound

### Requirement: The player handles invalid or missing sound identity explicitly

If neither the route params nor the shared playback state resolve to a valid sound in the player metadata source, the player SHALL render a minimal unavailable state with short explanatory copy and a clear path back to the library instead of substituting a different sound silently.

#### Scenario: Invalid player entry does not render the wrong sound

- **WHEN** the player is opened without any valid sound identity available
- **THEN** the route renders an unavailable or empty player state
- **AND** the user can leave the player and return to the library without seeing an unrelated fallback sound

### Requirement: Ambient player video is muted, looping, and lifecycle-safe

The player SHALL render its ambient background through a dedicated video component that uses `expo-video`, always keeps the video muted, loops the video continuously, and explicitly pauses playback when the player route loses focus or unmounts.

#### Scenario: Video background stays visually active without adding audio output

- **WHEN** the player screen is visible
- **THEN** the ambient background video loops continuously behind the player controls
- **AND** the video remains muted so it does not conflict with the app's audio playback session

#### Scenario: Phase 03-02 uses the current placeholder video asset for every category

- **WHEN** the player renders an ambient background in this slice
- **THEN** it uses the existing local `background_video/forest.mp4` asset as the Phase `03-02` placeholder background
- **AND** category-specific video assets are not required for this change to be complete

#### Scenario: Leaving the player stops ambient video playback

- **WHEN** a user navigates away from the player route or the player screen loses focus
- **THEN** the video component pauses the underlying `expo-video` player during cleanup
- **AND** the app does not continue leaking ambient video playback after the route is gone

### Requirement: The player shows progress and playback state through a circular center control

The player SHALL present a circular progress arc around the central play or pause control, and that center control SHALL reflect the current playback state while also displaying a timer label for the current session duration.

#### Scenario: Center control reflects play or pause state

- **WHEN** the player renders while the current sound is playing or paused
- **THEN** the central control shows the corresponding play or pause icon state
- **AND** activating the control updates the shared playback state used by the player flow

#### Scenario: Shared playback state wiring uses the existing store contract

- **WHEN** the player implements play or pause and loop interactions in Phase `03-02`
- **THEN** those interactions use the existing shared audio-store fields and setters already available to the app
- **AND** the slice does not require a broader audio-store API redesign to satisfy the player contract

#### Scenario: Progress ring supports the Phase 3 presentation contract

- **WHEN** the player renders before full countdown animation is wired
- **THEN** the circular progress arc can still render from a provided progress value such as a static full ring
- **AND** the timer label remains visible as part of the center presentation

### Requirement: Fullscreen mode hides player chrome and restores it on tap

The player SHALL provide a fullscreen action from the bottom control pill that hides the status bar and all non-video screen chrome, keeps the device awake while immersive mode is active, and restores the hidden controls when the user taps the screen.

#### Scenario: Entering fullscreen removes interface chrome

- **WHEN** the user activates the fullscreen control from the bottom control pill
- **THEN** the player hides the top metadata bar, bottom control pill, and status bar
- **AND** only the ambient visual and audio-focused playback experience remain visible

#### Scenario: Fullscreen mode keeps the device awake until exit

- **WHEN** the player is in fullscreen immersive mode
- **THEN** the route activates keep-awake behavior so the screen does not sleep during the session

#### Scenario: Tapping the screen restores the hidden controls

- **WHEN** the user taps the immersive player surface while fullscreen mode is active
- **THEN** the route exits fullscreen mode and restores the hidden player controls and status bar

### Requirement: The bottom control pill exposes the agreed Phase 3 action set

The player SHALL render a frosted bottom control pill containing controls for loop, AirPlay, favorite, and fullscreen so the Phase 3 player shell exposes the planned affordances even where some actions remain shell-only.

#### Scenario: Bottom control pill shows the required actions

- **WHEN** the player renders in its standard non-fullscreen state
- **THEN** the bottom control pill presents loop, AirPlay, favorite, and fullscreen controls together in a frosted visual container
- **AND** the fullscreen control is the entry point for immersive mode

#### Scenario: Loop is functional while AirPlay and favorite remain shell-only

- **WHEN** a user interacts with the bottom control pill in Phase `03-02`
- **THEN** the loop control reflects and updates the shared loop playback state
- **AND** the AirPlay and favorite controls remain explicit no-op affordances until later slices implement those behaviors
