## 1. Shared Placeholder UI

- [ ] 1.1 Create a minimal placeholder-screen primitive under `src/` for scaffold-only screens with a shared visual baseline.
- [ ] 1.2 Create route-specific placeholder screen components in `src/` for library, favorites, settings, onboarding, sign-in, sign-up, and player using that shared primitive.

## 2. Expo Router Shell

- [ ] 2.1 Implement `app/_layout.tsx` with the root stack that mounts `(tabs)`, `(onboarding)`, `(auth)`, and the modal `player` route.
- [ ] 2.2 Implement `app/(tabs)/_layout.tsx` with exactly three tabs named `index`, `favorites`, and `settings`, titled `Library`, `Favorites`, and `Settings`.
- [ ] 2.3 Implement the non-layout route files under `app/` as thin default-export shells that import their screen components from `src/`.
- [ ] 2.4 Implement the onboarding and auth layout files as route-group navigator shells without embedded product logic.

## 3. Shared Types And Stores

- [ ] 3.1 Add `src/types/index.ts` with the shared scaffold types `Sound`, `SoundCategory`, and `TimerDuration`.
- [ ] 3.2 Implement `src/stores/audioStore.ts` with the initial typed playback contract and synchronous setter actions.
- [ ] 3.3 Implement `src/stores/authStore.ts` with signed-out startup defaults, loading state, and synchronous setter actions.
- [ ] 3.4 Implement `src/stores/favoritesStore.ts` with typed local favorites state and synchronous add/remove/replace actions only.
- [ ] 3.5 Implement `src/stores/uiStore.ts` with dark mode enabled by default, onboarding state, and synchronous setter actions.
- [ ] 3.6 Document `useShallow` guidance in each scaffold store for future components that select multiple store values.

## 4. Verification

- [ ] 4.1 Verify all required route files exist and export valid default components.
- [ ] 4.2 Verify the tab shell exposes exactly three tabs and the root stack presents `player` as a modal.
- [ ] 4.3 Run `npx tsc --noEmit` and fix any type errors introduced by the scaffold.
- [ ] 4.4 Launch the Expo app and confirm Expo Router resolves the scaffolded routes without runtime export errors.
