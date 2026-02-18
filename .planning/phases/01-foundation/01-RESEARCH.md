# Phase 1: Foundation - Research

**Researched:** 2026-02-18
**Domain:** Expo EAS Build / React Native Firebase / Expo Router / TypeScript tooling
**Confidence:** HIGH (most findings verified against official docs; active SDK 54 issues flagged)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Firebase project structure
- One Firebase project for now (not separate dev/prod projects)
- google-services.json and GoogleService-Info.plist committed directly to the repo (not gitignored)
- Firebase web SDK config stored in .env file using EXPO_PUBLIC_ prefix
- All four Firebase services initialized in Phase 1: Auth, Firestore, Storage, Analytics

#### Environment config approach
- Full .env.example defined in Phase 1 with all known keys across all services (Firebase, RevenueCat, Unity Ads) — even if values are filled in later phases
- Actual .env file is gitignored; only .env.example is committed
- Unity Ads Game ID and placement IDs: EXPO_PUBLIC_ in .env (they are embedded in the app bundle anyway)
- RevenueCat API keys (separate iOS and Android keys): EXPO_PUBLIC_ in .env, consistent with Firebase and Unity pattern

#### Expo Router shell scope
- Full route skeleton scaffolded in Phase 1: all major routes as placeholder screens
- Tab structure: 3 tabs — Library, Favorites, Settings
- Player screen: presented as a modal/stack on top of the tab navigator (not a tab)
- Onboarding: separate route group app/(onboarding)/index.tsx
- Auth screens: separate route group app/(auth)/sign-in.tsx and app/(auth)/sign-up.tsx

#### TypeScript and linting strictness
- TypeScript: moderate strictness — strictNullChecks: true but NOT full strict: true mode
- ESLint: errors block commits via lint-staged (warnings are informational only)
- Prettier: VS Code format-on-save configured via .vscode/settings.json (committed) + enforced at commit via lint-staged
- ESLint ruleset: standard Expo defaults (eslint-config-expo), no custom rules added

### Claude's Discretion
- Zustand store scaffolding depth (interfaces + initial state structure)
- Exact .env.example key naming conventions
- lint-staged configuration details
- EAS build profile names and configuration
- Specific Prettier options (trailing commas, print width, etc.)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 1 sets up the non-negotiable infrastructure for all subsequent phases: an EAS Development Build with native background audio, React Native Firebase connected, TypeScript tooling locked down, and Expo Router scaffolded. The current state of the ecosystem (as of February 2026) has one significant complication: **Expo SDK 54 is now current**, and SDK 54 deprecated `expo-av` in favor of `expo-audio`. Since the app's core feature is background audio, the chosen audio library matters for Phase 1 configuration even though audio playback logic is Phase 2 work.

The biggest architecture decision for Phase 1 is **Firebase SDK choice**: Firebase JS SDK vs React Native Firebase (RNFB). The locked decision to include Analytics is the deciding factor — Firebase Analytics is not supported by the Firebase JS SDK on React Native/mobile; it requires React Native Firebase. This means RNFB is the correct path, which in turn requires native build configuration (config plugins, `useFrameworks: static` for iOS, `google-services.json`/`GoogleService-Info.plist` in app.json).

React Native Firebase with Expo SDK 54 has **known build challenges** on iOS (non-modular header errors with `useFrameworks: static`). A working solution exists via a Podfile post-install hook config plugin (RNFB v23+), but it requires careful setup. This is the highest-risk item in Phase 1 and warrants a dedicated verification step with a real device build before declaring phase complete.

