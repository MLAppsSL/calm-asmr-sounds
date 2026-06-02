## ADDED Requirements

### Requirement: The settings tab renders the Phase 3 settings shell

The app SHALL render `app/(tabs)/settings.tsx` as the real Phase 3 settings screen with the planned list of settings rows rather than a placeholder state.

#### Scenario: Settings screen shows the expected rows

- **WHEN** a user opens the Settings tab
- **THEN** the screen shows rows for Dark Mode, Session Duration, Loop Mode, Auto-play Next, Silence Notifications, Support and FAQ, and Share with Friends

### Requirement: Dark mode is functional from the settings screen

The Settings screen SHALL expose a working dark-mode toggle backed by the shared UI store so users can change the shell theme from the settings surface.

#### Scenario: Toggling dark mode updates the app theme

- **WHEN** a user toggles the Dark Mode control in Settings
- **THEN** the app updates the shell background and related screen colors between the dark and light presentation states

#### Scenario: Settings reflects the current dark-mode value

- **WHEN** a user opens the Settings screen after the shared UI store has hydrated
- **THEN** the Dark Mode control reflects the current `isDarkMode` value from the shared UI store

### Requirement: Dark-mode preference persists across app restart

The app SHALL preserve the user-selected dark-mode preference across app restarts through the existing persisted UI-store contract.

#### Scenario: Reopening the app keeps the chosen theme

- **WHEN** a user changes dark mode in Settings and later restarts the app
- **THEN** the restored shell theme matches the previously selected dark-mode value

### Requirement: Non-theme settings remain explicit shell-only affordances in Phase 3

The Settings screen SHALL present the remaining planned rows as visible shell affordances without claiming behavior that is not implemented in this slice, and those rows SHALL provide explicit `coming soon` feedback when tapped.

#### Scenario: Shell-only rows do not perform hidden product actions

- **WHEN** a user interacts with Session Duration, Loop Mode, Auto-play Next, Silence Notifications, Support and FAQ, or Share with Friends in Phase 3
- **THEN** the screen keeps those rows as shell-only affordances rather than silently mutating unrelated app state

#### Scenario: Shell-only rows acknowledge interaction explicitly

- **WHEN** a user taps Session Duration, Loop Mode, Auto-play Next, Silence Notifications, Support and FAQ, or Share with Friends in Phase 3
- **THEN** the app surfaces clear `coming soon` feedback
- **AND** the tap does not appear broken or silently ignored
