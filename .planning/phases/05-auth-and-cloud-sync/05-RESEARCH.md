# Phase 5: Auth and Cloud Sync - Research

**Researched:** 2026-02-19
**Domain:** Firebase Auth (email/password), Firestore favorites sync, anonymous-to-cloud migration, AuthContext with Expo Router, session persistence
**Confidence:** HIGH (core Firebase Auth APIs verified against official docs; Firestore data modeling verified against official Firebase docs; Expo Router auth pattern verified against official Expo docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Auth Provider
- Firebase Auth is the auth provider (established in PROJECT.md and STACK.md — "Firebase Auth + Firestore + Storage + Analytics")
- Email + password only (no social login)
- No email verification in v1 — reduce friction
- Sign Out is a clearly labeled, top-level option in Settings — not buried

#### Auth Flow UX
- Login and Sign Up are on the **same screen** with a toggle to switch between the two — single form, minimal navigation
- Auth section added to the Settings screen (already exists from Phase 3/4)

#### Migration Experience
- Anonymous-to-cloud migration runs **silently in the background** — no loading indicator, no confirmation step
- On login: merge local favorites into Firestore favorites (dedup by sound_id)
- If migration fails: retry silently on next app open — no error shown to user; local favorites remain as fallback

#### Sync Strategy
- Firestore as source of truth after login
- On login: merge local favorites into cloud, then load from Firestore
- On load when authenticated: pull from Firestore
- On logout: revert to local-only favorites
- Firestore **offline persistence is enabled** — favorites accessible offline; sync on reconnect

#### Sync Conflict Behavior
- Cross-device conflict strategy: **union** — merge anonymous + cloud, nothing discarded
- Duplicate detection: dedup by `sound_id` (same sound favorited on two devices = keep one entry)

### Claude's Discretion

- Auth entry point surfaces beyond Settings (Favorites screen icon, proactive nudge strategy)
- Auth form presentation (modal sheet vs full screen)
- Post-login UI feedback (silent update vs brief confirmation)
- Whether to include Forgot Password / email reset in this phase
- Post-migration local favorites handling (delete vs keep as backup)
- Sign-out favorites behavior (clear local vs keep cached)
- Duplicate detection algorithm for cross-device conflicts (by `sound_id` dedup)
- Sync status indicator (none vs subtle cloud icon in Favorites header)
- Session persistence strategy (how to store and restore Firebase session in React Native)
- Error handling UX for auth failures
- Loading states during sync
- How to structure the auth context/provider in the React Native app

### Deferred Ideas (OUT OF SCOPE)

- Social login (Google, Apple)
- Email verification
- Password reset flow (can add in later milestone)
- Push notifications for sync conflicts
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can use all free features without creating an account (anonymous mode unchanged) | Auth is entirely optional — no gate on any core feature; anonymous path is the default; `onAuthStateChanged` returns `null` user for anonymous users; all existing Phase 1–4 functionality unchanged when no account |
| AUTH-02 | User can optionally sign up or log in with email via Firebase Auth | `createUserWithEmailAndPassword` + `signInWithEmailAndPassword` from Firebase JS SDK; `initializeAuth` with `getReactNativePersistence(AsyncStorage)` for session survival across restarts; `onAuthStateChanged` listener in AuthContext |
| AUTH-03 | Authenticated user's favorites sync from Supabase on app load; on logout app reverts to local-only | Firestore `users/{uid}/favorites` document; read on login + merge; `onAuthStateChanged` drives favorites source switching between local Zustand and Firestore; `signOut()` resets to local favorites |
| FAV-03 | When anonymous user logs in, local favorites merged into cloud (no data loss) | Migration function: read `favoritesStore.favorites`, read Firestore doc, deduplicate by `id`, write merged set back to Firestore via `setDoc(..., { merge: true })`; runs once on first login, silently retried on next app open if failed |
</phase_requirements>

---

## Summary

Phase 5 adds three distinct technical areas on top of the foundation from Phases 1–4. First, **Firebase Auth integration**: the Firebase JS SDK is already installed from the project foundation (STACK.md). The auth module must be initialized with `initializeAuth` + `getReactNativePersistence(AsyncStorage)` to persist the session across app restarts — this is the critical difference from the default web initialization (`getAuth`). Without this, the user is logged out every time the app closes. An `AuthContext` provider with `onAuthStateChanged` wraps the root layout and exposes `user`, `isLoading`, `signIn`, `signUp`, `signOut` to all screens.

Second, **Firestore favorites data model and sync**: The user's favorites are stored as a single Firestore document at `users/{uid}` containing a `favorites` field as a map keyed by `soundId` (e.g. `{ "rain-01": { addedAt: 1707000000000 } }`). Using a map (not an array) is the correct choice because Firebase's `arrayUnion` does NOT support deduplication by object equality for arrays of objects — it only works for primitive values. A map keyed by `soundId` naturally deduplicates, supports `setDoc({ merge: true })` for partial updates, and allows atomic per-item writes. The local Zustand store's `Favorite[]` array is converted to/from this map format in the sync layer.

Third, **the anonymous-to-cloud migration**: on first login, the app reads the local `favoritesStore.favorites` array, converts to the map format, merges with any existing Firestore document (using `setDoc` with `{ merge: true }` which merges at the map level), then loads the merged result from Firestore back into the Zustand store. This migration runs silently and retries on the next app open if it fails. The app then uses Firestore as source of truth for all subsequent operations.

**Key finding**: Firestore offline persistence (`enableIndexedDbPersistence`) does NOT work with the Firebase JS SDK in React Native — it requires IndexedDB which is not available in RN. The `expo-firestore-offline-persistence` polyfill library is unmaintained (last commit Jan 2023) and incompatible with Firebase JS SDK v12. The correct approach for this phase is to use the **in-memory cache only** (default for the JS SDK in RN) and handle offline gracefully — favorites reads fail silently and fall back to the local Zustand store. For true offline persistence, the project would need `@react-native-firebase` (native SDK), but this would require major refactoring and is not in scope. This is an important constraint to document clearly.

**Primary recommendation:** Use `initializeAuth` + `getReactNativePersistence(AsyncStorage)` for auth session persistence; store Firestore favorites as a map (not array) keyed by `soundId`; implement migration as a one-shot `setDoc` merge on first login; use `AuthContext` React Context (not Zustand) for auth state per Expo Router's recommended pattern; accept that Firestore offline persistence is not available in the JS SDK on React Native.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| firebase (JS SDK) | ^12.x (already installed) | Firebase Auth (`initializeAuth`, `onAuthStateChanged`, `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`) + Firestore (`getFirestore`, `doc`, `getDoc`, `setDoc`) | Already in project per STACK.md; pure JS, no native modules required; works in managed Expo workflow |
| @react-native-async-storage/async-storage | ~2.x (already installed) | `getReactNativePersistence(AsyncStorage)` for Firebase Auth session persistence across restarts | Already in project; required by Firebase Auth for RN session survival |
| expo-secure-store | ~14.x (SDK 54 pinned) | Optional: more secure session token storage vs AsyncStorage | First-party Expo module; used in official Expo Router auth example for token storage |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand (already installed) | ^5.x | Existing `favoritesStore` — Phase 5 adds `setFavorites()` call after Firestore load | No new install; store already has `setFavorites(favorites: Favorite[])` from Phase 4 |
| @react-native-async-storage/async-storage | ~2.x (already installed) | Firebase Auth persistence; also used by existing Zustand stores | Already in project |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Firebase JS SDK | @react-native-firebase | RN Firebase has better native offline persistence but requires ejecting or complex EAS config plugin setup, and breaks Expo Go. Firebase JS SDK is already installed and sufficient for this phase's sync requirements |
| React Context (AuthContext) | Zustand authStore | Expo Router official docs recommend React Context for auth; Zustand lacks lifecycle hooks for `onAuthStateChanged` setup without extra wrapping; Context is idiomatic here |
| Map-keyed favorites in Firestore | Array of Favorite objects | `arrayUnion` only deduplicates primitives, not objects — map is the correct Firestore structure for dedup-safe object collections |
| In-memory Firestore cache (JS SDK default) | expo-firestore-offline-persistence | Polyfill is unmaintained (Jan 2023 last commit), incompatible with Firebase JS SDK v12, not recommended |
| AsyncStorage for session persistence | expo-secure-store | SecureStore is more secure (keychain/keystore) but adds a dependency; AsyncStorage is sufficient given Firebase manages token rotation; both are valid |

**Installation:**
```bash
# All core libraries already installed (firebase, AsyncStorage, Zustand)
# Optional: expo-secure-store if using secure session token approach
npx expo install expo-secure-store
```

---

## Architecture Patterns

### Recommended Project Structure

Phase 5 adds to the existing structure from Phases 1–4:

```
src/
├── context/
│   └── AuthContext.tsx         # NEW — Firebase onAuthStateChanged, signIn, signUp, signOut, user, isLoading
├── services/
│   ├── FavoritesService.ts     # NEW — Firestore read/write/merge for authenticated favorites
│   └── LocalFavoritesAdapter.ts  # (from Phase 4) — local Zustand read/write
├── stores/
│   └── favoritesStore.ts       # MODIFIED — add setFavorites(Favorite[]) if not already; ensure called after Firestore load
└── types/
    └── index.ts                # MODIFIED — add AuthUser type, FavoritesMap type

app/
├── _layout.tsx                 # MODIFIED — wrap in AuthProvider; hold splash during auth init
├── (tabs)/
│   └── settings.tsx            # MODIFIED — add auth section (sign in/up form or user + sign out)
└── auth.tsx                    # NEW — Login/Sign Up screen (same screen, toggle between modes)
                                # Presented as modal sheet from Settings
```

### Pattern 1: Firebase Auth Initialization (React Native)

The critical difference from web: use `initializeAuth` (not `getAuth`) and pass `getReactNativePersistence(AsyncStorage)`. Without this, Firebase Auth falls back to in-memory persistence and the user is logged out on every app restart.

```typescript
// Source: https://firebase.google.com/docs/auth/web/password-auth
// Source: Firebase JS SDK docs — getReactNativePersistence
// src/lib/firebase.ts (or wherever firebase is initialized)
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  // ...
};

// Guard against re-initialization in hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// CRITICAL: Use initializeAuth (not getAuth) with React Native persistence
// @ts-ignore — TypeScript may not find getReactNativePersistence; it exists at runtime
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
```

**Why `@ts-ignore` may be needed:** There is a known TypeScript false-positive where `getReactNativePersistence` is not found in the `firebase/auth` type definitions even though it exists at runtime. Adding `// @ts-ignore` on that import line is the standard workaround. Verified against firebase-js-sdk issues #9316 and #7584.

### Pattern 2: AuthContext with onAuthStateChanged

```typescript
// Source: https://docs.expo.dev/router/advanced/authentication/ (adapted for Firebase)
// Source: https://firebase.google.com/docs/auth/web/password-auth
// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true until first onAuthStateChanged fires

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return unsubscribe; // cleanup on unmount
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged fires after this — sets user automatically
      return {};
    } catch (e: any) {
      return { error: mapAuthError(e.code) };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return {};
    } catch (e: any) {
      return { error: mapAuthError(e.code) };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    // onAuthStateChanged fires — sets user to null
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Incorrect email or password.';
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    default: return 'Something went wrong. Please try again.';
  }
}
```

### Pattern 3: Root Layout with AuthProvider and Splash Screen Hold

The `isLoading` flag from `AuthContext` is `true` until Firebase fires the first `onAuthStateChanged` event. Keep the splash screen visible during this window. Auth does NOT gate routes — auth is optional, so no `Stack.Protected` redirect. The auth screen is accessible from Settings, not forced.

```typescript
// Source: https://docs.expo.dev/router/advanced/authentication/
// Source: Expo Router Splash Screen pattern (Phase 3 established)
// app/_layout.tsx
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { isLoading } = useAuth();

  useEffect(() => {
    // Also need the onboarding check from Phase 3 here
    // Only hide splash when both auth init AND onboarding check are done
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) return null; // Keep splash visible

  return (
    <Stack>
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="player" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Stack.Screen name="auth" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}
```

**CRITICAL:** Phase 3 already has `SplashScreen.preventAutoHideAsync()` and onboarding checks in `_layout.tsx`. Phase 5 must coordinate both: onboarding check AND auth init must complete before hiding the splash. The two async operations must be combined into a single `isReady` gate.

### Pattern 4: Firestore Favorites Data Model

**Use a map (object) keyed by `soundId`, NOT an array.**

Reason: `arrayUnion()` does NOT deduplicate object arrays by field equality — it only deduplicates by reference equality (value equality for primitives). For the `Favorite[]` type `{ id: string; addedAt: number }[]`, `arrayUnion` is useless. A map is the correct Firestore structure.

```typescript
// Firestore document structure at: users/{uid}
// {
//   favorites: {
//     "rain-01": { addedAt: 1707000000000 },
//     "fire-02": { addedAt: 1707001000000 },
//     ...
//   }
// }

// Type in TypeScript:
type FavoritesMap = Record<string, { addedAt: number }>;

// Converting local Favorite[] to Firestore map:
function favoritesToMap(favorites: Favorite[]): FavoritesMap {
  return favorites.reduce((map, fav) => {
    map[fav.id] = { addedAt: fav.addedAt };
    return map;
  }, {} as FavoritesMap);
}

// Converting Firestore map back to Favorite[]:
function mapToFavorites(map: FavoritesMap): Favorite[] {
  return Object.entries(map).map(([id, data]) => ({ id, addedAt: data.addedAt }));
}
```

### Pattern 5: FavoritesService (Firestore Read/Write)

```typescript
// Source: https://firebase.google.com/docs/firestore/manage-data/add-data
// src/services/FavoritesService.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Favorite } from '@/types';

const USER_DOC_PATH = (uid: string) => doc(db, 'users', uid);

export class FavoritesService {
  // Read current cloud favorites for a user
  static async getFavorites(uid: string): Promise<Favorite[]> {
    const snap = await getDoc(USER_DOC_PATH(uid));
    if (!snap.exists() || !snap.data().favorites) return [];
    const map = snap.data().favorites as Record<string, { addedAt: number }>;
    return Object.entries(map).map(([id, data]) => ({ id, addedAt: data.addedAt }));
  }

  // Write full favorites set to Firestore (used after merge)
  static async setFavorites(uid: string, favorites: Favorite[]): Promise<void> {
    const map = favorites.reduce((acc, fav) => {
      acc[fav.id] = { addedAt: fav.addedAt };
      return acc;
    }, {} as Record<string, { addedAt: number }>);

    await setDoc(USER_DOC_PATH(uid), { favorites: map }, { merge: true });
  }

  // Migrate local favorites into cloud favorites (dedup by id)
  static async migrateLocalToCloud(uid: string, localFavorites: Favorite[]): Promise<Favorite[]> {
    // 1. Read existing cloud favorites
    const cloudFavorites = await FavoritesService.getFavorites(uid);

    // 2. Merge: build a map from cloud, then overlay local (local wins on addedAt for new items)
    const merged: Record<string, Favorite> = {};
    for (const fav of cloudFavorites) {
      merged[fav.id] = fav;
    }
    for (const fav of localFavorites) {
      // If same sound exists in cloud, keep whichever was added earlier
      if (!merged[fav.id] || fav.addedAt < merged[fav.id].addedAt) {
        merged[fav.id] = fav;
      }
    }
    const mergedArray = Object.values(merged);

    // 3. Write merged set back to Firestore
    await FavoritesService.setFavorites(uid, mergedArray);

    return mergedArray;
  }
}
```

### Pattern 6: Auth State Change → Favorites Sync

The favorites source switches based on auth state. This logic lives in a `useFavoritesSync` hook or inside the root layout's `useEffect`:

```typescript
// src/hooks/useFavoritesSync.ts
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { FavoritesService } from '@/services/FavoritesService';

export function useFavoritesSync() {
  const { user } = useAuth();
  const { favorites, setFavorites } = useFavoritesStore();
  const hasMigrated = useRef(false); // prevent double-migration on re-renders

  useEffect(() => {
    if (!user) {
      // Logged out — favorites already in local store; no action needed
      // (on sign-out, leave local favorites intact — Claude's discretion: keep as backup)
      return;
    }

    // User just logged in — run migration + load from Firestore
    async function syncOnLogin() {
      try {
        if (!hasMigrated.current) {
          hasMigrated.current = true;
          // Run migration (silently — no loading indicator per locked decision)
          const mergedFavorites = await FavoritesService.migrateLocalToCloud(user!.uid, favorites);
          setFavorites(mergedFavorites);
        } else {
          // Already migrated this session — just load from Firestore
          const cloudFavorites = await FavoritesService.getFavorites(user!.uid);
          setFavorites(cloudFavorites);
        }
      } catch (error) {
        // Silent failure — local favorites remain as fallback (locked decision)
        // Retry on next app open (hasMigrated ref resets on app restart)
        console.warn('Favorites sync failed silently:', error);
      }
    }

    syncOnLogin();
  }, [user?.uid]); // Runs when user ID changes (login / logout)
}
```

**Call this hook in the root layout or a top-level component** that persists across navigation.

### Pattern 7: Auth Screen (Single Form with Toggle)

The auth screen is a modal sheet presented from the Settings screen. It shows email + password fields and a toggle to switch between "Sign In" and "Sign Up" modes.

```typescript
// app/auth.tsx (modal screen)
import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const action = mode === 'signin' ? signIn : signUp;
    const result = await action(email.trim(), password);

    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      // Success — dismiss modal; useFavoritesSync runs automatically via onAuthStateChanged
      router.back();
    }
  };

  return (
    <View>
      {/* Toggle Sign In / Sign Up */}
      <Pressable onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        <Text>{mode === 'signin' ? 'Need an account? Sign up' : 'Already have one? Sign in'}</Text>
      </Pressable>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
      />

      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      <Pressable onPress={handleSubmit} disabled={isSubmitting}>
        <Text>{mode === 'signin' ? 'Sign In' : 'Create Account'}</Text>
      </Pressable>
    </View>
  );
}
```

### Pattern 8: Settings Screen Auth Section

```typescript
// In app/(tabs)/settings.tsx — add auth section at bottom
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

// Inside the component:
const { user, signOut } = useAuth();

// Render (at bottom of settings):
{user ? (
  <View>
    <Text>Signed in as {user.email}</Text>
    <Pressable onPress={async () => {
      await signOut();
      // After signOut, useFavoritesSync's useEffect reverts to local favorites
    }}>
      <Text>Sign Out</Text>
    </Pressable>
  </View>
) : (
  <Pressable onPress={() => router.push('/auth')}>
    <Text>Sign in to sync favorites</Text>
  </Pressable>
)}
```

### Anti-Patterns to Avoid

- **Using `getAuth()` instead of `initializeAuth()` for React Native:** `getAuth()` uses in-memory persistence by default. Without `getReactNativePersistence(AsyncStorage)`, the user is logged out every time the app closes. Always use `initializeAuth()` with the persistence option.
- **Storing favorites as an array in Firestore and using `arrayUnion` for dedup:** `arrayUnion` cannot deduplicate by partial object equality. Use a map keyed by `soundId` instead.
- **Initializing Firebase multiple times:** In React Native with hot reload, `initializeApp()` is called again on every reload. Guard with `getApps().length === 0 ? initializeApp(...) : getApps()[0]`.
- **Gating any feature behind auth:** The app must remain fully functional without an account. No screen should require auth to render. Auth is opt-in from Settings.
- **Using `Stack.Protected` to redirect to auth:** Unlike typical auth flows, this app's auth is optional. Do NOT redirect unauthenticated users. Auth screen is reachable from Settings only.
- **Running favorites migration on every auth state change:** Migration should run once per login session. Use a `useRef(false)` flag to track whether migration has already run in this session. Reset on logout.
- **Showing loading state during migration (locked decision):** Migration must be completely silent. Do NOT show a spinner, progress bar, or "syncing..." message. The app responds normally; favorites update in the background.
- **Enabling Firestore offline persistence with the JS SDK in React Native:** `enableIndexedDbPersistence()` throws "This platform is either missing IndexedDB" in RN. The `expo-firestore-offline-persistence` polyfill is unmaintained. Accept in-memory cache only and handle offline gracefully via try/catch.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth session persistence across restarts | Custom token storage in AsyncStorage | `initializeAuth` + `getReactNativePersistence(AsyncStorage)` | Firebase handles token refresh, expiry, re-auth; manual storage misses these lifecycle events |
| Auth state change listener | Polling Firebase or storing user in Zustand manually | `onAuthStateChanged` in `useEffect` inside `AuthContext` | Firebase fires this on login, logout, token refresh, and app open; covers all cases |
| Duplicate detection in favorites merge | Sorting or comparing entire objects | Firestore map keyed by `soundId` + `setDoc({ merge: true })` | Map keys are unique by nature — dedup is structural, not algorithmic |
| Error message mapping | Showing raw Firebase error codes to users | `mapAuthError(e.code)` switch statement | Firebase error codes are developer-facing (e.g., `auth/email-already-in-use`); never show raw codes to users |
| Auth form validation | Complex regex or library | Simple null/empty checks + rely on Firebase server-side validation | Firebase validates email format and password strength server-side; minimal client-side checks are sufficient |

**Key insight:** Firebase Auth handles the hard parts (token lifecycle, session restoration, concurrent auth state). The app's job is to wire `onAuthStateChanged` correctly and keep the UX clean. The migration logic (merge local + cloud) is the one genuinely custom piece — everything else is standard Firebase SDK calls.

---

## Common Pitfalls

### Pitfall 1: Session Lost on App Restart (Missing initializeAuth)

**What goes wrong:** User signs in, closes the app, reopens — they are logged out. `onAuthStateChanged` fires with `null` on every cold start.

**Why it happens:** Using `getAuth(app)` (the web default) gives in-memory persistence. On React Native, there is no web `localStorage` or `sessionStorage` — without explicit `getReactNativePersistence`, Firebase has nowhere to store the session.

**How to avoid:** ALWAYS use `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })`. Never use `getAuth()` in the React Native version of `firebase.ts`.

**Warning signs:** User must log in again after every app restart; `onAuthStateChanged` immediately fires with `null` on app open.

### Pitfall 2: Firebase Re-initialized on Hot Reload

**What goes wrong:** Hot reload in Expo triggers the Firebase initialization code again, causing "Firebase App named '[DEFAULT]' already exists" error in the Metro console.

**Why it happens:** `initializeApp()` throws if called twice with the same app name. Expo's fast refresh re-executes module-level code.

**How to avoid:**
```typescript
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
```
Always guard with `getApps().length === 0`.

**Warning signs:** Red error screen on hot reload; "Firebase App named '[DEFAULT]' already exists" in console.

### Pitfall 3: TypeScript Error for getReactNativePersistence

**What goes wrong:** TypeScript throws "Module 'firebase/auth' has no exported member 'getReactNativePersistence'". Build fails or IDE shows red squiggles.

**Why it happens:** Firebase's TypeScript type definitions for `firebase/auth` may not expose `getReactNativePersistence` in all scenarios (reported in firebase-js-sdk issues #9316 and #7584). This is a type definition gap, not a missing function.

**How to avoid:** Add `// @ts-ignore` above the `getReactNativePersistence` import line, or import from `firebase/auth/react-native` if available in the project's Firebase version.

**Warning signs:** TypeScript build error only; app works correctly at runtime.

### Pitfall 4: arrayUnion Fails for Object Array Dedup in Firestore

**What goes wrong:** Using `arrayUnion({ id: 'rain-01', addedAt: 1707000000000 })` on a Firestore array field does NOT prevent duplicates. A sound favorited on two devices ends up twice in the array.

**Why it happens:** `arrayUnion` uses reference equality for objects, not field-level equality. Two `{ id: 'rain-01', addedAt: ... }` objects with the same `id` but different `addedAt` are NOT considered equal.

**How to avoid:** Use a Firestore **map** (not array) keyed by `soundId`. `setDoc({ merge: true })` naturally deduplicates because map keys are unique. See Pattern 4 above.

**Warning signs:** Favorites count grows past the number of sounds in the library; same sound appears twice in the Favorites screen after cross-device use.

### Pitfall 5: Splash Screen and Auth Init Timing Conflict

**What goes wrong:** Phase 3's root layout already manages the splash screen for onboarding detection. Phase 5 adds auth init. If not coordinated, the splash hides too early (before auth init) or is held indefinitely (if one condition never resolves).

**Why it happens:** `onAuthStateChanged` fires asynchronously (typically within 50–500ms on first load). If the Phase 3 onboarding check resolves first and calls `SplashScreen.hideAsync()`, auth `isLoading` is still `true` and the app briefly renders the wrong state.

**How to avoid:** Combine both gates: `const isReady = !authIsLoading && hasCheckedOnboarding`. Only call `SplashScreen.hideAsync()` when BOTH are resolved. Both are fast async checks — the combined delay is negligible.

**Warning signs:** Brief flash of unauthenticated UI before auth state resolves; or splash hangs indefinitely.

### Pitfall 6: Migration Runs Multiple Times

**What goes wrong:** `useFavoritesSync` fires whenever `user.uid` changes. If the component re-mounts (navigation, hot reload), migration runs again — overwriting Firestore favorites with local ones that may now be stale post-migration.

**Why it happens:** `useRef` value resets on component unmount. If `useFavoritesSync` is called in a component that can unmount/remount (e.g., a tab screen), `hasMigrated.current` resets.

**How to avoid:** Place `useFavoritesSync` in the root layout (which never unmounts), not in a tab screen. Alternatively, persist the migration flag in AsyncStorage keyed by user UID: `AsyncStorage.setItem('migrated_${uid}', 'true')`.

**Warning signs:** Favorites revert to local set after navigating away from the Settings screen.

### Pitfall 7: onAuthStateChanged Listener Memory Leak

**What goes wrong:** `onAuthStateChanged` subscription not cleaned up when the AuthProvider unmounts. Not critical for production (provider never unmounts), but causes warnings in tests and causes issues in development with strict mode double-mount.

**How to avoid:** Return the unsubscribe function from `useEffect`:
```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user));
  return unsubscribe; // CRITICAL cleanup
}, []);
```

**Warning signs:** Console warning "Can't perform a React state update on an unmounted component" during testing.

### Pitfall 8: Auth Error Code Changes (auth/invalid-credential)

**What goes wrong:** In Firebase JS SDK v9+, the error code for wrong password changed from `auth/wrong-password` to `auth/invalid-credential` for security reasons (prevents email enumeration). Apps mapping only `auth/wrong-password` will show a generic error instead of the "incorrect password" message.

**How to avoid:** Map BOTH codes in `mapAuthError`:
```typescript
case 'auth/wrong-password':
case 'auth/invalid-credential':
  return 'Incorrect email or password.';
```

**Warning signs:** Wrong password shows "Something went wrong" instead of a helpful message.

---

## Code Examples

Verified patterns from official sources:

### Firebase Auth Initialization (React Native)
```typescript
// Source: https://firebase.google.com/docs/auth/web/password-auth
// Source: Firebase JS SDK — getReactNativePersistence for React Native
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
// @ts-ignore — TypeScript definition gap; function exists at runtime
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
```

### onAuthStateChanged Subscription
```typescript
// Source: https://firebase.google.com/docs/auth/web/password-auth
import { onAuthStateChanged } from 'firebase/auth';

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);     // null when signed out
    setIsLoading(false);
  });
  return unsubscribe; // cleanup on unmount
}, []);
```

### Email/Password Sign Up + Sign In
```typescript
// Source: https://firebase.google.com/docs/auth/web/password-auth
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Sign up
await createUserWithEmailAndPassword(auth, email, password);

// Sign in
await signInWithEmailAndPassword(auth, email, password);

// Sign out
await signOut(auth);
```

### Firestore Favorites Map: Read + Write
```typescript
// Source: https://firebase.google.com/docs/firestore/manage-data/add-data
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Read
const snap = await getDoc(doc(db, 'users', uid));
const favoritesMap = snap.exists() ? snap.data().favorites : {};

// Write (merge: true preserves other fields in the user document)
await setDoc(
  doc(db, 'users', uid),
  { favorites: favoritesMap },
  { merge: true }
);
```

### Dedup Migration (Local + Cloud → Map Merge)
```typescript
// No external library needed — native JS object merge
const merged: Record<string, { addedAt: number }> = {};

// Add cloud favorites to map
for (const [id, data] of Object.entries(cloudMap)) {
  merged[id] = data;
}

// Add local favorites (keep earliest addedAt for same sound)
for (const localFav of localFavorites) {
  if (!merged[localFav.id] || localFav.addedAt < merged[localFav.id].addedAt) {
    merged[localFav.id] = { addedAt: localFav.addedAt };
  }
}

// merged is now the deduplicated union of both sets
```

### Firebase Auth Error Codes
```typescript
// Source: https://firebase.google.com/docs/auth/web/password-auth#errors
// Comprehensive mapping for email/password auth
switch (errorCode) {
  case 'auth/email-already-in-use': // Sign up: email taken
  case 'auth/wrong-password':        // Legacy sign in error code
  case 'auth/invalid-credential':    // Modern sign in error (v9+, security improvement)
  case 'auth/user-not-found':        // Sign in: no account exists
  case 'auth/weak-password':         // Sign up: password too short
  case 'auth/invalid-email':         // Both: malformed email
  case 'auth/too-many-requests':     // Both: rate limited
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getAuth(app)` for React Native | `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })` | Firebase JS SDK v9+ | Without this, session is not persisted across restarts in RN |
| `firebase/auth/react-native` subpath | Import from `firebase/auth` directly | Firebase JS SDK v9.6+ | Old subpath imports no longer required; `getReactNativePersistence` exported from main `firebase/auth` |
| `auth/wrong-password` error code | `auth/invalid-credential` (also emitted) | Firebase JS SDK v10+ | Security improvement — prevents email enumeration; must handle both codes |
| `enableIndexedDbPersistence()` for Firestore offline | Not supported in React Native JS SDK | Ongoing (issue #7947 open) | Firestore offline persistence requires `@react-native-firebase` or native SDKs; JS SDK falls back to memory cache |
| `arrayUnion()` for favorites list | Map keyed by soundId | Always has been limited | arrayUnion cannot deduplicate objects by partial field equality; map is the correct structure |
| `expo-firestore-offline-persistence` polyfill | Unmaintained, incompatible | Jan 2023 (last commit) | Do not use; use in-memory cache and graceful fallback |

**Deprecated/outdated:**
- `firebase/auth/react-native` subpath import: no longer required in recent Firebase JS SDK versions
- `enableIndexedDbPersistence()` in React Native: always fails with "missing IndexedDB" error
- `expo-firestore-offline-persistence`: unmaintained, incompatible with Firebase JS SDK v12

---

## Recommendations for Claude's Discretion Areas

Based on research findings:

### Auth Form Presentation: Modal sheet (recommended)
Present the auth screen as a modal from Settings (`router.push('/auth')`; `presentation: 'modal'` in `app/_layout.tsx`). This keeps the main app navigation uninterrupted. Users can dismiss without completing auth. Avoids a dedicated auth navigation stack.

### Auth Entry Beyond Settings: Favorites screen nudge row (recommended)
Show a subtle row at the top of the Favorites screen when logged out: "Sign in to sync across devices →". Tapping opens the auth modal. This surfaces auth where the value proposition is highest (favorites = the thing that syncs) without being intrusive.

### Post-Login UI Feedback: Silent (recommended)
Per the locked decision, migration is silent. After login, the Favorites screen data simply updates when `useFavoritesSync` resolves — no toast, no confirmation. The `user.email` appearing in Settings is the only visible feedback that login succeeded.

### Forgot Password: Include as low-effort row (recommended)
`sendPasswordResetEmail(auth, email)` is one Firebase call. Add a "Forgot password?" text link in the sign-in form. This reduces support burden significantly. The email goes to the user; no additional UI needed beyond a brief "Reset email sent" message. Not in the locked decisions, but easy to include.

### Post-Migration Local Data: Keep as backup (recommended)
After migration, do NOT clear local favorites from AsyncStorage/Zustand. Keep local Zustand store as the cache. On logout, local favorites remain available. This means the user retains their favorites locally even after logout. The favorites data is not sensitive.

### Sign-Out Favorites Behavior: Keep local cache (recommended)
On sign-out, keep Zustand favorites as-is. The user sees their local favorites unchanged. The favorites are not "logged-in data" — they were local before auth existed. This avoids confusion of "where did my favorites go?" on logout.

### Sync Status Indicator: Subtle cloud icon in Favorites header (recommended)
Show a small cloud icon with a subtle green checkmark when logged in, visible in the Favorites screen header. Tapping it is a no-op (no detail modal). This gives users visual confirmation that sync is active without cluttering the interface.

### Duplicate Detection: Earliest `addedAt` wins (recommended)
When the same sound appears in both local and cloud favorites, keep the entry with the lower `addedAt` timestamp (earlier = when they first saved it). This preserves historical accuracy. Implemented in the `migrateLocalToCloud` function above.

---

## Open Questions

1. **Firebase JS SDK version already in project — is `getReactNativePersistence` available?**
   - What we know: STACK.md says Firebase JS SDK `^12.x` is installed. `getReactNativePersistence` is available in Firebase JS SDK v9.6+. Firebase 12.x should export it from `firebase/auth`.
   - What's unclear: Whether the project has a working `firebase.ts` initialization file already from Phases 1–4, and whether it uses `getAuth` or `initializeAuth`.
   - Recommendation: The planner must check if a `src/lib/firebase.ts` or equivalent exists and whether auth has been initialized before. If `getAuth` is used, it must be changed to `initializeAuth` for Phase 5.

2. **Root layout `_layout.tsx` — combining Phase 3 onboarding check with Phase 5 auth init**
   - What we know: Phase 3's `_layout.tsx` already holds the splash screen during onboarding check. Phase 5 adds auth init delay.
   - What's unclear: The exact Phase 3 `_layout.tsx` implementation — whether the onboarding check is in a hook or inline, and how `SplashScreen.hideAsync()` is called.
   - Recommendation: The planner must read the Phase 3 plans (03-01-PLAN.md) to understand the existing root layout structure, then design Phase 5's modifications to coordinate both gates.

3. **Phase 4 `favoritesStore` — does `setFavorites(favorites: Favorite[])` exist with correct signature?**
   - What we know: Phase 4 upgraded from `setFavorites(ids: string[])` to `setFavorites(favorites: Favorite[])`. This method is the primary integration point for Phase 5's cloud load.
   - What's unclear: Whether Phase 4 was implemented and the Phase 4 plan's `setFavorites` signature was actually deployed.
   - Recommendation: Planner verifies against Phase 4 plan summaries. If the signature is wrong or missing, Phase 5's first task must include updating it.

4. **Firestore security rules — must be configured for the data model**
   - What we know: Firestore documents at `users/{uid}` require a security rule that allows reads and writes only for the authenticated user matching `{uid}`.
   - What's unclear: Whether the Firestore project has been set up with rules from earlier phases.
   - Recommendation: Include Firestore security rules in the Phase 5 plan as an explicit task:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{uid} {
           allow read, write: if request.auth != null && request.auth.uid == uid;
         }
       }
     }
     ```

---

## Sources

### Primary (HIGH confidence)
- `https://firebase.google.com/docs/auth/web/password-auth` — `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`, `onAuthStateChanged`, error codes
- `https://docs.expo.dev/router/advanced/authentication/` — SessionProvider pattern, `Stack.Protected`, splash screen hold during auth init, useStorageState hook
- `https://firebase.google.com/docs/firestore/manage-data/add-data` — `setDoc` with `merge: true`, `arrayUnion`, per-user document pattern
- `https://firebase.google.com/docs/firestore/manage-data/structure-data` — embedded document vs subcollection tradeoffs; map vs array for small collections
- `.planning/research/STACK.md` — confirms Firebase JS SDK `^12.x` is the project's backend; `initializeAuth` + `getReactNativePersistence(AsyncStorage)` pattern
- `.planning/phases/04-favorites/04-RESEARCH.md` — `favoritesStore` structure with `Favorite[]` + `addedAt`, `setFavorites(Favorite[])` method, `LocalFavoritesAdapter` pattern

