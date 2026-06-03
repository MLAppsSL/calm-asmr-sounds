## ADDED Requirements

### Requirement: Firebase auth sessions persist across app restarts

The app SHALL use the shared Firebase Auth client from `src/lib/firebase.ts`, it SHALL expose a named `auth` export for Phase 5 auth consumers, and an authenticated user session SHALL survive app restarts and be restored without re-entering credentials.

#### Scenario: Persisted session is restored on cold start

- **WHEN** a user has previously authenticated successfully and reopens the app later
- **THEN** Firebase Auth restores the persisted session from native device storage
- **AND** the app can recover the authenticated user without forcing a new sign-in

#### Scenario: Shared Firebase auth export remains stable for later Phase 5 work

- **WHEN** later auth or favorites-sync modules import the shared Firebase client
- **THEN** they can import the named `auth` export from `src/lib/firebase.ts`

### Requirement: Global auth state is exposed through a shared provider

The app SHALL provide a shared auth context in `src/context/AuthContext.tsx`, it SHALL export `AuthProvider` and `useAuth`, it SHALL expose `user`, `isLoading`, `signIn`, `signUp`, and `signOut`, and it SHALL update that state from Firebase Auth lifecycle events with proper subscription cleanup.

#### Scenario: Initial auth state resolves through the provider

- **WHEN** the app bootstrap mounts the auth provider
- **THEN** the provider reports `isLoading` until the initial session check finishes
- **AND** it exposes either the restored authenticated user or `null` once auth state is known

#### Scenario: Auth lifecycle updates shared state

- **WHEN** Firebase Auth emits an auth state change event through `onAuthStateChanged`
- **THEN** the provider updates the shared user state to reflect the latest session

#### Scenario: Shared auth exports remain stable for later Phase 5 work

- **WHEN** route modules or sync hooks need auth state or auth actions
- **THEN** they can import `AuthProvider` and `useAuth` from `src/context/AuthContext.tsx`

### Requirement: Startup waits for auth bootstrap before showing the shell

The root app startup SHALL keep splash gating active until both onboarding restoration and auth initialization have completed.

#### Scenario: Splash remains visible while auth is unresolved

- **WHEN** onboarding restoration has finished but auth initialization is still loading
- **THEN** the root layout keeps the splash gate active and does not render the ready shell yet

#### Scenario: Shell becomes ready after both startup checks complete

- **WHEN** onboarding restoration and auth initialization have both completed
- **THEN** the root layout releases the splash gate and renders the main app shell

### Requirement: Modal auth flow supports sign in and sign up without raw backend errors

The app SHALL provide a modal auth screen with email and password inputs, a sign-in or sign-up mode toggle, and human-readable error messaging instead of raw Firebase error strings.

#### Scenario: User signs in or signs up from the modal

- **WHEN** a user submits valid email and password credentials from the auth modal
- **THEN** the screen invokes the selected auth action and closes on successful authentication

#### Scenario: Auth failure shows mapped copy

- **WHEN** the auth provider returns a known failure for the submitted credentials
- **THEN** the screen shows a human-readable error message
- **AND** it does not render the raw Firebase error text directly to the user

### Requirement: Authentication remains optional for current app features

The app SHALL continue to render and allow access to existing non-sync product surfaces when no authenticated user is present.

#### Scenario: Signed-out user can still use the app shell

- **WHEN** the app has no authenticated user after startup completes
- **THEN** the user can still browse, play sounds, view favorites, and open settings without being blocked by a login wall
