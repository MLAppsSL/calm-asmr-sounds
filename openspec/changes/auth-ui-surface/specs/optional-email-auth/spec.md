## ADDED Requirements

### Requirement: Settings exposes optional account entry and session controls

The app SHALL render an Account section at the bottom of Settings that reflects the current shared auth state, it SHALL open the existing auth modal when a signed-out user chooses to sign in, and it SHALL expose sign-out controls when a user is authenticated.

#### Scenario: Signed-out settings shows a sign-in entry point

- **WHEN** the Settings screen renders while `useAuth().user` is `null`
- **THEN** the Account section shows a row inviting the user to sign in to sync favorites
- **AND** activating that row opens the existing `/auth` modal flow

#### Scenario: Signed-in settings shows the active account and sign-out action

- **WHEN** the Settings screen renders while `useAuth().user` is present
- **THEN** the Account section shows the signed-in email address
- **AND** it shows a sign-out action wired to the shared auth provider

#### Scenario: Sign-out immediately restores the signed-out settings state

- **WHEN** an authenticated user activates the sign-out control and the shared auth state becomes signed out
- **THEN** the Settings screen returns to the signed-out Account row without requiring an app restart or manual refresh
