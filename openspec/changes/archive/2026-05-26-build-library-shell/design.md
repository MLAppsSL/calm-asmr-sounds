## Context

Phase `03-01` is the first Core UI slice built on top of the already-landed Phase 1 navigation scaffold and Phase 2 audio foundations. The app currently has valid routes, placeholder screens, a shared audio engine, sound caching, and timer runtime wiring, but it still lacks the product-facing library browsing shell that lets users discover sounds and enter the player flow naturally.

The source phase plan was written against an older top-level `src/components`, `src/data`, and `src/stores` structure. Since then, the repository standardized on vertical-slice organization with `shared/` reserved for cross-feature concerns. This change needs explicit placement decisions so the implementation stays aligned with the current repo structure instead of reintroducing a second layout convention.

This slice also changes the role of some route files. In Phase 1, route files were intentionally thin placeholders delegating rendering to `src/` views. In Phase 3, `app/(tabs)/index.tsx` and related route files become real product entry points, so the route contract itself needs to evolve rather than preserving the placeholder-only rule.

## Goals / Non-Goals

**Goals:**

- Deliver the first real library-browsing shell with category sections, sound cards, and navigation into the player route.
- Establish the four-tab Phase 3 navigation shell, including the frosted tab-bar presentation and now-playing tab entry.
- Provide a stable, UI-facing sound manifest sized for the library experience instead of relying on ad hoc inline arrays inside screens.
- Evolve the UI store so persisted dark mode and hydration safety are available to Phase 3 screens at startup.
- Preserve compatibility with existing Phase 2 audio services so tapping a sound can transition naturally into later player work.

**Non-Goals:**

- Build the full player UI from later Phase 3 slices.
- Implement real premium gating, favorites persistence, quiet-mode wiring, or settings functionality beyond the dark-mode foundation required here.
- Replace the Phase 2 shared audio catalog or audio service contracts with a new playback model.

## Decisions

### Place library UI code under `src/library/` and keep only cross-feature state in `shared/`

Implementation should treat the library shell as a feature slice rooted at `src/library/` instead of following the plan's older top-level `src/components` and `src/data` paths directly. The concrete Phase 3 paths should be:

- `src/library/data/sounds.ts`
- `src/library/ui/components/SoundCard.tsx`
- `src/library/ui/components/CategorySection.tsx`

Persisted UI preferences remain under `src/shared/domain/stores/uiStore.ts` because dark mode and shell hydration state are cross-feature concerns.

Rationale: this follows the repository's vertical-slice rule and avoids adding a second structural convention after the codebase standardized on feature-first placement.

Alternative considered: follow the source plan literally with new top-level `src/components`, `src/data`, and `src/stores` folders.
Rejected because that would conflict with the current repo structure and make later Phase 3 work harder to organize consistently.

### Keep the library manifest UI-facing, separate from the Phase 2 cache catalog, and sized to 17 sounds

The library screen needs richer browse metadata than the Phase 2 cache catalog currently provides: display name, subtitle, duration text, premium presentation, and visual asset metadata sized for card rendering. This slice should define a UI-facing manifest contract for browsing in `src/library/data/sounds.ts` instead of overloading `src/shared/data/catalogs/sounds.ts` with presentation-only concerns. The manifest should keep the stronger source-plan breadth of 17 sounds across `rain`, `fire`, `forest`, and `wave`.

Rationale: the Phase 2 catalog is a playback/cache source contract centered around Firebase storage refs and default timers. The library shell needs browse-oriented display metadata. Keeping the two boundaries explicit avoids muddling playback concerns with UI-only presentation fields.

Alternative considered: extend the shared cache catalog directly until it also satisfies the library UI.
Rejected because it would mix source-of-truth playback metadata with screen-specific browse presentation requirements too early.

### Evolve the route contract from placeholder delegation to product-owned route files where needed

This slice should explicitly relax the Phase 1 requirement that all non-layout route files remain thin wrappers around `src/` placeholder screens. The real library route, now-playing route, and tab layouts may own product UI directly when that is the clearest home for navigation-driven screen composition, while still keeping reusable subcomponents outside `app/`.

Rationale: Phase 3 turns the route graph from a shell into the real app entry surface. Forcing the old placeholder-only rule to remain absolute would create artificial indirection with no product value.

Alternative considered: preserve the thin-route rule unchanged and push all product UI into imported screen wrappers.
Rejected because the route files themselves now represent the actual product surfaces rather than temporary placeholders, and the added wrapper layer would not improve reuse or clarity by itself.

