# favorites-saved-browse Specification

## Purpose

Define how the Favorites tab renders hydrated saved sounds, empty-state behavior, and safe handling of stale favorite IDs.

## Requirements

### Requirement: Favorites tab renders saved sounds after store hydration

The app SHALL replace the Favorites tab placeholder with a real saved-sounds route that waits for favorites-store hydration before rendering user-visible content, and it SHALL render saved sounds in most-recently-added-first order.

#### Scenario: Hydrated favorites render in recency order

- **WHEN** a user opens the Favorites tab after the favorites store has hydrated and saved favorites exist
- **THEN** the screen shows the saved sounds using the library sound metadata required by the existing `SoundCard` UI
- **AND** the first visible item is the most recently added favorite

#### Scenario: Cold start avoids empty-state flash

- **WHEN** the Favorites tab renders before persisted favorites have finished rehydrating
- **THEN** the route does not show the empty state or an incorrect zero-results message before hydration completes

### Requirement: Favorites tab shows the planned saved-count and list behavior

The app SHALL show a saved-count summary above the Favorites list when saved sounds exist, and it SHALL use a list implementation that keeps the empty-state layout centered and visible when the list is empty.

#### Scenario: Saved favorites expose the count summary

- **WHEN** a user opens the Favorites tab after hydration and one or more favorites exist
- **THEN** the screen shows a summary indicating how many sounds are saved above the list content

#### Scenario: Empty state remains vertically centered inside the list layout

- **WHEN** the Favorites route renders with no saved favorites after hydration
- **THEN** the list layout still allows the illustrated empty state to fill the available content area instead of collapsing toward the top

### Requirement: Favorites tab shows an illustrated empty state with library navigation

The app SHALL show an illustrated empty state when no saved favorites exist, and that empty state SHALL include a one-tap `Explore Sounds` action that returns the user to the Library tab.

#### Scenario: Empty favorites show the designed fallback state

- **WHEN** a user opens the Favorites tab after hydration and no favorites exist
- **THEN** the screen shows an illustrated empty state instead of a blank screen
- **AND** the empty state includes the heading `Your sanctuary is empty`, supporting guidance text, and an `Explore Sounds` action

#### Scenario: Empty-state CTA returns to browsing

- **WHEN** a user taps `Explore Sounds` from the empty Favorites state
- **THEN** the app navigates to the Library tab in one step

### Requirement: Favorites route tolerates stale saved IDs safely

The Favorites tab SHALL ignore saved favorite IDs that no longer map to a current library sound instead of crashing or rendering invalid cards.

#### Scenario: Saved favorite points to missing catalog entry

- **WHEN** the favorites store contains an ID that is absent from the current library sound manifest
- **THEN** the screen skips that entry safely
- **AND** the remaining valid favorites still render in recency order
