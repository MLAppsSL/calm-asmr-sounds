## Why

Phase `03-01` is where the app stops feeling like a scaffold and starts behaving like a real product shell. The repository already has audio, caching, and timer foundations in place, but it still lacks the core library browsing surface, tab-shell styling, and persisted UI preferences that later player and screen work depend on.

## What Changes

- Add the first real Phase 3 library-browsing capability: a category-based library screen with horizontally scrolling sections, tappable sound cards, and a static UI-facing sound manifest of 17 sounds sized for the core browsing experience.
- Replace the placeholder tab presentation with the planned four-tab shell, including a frosted-glass tab bar and the now-playing entry point needed by the Phase 3 navigation model.
- Evolve the root and tab route contracts from Phase 1 placeholder routing into a real app shell that preserves onboarding/auth/player boundaries while allowing product UI to live directly in the relevant route files where appropriate.
- Expand the UI store contract so dark mode preference is persisted and hydration-safe for Phase 3 screens.

## Capabilities

### New Capabilities

- `library-browse-shell`: Covers the static library manifest, category-based browsing screen, sound-card presentation, category sections, and the frosted Phase 3 tab-shell behavior that gets users into the player flow.

### Modified Capabilities

- `app-route-skeleton`: The Phase 1 placeholder route graph evolves into the Phase 3 navigation shell with four tabs, root splash/startup behavior, and direct product UI ownership in the route files that now host the real library experience.
- `state-store-contracts`: The UI store contract evolves from the initial scaffold preferences into a persisted dark-mode and hydration-safe shell preference store that Phase 3 screens can read immediately at startup.

## Impact

- Affected code: root and tab layouts under `app/`, the library tab route, the now-playing tab route, onboarding route wiring, shared UI state, and the new `src/library/` feature-slice manifest and UI components.
- Affected systems: Expo Router navigation shell, tab bar presentation, persisted UI preferences, library browsing UX, and the path from browsing a sound to opening the player route.
- Dependencies: existing Expo Router shell, current shared audio foundations from Phase 2, Zustand persistence via AsyncStorage, and the Phase 3 UI libraries required for blur, images, gradients, and card presentation.
