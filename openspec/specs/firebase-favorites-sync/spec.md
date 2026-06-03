## ADDED Requirements

### Requirement: Favorites cloud data is stored in Firestore per signed-in user

The app SHALL provide a favorites sync service that reads and writes the signed-in user's favorites through Firestore, and that service SHALL store cloud favorites under the user's Firestore record using a favorites map keyed by sound ID that can be converted to and from the local `Favorite[]` shape.

#### Scenario: Reading cloud favorites returns local store shape

- **WHEN** the favorites sync service loads data for a signed-in user whose Firestore record contains a `favorites` map
- **THEN** the service returns a `Favorite[]` containing those sound IDs and timestamps
- **AND** the returned values are safe to pass directly to `useFavoritesStore().setFavorites`

#### Scenario: Writing favorites replaces the cloud-backed set

- **WHEN** the favorites sync service persists a signed-in user's full favorites set
- **THEN** the service writes the user's Firestore favorites map using sound IDs as keys
- **AND** duplicate sound IDs do not create duplicate favorites entries in cloud storage

### Requirement: First login silently merges local favorites into cloud favorites

The app SHALL merge anonymous local favorites into the signed-in user's Firestore favorites on login using a union by sound ID, and it SHALL preserve the earliest known `addedAt` timestamp when the same sound exists in both local and cloud data.

#### Scenario: Local-only favorites are uploaded on first login

- **WHEN** a signed-out user with locally persisted favorites signs into an account with no cloud favorites yet
- **THEN** the app writes those local favorites into the user's Firestore favorites data
- **AND** the in-memory favorites store continues showing the same favorites after login completes

#### Scenario: Local and cloud favorites are deduplicated during migration

- **WHEN** a signed-out user signs into an account that already has some overlapping cloud favorites
- **THEN** the merged cloud-backed set contains each sound at most once
- **AND** the merged result preserves the earliest `addedAt` timestamp for each overlapping sound ID

### Requirement: Auth state changes switch the favorites source without user-facing sync UI

The app SHALL run favorites sync from a root-level hook that reacts to Firebase auth state changes, and it SHALL replace the active favorites store with cloud favorites after successful login without showing a dedicated loading or sync confirmation UI.

#### Scenario: Login replaces local-only session state with cloud-backed favorites

- **WHEN** Firebase auth changes from signed-out to signed-in and favorites migration or load succeeds
- **THEN** the root-level sync hook updates the Zustand favorites store with the Firestore-backed favorites set
- **AND** the hook does not require the user to visit a specific screen before sync occurs

#### Scenario: Navigation does not re-run migration guards

- **WHEN** the user navigates between tabs or modal routes after login
- **THEN** the favorites sync hook remains mounted from the root layout
- **AND** the same signed-in session does not trigger duplicate migration work only because navigation changed

### Requirement: Favorites changes made while signed in are written back to Firestore

The app SHALL persist favorites mutations made after login back to Firestore while the user remains signed in, and it SHALL avoid treating the initial cloud-to-store replacement after login as a new local mutation that immediately triggers a redundant write.

#### Scenario: Post-login favorite changes survive app restart

- **WHEN** a signed-in user adds or removes favorites after the initial login sync has completed
- **THEN** the current favorites set is written back to that user's Firestore favorites data
- **AND** reopening the app while still signed in restores those changes from Firestore

#### Scenario: Initial cloud load does not cause an echo write

- **WHEN** the sync hook replaces the local favorites store with the Firestore-backed set during login hydration
- **THEN** that store update is not treated as a fresh user-authored mutation that immediately writes the same set back to Firestore

### Requirement: Logout and Firestore failures preserve local favorites safely

The app SHALL preserve local favorites as the fallback data source when auth returns to signed-out, and it SHALL leave local favorites unchanged if Firestore reads or writes fail during sync.

#### Scenario: Logout restores local-only favorites behavior

- **WHEN** a signed-in user signs out after the app has been showing cloud-backed favorites
- **THEN** the favorites store reverts to the preserved local favorites snapshot from before login
- **AND** the app does not clear the favorites store solely because auth became signed-out

#### Scenario: Firestore failure does not wipe local favorites

- **WHEN** a favorites sync read or migration write fails because Firestore is unreachable or returns an error
- **THEN** the app keeps the current local favorites state intact
- **AND** the failure does not force a user-visible error or empty favorites replacement in this slice

#### Scenario: Failed login sync is retried on a later session

- **WHEN** a login-time Firestore read or migration attempt fails for a signed-in user
- **THEN** the app leaves local favorites unchanged for that session
- **AND** a later app open or later signed-in session attempts the login-time sync again for that user
