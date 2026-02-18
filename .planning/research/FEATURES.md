# Feature Research

**Domain:** ASMR / Relaxation Sound Mobile App (iOS + Android)
**Researched:** 2026-02-18
**Confidence:** MEDIUM — Training data through August 2025. Web search and WebFetch unavailable. Findings based on deep familiarity with Calm, Headspace, White Noise Lite, Endel, Noisli, myNoise, Rain Rain, and similar apps in the category. Confidence is MEDIUM because live competitor verification was not possible.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Sound library with categories | Every app in the category has categorized sounds (rain, nature, white noise, etc.); uncategorized = disorienting | LOW | 15–30 sounds is enough for MVP. Categories: nature, white noise, urban, music-adjacent |
| Auto-play on sound selection | Tapping a sound and having to press Play separately breaks the "calm" flow; users expect tap = sound | LOW | Tap-to-play is the dominant pattern in the category |
| Loop mode | ASMR sessions routinely exceed clip length; no loop = the sound stops mid-session = broken experience | LOW | Binary toggle. No complex sequencing needed at MVP |
| Configurable session timer | Users don't want to manually stop; auto-stop after N minutes is universal (Calm, Headspace, White Noise all have it) | LOW | 1–3 min range fits the "ultra-short" positioning; common pattern is 5/10/15/30 but this app's positioning justifies the shorter range |
| Favorites / save sounds | Repeat users return to the same 2–3 sounds; no save = forced re-discovery every session | LOW | Local storage is sufficient; cloud sync is a differentiator, not table stakes |
| Dark mode | Used at night and for sleep; bright UI is actively hostile to the use case; users expect dark mode in 2026 | LOW | System-level dark mode follow + manual toggle |
| Background audio playback | Sound must continue when screen locks or user switches apps; anything less is broken for sleep/focus use | MEDIUM | Requires correct React Native / Expo Audio configuration; this is where bugs hide |
| Visual calm (no clutter) | Users in this category are uniquely sensitive to visual noise; an overwhelming UI breaks the product promise | MEDIUM | Not a "feature" per se but a quality bar — the design IS the feature |
| Audio volume control | Users often arrive from a noisy context; in-app volume matters when device volume is already set | LOW | Simple slider or +/- controls; system volume alone is insufficient |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Ultra-short format (1–3 min clips) | Competitors default to long-form content (45–60 min sleep tracks); 1–3 min is a deliberate contrast that makes the app feel snackable and non-committal — reduces friction for anxious users who feel overwhelmed by "commit to 30 minutes" | LOW | Already decided. The clip duration itself is a feature; surface it clearly in UI ("2 min rain shower") |
| Fullscreen immersive mode | Competitors show persistent UI chrome during playback; hiding all UI elements and showing only ambient visual + audio creates a meaningfully different session quality | MEDIUM | Auto-hide controls after 2s on play is the pattern; tap to reveal, tap again to hide |
| Do-not-disturb / notification block toggle | Competitors require users to manually enable DND through the OS; offering this as an in-app toggle within the session eliminates a multi-step OS navigation that breaks the calm | MEDIUM | On iOS: uses `DND` entitlement or Focus API. On Android: `NotificationManager.INTERRUPTION_FILTER_ALL`. Needs OS permission and will require per-platform handling |
| Maximum 3-tap rule (design constraint as feature) | No competitor publishes a "max 3 taps" UX commitment; this is marketable and verifiable — users who read the App Store description can trust it | LOW | Requires sustained discipline across the roadmap; every new feature must be evaluated against this constraint |
| Freemium without ads | Dominant competitor pattern is ads-in-free-tier (White Noise apps) or aggressive upsell modals (Calm); an ad-free model at all tiers is a trust signal for the anxiety-prone audience | LOW (product decision) | Revenue comes only from premium tier; sets user expectation correctly from first launch |
| Curated micro-library (not overwhelming) | Competitors compete on quantity (Calm: 100+ meditations, myNoise: 200+ soundscapes); this app's 15–30 curated sounds is itself a differentiator for decision-fatigued users | LOW | Number should be visible in marketing; each sound needs quality > quantity |
| Optional auth (local-first, sync optional) | Competitors force account creation early; local-first with optional sync for favorites removes a friction point at onboarding | MEDIUM | Requires offline-capable favorites (AsyncStorage locally; Firestore when authenticated) |
| Calm-first visual aesthetic | Warm palette, generous whitespace, slow animations (150–250ms) — this is the visual analogue of the audio content. Very few apps treat the visual experience as carefully as the audio | MEDIUM (design/animation effort) | Defined in PRD: #F9FAF9 background, #6FB3B8 accent; animations are low-complexity but must be tuned |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for a calm-focused product.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Sound mixing / layering | Power users want to combine rain + coffee shop + binaural; myNoise and Noisli make this a core feature | Immediately increases UI complexity; multiple sliders, volume balancing, save/load presets — this is a different product. Decision fatigue is the enemy | If validated by users post-launch, add one preset "blend" per premium tier — no UI mixer |
| Streaks / achievements / gamification | App stores reward engagement loops; streaks have worked for Duolingo, Calm — "meditated 7 days in a row" is a common pattern | Directly contradicts "we optimize for calm not engagement." Streaks create anxiety when broken. Achievements make relaxation feel performative | Ignore entirely. If users want to track usage, that's v2+ personal stats — optional, no streak pressure |
| Push notifications / reminders | "Remind me to relax at 9pm" is a real user need; Headspace and Calm have daily reminders | Notifications interrupt people. An app promising calm should not interrupt users. Ironically, reminder notifications create the exact stimulus-response cycle the app is trying to break | Offer scheduled system sounds (OS-level alarm integration) or a "widget" shortcut instead of push interrupts |
| Social features (share, community) | "Share what I'm listening to" — social proof, virality | Introduces performance anxiety; "how many listens does this sound have?" creates comparison; "share to Instagram" requires social auth complexity | Simple "copy link to sound" for word-of-mouth sharing only, no in-app social graph |
| Autoplay next sound / continuous playlist | "Keep playing" — logical extension of loop mode | Creates a passive content consumption pattern. The app's value proposition is intentional micro-sessions, not infinite scroll audio. Chaining sounds undermines intentionality | Loop single sound + explicit "play next" gesture only; never auto-advance |
| Detailed analytics dashboard | Users want to know "how much time did I spend relaxing?" | A dashboard inside a calm app is cognitive load inside a calm app. Counterproductive location for this information | If usage stats are wanted, a single "lifetime minutes" number on profile is sufficient — not a chart |
| Wake-up alarm tied to sounds | "Use my favorite rain sound as my alarm" — natural extension of sleep use case | Alarm functionality is a fundamentally different mode requiring reliability guarantees, snooze logic, background scheduling — this is a separate product scope | Recommend OS alarm app + suggest the user plays Calm Sounds Mini as a wind-down before sleep |
| Sound upload / user-generated content | Power users want custom sounds | Moderation complexity, storage costs, copyright risk, and UI complexity that undermines the curated positioning | Stay curated; allow premium users to request sounds via feedback |
| Haptic feedback synchronized with audio | Immersive experience enhancement — phones can vibrate in rhythm with rain | Implementation complexity is high; behavior is inconsistent across Android OEMs; battery drain; irritating if pattern is even slightly off | Reserve for future native module exploration; don't build in MVP |

