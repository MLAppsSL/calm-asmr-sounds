## ADDED Requirements

### Requirement: Favorites surfaces sync discoverability and synced state

The app SHALL make the existing Firestore-backed cloud sync discoverable from the Favorites screen when the user is signed out, and it SHALL show a subtle synced-state indicator in the Favorites header when the user is signed in.

#### Scenario: Signed-out favorites shows a sync nudge

- **WHEN** the Favorites screen renders while `useAuth().user` is `null`
- **THEN** the screen shows a subtle sign-in nudge above the favorites list
- **AND** activating that nudge opens the existing `/auth` modal flow

#### Scenario: Signed-in favorites shows a cloud-backed indicator

- **WHEN** the Favorites screen renders while `useAuth().user` is present
- **THEN** the screen shows a subtle cloud indicator near the Favorites header title
- **AND** it does not show the signed-out sync nudge at the same time

#### Scenario: Favorites interactions remain unchanged across auth-aware UI states

- **WHEN** the Favorites screen shows either the signed-out nudge or the signed-in cloud indicator
- **THEN** the existing favorites list, empty state, and favorite toggle interactions continue to behave the same as before
