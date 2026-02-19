# Phase 6: Freemium and Monetization - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Premium sounds are locked server-side via Firestore Security Rules — no premium URL is ever returned to a non-premium user. The UI surfaces lock indicators for premium sounds and routes free users to a RevenueCat native paywall. After purchase, all premium features unlock immediately with no app restart. Auth and the sound catalog are already in place from prior phases.

</domain>

<decisions>
## Implementation Decisions

### Lock indicators
- Card style and lock badge design: Claude's discretion — pick what looks clean and modern for a calm ambient app
- Lock label (icon vs icon + text): Claude's discretion
- Tapping a locked sound card immediately opens the paywall — no preview clip, no teaser
- Free users cannot favorite a premium sound — tapping the favorite button on a premium sound opens the paywall instead

### Paywall screen
- Use RevenueCat's native paywall (not a custom-built screen)
- Visual template: RevenueCat default template — fast to implement, no custom design needed
- Paywall is blocked during fullscreen immersive mode (as per ROADMAP); behavior during regular player playback: Claude's discretion (least disruptive rule)
- Benefits to highlight on the paywall: Unlock all premium sounds, Infinity mode (no time limit), Custom timer duration

### Purchase feedback
- After successful purchase: paywall dismisses and sounds unlock instantly — no celebration screen or animation
- All three unlocks happen immediately on purchase with no app restart: premium sounds playable, Infinity mode enabled, custom timer duration available
- Purchase failure or cancellation: show a brief error message ("Purchase didn't complete. Try again.") then dismiss
- Restore purchases is accessible from both the paywall screen and the Settings screen

### Subscription model
- Plans: Monthly + Annual (both configured and managed via RevenueCat)
- No free trial — direct purchase only
- Proactive paywall entry points (beyond tapping a locked sound): library header/banner, Favorites screen nudge, Settings screen
- Premium status indicator: none — once subscribed, sounds just work; no badge or "Premium Member" label needed

### Claude's Discretion
- Lock indicator visual design (card style, badge position, icon choice)
- Lock label: icon-only vs icon + "Premium" text
- Whether paywall is blocked during regular player screen (apply "no interruption during active playback" rule or restrict only to fullscreen immersive mode)

</decisions>

<specifics>
## Specific Ideas

- RevenueCat native paywall handles all subscription UI — don't reinvent it
- Monthly + Annual plans only; RevenueCat manages duration configuration
- Paywall entry from three proactive surfaces: library header/banner, Favorites nudge, Settings

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-freemium-and-monetization*
*Context gathered: 2026-02-19*
