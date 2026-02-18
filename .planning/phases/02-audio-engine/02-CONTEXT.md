# Phase 2: Audio Engine - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Audio playback engine: users tap a sound and hear it play — including when the screen is locked or app is backgrounded — with loop, timer, and fade behavior verified on real devices. No UI chrome (that's Phase 3). This phase is the engine that drives everything.

</domain>

<decisions>
## Implementation Decisions

### Sound switching
- Switching to a new sound: crossfade (old fades out, new fades in simultaneously)
- Tapping the active sound (already playing): toggle it off — stop playback
- Manual stop (toggle off): cut immediately, no fade
- Switching is the only action that uses crossfade; stopping is instant

### Timer behavior
- Timer options: 1, 2, or 3 minutes (as defined in roadmap)
- At timer zero: audio fades out gently, then stops
- Timer display: visible by default during playback; Settings will include a "disable timer display" option
- Mid-session timer change: allowed — user can change timer duration while audio is playing
- Switching sounds resets the timer to its original duration (not continues counting)

### Loop and fade
- Sounds always loop indefinitely — they are short clips (~30s) designed to repeat
- Timer is the stop mechanism (or manual tap to toggle off)
- Loop restart: gapless, seamless — no audible gap or fade at the loop point
- Fade behavior applies only to: (1) crossfade when switching sounds, (2) fade-out when timer reaches zero
- Loop counter: Claude's Discretion — if implemented, a subtle display (e.g., ×4) on the player screen

### First-play loading
- Loading state during first play (before cached): Claude's Discretion — minimize disruption
- Cached playback: must start instantly with no perceptible delay
- Load failure (no internet, Firebase unreachable): Claude's Discretion — least disruptive handling
- Cache policy: permanent until app reinstall — sounds never expire after being cached

### Claude's Discretion
- Loading state indicator during first play (spinner vs active-state vs silent wait)
- Error handling on load failure (silent fail vs brief toast)
- Loop counter: whether to show it and exact placement
- Crossfade duration (suggested: ~0.5–1s based on user preference for "short fade")

</decisions>

<specifics>
## Specific Ideas

- Sounds are ~30 seconds or less — the audio engine must handle very short loops seamlessly
- The loop is not a "feature toggle" — it's always on, just a question of when it stops
- Timer is conceptually a "session end" tool, not a loop controller
- "Permanent cache" signals that the app should feel responsive on repeat use — offline-capable for heard sounds

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-audio-engine*
*Context gathered: 2026-02-19*