---

## Feature Dependencies

```
Sound Library (data)
    └──requires──> Audio Playback Engine
                       └──requires──> Background Audio Config (iOS/Android)
                       └──requires──> Session Timer
                                          └──requires──> Timer UI Component

Fullscreen Immersive Mode
    └──requires──> Audio Playback Engine (sound must already be playing)
    └──enhances──> Do Not Disturb Toggle (both activated together = full immersion)

Favorites (local)
    └──requires──> Sound Library (something to favorite)
    └──independent of──> Auth (local storage works without auth)

Favorites (synced)
    └──requires──> Favorites (local)
    └──requires──> Auth (Firebase Authentication)
    └──requires──> Firestore

Dark Mode
    └──independent of──> all audio features
    └──enhances──> Fullscreen Immersive Mode (dark + fullscreen = maximum immersion)

Do Not Disturb Toggle
    └──requires──> OS Permissions (NotificationManager / Focus mode)
    └──requires──> Audio Playback (toggle only makes sense during a session)

Freemium Gate
    └──requires──> Sound Library (sounds must be marked free/premium)
    └──enhances──> Auth (premium status tied to account)

Loop Mode ──conflicts──> Autoplay Next Sound (mutually exclusive behaviors)
```

### Dependency Notes

- **Audio Playback Engine is the critical path:** Everything else depends on getting background audio right on both iOS and Android. This must be solved in Phase 1 or the entire product doesn't work.
- **Fullscreen Immersive Mode requires playback:** Cannot be entered without an active sound; this simplifies state management.
- **Favorites are independent of auth at MVP:** Local-only favorites work without any backend. Auth unlocks sync, not the feature itself. This allows shipping faster.
- **Freemium gate requires sound library data model:** Sounds must have an `access` field (`free`/`premium`) from the start; retrofitting this later is painful.
- **Do Not Disturb requires runtime permissions:** This must be requested in context (during session) not at onboarding; requesting at cold launch will get denied.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Sound library (15 sounds, categorized, free/premium data model from day 1) — core product
- [ ] Auto-play on selection (tap = sound starts immediately) — core UX promise
- [ ] Loop mode toggle — required for any use case beyond 3 minutes
- [ ] Session timer (1/2/3 min + infinite) — required for sleep and focus use cases
- [ ] Background audio playback (screen lock + app switch) — required or the product is broken
- [ ] Favorites (local storage, no auth required) — repeat users need this from day 1
- [ ] Dark mode (system-follow minimum; manual toggle preferred) — used at night, essential for credibility
- [ ] Fullscreen immersive mode — the primary differentiator; builds in v1 while codebase is small
- [ ] Volume control (in-app slider) — required for context-switching users
- [ ] Freemium gating (5 free sounds, rest behind premium) — validates monetization model

