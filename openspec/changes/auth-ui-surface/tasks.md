## 1. Settings Auth Surface

- [x] 1.1 Update `app/(tabs)/settings.tsx` to read `user` and `signOut` from `useAuth` and import `router` for auth navigation.
- [x] 1.2 Add the bottom-of-screen Account section that shows a sign-in row when signed out and the signed-in email plus sign-out action when authenticated.

## 2. Favorites Sync Surface

- [x] 2.1 Update `app/(tabs)/favorites.tsx` to read `user` from `useAuth` and reuse `router` for auth navigation.
- [x] 2.2 Add the signed-out sync nudge above the favorites list and the signed-in cloud indicator near the Favorites header without changing favorites list or toggle behavior.

## 3. Verification

- [x] 3.1 Run `npx tsc --noEmit` and fix any type issues introduced by the auth-aware UI additions.
- [x] 3.2 Verify the auth-aware UI wiring in `settings.tsx` and `favorites.tsx`, including `/auth` navigation, sign-out behavior, and preservation of existing favorites interactions.
- [ ] 3.3 Manually verify the Firebase-backed auth state transitions on a device or simulator: signed-out Settings and Favorites surfaces, sign-in via `/auth`, signed-in cloud indicator state, immediate sign-out reversion, and unchanged favorites behavior across those transitions.