**Primary recommendation:** Use React Native Firebase v23 with Expo SDK 54, apply the `useFrameworks: static` Podfile patch config plugin, and treat the first successful EAS development build on both platforms as the phase gate.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo | ~54.0.33 | Expo SDK (current stable) | Latest stable as of Feb 2026; SDK 55 will mandate New Architecture |
| expo-dev-client | ~5.x | Required for development builds with custom native code | Without this, EAS dev builds cannot include RNFB or expo-audio |
| @react-native-firebase/app | ^23.0.1 | Core Firebase module, config plugin | Required by all RNFB modules; provides native Firebase SDK wrapper |
| @react-native-firebase/auth | ^23.0.1 | Firebase Authentication | Only RNFB has full Auth support on React Native |
| @react-native-firebase/firestore | ^23.0.1 | Cloud Firestore | Full native SDK; JS SDK works but slower on mobile |
| @react-native-firebase/storage | ^23.0.1 | Firebase Storage | Full native SDK |
| @react-native-firebase/analytics | ^23.0.1 | Firebase Analytics | **Not available in Firebase JS SDK on mobile** — RNFB required |
| expo-build-properties | ~0.14.x | Configure native build (useFrameworks: static for iOS) | Required for RNFB iOS builds |
| expo-router | ~4.x | File-based routing (SDK 54 includes Router v4) | First-party routing for Expo; replaces React Navigation manual setup |
| zustand | ^5.x | Global state management | Minimal boilerplate, TypeScript-native, no Provider wrapping needed |
| expo-audio | ~0.4.x | Audio playback (replacement for expo-av) | expo-av deprecated in SDK 54; configure now, implement in Phase 2 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-native-async-storage/async-storage | ^2.x | Auth persistence storage | Required by RNFB Auth for token persistence |
| eslint-config-expo | ^10.0.0 | ESLint ruleset | Standard Expo linting — flat config format from SDK 53+ |
| prettier | ^3.x | Code formatter | Enforced at commit via lint-staged |
| eslint-config-prettier | ^9.x | Disables ESLint rules that conflict with Prettier | Required when using both ESLint and Prettier |
| eslint-plugin-prettier | ^5.x | Runs Prettier as ESLint rule | Makes Prettier violations show as ESLint errors |
| husky | ^9.x | Git hooks manager | Runs lint-staged on pre-commit |
| lint-staged | ^15.x | Run linters on staged files only | Faster than running on all files; configured via package.json |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Native Firebase | Firebase JS SDK | JS SDK lacks Analytics on mobile — ruled out by locked decision to use Analytics in Phase 1 |
| expo-audio | expo-av | expo-av is deprecated in SDK 54 and will not receive updates — do not use |
| Zustand | Redux Toolkit | Redux adds significant boilerplate; Zustand is idiomatic for small-to-medium Expo apps |
| lint-staged + husky | lefthook | Both work; husky v9 is the ecosystem standard with most documentation |

**Installation:**

```bash
# Core Expo + dev client
npx create-expo-app@latest calm-asmr-sounds --template blank-typescript
npx expo install expo-dev-client

# Firebase (RNFB)
npx expo install @react-native-firebase/app @react-native-firebase/auth \
  @react-native-firebase/firestore @react-native-firebase/storage \
  @react-native-firebase/analytics

# Required for RNFB iOS builds
npx expo install expo-build-properties

# Audio (configure now, implement Phase 2)
npx expo install expo-audio

# State management
npm install zustand

# Linting + formatting
npm install --save-dev eslint-config-expo prettier eslint-config-prettier \
  eslint-plugin-prettier husky lint-staged

# Initialize husky
npx husky init
```

---

## Architecture Patterns

### Recommended Project Structure

```
calm-asmr-sounds/
├── app/                        # Expo Router routes (routes ONLY)
│   ├── _layout.tsx             # Root Stack layout (wraps everything)
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab navigator (Library, Favorites, Settings)
│   │   ├── index.tsx           # Library tab (placeholder)
│   │   ├── favorites.tsx       # Favorites tab (placeholder)
│   │   └── settings.tsx        # Settings tab (placeholder)
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   └── index.tsx           # Welcome screen (placeholder)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx         # Sign in (placeholder)
│   │   └── sign-up.tsx         # Sign up (placeholder)
│   └── player.tsx              # Player modal (stack over tabs, placeholder)
├── src/
│   ├── lib/
│   │   └── firebase.ts         # Firebase initialization (all 4 services)
│   ├── stores/
│   │   ├── audioStore.ts       # Zustand: playback state
│   │   ├── authStore.ts        # Zustand: auth state
│   │   ├── favoritesStore.ts   # Zustand: favorites state
│   │   └── uiStore.ts          # Zustand: UI state (dark mode, etc.)
│   └── types/
│       └── index.ts            # Shared TypeScript types
├── .env                        # Gitignored — actual secrets
├── .env.example                # Committed — template for all env vars
├── .vscode/
│   └── settings.json           # VS Code format-on-save (committed)
├── eslint.config.js            # Flat config format (SDK 53+)
├── eas.json                    # EAS build profiles
├── google-services.json        # Android Firebase config (committed per decision)
├── GoogleService-Info.plist    # iOS Firebase config (committed per decision)
├── app.json                    # Expo config with plugins
├── tsconfig.json               # Moderate strict TypeScript
└── package.json
```

