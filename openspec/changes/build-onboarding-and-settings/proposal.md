## Why

Phase `03-01` and `03-02` established the library and player surfaces, but the app still lacks the first-launch onboarding gate and the real settings screen that make the Phase 3 shell feel complete. Without this slice, new users do not follow the intended onboarding flow, returning users are not routed directly into the main experience, and the existing dark-mode preference has no finished in-app control surface.

## What Changes

- Add first-launch shell routing in `app/_layout.tsx` that checks the onboarding flag, holds the splash screen while startup gating resolves, and routes users to `/(onboarding)` or `/(tabs)` accordingly.
- Replace the temporary onboarding placeholder route content with the two-screen Welcome and Quiet Mode flow, including writing the onboarding completion flag before entering the tabs experience.
- Replace the temporary settings placeholder with the full Phase `03-03` settings shell, including a functional dark-mode toggle and visual-only rows for the remaining settings items.
- Preserve the existing Phase 3 library and player flow so onboarding completion leads directly into the already-built tabs and player experience.

## Capabilities

### New Capabilities

- `first-launch-onboarding`: Covers startup gating for first-time versus returning users, the Welcome screen, and the Quiet Mode completion flow that writes the onboarding flag.
- `settings-shell`: Covers the Phase 3 settings presentation, including the functional dark-mode toggle and the remaining shell-only settings rows.

### Modified Capabilities

- `app-route-skeleton`: Extend the root route-shell contract so startup routing can hold the splash screen, resolve the onboarding gate, and direct the user into the onboarding group or tabs group without changing the existing route graph.

## Impact

- Affected code: `app/_layout.tsx`, `app/(onboarding)/index.tsx`, `app/(onboarding)/quiet-mode.tsx`, and `app/(tabs)/settings.tsx`.
- Affected systems: Expo Router startup flow, splash-screen gating, AsyncStorage-backed onboarding completion, and the persisted UI preferences surface.
- Dependencies: existing route graph from `03-01`, the shared persisted `useUIStore` dark-mode contract, and `@react-native-async-storage/async-storage` already present in the project.
