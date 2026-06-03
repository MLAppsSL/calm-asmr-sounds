## Context

Phase `05-02` sits between the new Firebase auth foundation and the later Phase 5 UI work. The current plan content is stale because it still describes Supabase table reads and upserts, while the app now uses `@react-native-firebase/auth`, exports `firestore` from `src/lib/firebase.ts`, and already has local favorites persisted through the Zustand `useFavoritesStore`.

The change is cross-cutting in three places:

- a Firestore data layer for favorites
- an auth-aware orchestration hook that bridges Firebase auth to the local store
- root layout wiring so the sync lifecycle survives navigation

The implementation also needs a safe migration path because anonymous users may already have local favorites before creating or signing into an account.

## Goals / Non-Goals

**Goals:**

- Use Firestore, not Supabase, as the cloud source of truth for signed-in favorites.
- Merge anonymous local favorites into the signed-in account on login without losing data.
- Replace the in-memory favorites store with cloud-backed data after login.
- Persist favorites changes made while signed in so they survive app restarts and appear on other devices.
- Preserve local favorites on logout so the app returns to local-only behavior cleanly.
- Keep failures silent and fallback-safe.
- Keep the sync hook mounted at the app root so migration guards are not reset by route changes.

**Non-Goals:**

- Real-time multi-device listeners during an active session.
- Per-favorite incremental cloud writes outside the current full-set sync contract.
- New user-facing loading, conflict, or error UI for sync.
- Changes to the existing auth modal or Phase 5 screen-level account UI.

## Decisions

### Store cloud favorites as a single Firestore document keyed by sound ID

Cloud favorites will live in a Firestore document at `users/{uid}` with a `favorites` map shaped like the existing `FavoritesDocument` type: `{ [soundId]: { addedAt: number } }`.

Rationale:

- the repo already has `FavoritesMap` and `FavoritesDocument` types that fit this shape
- sound ID keys provide natural deduplication
- a single document keeps reads and writes simple for this slice
- RN Firebase Firestore supports offline caching natively, which matches the current Firebase direction better than the stale Supabase plan

Alternatives considered:

- `favorites/{uid}` top-level documents: workable, but less aligned with the existing `users/{uid}` planning note and future user-profile expansion
- a subcollection with one document per favorite: more flexible for large datasets, but unnecessary complexity for a small favorites set and a full-set sync contract

### Keep the service API array-based and convert at the boundary

The new favorites service will expose `getFavorites(uid)`, `setFavorites(uid, favorites)`, and `migrateLocalToCloud(uid, localFavorites)` using the local `Favorite[]` model, while converting to and from the Firestore map shape internally.

Rationale:

- the Zustand store and current favorites UI already speak `Favorite[]`
- conversion at one boundary keeps cloud-shape concerns out of the rest of the app
- it preserves the Phase `05-02` service contract while swapping the backend implementation

Alternatives considered:

- changing the store to a cloud-native map: would spread Firestore-specific concerns through the favorites feature for little benefit in this slice

### Run migration once per signed-in session from a root-level hook

`useFavoritesSync` will depend on `user?.uid` from `useAuth()`, read local favorites from the store, and use a ref guard to prevent duplicate migration work while the same signed-in session remains active. The hook will live in a non-unmounting root layout component.

Rationale:

- auth changes are the natural trigger for switching between local-only and cloud-backed favorites
- a root-level mount avoids re-running migration when users navigate between tabs or modal routes
- a ref guard avoids duplicate writes during startup or React re-renders

Alternatives considered:

- placing the hook in a Favorites screen: too fragile because unmounts would reset migration state
- putting this orchestration inside `AuthContext`: mixes unrelated responsibilities and makes favorites sync harder to test independently

### Persist signed-in favorites changes after the initial login sync

After the initial login migration or cloud load completes, the root-level sync hook will observe subsequent local favorites changes while a user is signed in and write the current full set back through the favorites service. The hook will suppress echo writes during the initial cloud-to-store replacement so login hydration does not immediately schedule a redundant save.

Rationale:

- the phase plan's `AUTH-03` behavior requires a new favorite added after login to still exist on app restart
- keeping the writeback logic in the same root hook preserves one place where auth state and cloud sync rules meet
- reusing the full-set service contract avoids expanding this slice into per-item mutation APIs

Alternatives considered:

- persisting only during login and next app open: insufficient for cross-session sync because post-login changes could remain local only
- moving cloud writes into every favorites toggle caller: duplicates sync logic across UI surfaces and increases drift risk

### Retry failed login sync on the next app open or signed-in session

The migration guard will be session-scoped rather than permanent. A login-time Firestore read or migration failure must leave local favorites untouched and allow the same account to retry on a later app open or later signed-in session.

Rationale:

- this preserves the phase requirement that silent failures are recoverable instead of terminal
- it keeps failure behavior aligned with the planning context without adding user-facing recovery UI

### Treat Firestore read or write failures as silent fallback events

If Firestore operations fail, the hook will not clear or overwrite the local store with empty data. Local favorites remain the fallback state, and migration will retry on a later login or app open.

Rationale:

- this matches the phase requirement that auth remains optional and non-destructive
- silent failure avoids blocking app startup or showing noisy sync states before the Phase 5 UI slice

Alternatives considered:

- surfacing sync errors immediately: useful eventually, but outside this slice and inconsistent with the planned silent migration experience

## Risks / Trade-offs

- [A stale local snapshot can survive logout] -> Preserve the pre-login local favorites snapshot before cloud replacement and restore that snapshot when auth returns to signed-out.
- [Repeated full-document writes can overwrite newer cloud state if used carelessly] -> Limit this slice to login migration plus explicit full-set sync semantics, and keep merge behavior based on sound ID plus preserved timestamps.
- [Store-to-cloud writeback can loop after a cloud load] -> Track whether a local store change was initiated by the sync hook and suppress the immediate follow-up save for that transition.
- [Root-level effects can race during startup] -> Gate sync behavior on auth readiness and use an in-flight guard so startup re-renders do not trigger overlapping migrations.
- [Future favorites volume could outgrow a single document approach] -> Accept the document model for this phase because favorites are expected to remain small; revisit only if product scope changes materially.

## Migration Plan

1. Add the Firestore-backed favorites service in the favorites feature.
2. Add the auth-aware `useFavoritesSync` hook and mount it from `app/_layout.tsx`.
3. Add signed-in writeback behavior for post-login favorites changes and guard it against echo loops.
4. Verify anonymous favorites remain intact before login, are merged on login, later signed-in favorites changes persist to Firestore, and local-only mode returns on logout.
5. Write `.planning/phases/05-auth-and-cloud-sync/05-02-SUMMARY.md` with the implementation notes expected by the original plan.
6. If rollout needs to be backed out, remove the root hook and service usage; the persisted local favorites store remains the fallback source and no destructive local migration is required.

## Open Questions

None for this slice. The Firebase direction, silent migration behavior, union merge strategy, and logout preservation behavior are already constrained by the current planning context.
