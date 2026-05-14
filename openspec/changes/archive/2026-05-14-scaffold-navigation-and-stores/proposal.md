## Why

Phase 1 still lacks the route shell and shared state contracts that later phases depend on for every visible app flow. Defining the Expo Router skeleton, placeholder screens, and Zustand store interfaces now prevents downstream phases from inventing navigation and state structure ad hoc.

## What Changes

- Add the full Phase 1 route scaffold under `app/`, including the root stack, the three-tab shell, the modal player route, the onboarding route group, and the auth route group.
- Add placeholder route screens with valid default exports so Expo Router can resolve the full app surface before product logic is implemented.
- Add four Zustand stores for audio, auth, favorites, and UI state with typed initial state and exported hooks for later phases to extend.
- Add shared TypeScript types used by the initial stores and route-level app shell.

## Capabilities

### New Capabilities

- `app-route-skeleton`: Defines the initial Expo Router route graph, route groups, and placeholder screens required for the app shell.
- `state-store-contracts`: Defines the initial Zustand store contracts and shared TypeScript types that later features build on.

### Modified Capabilities

None.

## Impact

- Affected code: `app/_layout.tsx`, `app/player.tsx`, `app/(tabs)/*`, `app/(onboarding)/*`, `app/(auth)/*`, `src/stores/*`, and `src/types/index.ts`
- Affected systems: Expo Router route resolution, placeholder app navigation, and shared client-side state shape
- Dependencies already in scope: `expo-router` and `zustand`
- No external API or backend contract changes
