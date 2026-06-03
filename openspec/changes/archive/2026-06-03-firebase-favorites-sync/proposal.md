## Why

Phase 5 plan `05-02` is the point where authentication begins changing user data behavior, but the current planning text still assumes Supabase even though the app has standardized on Firebase Auth and Firestore. This change is needed now so login can silently merge local favorites into a cloud-backed account and keep favorites available across devices without interrupting the existing anonymous flow.

## What Changes

- Add a Firestore-backed favorites sync service that reads, writes, and merges a signed-in user's favorites document.
- Add a root-level favorites sync hook that reacts to Firebase auth changes, runs one-shot migration on login, replaces in-memory favorites with the cloud-backed set, and persists later signed-in favorites changes back to Firestore.
- Preserve local favorites on logout instead of clearing them, so signing out returns the app to local-only behavior without data loss.
- Keep sync failures silent and fallback-safe so unreachable Firestore does not block browsing or wipe local favorites, and retry login-time sync on a later app open or signed-in session.
- Wire the sync hook into `app/_layout.tsx` so it survives navigation and does not re-run migration on screen changes.

## Capabilities

### New Capabilities

- `firebase-favorites-sync`: Auth-driven Firestore favorites migration and sync between the local favorites store and the signed-in user's cloud data.

### Modified Capabilities

None.

## Impact

- Affected code: `app/_layout.tsx`, `src/context/AuthContext.tsx`, `src/favorites/domain/stores/favoritesStore.ts`, new favorites sync service and hook files under the current favorites feature structure, and `.planning/phases/05-auth-and-cloud-sync/05-02-SUMMARY.md`.
- Affected systems: Firebase Auth, Firestore, persisted local favorites state, startup/root layout lifecycle.
- Dependencies: `@react-native-firebase/auth`, `@react-native-firebase/firestore`, Zustand persisted favorites store.
