# Phase 5: Auth and Cloud Sync - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can optionally create an email account to sync favorites across devices. Any favorites saved while anonymous are migrated to the cloud account on first login with no data loss. All free features remain accessible without an account — no forced login gates anywhere in the app.

</domain>

<decisions>
## Implementation Decisions

### Auth Entry Points
- Sign Out is a clearly labeled, top-level option in the Settings screen — not buried
- All other entry point decisions (where auth can be triggered, proactive nudge strategy, Favorites screen auth UI for logged-out users) deferred to Claude's discretion

### Auth Flow UX
- Login and Sign Up are on the **same screen** with a toggle to switch between the two — single form, minimal navigation
- Form presentation style (modal sheet vs full screen), post-login feedback (silent vs brief confirmation), and whether to include Forgot Password in this phase are deferred to Claude's discretion

### Migration Experience
- Anonymous-to-cloud migration runs **silently in the background** — no loading indicator, no confirmation step
- If migration fails, it retries **silently on next app open** — no error shown to user; local favorites remain intact as fallback
- Post-migration local data handling and sign-out favorites behavior are deferred to Claude's discretion

### Sync Conflict Behavior
- When logging into a device that has anonymous favorites, the strategy is **union** — anonymous favorites are merged into the cloud set, nothing is discarded
- Firestore **offline persistence is enabled** — favorites are accessible and writable with no internet connection; sync happens automatically on reconnect
- Duplicate handling (same sound favorited on two devices) and sync status indicator decisions are deferred to Claude's discretion

### Claude's Discretion
- Auth entry point surfaces beyond Settings (Favorites screen icon, proactive nudge strategy)
- Auth form presentation (modal sheet vs full screen)
- Post-login UI feedback (silent update vs brief confirmation)
- Whether to include Forgot Password / email reset in this phase
- Post-migration local favorites handling (delete vs keep as backup)
- Sign-out favorites behavior (clear local vs keep cached)
- Duplicate detection algorithm for cross-device conflicts
- Sync status indicator (none vs subtle cloud icon in Favorites header)

</decisions>

<specifics>
## Specific Ideas

No specific references or "I want it like X" moments — open to standard approaches for all undecided areas.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-auth-and-cloud-sync*
*Context gathered: 2026-02-19*
