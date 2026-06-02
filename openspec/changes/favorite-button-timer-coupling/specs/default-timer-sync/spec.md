## ADDED Requirements

### Requirement: Player pre-fills timer from saved default for new sessions

The system SHALL initialize the player timer from the saved default timer duration when the player screen opens or regains focus for a session that is not currently playing.

#### Scenario: Player opens with no active playback

- **WHEN** the player screen gains focus and no sound is currently playing
- **THEN** the system SHALL copy the saved default timer duration into the player timer state

#### Scenario: Player regains focus during active playback

- **WHEN** the player screen gains focus while a sound is already playing
- **THEN** the system SHALL preserve the current session timer instead of overwriting it from the saved default

### Requirement: Player timer changes become the new saved default

The system SHALL persist every timer duration change made from the player controls as the new default timer duration for future sessions.

#### Scenario: User changes timer in player

- **WHEN** the user selects a different timer duration from the player controls
- **THEN** the system SHALL update both the active player timer state and the saved default timer preference to the selected duration

### Requirement: Settings timer selector stays synchronized with the saved default

The system SHALL render the existing settings timer selector from the saved default timer preference, and SHALL persist settings-based timer changes back into both the active audio timer state and the saved default.

#### Scenario: Settings reflects the saved default

- **WHEN** the settings screen renders after the saved default timer duration has been changed
- **THEN** the settings timer selector SHALL show the option that matches `uiStore.defaultTimerDuration`

#### Scenario: User changes timer in settings

- **WHEN** the user selects a different timer duration from the settings screen
- **THEN** the system SHALL update both the active audio timer state and the saved default timer preference to the selected duration
