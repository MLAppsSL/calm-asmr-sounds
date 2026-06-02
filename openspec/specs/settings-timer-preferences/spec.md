# settings-timer-preferences Specification

## Purpose

Define how the Settings screen reflects and updates the persisted default timer duration without breaking the existing dark-mode control.

## Requirements

### Requirement: Settings session duration reflects the persisted default preference

The app SHALL render the Settings session-duration control from the persisted `uiStore.defaultTimerDuration` preference rather than from route-local shell state.

#### Scenario: Settings opens with the saved default selected

- **WHEN** a user opens the Settings screen after the UI store has hydrated
- **THEN** the selected session-duration option matches the current `uiStore.defaultTimerDuration` value

### Requirement: Settings duration changes update both persisted preference and active timer state

The app SHALL treat a Settings session-duration change as both a preference update for future sessions and an immediate update to the shared audio timer selection used by the current runtime.

#### Scenario: User selects a different duration in Settings

- **WHEN** a user chooses a different session-duration option in Settings
- **THEN** the app updates `uiStore.defaultTimerDuration` to the matching duration value
- **AND** the app updates the shared audio timer duration to the same selection

#### Scenario: Restart preserves the chosen settings duration

- **WHEN** a user changes the session duration in Settings and later restarts the app
- **THEN** the Settings screen restores the same selected duration after hydration completes

### Requirement: Completing timer preferences does not regress the existing dark-mode control

The app SHALL preserve the functional dark-mode toggle on the Settings screen while exposing the persisted session-duration preference.

#### Scenario: Dark mode remains interactive after timer preference work

- **WHEN** a user toggles dark mode from the Settings screen after the session-duration control is present
- **THEN** the app still updates the visible theme immediately
