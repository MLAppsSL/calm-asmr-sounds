## Why

Phase `03-01` and `03-02` established the library and player surfaces, and the `03-03` branch already contains the first pass of the onboarding screens. The remaining gap is turning that partial shell into a consistent Phase 3 startup experience: new users still are not gated deterministically before the shell renders, returning users are not yet guaranteed to bypass onboarding cleanly, and the existing dark-mode preference still has no finished in-app settings surface.

## What Changes

- Add first-launch shell routing in `app/_layout.tsx` that waits for both persisted UI-store hydration and onboarding resolution before hiding the splash screen, then routes users to `/(onboarding)` or `/(tabs)` accordingly.
- Finalize the existing onboarding screens in `app/(onboarding)/index.tsx` and `app/(onboarding)/quiet-mode.tsx` so they operate as the real Phase `03-03` flow and persist onboarding completion through the existing `useUIStore` contract.
- Replace the temporary settings placeholder with the full Phase `03-03` settings shell, including a functional dark-mode toggle and explicit shell-only rows that surface `coming soon` feedback for the remaining settings items.
- Preserve the existing Phase 3 library and player flow so onboarding completion leads directly into the already-built tabs and player experience.

## Capabilities

### New Capabilities

- `first-launch-onboarding`: Covers startup gating for first-time versus returning users, the Welcome screen, and the Quiet Mode completion flow that writes onboarding completion through the persisted UI store.
- `settings-shell`: Covers the Phase 3 settings presentation, including the functional dark-mode toggle and the remaining shell-only settings rows.

### Modified Capabilities

- `app-route-skeleton`: Extend the root route-shell contract so startup routing can hold the splash screen, resolve the onboarding gate, and direct the user into the onboarding group or tabs group without changing the existing route graph.

## Impact

- Affected code: `app/_layout.tsx`, `app/(onboarding)/index.tsx`, `app/(onboarding)/quiet-mode.tsx`, `app/(tabs)/settings.tsx`, and `src/shared/domain/stores/uiStore.ts`.
- Affected systems: Expo Router startup flow, splash-screen gating, the persisted `useUIStore` onboarding and dark-mode contract, and AsyncStorage-backed shell preferences.
- Dependencies: existing route graph from `03-01`, the shared persisted `useUIStore` contract, and `@react-native-async-storage/async-storage` already present in the project.
