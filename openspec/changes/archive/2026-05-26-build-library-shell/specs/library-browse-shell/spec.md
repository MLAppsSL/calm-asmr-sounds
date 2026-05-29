## ADDED Requirements

### Requirement: The app exposes a static library browsing manifest

The app SHALL define a UI-facing sound manifest at `src/library/data/sounds.ts` for the Phase 3 library shell that contains 17 sounds across the four browsing categories `rain`, `fire`, `forest`, and `wave`, and each entry SHALL provide the display metadata needed by the library cards without requiring a network fetch.

#### Scenario: Manifest provides browse-ready sound metadata

- **WHEN** application code imports the library browsing manifest
- **THEN** it can read typed sound entries that include a stable sound ID, display name, subtitle, browsing category, display duration, duration seconds, premium flag, and visual asset or fallback metadata for card rendering

#### Scenario: Manifest covers the planned library breadth

- **WHEN** a developer reviews the initial Phase 3 manifest
- **THEN** it includes 17 sounds spread across `rain`, `fire`, `forest`, and `wave` so the library screen can render multiple horizontal sections with meaningful content

#### Scenario: Manifest exposes user-facing category labels separately from technical category IDs

- **WHEN** the library shell renders category headings from the manifest layer
- **THEN** it can keep technical category IDs such as `rain`, `fire`, `forest`, and `wave`
- **AND** it can present user-facing labels such as `Rain`, `Fire`, `Forest`, and `Ocean`

### Requirement: The library screen browses sounds by category sections

The app SHALL present the Phase 3 library route as a vertically scrollable list of category sections, and each category section SHALL render its own independent horizontal list of sound cards instead of using filter tabs or "View all" flows.

#### Scenario: Category sections scroll independently

- **WHEN** a user opens the library screen
- **THEN** the screen renders multiple category sections and each section can be horizontally scrolled without changing the other sections

#### Scenario: Library route uses sections as the primary browse mechanism

- **WHEN** a user browses the library screen
- **THEN** the experience is organized around category sections rather than top-level category filter tabs or separate category drill-down links

### Requirement: Sound cards expose the agreed Phase 3 browse presentation

Each sound card SHALL render as a square card with rounded corners, a visual background, a gradient overlay, the sound name, subtitle, clip duration, and a top-right premium indicator for premium sounds.

#### Scenario: Free and premium sounds render the required card content

- **WHEN** the library screen renders a sound card
- **THEN** the card shows the sound name, subtitle, duration, and visual background treatment
- **AND** premium sounds show the agreed premium badge treatment in the top-right area

#### Scenario: Reusable library browse UI lives under the library feature slice

- **WHEN** a developer reviews the implementation for the library card and category section UI
- **THEN** the reusable components live under `src/library/ui/components/` rather than under legacy top-level `src/components/` paths

### Requirement: Tapping a sound card opens the player route

The library shell SHALL allow a user to tap a sound card and navigate into the player route for that sound.

#### Scenario: Sound-card tap enters the player flow

- **WHEN** a user taps a sound card in the library shell
- **THEN** the app pushes the `/player` route
- **AND** the selected sound identity is made available to the player flow through the route or shared state boundary used by the implementation
