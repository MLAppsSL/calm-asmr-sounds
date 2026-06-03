## Why

Phase 5 already establishes optional email authentication and cloud favorites sync, but the current app shell does not surface those capabilities where users naturally look for them. This change adds the missing product entry points so users can discover sync, sign in from Settings, and understand when favorites are cloud-backed without disrupting anonymous usage.

## What Changes

- Add an Account section to the bottom of Settings that shows a sign-in entry point when signed out and the current email plus sign-out action when signed in.
- Add a subtle sync nudge to the top of Favorites for signed-out users that opens the auth modal.
- Add a subtle cloud-backed indicator in the Favorites header for signed-in users.
- Preserve all existing anonymous browsing, playback, and favorites behaviors while making auth and sync state visible in the UI.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `optional-email-auth`: Extend auth requirements to cover the Settings-based sign-in and sign-out surface and immediate signed-in or signed-out UI updates.
- `firebase-favorites-sync`: Extend sync requirements to cover Favorites-screen discoverability cues for signed-out and signed-in states.

## Impact

- Affected code: `app/(tabs)/settings.tsx`, `app/(tabs)/favorites.tsx`
- Related shared modules: `src/context/AuthContext.tsx`, `app/auth.tsx`
- User-facing behavior: Settings becomes the primary auth entry point; Favorites shows sync discoverability and state cues.
- No API or storage contract changes are expected.
