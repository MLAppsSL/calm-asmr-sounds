# Requirements: Calm Sounds Mini

**Defined:** 2026-02-18
**Core Value:** User opens app, taps a sound, and is relaxing in under 3 taps — no menus, no interruptions, no friction.

## v1 Requirements

### Audio Playback (AUDIO)

- [ ] **AUDIO-01**: User can start playing a sound by tapping it (auto-play, no extra step)
- [ ] **AUDIO-02**: Audio continues playing when the screen locks or the user switches apps (background audio)
- [ ] **AUDIO-03**: User can enable loop mode so a sound repeats until they manually stop it
- [ ] **AUDIO-04**: User can choose a fixed timer duration (1, 2, or 3 minutes) that stops audio automatically — free tier
- [ ] **AUDIO-05**: [PREMIUM] User can activate Infinity mode — audio plays with no time limit, looping forever
- [ ] **AUDIO-06**: [PREMIUM] User can set a custom timer duration of their choosing

### Sound Library (LIB)

- [ ] **LIB-01**: User can browse a library of 15+ relaxing sounds organized by ambient category
- [ ] **LIB-02**: User can filter the library by sound category (rain, fire, forest, ocean, etc.)
- [ ] **LIB-03**: Each sound card displays the clip duration and whether it is free or premium
- [ ] **LIB-04**: Premium sounds are visible in the library but locked with a visual premium indicator

### Visual Experience (VIS)

- [ ] **VIS-01**: User can enter fullscreen immersive mode during playback — UI elements hide, only background visual and audio remain
- [ ] **VIS-02**: Each sound category has a corresponding ambient video/visual background shown during playback
- [ ] **VIS-03**: User can activate Do Not Disturb mode to suppress system notifications during a session

### Favorites (FAV)

- [ ] **FAV-01**: User can save or unsave any sound as a favorite via a star/heart icon
- [ ] **FAV-02**: User can view all saved favorites in a dedicated Favorites screen
- [ ] **FAV-03**: When an anonymous user logs in, their locally-saved favorites are merged into their cloud account (no data loss)

### Settings (SET)

- [ ] **SET-01**: User can toggle dark mode on or off (dark mode is on by default)
- [ ] **SET-02**: User can set a default timer duration that pre-fills for new sessions
- [ ] **SET-03**: User can access a Settings screen to manage all app preferences

### Account & Monetization (AUTH)

- [ ] **AUTH-01**: User can use all free features without creating an account (anonymous mode)
- [ ] **AUTH-02**: User can optionally sign up or log in with email via Firebase Auth
- [ ] **AUTH-03**: Authenticated user's favorites sync across devices via Firestore
- [ ] **AUTH-04**: User sees a premium paywall screen built with RevenueCat, enabling in-app subscription purchase to unlock premium features (Infinity mode, custom timer, premium sounds)

### Onboarding (ONBRD)

- [ ] **ONBRD-01**: First-time users see a welcome onboarding screen before entering the main app ("Toca un sonido. Respira.")

### Analytics (ANLX)

- [ ] **ANLX-01**: App tracks key events via Firebase Analytics: sound played, favorite saved, loop enabled, timer set, paywall viewed, subscription purchased

---

## v2 Requirements

### Social & Personalization

- **SOCL-01**: User can share a sound via a link or native share sheet
- **SOCL-02**: App surfaces personalized sound recommendations based on listening history

### Personal Stats

- **STAT-01**: User can view personal calm session statistics (total time, most-played sound)
- **STAT-02**: App integrates with Apple Health / Google Fit to log relaxation time

### Platform Extras

- **PLAT-01**: User can access a quick-play lockscreen widget
- **PLAT-02**: App sends optional mindfulness reminder notifications (user opt-in)

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat / community | Against calm-first mission; social interaction creates stimulation, not calm |
| Streaks / gamification / badges | Engagement-optimization pattern — explicitly anti-mission ("we optimize for calm, not engagement") |
| Multiple simultaneous sounds (sound mixing) | Significant complexity; not in PRD; deferred to post-v2 |
| User-uploaded sounds | Content moderation complexity; copyright risk |
| Web version | Mobile-first; React Native cross-platform covers iOS + Android in v1 |

---

## Traceability

*Populated by roadmapper.*

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUDIO-01 | — | Pending |
| AUDIO-02 | — | Pending |
| AUDIO-03 | — | Pending |
| AUDIO-04 | — | Pending |
| AUDIO-05 | — | Pending |
| AUDIO-06 | — | Pending |
| LIB-01 | — | Pending |
| LIB-02 | — | Pending |
| LIB-03 | — | Pending |
| LIB-04 | — | Pending |
| VIS-01 | — | Pending |
| VIS-02 | — | Pending |
| VIS-03 | — | Pending |
| FAV-01 | — | Pending |
| FAV-02 | — | Pending |
| FAV-03 | — | Pending |
| SET-01 | — | Pending |
| SET-02 | — | Pending |
| SET-03 | — | Pending |
| AUTH-01 | — | Pending |
| AUTH-02 | — | Pending |
| AUTH-03 | — | Pending |
| AUTH-04 | — | Pending |
| ONBRD-01 | — | Pending |
| ANLX-01 | — | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 0
- Unmapped: 25 ⚠️ (will be resolved by roadmapper)

---
*Requirements defined: 2026-02-18*
*Last updated: 2026-02-18 after initial definition*
