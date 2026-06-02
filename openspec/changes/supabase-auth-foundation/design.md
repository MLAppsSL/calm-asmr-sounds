## Context

Phase 5 needs an auth bootstrap layer before favorites migration and cross-device sync can be implemented. The app already relies on Supabase for backend integration in recent plans, and this plan explicitly locks Phase 5 auth to Supabase email/password instead of Firebase Auth. The current shell must stay anonymous-first, so authentication can add cloud identity without blocking playback, browsing, favorites, or settings for signed-out users.

This change also intersects with app startup. The root layout already coordinates onboarding gating; auth restoration now needs to join that bootstrap flow so the app does not briefly render the wrong shell state during cold start. The route shape also changes from the earlier placeholder auth route-group plan to a single modal auth entry screen.

## Goals / Non-Goals

**Goals:**

- Establish a single shared Supabase client configuration for React Native auth with persisted sessions.
- Add a global `AuthContext` that owns auth lifecycle subscription, current user state, and auth actions.
- Keep splash visibility until both onboarding and auth bootstrap finish.
- Provide a simple modal auth UI for sign in and sign up with human-readable errors.
- Preserve anonymous access to all existing product surfaces.

**Non-Goals:**

- Favorites migration, background sync, or multi-device reconciliation.
- Social login providers, magic links, or email verification flows.
- Server-side authorization changes for premium access or sync writes.
- Broad route-system redesign beyond replacing the planned auth route group with a modal auth screen.

## Decisions

### Use Supabase auth persistence through the existing client module

The app will configure `@supabase/supabase-js` with `AsyncStorage`, `persistSession: true`, `autoRefreshToken: true`, and `detectSessionInUrl: false` in `src/lib/supabase.ts`.

Rationale: React Native does not have browser URL callback semantics, and in-memory auth would log users out on every restart. Keeping the auth configuration in the shared Supabase module avoids duplicate client initialization and makes later sync code depend on the same authenticated client.

Alternatives considered:

- Use Firebase Auth: rejected because the Phase 5 plan explicitly locks auth to Supabase.
- Initialize a second Supabase client only for auth: rejected because it would split session state and increase bootstrap risk.

### Manage auth lifecycle in React Context instead of a store

`AuthContext` will own initial `getSession()` resolution, the `onAuthStateChange` subscription, and `signIn`, `signUp`, and `signOut` helpers.

Rationale: Supabase auth is a subscription-driven lifecycle concern with cleanup requirements. A context provider is the smallest place to centralize that state and avoid scattering session bootstrapping across routes or stores.

Alternatives considered:

- Use Zustand for auth state: rejected because the subscription lifecycle would still need React-owned setup and teardown.
- Fetch session ad hoc in each screen: rejected because it creates inconsistent loading and duplicate listeners.

### Join auth readiness with onboarding readiness in the root layout

The root layout will wait for `auth.isLoading === false` and the existing onboarding check before it hides the splash screen and renders the shell.

Rationale: without a combined startup gate, the app can briefly render signed-out UI before a persisted session restores, or dismiss the splash before startup state is coherent.

Alternatives considered:

- Allow auth to resolve after shell render: rejected because it risks visible flicker and inconsistent settings/auth entry state.
- Add a separate auth loading screen: rejected because it adds friction to a calm-first app for a background initialization concern.

### Replace the auth route group with a single modal auth screen

The auth entry point will be `app/auth.tsx`, declared from the root stack as a modal screen.

Rationale: Phase 5 only needs one compact email/password surface with a sign-in or sign-up toggle. A single modal route better matches the non-intrusive requirement and keeps the main shell accessible.

Alternatives considered:

- Keep separate `sign-in` and `sign-up` routes in an auth group: rejected because it adds navigation overhead without adding product value for v1.
- Full-screen auth takeover: rejected because the app must remain usable without an account.

### Map Supabase errors before rendering them

The auth UI will convert known Supabase auth failures into concise human-readable messages and avoid exposing raw backend strings.

Rationale: raw provider errors are inconsistent and often too technical for a calm consumer app. A small mapping layer keeps the UI predictable and localizes future copy updates.

Alternatives considered:

- Render raw error messages: rejected because it leaks implementation details and creates uneven UX.

## Risks / Trade-offs

- [Startup gate regression] -> Combining onboarding and auth readiness can hold the splash longer if either path stalls. Mitigation: keep the auth bootstrap minimal and resolve `isLoading` immediately after `getSession()` settles.
- [Plan versus prior route spec drift] -> Earlier route planning assumed an auth route group. Mitigation: capture the route change as an explicit `app-route-skeleton` spec delta in this change.
- [Auth copy gaps] -> Supabase may return error variants not covered by the first mapping pass. Mitigation: provide a safe fallback message and extend mapping as cases appear.
- [Later sync coupling] -> Favorites sync work depends on these auth contracts staying stable. Mitigation: keep the provider API small and centered on `user`, `isLoading`, and auth actions.

## Migration Plan

1. Update the shared Supabase client to persist auth sessions in React Native.
2. Add `AuthContext` and wrap the root layout with the provider.
3. Combine auth and onboarding readiness in the startup gate.
4. Add the modal auth screen and connect it to the provider actions.
5. Verify that signed-out access still works and that signed-in sessions restore after restart.

Rollback strategy: remove the provider and modal route, restore the previous root-layout startup gate, and revert the Supabase auth configuration if auth bootstrap causes instability.

## Open Questions

- No blocking open questions for implementation. Later Phase 5 changes will decide how Settings surfaces account status and how local favorites migrate on first authenticated sync.