### Keep the root stack boundaries but upgrade the tab contract to the Phase 3 shell

The root layout should continue to host `(tabs)`, `(onboarding)`, and `player` as sibling stack screens, but the tab layout should evolve from three placeholder tabs to four Phase 3 tabs: home/library, now-playing, favorites, and settings. The tab bar should use a frosted `BlurView` background and absolute positioning so content can visually extend beneath it.

Rationale: the sibling `player` route is already the right navigation architecture for an immersive player, while the tab-shell presentation now needs to match the Core UI browsing experience.

Alternative considered: move `player` into tabs or add a second nested stack just for the library flow.
Rejected because the current sibling-stack player boundary is already correct and avoids tab-bar leakage into immersive screens.

### Keep the now-playing tab minimal: push to `/player` only when a sound is active

The `now-playing` tab should act as a lightweight shortcut into the player route when there is an active sound. If no sound is active, the tab route should render a minimal inactive shell state rather than inventing richer playback behavior inside this slice.

Rationale: this matches the research guidance, gives the four-tab shell a concrete purpose, and avoids pulling later player-slice logic into the library-shell change.

Alternative considered: make the tab a static placeholder or always push to player regardless of playback state.
Rejected because the first option weakens the shell, while the second creates a misleading navigation target when nothing is playing.

### Include the onboarding route structure now, but keep Quiet Mode non-functional

This slice should include the onboarding route structure needed by the Phase 3 shell, including the second `quiet-mode` route. The quiet-mode control itself remains a UI shell only and does not implement real DND behavior in this phase.

Rationale: the Core UI shell depends on the route structure being present now, while the actual quiet-mode behavior is explicitly deferred in the research and phase plan.

Alternative considered: defer the second onboarding route entirely until a later slice.
Rejected because it would leave the shell contract incomplete relative to the planned onboarding flow.

### Preserve the existing UI store fields, persist only durable preferences, and keep hydration explicit

The updated UI store should preserve the existing shell fields already present in `src/shared/domain/stores/uiStore.ts`, add hydration visibility explicitly, and persist only durable preferences or flags that should survive app restarts. At minimum, the store should continue to support `isDarkMode`, `hasSeenOnboarding`, `isImmersiveMode`, and `isPlayerVisible`, while adding `_hasHydrated` and avoiding blanket persistence of ephemeral state.

Rationale: dark mode is a durable preference that affects the shell immediately at startup, while hydration state is required to avoid theme flashes before persisted values are loaded.

Alternative considered: persist every UI field indiscriminately or avoid a hydration flag entirely.
Rejected because over-persisting ephemeral state creates stale-shell behavior, replacing the store shape would create unnecessary churn for later slices, and skipping hydration awareness risks visible theme flicker on startup.

## Risks / Trade-offs

- [The source phase plan still references outdated file paths] -> Mitigation: codify the placement decision here and in the specs so implementation follows the current vertical-slice structure consistently.
- [A separate UI manifest can drift from the Phase 2 cache catalog] -> Mitigation: keep the contracts explicit and treat reconciliation with playback-oriented metadata as a later integration boundary rather than hiding the mismatch now.
- [Relaxing the thin-route rule could encourage oversized route files] -> Mitigation: limit the rule change to real product route ownership while keeping reusable UI pieces in non-route feature modules.
- [The now-playing tab behavior may be partly placeholder until player work expands] -> Mitigation: lock the tab to “push to player only when active, otherwise inactive shell” and leave richer behavior to later slices.

## Migration Plan

1. Add a new `library-browse-shell` capability spec for the library manifest, category sections, sound cards, and tab-shell browse behavior.
2. Modify `app-route-skeleton` so the route contract reflects the real Phase 3 shell instead of the placeholder-only Phase 1 shell.
3. Modify `state-store-contracts` so `useUIStore` includes persisted dark-mode and hydration-safe behavior for Core UI startup.
4. Implement the feature-slice UI, route updates, and store changes in the codebase.
5. Verify that the library shell renders, tab navigation matches the new contract, tapping a sound can reach the player route, and the now-playing tab behaves correctly for both active and inactive playback states.

Rollback strategy: restore the archived placeholder route behavior and remove the new library-shell modules if the Phase 3 shell proves unstable, while leaving the lower-level Phase 2 audio foundations intact.

## Open Questions

- Whether the new library manifest should eventually replace the Phase 2 shared sound catalog outright or remain a separate UI-facing contract through the rest of Phase 3.
