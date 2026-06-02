## Why

Phase 4 has the persisted favorites data and saved timer preference in place, but the user-facing surfaces that expose them are still incomplete. This change closes the phase by turning the Favorites tab into a real saved-sounds screen and making the Settings session-duration control read from and write to the persisted default.

## What Changes

- Replace the Favorites tab placeholder with a hydrated saved-sounds list that renders favorite sounds in most-recently-added order.
- Show a saved-count summary above the Favorites list and use the list wiring needed to keep the empty state centered and user-visible.
- Add an illustrated empty state for the Favorites tab with a one-tap `Explore Sounds` action that returns users to the Library tab.
- Preserve and formally capture the already-landed Settings `Session Duration` control behavior on this branch so the selected duration reflects persisted state and survives restarts.
- Preserve the existing dark-mode behavior while completing the settings timer interaction.

## Capabilities

### New Capabilities

- `favorites-saved-browse`: Users can open the Favorites tab and either see their saved sounds in recency order or an illustrated empty state with a navigation CTA.
- `settings-timer-preferences`: Users can manage the default session duration from Settings, with the control reflecting and persisting the shared timer preference.

### Modified Capabilities

- None.

## Impact

- Affected code: `app/(tabs)/favorites.tsx`, `src/favorites/ui/components/EmptyFavoritesState.tsx`, `app/(tabs)/settings.tsx`, the favorites store selector usage, and the shared UI store timer-preference usage.
- Branch-state note: the current branch already appears to satisfy the planned Settings timer wiring, so this change treats Settings as preserve-and-verify work while implementing the missing Favorites tab surface.
- Affected systems: Favorites tab rendering, Expo Router tab navigation, persisted UI preferences, and the Phase 4 user-facing completion flow.
- Dependencies: existing Zustand stores, the sound catalog used by `SoundCard`, Expo Router, and the current settings UI components.
