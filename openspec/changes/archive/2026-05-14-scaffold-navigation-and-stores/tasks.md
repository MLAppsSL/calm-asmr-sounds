## 1. Shared Placeholder UI

- [x] 1.1 Create a minimal placeholder-screen primitive under `src/` for scaffold-only screens with a shared visual baseline.
- [x] 1.2 Create route-specific placeholder screen components in `src/` for library, favorites, settings, onboarding, sign-in, sign-up, and player using that shared primitive.

## 2. Expo Router Shell

- [x] 2.1 Implement `app/_layout.tsx` with the root stack that mounts `(tabs)`, `(onboarding)`, `(auth)`, and the modal `player` route.
- [x] 2.2 Implement `app/(tabs)/_layout.tsx` with exactly three tabs named `index`, `favorites`, and `settings`, titled `Library`, `Favorites`, and `Settings`.
- [x] 2.3 Implement the non-layout route files under `app/` as thin default-export shells that import their screen components from `src/`.
- [x] 2.4 Implement the onboarding and auth layout files as route-group navigator shells without embedded product logic.

## 3. Shared Types And Stores

- [x] 3.1 Add `src/shared/domain/types/index.ts` exporting `SoundCategory` as `'rain' | 'fire' | 'forest' | 'ocean' | 'wind' | 'white-noise'`, `TimerDuration` as `60 | 120 | 180`, `Sound` with `id`, `title`, `category`, `durationSeconds`, `isPremium`, `storageUrl`, and `thumbnailUrl`, and `User` with `uid`, `email`, and `isAnonymous`.
- [x] 3.2 Implement `src/shared/domain/stores/audioStore.ts` exporting `useAudioStore` with `currentSoundId`, `isPlaying`, `isLooping`, `timerSeconds`, `volume`, `setCurrentSound`, `setIsPlaying`, `setIsLooping`, `setTimer`, `setVolume`, and `reset`.
- [x] 3.3 Implement `src/shared/domain/stores/authStore.ts` exporting `useAuthStore` with `user: User | null`, `isLoading`, `setUser`, and `setLoading`, with startup defaults suitable for pre-auth app launch.
- [x] 3.4 Implement `src/shared/domain/stores/favoritesStore.ts` exporting `useFavoritesStore` with `favoriteIds`, `addFavorite`, `removeFavorite`, `isFavorite`, and `setFavorites`, with no persistence or remote sync behavior yet.
- [x] 3.5 Implement `src/shared/domain/stores/uiStore.ts` exporting `useUIStore` with `isDarkMode`, `hasSeenOnboarding`, `isImmersiveMode`, `isPlayerVisible`, `setDarkMode`, `setHasSeenOnboarding`, `setImmersiveMode`, and `setPlayerVisible`, with dark mode enabled by default.
- [x] 3.6 Document `useShallow` guidance in each scaffold store for future components that select multiple store values.

## 4. Verification

- [x] 4.1 Verify all required route files exist and export valid default components.
- [x] 4.2 Verify the tab shell exposes exactly three tabs and the root stack presents `player` as a modal.
- [x] 4.3 Run `npx tsc --noEmit` and fix any type errors introduced by the scaffold.
- [x] 4.4 Run `npm run lint` and fix any lint errors introduced by the scaffold.
- [x] 4.5 Start the Metro/dev server with `npm run start` and confirm Expo Router resolves the scaffolded routes without runtime export errors.
- [x] 4.6 Treat runtime verification as dev-client compatible only: do not rely on Expo Go for this project because native Firebase modules and `expo-dev-client` are in use.
