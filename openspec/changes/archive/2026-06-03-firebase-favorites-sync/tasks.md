## 1. Firestore Favorites Data Layer

- [x] 1.1 Add a favorites sync service under the favorites feature that converts between `Favorite[]` and the Firestore `favorites` map stored at `users/{uid}`.
- [x] 1.2 Implement `getFavorites(uid)` so signed-in favorites load from Firestore into the local store shape without throwing destructive fallback errors.
- [x] 1.3 Implement `setFavorites(uid, favorites)` and `migrateLocalToCloud(uid, localFavorites)` with union-by-sound-id merge behavior and earliest-`addedAt` preservation.

## 2. Auth-Driven Sync Orchestration

- [x] 2.1 Add `useFavoritesSync` in the favorites feature and have it react to `useAuth().user?.uid` changes from the root app lifecycle.
- [x] 2.2 Preserve a pre-login local favorites snapshot, run one-shot migration on login, and replace the Zustand favorites store with the merged Firestore-backed set.
- [x] 2.3 Persist favorites changes made while signed in back to Firestore, while preventing echo writes caused by the initial cloud-to-store replacement.
- [x] 2.4 Restore local-only favorites behavior on logout and keep Firestore failures silent so local favorites remain intact, including retrying failed login-time sync on a later app open or signed-in session.

## 3. Root Wiring And Verification

- [x] 3.1 Mount `useFavoritesSync` from the non-unmounting root layout so navigation does not reset migration guards.
- [x] 3.2 Add or update focused tests for favorites map conversion, migration deduplication, and logout fallback behavior where the repo already has coverage patterns for the touched files.
- [x] 3.3 Add or update focused tests for signed-in writeback, retry-after-failure behavior, and cloud-load echo-write suppression.
- [x] 3.4 Verify the slice with repo-supported checks and targeted runtime validation for login merge, post-login persistence across restart, silent failure fallback, retry on later session, and logout preservation.
- [x] 3.5 Write `.planning/phases/05-auth-and-cloud-sync/05-02-SUMMARY.md` with the final implementation notes and any path deviations from the stale plan text.
