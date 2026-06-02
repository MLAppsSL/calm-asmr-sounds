## Context

Phase 4.1 introduced the persisted favorites store shape and a UI store field for the default timer duration, but the Phase 3 surfaces still lack the favorite controls and the current timer surfaces are split across the player and settings flows. This change spans shared UI components, the library card surface, the player screen, and the existing settings timer selector, so the main design concern is keeping favorite state reactive without causing broad list re-renders while also keeping timer preference writes consistent across both UI entry points.

## Goals / Non-Goals

**Goals:**

- Add a reusable favorite toggle component that reads and writes the existing favorites store efficiently.
- Surface favorite state and toggle actions from both `SoundCard` and the player controls.
- Ensure the player initializes its timer from the saved default when starting a new session.
- Ensure timer changes made in the player and settings both update the saved default preference.

**Non-Goals:**

- Building the dedicated Favorites screen or Settings screen wiring planned for Phase 4.3.
- Changing the persisted favorites data model or adding cloud sync behavior.
- Introducing new timer duration options, premium gating, or new animation libraries.

## Decisions

### Use a dedicated `FavoriteButton` component backed by scoped Zustand selectors

The favorite toggle will live in `src/favorites/ui/components/FavoriteButton.tsx` and subscribe with `useFavoritesStore((s) => s.isFavorite(soundId))`, while invoking `useFavoritesStore.getState().toggleFavorite(soundId)` for the action path. This keeps each button reactive only to its own sound's favorite status instead of subscribing every card to the whole store.

Alternative considered: reading both `isFavorite` and `toggleFavorite` through a single hook subscription. Rejected because the function subscription is unnecessary and broadens the render surface.

### Reuse the existing icon and animation stack

The button will use `MaterialIcons` with `favorite` and `favorite-border`, plus a small `react-native-reanimated` scale sequence for immediate visual feedback. This stays aligned with the existing app iconography and animation tooling instead of introducing another icon family or a custom SVG asset.

Alternative considered: placing the heart as a static icon with no animation. Rejected because the plan explicitly requires immediate toggle feedback and the existing stack already supports a small spring interaction cheaply.

### Keep timer default sync in the player screen, not inside stores

The player screen will own the focus-time prefill and the coupling write because the behavior is screen-specific: only the player knows when it gains focus and when the timer segmented control changes. The stores remain simple state containers, while the screen coordinates `audioStore` and `uiStore` using their existing APIs.

Alternative considered: embedding automatic sync inside `audioStore` setters or cross-store subscriptions. Rejected because it would make timer persistence implicit and harder to reason about, especially when different screens may eventually edit timer state for different reasons.

### Treat `uiStore.defaultTimerDuration` as the persisted source of truth across player and settings

The existing settings timer selector already edits `audioStore.timerDurationMs`, so this change will also update settings to read the persisted default from `uiStore.defaultTimerDuration` and write back to both stores when the user changes the selection. The player remains responsible for focus-time prefill, but both surfaces must keep the persisted preference synchronized with the active timer duration.

Alternative considered: leaving settings unchanged and syncing only from the player. Rejected because the settings selector would drift from the persisted default and player focus could overwrite a settings choice that was never saved.

### Guard timer prefill to new sessions only

On player focus, the screen will read `uiStore.defaultTimerDuration` and write it into `audioStore` only when playback is not already active. This prevents overwriting an in-progress session if the user returns to the player mid-playback.

Alternative considered: always applying the saved default on focus. Rejected because it would clobber the active session's timer state.

## Risks / Trade-offs

- [Favorite button placement may overlap existing card content] → Mitigation: place the button in a card corner with minimal footprint and adjust to a backed container if the current text layout needs separation.
- [Player timer coupling could drift from the actual audio setter name or units] → Mitigation: read the current `audioStore` implementation before coding and use the existing millisecond-based `setTimerDuration` API with explicit seconds-to-milliseconds conversion where needed.
- [Settings timer selector could diverge from the persisted default] → Mitigation: update the settings route to derive its selected value from `uiStore.defaultTimerDuration` and write both stores on change.
- [Focus-based prefill could overwrite state during navigation edge cases] → Mitigation: gate on the current playback state and limit the write to non-playing sessions.
- [Per-button subscriptions still create many listeners in large lists] → Mitigation: use the narrowest possible selector so only the affected sound card re-renders when its favorite state changes.

## Migration Plan

No data migration is required. The change reuses the persisted favorites store and the existing `defaultTimerDuration` preference added in the prior phase. Rollback is limited to removing the new UI component usages and the player-level timer sync code if issues are discovered.

## Open Questions

- None. The Phase 4.2 plan already locks the timer sync decision and defines the desired button behavior.