### Secondary (MEDIUM confidence)
- `https://github.com/firebase/firebase-js-sdk/issues/9316` — TypeScript false-positive for `getReactNativePersistence`; runtime function exists, type definition gaps
- `https://github.com/firebase/firebase-js-sdk/issues/7584` — Same TypeScript issue in earlier SDK; workaround confirmed
- `https://github.com/firebase/firebase-js-sdk/issues/7947` — Official Firebase response confirming Firestore offline persistence unsupported in React Native JS SDK; open issue
- `https://github.com/firebase/firebase-js-sdk/issues/1918` — Official Firebase confirmation that `arrayUnion` does not support object partial equality dedup; map structure recommended
- `https://github.com/nandorojo/expo-firestore-offline-persistence` — Confirmed unmaintained (Jan 2023), incompatible with Firebase JS SDK v12

### Tertiary (LOW confidence)
- None — all critical findings verified against official Firebase or Expo docs.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Firebase JS SDK already in project per STACK.md; `initializeAuth` + `getReactNativePersistence` pattern verified against official Firebase docs and confirmed working in multiple community guides
- Architecture: HIGH — `onAuthStateChanged` in React Context verified against Expo Router official authentication guide; Firestore map model verified against official data structure docs and arrayUnion limitation confirmed in Firebase GitHub issue
- Pitfalls: HIGH — session persistence pitfall verified against official docs; TypeScript false-positive verified against firebase-js-sdk issues; arrayUnion object limitation confirmed in official issue; Firestore offline persistence limitation confirmed in official Firebase response

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days — Firebase JS SDK and Expo Router are stable; Firebase error codes and persistence APIs are unlikely to change in this window)