### Pattern 1: Expo Router Root Layout with Stack + Protected Groups

The root `app/_layout.tsx` defines a Stack navigator that contains all route groups. Expo Router v4 introduced `Stack.Protected` for auth-guarded routes.

```typescript
// app/_layout.tsx
// Source: https://docs.expo.dev/router/basics/common-navigation-patterns/
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="player"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
```

### Pattern 2: Tab Navigator Layout

```typescript
// app/(tabs)/_layout.tsx
// Source: https://docs.expo.dev/router/advanced/tabs/
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Library' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favorites' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
```

### Pattern 3: React Native Firebase Initialization

```typescript
// src/lib/firebase.ts
// Source: https://rnfirebase.io/
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import analytics from '@react-native-firebase/analytics';

// RNFB initializes from google-services.json / GoogleService-Info.plist
// automatically — no manual initializeApp() call needed
// Export service accessors for use throughout the app
export { auth, firestore, storage, analytics };
```

> Note: Unlike the Firebase JS SDK, RNFB does NOT require calling `initializeApp()`. The native modules self-initialize from the platform config files referenced in app.json.

### Pattern 4: Zustand Store with TypeScript (v5 pattern)

```typescript
// src/stores/audioStore.ts
// Source: https://zustand.docs.pmnd.rs/guides/beginner-typescript
import { create } from 'zustand';

interface AudioState {
  currentSoundId: string | null;
  isPlaying: boolean;
  isLooping: boolean;
  timerSeconds: number | null;
  setCurrentSound: (id: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLooping: (looping: boolean) => void;
  setTimer: (seconds: number | null) => void;
}

export const useAudioStore = create<AudioState>()((set) => ({
  currentSoundId: null,
  isPlaying: false,
  isLooping: false,
  timerSeconds: null,
  setCurrentSound: (id) => set({ currentSoundId: id }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsLooping: (looping) => set({ isLooping: looping }),
  setTimer: (seconds) => set({ timerSeconds: seconds }),
}));
```

Note the `create<AudioState>()()` double-parentheses pattern — required in Zustand v5 TypeScript.

### Pattern 5: app.json Configuration (with all plugins)

```json
{
  "expo": {
    "name": "Calm Sounds Mini",
    "slug": "calm-asmr-sounds",
    "version": "1.0.0",
    "scheme": "calm-sounds",
    "android": {
      "package": "com.yourname.calmsounds",
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "bundleIdentifier": "com.yourname.calmsounds",
      "googleServicesFile": "./GoogleService-Info.plist",
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/firestore",
      "@react-native-firebase/storage",
      "@react-native-firebase/analytics",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ],
      [
        "expo-audio",
        {
          "microphonePermission": false
        }
      ]
    ]
  }
}
```

### Pattern 6: EAS Build Profiles

