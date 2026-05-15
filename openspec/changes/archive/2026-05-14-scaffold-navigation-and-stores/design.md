## Context

Phase 1 already defines the native build foundation, tooling guardrails, and Firebase service module, but the app still lacks the navigation shell and state contracts that later phases will build on. The reference implementation plan for 01-03 establishes a full Expo Router route graph, four Zustand stores, and shared types as foundational scaffolding.

This change also resolves a conflict inside the source plan: although some examples inline placeholder UI inside `app/` route files, the stronger architectural rule is that `app/` stays route-only. The user confirmed that this change should require thin route files that import placeholder screen components from `src/`.

## Goals / Non-Goals

**Goals:**

- Define the initial Expo Router route graph with a root stack, a three-tab group, onboarding routes, auth routes, and a modal player route.
- Require all route files to remain thin routing shells with valid default exports.
- Define typed Zustand store contracts for audio, auth, favorites, and UI state, with stable exported hooks and initial state only.
- Define the shared TypeScript types that those initial stores and placeholder screens depend on.
- Keep the scaffold small enough that `npx tsc --noEmit` and route resolution can succeed before product logic exists.

**Non-Goals:**

- Implementing real audio playback, favorites persistence, authentication flows, onboarding behavior, or premium gating.
- Designing final UI components or visual polish for library, player, favorites, settings, onboarding, or auth screens.
- Adding navigation guards, async side effects, or business logic beyond initial state setters and placeholder rendering.

## Decisions

### Thin Expo Router files, placeholder UI in `src/`

Route files under `app/` will only define route entry points and navigator configuration. Placeholder screen components will live in `src/` so future feature work can evolve screen logic without mixing it into Expo Router files.

Alternatives considered:

- Inline placeholder UI in each route file. Rejected because it conflicts with the plan's route-only rule for `app/` and would entangle temporary UI with routing concerns.

### Preserve the Phase 1 route graph exactly

The initial navigation structure will include exactly three tabs (`index`, `favorites`, `settings`), a separate onboarding group, a separate auth group, and a `player` modal route presented from the root stack. This gives later phases stable file-based paths and navigator boundaries.

Alternatives considered:

- Deferring unused route groups until later phases. Rejected because Phase 1 explicitly aims to prevent later architectural drift by creating the full route skeleton now.

### Use one shared placeholder-screen primitive plus route-specific wrappers in `src/`

Placeholder screens should share a minimal visual baseline while still exporting route-specific components from `src/`. This keeps the route shell thin without creating unnecessary duplicated placeholder markup.

Alternatives considered:

- A fully unique placeholder component for every route. Rejected as unnecessary duplication for a scaffold-only phase.
- A single route file rendering a generic placeholder directly. Rejected because route files must stay route-only.

### Keep Zustand stores at contract level only

Each store will define typed state, synchronous setters, and sensible placeholder defaults, but no persistence, subscriptions, remote sync, or service integration. The store surface should be stable enough for later phases to extend without forcing a refactor of imports or core field names.

Alternatives considered:

- Adding future-phase logic now, such as persistence or Firebase coupling. Rejected because that would cross phase boundaries and introduce unverified behavior before dependent features are ready.

### Shared types live in `src/shared/domain/types/index.ts`

Common types such as `Sound`, `SoundCategory`, `TimerDuration`, and `User` will be defined centrally so the initial route shell and stores share the same domain vocabulary from the start.

The initial type and store contract is intentionally exact, not illustrative, because later phases extend these files in place. This change locks the Phase 1 baseline to the plan:

- `src/shared/domain/types/index.ts` exports `SoundCategory` as `'rain' | 'fire' | 'forest' | 'ocean' | 'wind' | 'white-noise'`
- `src/shared/domain/types/index.ts` exports `TimerDuration` as `60 | 120 | 180`
- `src/shared/domain/types/index.ts` exports `Sound` with `id`, `title`, `category`, `durationSeconds`, `isPremium`, `storageUrl`, and `thumbnailUrl`
- `src/shared/domain/types/index.ts` exports `User` with `uid`, `email`, and `isAnonymous`
- `src/shared/domain/stores/audioStore.ts` exports `useAudioStore` with `currentSoundId`, `isPlaying`, `isLooping`, `timerSeconds`, `volume`, setter actions, and `reset`
- `src/shared/domain/stores/authStore.ts` exports `useAuthStore` with `user`, `isLoading`, and setter actions
- `src/shared/domain/stores/favoritesStore.ts` exports `useFavoritesStore` with `favoriteIds`, `addFavorite`, `removeFavorite`, `isFavorite`, and `setFavorites`
- `src/shared/domain/stores/uiStore.ts` exports `useUIStore` with `isDarkMode`, `hasSeenOnboarding`, `isImmersiveMode`, `isPlayerVisible`, and setter actions

Alternatives considered:

- Defining types inline within each store. Rejected because it would create duplication and make later cross-feature expansion harder.

## Risks / Trade-offs

- [Risk] Placeholder screens in `src/` add more files than the original file list implied. -> Mitigation: keep them minimal, colocate them under a single app-shell feature area, and treat them as implementation support for the already-decided route-only architecture.
- [Risk] Early store field names may constrain later phases. -> Mitigation: restrict this change to broadly stable contract fields only and avoid speculative feature-specific detail.
- [Risk] A spec that names only broad store categories can drift from the locked Phase 1 plan. -> Mitigation: encode the exact field and export contract for the initial types and stores in the OpenSpec requirements and tasks.
- [Risk] Expo Router can fail at runtime if any route file lacks a default export or navigator names drift from file paths. -> Mitigation: require explicit route-file existence, default exports, and exact tab/modal structure in the specs and tasks.
- [Risk] The scaffold may accidentally grow into real feature work. -> Mitigation: explicitly exclude side effects, persistence, auth flows, and playback logic from this change.
- [Risk] Verification instructions can become misleading if they assume Expo Go or generic ESLint commands. -> Mitigation: verify with `npx tsc --noEmit`, `npm run lint`, and `npm run start`, and treat route-resolution checks as development-build or Metro validation rather than Expo Go validation.
