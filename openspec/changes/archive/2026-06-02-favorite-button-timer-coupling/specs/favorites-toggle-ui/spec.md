## ADDED Requirements

### Requirement: Favorite toggle is available on library cards and player controls

The system SHALL show a favorite toggle for each sound on both the library card surface and the player control surface, and SHALL render the toggle state from the persisted favorites store for that specific sound.

#### Scenario: Library card reflects current favorite state

- **WHEN** the library renders a sound card for a sound that is already favorited
- **THEN** the card SHALL show the `MaterialIcons` `favorite` icon for that sound
- **AND** the active icon color SHALL be rose-500 (`#f43f5e`)

#### Scenario: Player reflects current favorite state

- **WHEN** the player screen renders for a sound that is not favorited
- **THEN** the player SHALL show the `MaterialIcons` `favorite-border` icon for that sound
- **AND** the inactive icon color SHALL be slate-400 (`#94a3b8`)

### Requirement: Favorite toggle updates immediately

The system SHALL toggle the current sound's favorite state immediately when the user presses the favorite button, and SHALL provide immediate visual feedback for the press interaction through a gentle scale-pop animation.

#### Scenario: Favoriting a sound from the library

- **WHEN** the user presses the favorite button on a non-favorited library sound card
- **THEN** the system SHALL save that sound as a favorite and update the button to the active state without requiring confirmation

#### Scenario: Favorite press uses the approved pop interaction

- **WHEN** the user presses the favorite button from either the library or player surface
- **THEN** the button SHALL animate with a brief scale-up followed by a return to its resting size

#### Scenario: Unfavoriting a sound from the player

- **WHEN** the user presses the favorite button for a sound that is already favorited on the player screen
- **THEN** the system SHALL remove that sound from favorites and update the button to the inactive state without requiring confirmation

### Requirement: Favorite toggle avoids unrelated card re-renders

The system SHALL scope favorite-state subscriptions so that a sound card favorite button only re-renders for changes to its own sound's favorite state.

#### Scenario: Toggling one sound does not require broad list subscriptions

- **WHEN** the user toggles the favorite state for one sound in the library
- **THEN** the system SHALL resolve favorite state for each button through a selector scoped to that button's sound identifier
