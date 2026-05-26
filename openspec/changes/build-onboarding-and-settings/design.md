## Context

Phase `03-01` established the route graph, library shell, and persisted UI store, while Phase `03-02` added the real player surface. The remaining Phase 3 gap is the shell behavior around those screens: the app still needs first-launch gating that decides whether a user should see onboarding or the library, and it still needs the finished settings screen that exposes the persisted dark-mode preference.

This slice crosses route startup, onboarding route content, AsyncStorage-backed shell gating, and the tab settings surface. Those concerns already exist in different parts of the app, so documenting the ownership boundaries is useful before implementation. The branch also needs to preserve the existing library and player flow so the final Phase 3 app remains navigable from onboarding through playback without introducing another route restructure.

## Goals / Non-Goals

**Goals:**

- Add deterministic first-launch routing in `app/_layout.tsx` using the onboarding completion flag.
- Build the Welcome and Quiet Mode onboarding screens as the real Phase `03-03` onboarding flow.
- Build the Settings screen as the real Phase `03-03` settings shell with a functional dark-mode toggle.
- Reuse the existing persisted `useUIStore` contract instead of redesigning shared state for this slice.
- Preserve the current Phase 3 route graph and the existing library-to-player flow.

**Non-Goals:**

- Implement actual Do Not Disturb behavior, session-duration settings logic, auto-play, sharing, or support flows.
- Redesign the tab navigator, player route, or the shared UI-store contract beyond using the existing dark-mode fields and actions.
- Add new persistence layers beyond the onboarding completion flag already suited to AsyncStorage.

## Decisions

### Keep onboarding completion as a dedicated AsyncStorage gate outside the shared UI store

The onboarding completion state should use a dedicated AsyncStorage key such as `has_seen_onboarding` read directly by `app/_layout.tsx` and written by the Quiet Mode screen, instead of being folded into `useUIStore`.

Rationale: onboarding completion is startup shell gating, not a frequently read screen preference. Keeping it separate avoids widening the shared UI-store contract just to support a one-time route decision.

Alternative considered: store onboarding completion in `useUIStore` persistence.
Rejected because it would mix first-launch route gating with unrelated theme and visibility preferences.

### Make the root layout own startup gating and splash lifetime

`app/_layout.tsx` should remain the single place that prevents the splash screen from auto-hiding, checks the onboarding flag, decides between `/(onboarding)` and `/(tabs)`, and only then reveals the shell.

Rationale: startup routing and splash lifetime are application-wide responsibilities, and centralizing them prevents onboarding logic from leaking into individual screens or route groups.

Alternative considered: let the onboarding route self-redirect after the app renders.
Rejected because it would flash the wrong shell briefly and weaken the startup contract already implied by the root layout.

### Keep onboarding UI route-local instead of creating reusable shared components

The Welcome and Quiet Mode screens should be implemented directly in `app/(onboarding)/index.tsx` and `app/(onboarding)/quiet-mode.tsx` without extracting a new shared component layer.

Rationale: this onboarding flow is only two screens, already route-owned, and easier to evolve if the route files keep the screen composition local.

Alternative considered: extract reusable onboarding components under a new shared slice.
Rejected because it would add structure without reuse and increase cleanup cost if the product flow changes.

### Build the Settings screen on top of the existing UI-store contract

`app/(tabs)/settings.tsx` should read `isDarkMode` and call `toggleDarkMode` from `useUIStore`, while the remaining settings rows stay shell-only and do not introduce new shared state or services.

Rationale: the existing store already defines the persisted dark-mode contract and hydration behavior, so the settings screen only needs to expose that capability in the UI.

Alternative considered: expand `useUIStore` with new persisted settings fields during this slice.
Rejected because the plan explicitly treats the remaining rows as visual shells rather than implemented product behavior.

### Preserve the existing route graph and tab destination behavior

This slice should not add or remove route groups. Completing onboarding should `router.replace('/(tabs)')`, and returning users who already completed onboarding should land in the tabs shell immediately.

Rationale: Phase `03-01` already established the route skeleton, and this slice only completes the shell behavior on top of it.

Alternative considered: add a separate post-onboarding landing route or nested onboarding wrapper.
Rejected because it complicates navigation without solving a requirement gap in the Phase 3 plan.

## Risks / Trade-offs

- [Startup gating could flash the wrong route before the onboarding check resolves] -> Mitigation: hold the splash screen and avoid rendering the stack until the routing decision is complete.
- [AsyncStorage read or write failures could strand users in onboarding] -> Mitigation: default startup failures to the tabs shell and keep onboarding completion handlers simple and explicit.
- [Settings shell could imply behavior that is not implemented yet] -> Mitigation: keep non-dark-mode rows visually present but clearly shell-only with no hidden state changes.
- [Theme hydration timing could still cause a brief mismatch] -> Mitigation: rely on the existing persisted `useUIStore` hydration-ready contract and avoid reworking theme persistence in this slice.

## Migration Plan

1. Add OpenSpec capabilities for first-launch onboarding and the settings shell, and extend the route-skeleton startup requirement.
2. Update `app/_layout.tsx` to gate startup on the onboarding flag while preserving the current route declarations.
3. Replace the onboarding route placeholders with the Welcome and Quiet Mode screens.
4. Replace the settings placeholder with the real settings shell using the existing dark-mode store actions.
5. Verify first-launch onboarding, returning-user bypass, and dark-mode persistence across restart.

Rollback strategy: remove the onboarding gate from `app/_layout.tsx`, restore the placeholder onboarding and settings screens, and leave the existing library and player slices untouched.

## Open Questions

- None.
