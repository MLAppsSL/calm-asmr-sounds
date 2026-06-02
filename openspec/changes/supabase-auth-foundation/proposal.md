## Why

> Correction: the implemented Phase 5 auth foundation is being steered back to Firebase Auth to match the existing native project setup. Supabase-specific wording in this change is stale planning drift.

Phase 5 depends on a working auth foundation before favorites can migrate or sync across devices. The app needs optional email auth that preserves calm-first access for anonymous users while restoring sessions reliably across app restarts.

## What Changes

- Add a Supabase-backed optional email/password auth foundation for React Native with persistent sessions via AsyncStorage.
- Introduce an app-wide `AuthContext` that exposes the current user, initialization state, and `signIn`, `signUp`, and `signOut` actions.
- Update the root layout so startup readiness waits for both onboarding restoration and auth restoration before dismissing the splash screen.
- Add a modal auth screen reachable from the app shell with sign-in and sign-up flows plus human-readable auth errors.
- Preserve anonymous access so every current app feature still renders and works without forcing account creation.

## Capabilities

### New Capabilities

- `optional-email-auth`: Optional Supabase email authentication with persistent sessions, global auth state, and a non-blocking modal auth flow.

### Modified Capabilities

- `app-route-skeleton`: Replace the planned auth route group with a single modal `app/auth.tsx` screen declared from the root stack.

## Impact

- Affected code: `src/lib/supabase.ts`, `src/context/AuthContext.tsx`, `src/types/index.ts`, `app/_layout.tsx`, `app/auth.tsx`.
- Systems: Supabase Auth session storage and app bootstrap flow.
- Dependencies: React Native AsyncStorage persistence for `@supabase/supabase-js` auth state.
- Follow-on work: Enables favorites migration and cross-device sync changes planned later in Phase 5.
