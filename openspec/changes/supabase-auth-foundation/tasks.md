## 1. Auth Client Foundation

> Correction: Firebase Auth is the current Phase 5 source of truth. These completed Supabase task records are retained as history, but the active implementation is being moved back to Firebase.

- [x] 1.1 Update `src/lib/supabase.ts` to configure Supabase auth with `AsyncStorage`, `persistSession`, `autoRefreshToken`, and `detectSessionInUrl: false` while preserving a named `supabase` export for later Phase 5 work.
- [x] 1.2 Extend `src/types/index.ts` with the shared `AuthUser` alias and `FavoritesRow` type used by the Phase 5 auth and sync layers.

## 2. Shared Auth State

- [x] 2.1 Create `src/context/AuthContext.tsx` with initial `getSession()` bootstrap, `onAuthStateChange` subscription cleanup, and shared `user` and `isLoading` state.
- [x] 2.2 Export `AuthProvider` and `useAuth`, implement `signIn`, `signUp`, and `signOut`, and map Supabase auth failures to human-readable UI messages.

## 3. App Bootstrap And Routing

- [x] 3.1 Wrap the root app layout with `AuthProvider` and combine auth readiness with the existing onboarding readiness gate before releasing the splash screen.
- [x] 3.2 Update the root stack route declarations to present `app/auth.tsx` as a modal auth screen and align the route graph with the new OpenSpec delta.

## 4. Auth UI Surface And Verification

- [x] 4.1 Build `app/auth.tsx` with email and password inputs, a sign-in or sign-up toggle, inline mapped error messaging, and success dismissal back to the previous screen.
- [x] 4.2 Verify with `npx tsc --noEmit` that the Phase 5 auth foundation changes compile cleanly.
- [x] 4.3 Verify the named `supabase`, `AuthProvider`, and `useAuth` exports plus the required auth configuration markers (`AsyncStorage`, `detectSessionInUrl: false`, `onAuthStateChange`) are present in the expected files.
- [x] 4.4 Verify `app/auth.tsx` dismisses with `router.back()`, the Phase 5 auth files contain no Firebase references, and the app introduces no forced-auth routing patterns.
