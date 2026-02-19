# Phase 4: Favorites - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Local-first favorites system — users can save sounds as favorites, retrieve them instantly without an account, and their favorites survive app restarts. Cloud sync and authentication are Phase 5. The Settings screen is completed in this phase (dark mode toggle, default timer, placeholder for future account section).

</domain>

<decisions>
## Implementation Decisions

### Favoriting interaction
- Heart icon (not star or bookmark) — consistent with the calm/emotional tone of the app
- Heart appears in BOTH locations: on the sound card in the library AND on the player screen
- Tap to toggle — no confirmation needed on remove; animation and removal behavior at Claude's discretion (see below)

### Favorites screen layout
- Layout style: Claude's discretion — match library screen cards for consistency
- Ordering: Claude's discretion — most recently added first is the natural default
- Empty state: illustrated empty state using the existing mock at `mock/empty_favorites_state/screen.png`
- Filtering/grouping: Claude's discretion — flat list preferred for Phase 4 simplicity
- Full screen mock available at `mock/your_favorite_sounds/screen.png`

### Default timer setting
- Available durations: 1, 2, and 3 minutes — same options as the audio engine (Phase 2)
- "No timer" option: Claude's discretion — must respect free vs premium constraints (Infinity mode is Phase 6 premium)
- Timer application when opening player: Claude's discretion — least disruptive approach
- Per-session override: No — changing the timer in any screen updates the saved default (no separate session vs. default concept)

### Settings screen structure
- Follow the existing mock at `mock/app_settings_and_timer/screen.png` for layout and grouping
- Account section placeholder: Claude's discretion — decide whether to show a greyed-out "Sign in to sync" row or hide it entirely until Phase 5
- Dark mode default: Follow system preference (not forced dark on first install)

### Claude's Discretion
- Heart animation on favoriting (pop, burst, or simple fill — pick what fits the calm aesthetic)
- Unfavorite behavior (immediate vs brief undo toast — pick least disruptive)
- Favorites screen card style (same as library or compact — pick most consistent)
- Favorites ordering (most recent first recommended)
- Favorites grouping (flat list recommended for Phase 4)
- Default timer application in player (silent pre-select vs highlighted indicator)
- No-timer option availability (constrained by free tier: Infinity mode is Phase 6 premium)
- Account section placeholder in Settings (greyed row vs hidden)

</decisions>

<specifics>
## Specific Ideas

- Illustrated empty state for the Favorites screen — existing mock at `mock/empty_favorites_state/screen.png`
- Full Favorites screen mock at `mock/your_favorite_sounds/screen.png`
- Settings screen mock (including timer section) at `mock/app_settings_and_timer/screen.png`
- Researcher and planner should read these mock HTML/PNG files before designing components

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-favorites*
*Context gathered: 2026-02-19*
