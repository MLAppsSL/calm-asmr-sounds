## Context

Phase 5 already adds optional email authentication and cloud-backed favorites sync through shared auth and sync modules. The remaining gap is product discoverability: signed-out users need a clear but low-friction path to sign in, and signed-in users need light feedback that favorites are now cloud-backed.

The current implementation surface is narrow and self-contained. `app/(tabs)/settings.tsx` already owns the settings sections and is the right place for an optional account entry point. `app/(tabs)/favorites.tsx` already owns the favorites header and list framing, so it can expose sync discovery without changing list data or mutation behavior. Existing auth state and actions come from `useAuth`, and the existing auth modal route remains the only sign-in flow.

## Goals / Non-Goals

**Goals:**

- Surface optional authentication from Settings without promoting it above core playback and support settings.
- Make the value of sync discoverable from Favorites when the user is signed out.
- Indicate cloud-backed sync state in Favorites when the user is signed in.
- Reuse existing auth state, sign-out behavior, and auth modal routing with no changes to persistence or sync logic.
- Preserve all existing favorites list, empty state, and toggle behavior across auth states.

**Non-Goals:**

- Changing auth providers, session persistence, or favorites sync storage.
- Adding a new auth screen, banner system, or onboarding step.
- Introducing explicit sync progress, sync errors, or additional account management features.
- Reworking Settings or Favorites layout beyond the minimal auth-aware additions.

## Decisions

### Add the auth entry point at the bottom of Settings

Settings is the stable place users expect account controls, but auth is optional for this product. Placing the Account section below Support keeps the entry point discoverable without making sign-in feel required.

Alternative considered: placing sign-in near the top of Settings or in a dedicated modal trigger elsewhere. Rejected because it gives optional auth too much prominence and duplicates navigation paths.

### Keep Settings logic entirely screen-local and driven by `useAuth`

The screen will read `user` and `signOut` directly from `useAuth` and conditionally render either a sign-in row or a signed-in summary plus sign-out action. This keeps auth UI state aligned with the provider and avoids introducing new intermediate state.

Alternative considered: adding a separate account view model or store slice. Rejected because the screen only needs existing provider state and actions.

### Reuse the existing `/auth` modal as the only sign-in path

Both Settings and Favorites will navigate to `router.push('/auth')` for signed-out entry. This preserves one consistent auth experience and avoids parallel auth entry implementations.

Alternative considered: embedding inline auth controls in Settings or Favorites. Rejected because it duplicates auth form behavior and adds complexity to tab screens.

### Add subtle auth-aware cues in Favorites without changing favorites behavior

The Favorites screen will show a lightweight nudge row above the list when signed out and a small cloud indicator near the title when signed in. These additions communicate sync value and sync state while leaving list data, rendering, and favorite mutations untouched.

Alternative considered: a larger banner or a loading/synced status card. Rejected because the phase goal is discoverability, not a new sync management surface.

## Risks / Trade-offs

- [Settings layout crowding on small devices] -> Keep the Account section compact and appended to the bottom rather than inserting it higher in the screen.
- [Favorites visual noise] -> Use subdued copy and icon treatment so the nudge reads as a hint, not a blocking callout.
- [Signed-out and signed-in UI drifting from provider state] -> Read directly from `useAuth` and rely on provider updates after sign-in and sign-out rather than duplicating state.
- [Accidental favorites regressions] -> Limit Favorites changes to header and list framing only; do not alter data sources, render items, or toggle paths.