```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_VARIANT": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "APP_VARIANT": "preview"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "APP_VARIANT": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Pattern 7: TypeScript Configuration (Moderate Strict)

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": false,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

`expo/tsconfig.base` provides Expo-recommended defaults. Overriding `strict: false` then enabling individual flags gives the "moderate strict" profile defined in the locked decisions.

### Pattern 8: ESLint Flat Config (SDK 53+ format)

```javascript
// eslint.config.js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = defineConfig([
  ...expoConfig,
  prettierConfig,
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '.expo/'],
  },
]);
```

### Pattern 9: lint-staged + Husky v9

```json
// package.json (relevant sections)
{
  "scripts": {
    "prepare": "husky",
    "lint": "expo lint",
    "lint:fix": "expo lint --fix"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --max-warnings=0 --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

The `--max-warnings=0` flag makes ESLint treat warnings as errors at the commit stage, implementing the "errors block commits, warnings are informational" decision.

### Pattern 10: Environment Variables

```bash
# .env.example (committed — template only, no real values)
# Firebase Web SDK (EXPO_PUBLIC_ = inlined into bundle)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=

# RevenueCat
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=

# Unity Ads
EXPO_PUBLIC_UNITY_GAME_ID_IOS=
EXPO_PUBLIC_UNITY_GAME_ID_ANDROID=
EXPO_PUBLIC_UNITY_PLACEMENT_ID_REWARDED=
EXPO_PUBLIC_UNITY_PLACEMENT_ID_INTERSTITIAL=
```

> Note: With React Native Firebase, the actual Firebase connection uses `google-services.json` / `GoogleService-Info.plist` (native). The `EXPO_PUBLIC_FIREBASE_*` variables in .env are for the **Firebase JS SDK** if used in any JS-side context (e.g., web SSR or admin utilities). Since this project uses RNFB exclusively for mobile, the .env Firebase vars are present for completeness and consistency with the locked decision pattern, but are not strictly required at runtime.

### Anti-Patterns to Avoid

- **Using `expo-av` for audio:** Deprecated in SDK 54. Will not receive updates. Use `expo-audio`.
- **Using Firebase JS SDK for Analytics:** Not supported on React Native mobile. Use `@react-native-firebase/analytics`.
- **Calling `initializeApp()` with RNFB:** RNFB auto-initializes from native config files. Calling `initializeApp()` (Firebase JS SDK pattern) alongside RNFB creates a "dual package hazard" that causes runtime errors.
- **Not installing `expo-dev-client` before building:** EAS builds with RNFB require the dev client. Without it, native modules are not linked.
- **Committing `.env` with real values:** Only `.env.example` is committed. `.env` must be in `.gitignore`.
- **Adding routes outside the `app/` directory:** The `app/` directory in Expo Router is exclusively for routes. All components, hooks, stores go in `src/`.
- **Bracket notation for env vars:** `process.env['EXPO_PUBLIC_KEY']` does not work with Expo's static inlining. Must use dot notation: `process.env.EXPO_PUBLIC_KEY`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File-based navigation | Custom navigator with React Navigation | `expo-router` | Route groups, protected routes, deep linking, and modal presentation are built in |
| Pre-commit code quality | Custom git hook scripts | `husky` + `lint-staged` | Handles staged-only execution, cross-platform hook installation |
| Firebase native integration | Manual native code in ios/ and android/ | RNFB config plugins + `eas build` | Prebuild handles all native modifications; manual native code is incompatible with managed workflow |
| iOS static frameworks | Manual Podfile edits | `expo-build-properties` plugin + post-install hook | EAS Build regenerates native dirs from config; manual Podfile edits are overwritten on next prebuild |
| TypeScript path aliases | Manual webpack/metro config | `tsconfig.json` paths + Expo's Metro resolver | Expo's Metro bundler reads tsconfig paths directly |
| Background audio iOS config | Manual Xcode capability edits | `infoPlist.UIBackgroundModes` in app.json | Automatically applied to Info.plist during prebuild |

**Key insight:** In Expo's managed/CNG (Continuous Native Generation) workflow, the `ios/` and `android/` directories are generated artifacts. Any manual edits to native code are overwritten on the next `prebuild`. All native configuration MUST go through config plugins in `app.json`.

---

## Common Pitfalls

### Pitfall 1: RNFB + `useFrameworks: static` iOS Build Failures

**What goes wrong:** iOS EAS builds fail with "Non-modular header errors" or "The Swift pod FirebaseCoreInternal depends upon GoogleUtilities which does not define modules."

**Why it happens:** Firebase iOS SDK requires `use_frameworks!` (static), but some React Native native modules (RNScreens, others) expose non-modular C headers that conflict with framework module rules.

**How to avoid:** Use a custom Expo config plugin (written as `app.plugin.js` or inline in `app.config.ts`) that adds a `post_install` hook to the Podfile setting:
```
config.build_settings["CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES"] = "YES"
```
RNFB v23 working solution is documented in [GitHub issue #8657](https://github.com/invertase/react-native-firebase/issues/8657). Use `@react-native-firebase/app` ≥ v23.0.1.

**Warning signs:** Build log mentioning `FirebaseCoreInternal`, `GoogleUtilities`, or `non-modular header` in the `xcodebuild` output.

### Pitfall 2: Firebase Analytics Not Working with JS SDK

**What goes wrong:** `getAnalytics()` from `firebase/analytics` throws an error or silently does nothing on React Native.

**Why it happens:** Firebase Analytics JS SDK is explicitly not supported on mobile. It requires native SDKs.

**How to avoid:** Use `@react-native-firebase/analytics` (RNFB). This is a locked decision, so it's already addressed by choosing RNFB — just never import from `firebase/analytics` JS SDK.

**Warning signs:** `Firebase: Analytics is not available in this environment` error at runtime.

### Pitfall 3: Expo Router Routes Outside `app/`

**What goes wrong:** Screen files in `src/screens/` or `components/` get included as routes or don't get resolved at all.

**Why it happens:** Expo Router uses the `app/` directory exclusively for route resolution. Files outside it are not treated as routes.

**How to avoid:** Keep `app/` for routes only. All components, stores, hooks, utilities go in `src/` or sibling directories. Route files should be thin shells that import from `src/`.

**Warning signs:** "No routes found" error, or unexpected routes appearing in navigation.

### Pitfall 4: Zustand Selector Infinite Loops (v5 behavior change)

**What goes wrong:** Components re-render infinitely when using object selectors from Zustand v5.

**Why it happens:** In v5, selectors returning new object references (e.g., `(state) => ({ a: state.a, b: state.b })`) trigger re-renders on every state change because the object reference is always new.

**How to avoid:** Use `useShallow` from `zustand/react/shallow` when selecting multiple values, or select primitive values individually.

```typescript
import { useShallow } from 'zustand/react/shallow';
const { isPlaying, currentSoundId } = useAudioStore(
  useShallow((state) => ({ isPlaying: state.isPlaying, currentSoundId: state.currentSoundId }))
);
```

**Warning signs:** Console showing excessive re-renders, sluggish UI when state changes.

### Pitfall 5: `EXPO_PUBLIC_` Variables Not Available at Runtime

**What goes wrong:** `process.env.EXPO_PUBLIC_FIREBASE_API_KEY` is `undefined` at runtime even though `.env` has the value set.

**Why it happens:** (a) Variables are statically inlined at build time — not at `expo start` time for EAS cloud builds. (b) Bracket notation (`process.env['EXPO_PUBLIC_KEY']`) is not supported. (c) The `.env` file may not exist or may have wrong key names.

**How to avoid:** Always use dot notation. Verify the `.env` file exists locally. For EAS builds, set variables in the EAS dashboard or `eas.json` `env` section for build-time availability.

**Warning signs:** `undefined` values for env vars despite the key existing in `.env`.

### Pitfall 6: Missing `scheme` in app.json Breaks Deep Linking

**What goes wrong:** Expo Router cannot initialize properly or deep links don't work.

**Why it happens:** Expo Router requires a `scheme` property in `app.json` to configure deep link URL handling.

**How to avoid:** Add `"scheme": "calm-sounds"` (or similar) to `app.json` before first build.

**Warning signs:** `Warning: No scheme found in app.json` at startup, or push notification navigation failing.

### Pitfall 7: New Architecture Compatibility

**What goes wrong:** Some native modules fail on SDK 54 with New Architecture enabled (enabled by default in SDK 53+).

**Why it happens:** SDK 54 enables New Architecture by default. Some RNFB modules or other native libs may have incomplete New Architecture support.

**How to avoid:** Keep New Architecture enabled (it's the future). RNFB v23 has official New Architecture support. If issues arise, can temporarily disable via `expo.experiments.reactNativeDirectionEnabled` or `newArchEnabled: false` in `app.json`.

**Warning signs:** `TurboModuleRegistry` errors, or modules that worked in older SDK failing.

---

## Code Examples

### Zustand authStore (Phase 1 scaffold)

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';

interface User {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

### Zustand favoritesStore (Phase 1 scaffold)

```typescript
// src/stores/favoritesStore.ts
import { create } from 'zustand';

interface FavoritesState {
  favoriteIds: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  favoriteIds: [],
  addFavorite: (id) =>
    set((state) => ({ favoriteIds: [...state.favoriteIds, id] })),
  removeFavorite: (id) =>
    set((state) => ({ favoriteIds: state.favoriteIds.filter((f) => f !== id) })),
  isFavorite: (id) => get().favoriteIds.includes(id),
}));
```

### Zustand uiStore (Phase 1 scaffold)

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';

interface UIState {
  isDarkMode: boolean;
  hasSeenOnboarding: boolean;
  setDarkMode: (dark: boolean) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isDarkMode: true, // dark mode default per requirements
  hasSeenOnboarding: false,
  setDarkMode: (dark) => set({ isDarkMode: dark }),
  setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
}));
```

### Full app directory tree for Phase 1 skeleton

```
app/
├── _layout.tsx            # Root Stack: (tabs), player (modal), (onboarding), (auth)
├── player.tsx             # Player modal — placeholder
├── (tabs)/
│   ├── _layout.tsx        # Tabs: Library (index), Favorites, Settings
│   ├── index.tsx          # Library placeholder
│   ├── favorites.tsx      # Favorites placeholder
│   └── settings.tsx       # Settings placeholder
├── (onboarding)/
│   ├── _layout.tsx
│   └── index.tsx          # Welcome screen placeholder
└── (auth)/
    ├── _layout.tsx
    ├── sign-in.tsx        # Sign-in placeholder
    └── sign-up.tsx        # Sign-up placeholder
```

### VS Code settings for format-on-save

```json
// .vscode/settings.json (committed to repo)
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Prettier configuration (Claude's discretion)

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "bracketSameLine": false
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `expo-av` | `expo-audio` | SDK 54 (Sep 2025) | expo-av is deprecated; must migrate to expo-audio for new projects |
| Firebase JS SDK for all services | RNFB for Analytics (and preferred for mobile) | Analytics never worked in JS SDK on mobile | Analytics requirement forces RNFB |
| `expo-firebase-recaptcha` | `@react-native-firebase/auth` | SDK 48 | expo-firebase-recaptcha was removed; RNFB is the standard |
| eslintrc.json format | eslint.config.js flat config | SDK 53 (Apr 2025) | New projects default to flat config |
| Husky v8 with .huskyrc | Husky v9 with file-based hooks | Husky v9.0 (2024) | New hook files in `.husky/`, `prepare` script |
| `create<T>()()` pattern not required | Double-parens required in v5 | Zustand v5 (2024) | Always use `create<T>()()` in TypeScript |
| Manual `initializeApp()` + RNFB | RNFB-only auto-init from native config | RNFB v6+ | Do not mix Firebase JS SDK initializeApp with RNFB |

**Deprecated/outdated:**
- `expo-av`: Deprecated in SDK 54. Do not use in new projects targeting SDK 54+.
- `expo-firebase-analytics`: Removed in SDK 48. Use `@react-native-firebase/analytics`.
- `expo-firebase-recaptcha`: Removed in SDK 48. Use `@react-native-firebase/auth`.
- ESLint `.eslintrc` format: Legacy format; SDK 53+ generates `eslint.config.js` flat config.
- Husky `.huskyrc`: Replaced by file-based hooks in `.husky/` directory.

---

## Open Questions

1. **RNFB iOS build stability on the developer's machine**
   - What we know: RNFB v23 + `useFrameworks: static` + Podfile `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES` works per GitHub issue #8657 demonstrator.
   - What's unclear: Whether SDK 54.0.33 (latest at time of research) has any regressions beyond what's documented. The issue thread is active.
   - Recommendation: Make the first iOS EAS development build the first success criterion. If it fails, consult the RNFB issues page for the specific error before proceeding.

2. **New Architecture compatibility for all RNFB modules**
   - What we know: RNFB v23 officially supports New Architecture. SDK 55 (future) will mandate it.
   - What's unclear: Whether all 4 RNFB modules (auth, firestore, storage, analytics) are fully stable under New Architecture on the developer's test devices.
   - Recommendation: Keep New Architecture enabled. Test early on real devices during Phase 1.

3. **Google Services file commit strategy risk**
   - What we know: The locked decision commits `google-services.json` and `GoogleService-Info.plist` directly (not gitignored). These contain the Firebase project ID, API key, and app ID — all of which are scoped to the Firebase project and not secret in the cryptographic sense (they're in every shipped app binary anyway).
   - What's unclear: If the repo is ever made public, this could enable unauthorized usage of the Firebase project (billing attacks, abuse). For a private repo, risk is acceptable.
   - Recommendation: Add Firebase Security Rules as a compensating control (enforced in Phase 5 / Auth phase). Note the risk in documentation for future reference.

4. **`expo-audio` background audio maturity**
   - What we know: `expo-audio` became stable in SDK 53. Background audio requires `UIBackgroundModes: audio` in app.json and `setAudioModeAsync({ shouldPlayInBackground: true })` at runtime.
   - What's unclear: Audio ducking/unducking behavior on Android has known issues (GitHub issue #37776). This is a Phase 2 concern but worth noting.
   - Recommendation: Configure `expo-audio` plugin in app.json during Phase 1 (it affects native build). Actual playback behavior testing is Phase 2.

---

## Sources

### Primary (HIGH confidence)
- [Expo official docs — Using Firebase](https://docs.expo.dev/guides/using-firebase/) — Firebase JS SDK vs RNFB, setup instructions
- [React Native Firebase — rnfirebase.io](https://rnfirebase.io/) — Config plugins, google-services.json, app.json setup
- [Expo official docs — Environment Variables](https://docs.expo.dev/guides/environment-variables/) — EXPO_PUBLIC_ pattern, static inlining, limitations
- [Expo official docs — Create EAS Development Build](https://docs.expo.dev/develop/development-builds/create-a-build/) — EAS build process, prerequisites
- [Expo official docs — EAS JSON](https://docs.expo.dev/build/eas-json/) — Build profiles, configuration options
- [Expo official docs — Expo Router Common Navigation Patterns](https://docs.expo.dev/router/basics/common-navigation-patterns/) — Route groups, tabs, modals, protected routes
- [Expo official docs — expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/) — Background audio API, app.json config, stability
- [Expo official docs — Using ESLint](https://docs.expo.dev/guides/using-eslint/) — Flat config, Prettier integration
- [Zustand — Beginner TypeScript Guide](https://zustand.docs.pmnd.rs/guides/beginner-typescript) — `create<T>()()` pattern
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54) — expo-av deprecation, React Native 0.81, New Architecture
- [Firebase blog — Which React Native Firebase SDK to use](https://firebase.blog/posts/2023/03/which-react-native-firebase-sdk-to-use/) — JS SDK vs RNFB decision guide

### Secondary (MEDIUM confidence)
- [GitHub issue #8657 — RNFB build error Expo 54 working solution](https://github.com/invertase/react-native-firebase/issues/8657) — Verified as official RNFB repo issue with maintainer comment; CLANG_ALLOW_NON_MODULAR_INCLUDES workaround
- [GitHub issue #39607 — SDK 54 non-modular headers with useFrameworks static](https://github.com/expo/expo/issues/39607) — Active Expo repo issue; cross-references RNFB fix

### Tertiary (LOW confidence — flag for validation)
- [Medium (Jan 2026): Migrating to React Native Firebase v22](https://medium.com/@shanavascruise/migrating-to-react-native-firebase-v22-6fb15f473c9f) — Single author source; version number may be outdated (v23 is current)
- Community reports of SDK 53/54 + RNFB compatibility issues — Multiple sources agree on the problem; working solutions exist but may require project-specific tuning

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All core libraries verified against official Expo, RNFB, and Zustand docs
- Architecture: HIGH — Expo Router patterns from official docs; RNFB config from rnfirebase.io
- Pitfalls: HIGH (identified issues) / MEDIUM (resolution details) — Main issues verified in official GitHub; some workarounds from community sources cross-referenced
- EAS Build process: HIGH — Official Expo docs
- RNFB iOS build stability: MEDIUM — Working solutions documented; project-specific variables may differ

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (30 days — fast-moving SDK ecosystem; check RNFB and Expo changelogs before planning if research is older than 2 weeks)
