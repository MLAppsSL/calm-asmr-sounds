# Phase 3: Core UI - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

The app is fully navigable — users can browse sounds by category, tap to play, enter fullscreen immersive mode, see per-category ambient video backgrounds, configure dark mode, and complete onboarding on first launch. Favorites, auth, and monetization are separate phases.

Design reference: `mock/` folder contains HTML + PNG mocks for all screens in this phase.

</domain>

<decisions>
## Implementation Decisions

### Library layout
- Horizontal scroll sections per category (e.g. Nature, Ambient) — no "View all" links
- Sections are the browsing mechanism; no category filter tabs needed
- Each section is an independent horizontal FlatList
- No "View all" — the section itself is the complete category view

### Sound card content
- Square cards, rounded corners (24px), image background with gradient overlay
- Content: image bg + sound name + subtitle (descriptor) + clip duration + PRO/lock badge
- PRO badge: small purple pill ("PRO") top-right corner for premium sounds
- Lock icon: purple circle icon top-right for locked sounds
- Duration added to card (roadmap takes priority over mock — mock omits it)

### Player screen
- Full-screen ambient background — looping video per category (not still image)
- Each sound category has its own looping video background
- Controls: top bar (back chevron + "NOW PLAYING" + sound name + •••), circular progress arc around play button, countdown timer, bottom frosted-glass pill (loop, airplay, favorite, fullscreen)
- Player is navigated to on sound tap; it is already visually immersive

### Fullscreen mode
- Fullscreen button in the bottom control pill hides ALL UI chrome: status bar, top bar, bottom controls
- Result: only ambient video and audio remain visible
- Restore: tap anywhere on screen brings back all controls
- Keep-awake active in fullscreen mode

### Bottom navigation
- 4 tabs: Home (library), graphic_eq (now-playing shortcut), Favorites, Settings
- Nav tab 2 (graphic_eq): Claude's discretion — recommended: navigates to player screen if a sound is active; inactive/disabled state if nothing is playing

### Onboarding
- 2-screen flow, shown only on first launch
- Screen 1 (Welcome): logo/icon, "Find your calm in a minute", "ULTRA-SHORT SOUNDS", "Begin" button
- Screen 2 (Quiet Mode): "Enable Quiet Mode" with DND toggle (pre-enabled), "Continue" / "Not now"
- Quiet Mode toggle is non-functional shell in Phase 3 — wired up in Phase 7
- First-launch detection: AsyncStorage flag to skip onboarding on subsequent launches

### Settings screen
- Full mock layout built as a working shell
- Dark mode toggle: functional in Phase 3 (SET-01)
- Session Duration (1m/2m/3m segmented control): shell — non-functional until Phase 4
- Loop Mode toggle: shell — non-functional until Phase 2 wiring
- Auto-play Next toggle: shell — non-functional, Phase TBD
- Silence Notifications toggle: shell — non-functional until Phase 7
- Support & FAQ: placeholder row (no-op tap)
- Share with Friends: placeholder row (no-op tap)

### Claude's Discretion
- Nav tab 2 exact behavior (now-playing routing logic, disabled state treatment)
- Exact looping video assets to use per category (may use placeholder videos in Phase 3)
- Transition animation between library card tap → player screen
- Exact duration label placement on sound card
- Loading/error states for video backgrounds

</decisions>

<specifics>
## Specific Ideas

- Design reference is in `mock/` folder: `extended_sound_library_home`, `immersive_sound_player`, `onboarding_welcome`, `onboarding_permissions`, `app_settings_and_timer`
- Color system: primary `#8b5cf6` (purple), background `#0f1115` (charcoal), card-bg `#1a1c22`, Inter font
- Cards: `min-w-[156px]`, `aspect-square`, `rounded-[24px]`, frosted-glass nav bar
- Player uses `frosted-glass` control pill, ultra-light font weights (100-300), minimal chrome
- Onboarding feel: very minimal, calm — single tap to proceed

</specifics>

<deferred>
## Deferred Ideas

- Quiet Mode / DND functional implementation — Phase 7
- Session Duration functional wiring — Phase 4
- Loop Mode functional wiring — Phase 2 (already done; settings toggle wired in Phase 4)
- Account section in Settings — Phase 5
- "Auto-play Next" feature — not yet scoped in any phase (noted for backlog)

</deferred>

---

*Phase: 03-core-ui*
*Context gathered: 2026-02-19*
