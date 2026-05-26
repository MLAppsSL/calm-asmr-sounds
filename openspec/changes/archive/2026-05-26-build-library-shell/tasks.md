## 1. Library Manifest And Shared UI State

- [x] 1.1 Install the Phase 3 UI dependencies needed by this slice and verify the resulting dependency set is compatible with the current Expo SDK.
- [x] 1.2 Create `src/library/data/sounds.ts` as the UI-facing library sound manifest with 17 sounds across `rain`, `fire`, `forest`, and `wave`, including browse metadata and user-facing category labels.
- [x] 1.3 Update `src/shared/domain/stores/uiStore.ts` so dark mode is persisted, hydration readiness is exposed, and the existing shell fields/defaults are preserved.

## 2. Navigation Shell Upgrade

- [x] 2.1 Update `app/_layout.tsx` so the Phase 3 shell preserves `(tabs)`, `(onboarding)`, `(auth)`, and sibling `player` boundaries while supporting splash hold during shell gating.
- [x] 2.2 Update `app/(tabs)/_layout.tsx` to expose the four-tab Phase 3 shell and apply the frosted blur-backed tab bar treatment.
- [x] 2.3 Add or update `app/(tabs)/now-playing.tsx`, `app/(onboarding)/index.tsx`, and `app/(onboarding)/quiet-mode.tsx` to satisfy the Phase 3 shell route contract.

## 3. Library Browse UI

- [x] 3.1 Build `src/library/ui/components/SoundCard.tsx` for the library shell, including the visual background, gradient overlay, browse metadata, and premium badge treatment.
- [x] 3.2 Build `src/library/ui/components/CategorySection.tsx` so each library category renders an independent horizontal list of sound cards.
- [x] 3.3 Replace the library tab placeholder with the real Phase 3 browsing screen that renders the manifest by category section and pushes the `/player` route when a sound is tapped.
- [x] 3.4 Wire the now-playing tab to the minimal Phase 3 behavior required by the shell: route to the player when a sound is active and otherwise show an inactive shell state.

## 4. Validation

- [x] 4.1 Run the relevant project checks after the navigation, store, and browse UI changes are in place, and fix any type, lint, or formatting regressions introduced by this slice.
- [x] 4.2 Manually review the implementation against the library-browse-shell, app-route-skeleton, and state-store-contracts requirements for route structure, tab count, persisted dark mode, category browsing, and player navigation.
- [x] 4.3 Create the Phase `03-01` summary artifact after implementation, following the project planning summary format.