### Add After Validation (v1.x)

Features to add once core is working and users are retained.

- [ ] Auth + favorites sync (Firebase) — add when users start requesting "I lost my favorites" or are multi-device
- [ ] Do Not Disturb toggle — add once the audio session experience is confirmed solid; don't add permission-requesting complexity to v1
- [ ] Reminder nudge (single optional weekly suggestion, not daily) — add only if D7 retention data shows drop-off without it; use conservative, calm-first design
- [ ] 15 additional sounds (expand to 30) — add based on which categories users favorite most
- [ ] Onboarding flow (single screen, skippable) — add after understanding where new users get confused

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Widget (iOS/Android home screen widget) — high implementation effort, meaningful retention driver, but requires product-market fit first
- [ ] CarPlay / Android Auto integration — niche but valuable for commuters; defer until core user base is established
- [ ] Personal usage stats (single lifetime minutes counter only) — if users request "how much have I used this?"; keep minimal
- [ ] Haptic synchronization — explore only after native module architecture is stable
- [ ] Offline premium (pre-cache purchased sounds) — valuable for travel use case; complex to implement correctly; defer

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Background audio playback | HIGH | MEDIUM | P1 |
| Auto-play on selection | HIGH | LOW | P1 |
| Sound library (15 sounds) | HIGH | LOW | P1 |
| Loop mode | HIGH | LOW | P1 |
| Session timer | HIGH | LOW | P1 |
| Favorites (local) | HIGH | LOW | P1 |
| Dark mode | HIGH | LOW | P1 |
| Fullscreen immersive mode | HIGH | MEDIUM | P1 |
| Volume control | MEDIUM | LOW | P1 |
| Freemium gating | HIGH | LOW | P1 |
| Auth + favorites sync | MEDIUM | MEDIUM | P2 |
| Do Not Disturb toggle | MEDIUM | MEDIUM | P2 |
| Reminder nudge (optional) | LOW | LOW | P2 |
| Sound library expansion (30) | MEDIUM | LOW | P2 |
| Widget | HIGH | HIGH | P3 |
| Personal usage stats (minimal) | LOW | LOW | P3 |
| Offline premium caching | MEDIUM | HIGH | P3 |
| CarPlay / Android Auto | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

*Note: Competitor data from training knowledge (August 2025). Live verification was unavailable. Confidence: MEDIUM.*

| Feature | Calm | White Noise Lite | Noisli | Our Approach |
|---------|------|-----------------|--------|--------------|
| Sound library size | 100+ | 40+ | 35+ | 15–30 (curated quality > quantity) |
| Session timer | Yes (5–30+ min defaults) | Yes (sleep timer) | Yes | Yes, but 1–3 min range emphasizes snackability |
| Loop mode | Yes | Yes | Yes | Yes — infinite loop as default behavior |
| Sound mixing | No | Yes (multi-layer) | Yes (multi-layer) | No — anti-feature for our positioning |
| Fullscreen immersive | Partial (player view) | No | No | Yes — primary UX differentiator |
| Background playback | Yes | Yes | Yes | Yes — required |
| Favorites | Yes | Yes | Yes | Yes — local-first, cloud sync v1.x |
| Dark mode | Yes | Yes | Limited | Yes |
| Ads | No (paid app) | Yes (free tier) | No | No (freemium, no ads ever) |
| Push notifications | Yes (aggressive) | Yes | Yes | No / Optional minimal |
| Streaks/gamification | Yes (meditation streaks) | No | No | No — anti-feature |
| Social sharing | Yes | No | No | No (word-of-mouth link only) |
| Widget | Yes | Yes | No | v2+ |
| Onboarding | Heavy | Minimal | Minimal | Minimal (skippable) |
| Audio content length | 10–45 min typical | Continuous/infinite | Continuous/infinite | 1–3 min clips (unique) |
| Do Not Disturb in-app | No | No | No | Yes — differentiator |

---

## Sources

- Training data through August 2025: Calm (iOS/Android), Headspace (iOS/Android), White Noise Lite, Noisli (web + mobile), myNoise (web), Endel (iOS), Rain Rain Sleep Sounds, Relax Melodies
- Project PRD: `CalmSoundsMini_PRD_Completo.md` (January 2026)
- User persona research: PRD Section 4 (students, anxiety sufferers, professionals, sleep-challenged users)
- Live web verification: UNAVAILABLE (WebSearch and WebFetch denied during this research session)

**Confidence note:** All competitor feature claims are MEDIUM confidence — based on training data, not live verification. Before shipping, verify that Calm, Headspace, and White Noise have not added in-app DND toggles or 1–3 min clip formats, as these would affect differentiation claims.

---
*Feature research for: Calm Sounds Mini — ASMR/relaxation sound mobile app*
*Researched: 2026-02-18*
