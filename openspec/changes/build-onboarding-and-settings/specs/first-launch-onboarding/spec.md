## ADDED Requirements

### Requirement: The app routes first-time and returning users through the correct shell entry path

The app SHALL check an onboarding completion flag during startup and route first-time users into `/(onboarding)` while routing returning users directly into `/(tabs)`.

#### Scenario: First launch enters onboarding

- **WHEN** the app starts and the onboarding completion flag is absent
- **THEN** the root shell routes the user into `/(onboarding)` instead of the library tabs

#### Scenario: Returning user skips onboarding

- **WHEN** the app starts and the onboarding completion flag is already present
- **THEN** the root shell routes the user directly into `/(tabs)` without requiring the onboarding screens again

### Requirement: The onboarding Welcome screen exposes the planned first step

The app SHALL render `app/(onboarding)/index.tsx` as a real Welcome screen that presents the Phase 3 onboarding headline, supporting label, and a clear entry action into the second onboarding step.

#### Scenario: Welcome screen shows the expected content

- **WHEN** a user lands on the onboarding Welcome screen
- **THEN** the screen shows the onboarding logo or icon treatment, the `Find your calm in a minute` headline, the `ULTRA-SHORT SOUNDS` label, and a `Begin` button

#### Scenario: Welcome screen advances to Quiet Mode

- **WHEN** a user taps `Begin` on the onboarding Welcome screen
- **THEN** the app navigates to `/(onboarding)/quiet-mode`

### Requirement: The Quiet Mode screen completes onboarding regardless of CTA choice

The app SHALL render `app/(onboarding)/quiet-mode.tsx` as the second onboarding step with a pre-enabled visual DND toggle and completion actions that both mark onboarding as complete and enter the tabs shell.

#### Scenario: Quiet Mode presents the expected shell controls

- **WHEN** a user views the Quiet Mode screen
- **THEN** the screen shows the Quiet Mode explanation, a Do Not Disturb toggle initialized to enabled, and both `Continue` and `Not now` actions

#### Scenario: Continue completes onboarding

- **WHEN** a user taps `Continue` on the Quiet Mode screen
- **THEN** the app writes the onboarding completion flag
- **AND** the app replaces the onboarding flow with `/(tabs)`

#### Scenario: Not now also completes onboarding

- **WHEN** a user taps `Not now` on the Quiet Mode screen
- **THEN** the app writes the onboarding completion flag
- **AND** the app replaces the onboarding flow with `/(tabs)`
