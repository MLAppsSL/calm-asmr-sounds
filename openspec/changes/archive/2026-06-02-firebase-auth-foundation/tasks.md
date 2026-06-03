## 1. Auth Client Foundation

> Correction: Firebase Auth is the current Phase 5 source of truth, and this archived task record reflects the shipped Firebase implementation.

- [x] 1.1 Expose the shared Firebase modules from `src/lib/firebase.ts`, including the named `auth` export used by the Phase 5 auth foundation.
- [x] 1.2 Extend `src/types/index.ts` with the shared `AuthUser` alias and `FavoritesRow` type used by the Phase 5 auth and sync layers.

## 2. Shared Auth State

- [x] 2.1 Create `src/context/AuthContext.tsx` with `onAuthStateChanged` bootstrap, subscription cleanup, and shared `user` and `isLoading` state.
- [x] 2.2 Export `AuthProvider` and `useAuth`, implement `signIn`, `signUp`, and `signOut`, and map Firebase auth failures to human-readable UI messages.

## 3. App Bootstrap And Routing

- [x] 3.1 Wrap the root app layout with `AuthProvider` and combine auth readiness with the existing onboarding readiness gate before releasing the splash screen.
- [x] 3.2 Update the root stack route declarations to present `app/auth.tsx` as a modal auth screen and align the route graph with the new OpenSpec delta.

## 4. Auth UI Surface And Verification

- [x] 4.1 Build `app/auth.tsx` with email and password inputs, a sign-in or sign-up toggle, inline mapped error messaging, and success dismissal back to the previous screen.
- [x] 4.2 Verify with `npx tsc --noEmit` that the Phase 5 auth foundation changes compile cleanly.
- [x] 4.3 Verify the named `auth`, `AuthProvider`, and `useAuth` exports plus the required Firebase auth lifecycle marker (`onAuthStateChanged`) are present in the expected files.
- [x] 4.4 Verify `app/auth.tsx` dismisses with `router.back()`, the Phase 5 auth files use Firebase references as intended, and the app introduces no forced-auth routing patterns.
