# Phase 7: Polish, DND, and Analytics - Research

**Researched:** 2026-02-20
**Domain:** Cross-platform DND behavior, Firebase Analytics instrumentation, accessibility/perf/store-readiness hardening
**Confidence:** MEDIUM

## User Constraints

No `CONTEXT.md` exists for this phase (`.planning/phases/7-polish-dnd-and-analytics/CONTEXT.md` not found).

### Locked Decisions
None provided.

### Claude's Discretion
All implementation details in this phase are currently discretionary, constrained by:
- `VIS-03`: in-session DND toggle behavior
- `ANLX-01`: Firebase Analytics KPI events
- Phase success criteria in `.planning/ROADMAP.md`

### Deferred Ideas (OUT OF SCOPE)
None provided.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIS-03 | User can activate Do Not Disturb mode to suppress system notifications during a session | Clarify to platform-realistic acceptance: Android = full DND toggle with policy access; iOS = `Quiet Session` partial suppression via `AVAudioSession.setPrefersNoInterruptionsFromSystemAlerts` + app-owned interruption suppression + explicit user guidance for manual Focus |
| ANLX-01 | App tracks key events via Firebase Analytics: sound played, favorite saved, loop enabled, timer set, paywall viewed, subscription purchased | Expo docs confirm Firebase JS SDK does not support Analytics in RN/Expo; use `@react-native-firebase/app` + `@react-native-firebase/analytics` with a strict event wrapper and DebugView verification |
</phase_requirements>

## Summary

Phase 7 is primarily an integration-hardening phase, not a feature-invention phase. The most important unknown discovered is platform asymmetry for DND: Android has explicit platform APIs for policy access and DND filter control after user grant, while iOS public SDK surface (as inspected in headers) exposes Focus status and notification interruption levels, but no direct app API to toggle system Focus/DND globally. This means a literal one-tap cross-platform "system notification suppression" implementation is technically straightforward on Android and constrained on iOS.

For analytics, the current stack assumption must be corrected for React Native: Firebase JS SDK is valid for Auth/Firestore/Storage, but not Analytics in Expo/RN. Official Expo guidance explicitly points Analytics to React Native Firebase. Therefore, ANLX-01 should be implemented via `@react-native-firebase/analytics` and centralized in a typed Analytics service (one event catalog, no direct scattered `logEvent` calls).

Release readiness should use existing Expo/EAS flow: store upload via EAS Submit, TestFlight + Play internal track validation, and pre-submit gates for WCAG AA contrast and memory stability. For iOS memory checks, practical SOTA is Instruments Allocations/Leaks (also available via `xctrace` templates).

**Primary recommendation:** Implement DND as a platform-gated feature with explicit lifecycle policy: Android uses session-scoped DND with best-effort restore + orphan recovery, iOS uses explicit constrained fallback UX (`Quiet Session`). Keep analytics on React Native Firebase and enforce launch gates (contrast audit + iOS memory profile + internal store install smoke tests).

## Deep Dive: iOS VIS-03 Fallback (High-Risk Unknown)

### 1) What is technically feasible on iOS with public APIs?

**Feasible (HIGH confidence):**
- **Session-level interruption preference for audio apps:** `AVAudioSession.setPrefersNoInterruptionsFromSystemAlerts(true)` (iOS 14.5+) tells the system the session prefers not to be interrupted by ringtones/alerts. Apple header notes important caveats: effect depends on user call display style; accepted calls still interrupt; full-screen call style can still interrupt.
- **Read Focus status (not control it):** `INFocusStatusCenter` + `INFocusStatus.isFocused` are available with authorization.
- **Open app settings / app notification settings:** `UIApplicationOpenSettingsURLString` and `UIApplicationOpenNotificationSettingsURLString` are public constants.
- **Tune app-owned notification behavior:** `UNNotificationInterruptionLevel` and notification sound APIs affect your app's notifications only.

**Not feasible (HIGH confidence):**
- **Directly toggling global Focus / Do Not Disturb** from an App Store app using public APIs.
- **Programmatically suppressing notifications from other apps** at OS level.

**Why confidence is HIGH:** Public iOS headers expose read-only Focus status APIs and notification metadata controls, but no public setter for global Focus/DND policy.

### 2) Standard product/UX fallback when direct Focus toggle is unavailable

**Prescriptive fallback pattern (MEDIUM-HIGH confidence):**
1. **Single in-session toggle remains** (`Quiet Session` on iOS label).
2. Toggle applies **what the app can guarantee**:
   - Enable `prefersNoInterruptionsFromSystemAlerts` while session is active.
   - Disable in-app nonessential notifications/haptics/toasts during session.
   - Keep playback session active (already part of audio architecture).
3. If user expects full OS suppression, show **one guided sheet**:
   - "For full system silence, enable a Focus mode in iOS Control Center."
   - Optional button to app notification settings (public URL constant).
4. Never show a false "DND fully enabled" status on iOS.

This pattern is used in calm/meditation category products because it is transparent, testable, and policy-safe.

### 3) Proposed acceptance criteria wording to replace/clarify VIS-03

Use platform-realistic criteria in planning docs:

**VIS-03 (clarified):**
- **Android:** During active playback, user can toggle `Do Not Disturb` in one tap. If policy access is missing, app routes user to policy access settings and retries successfully after grant.
- **iOS:** During active playback, user can toggle `Quiet Session` in one tap. App enables iOS audio-session interruption preference (`prefersNoInterruptionsFromSystemAlerts`) and suppresses app-owned interruptions for the session. App clearly communicates that full system-wide Focus/DND must be enabled by user in iOS.
- **Both platforms:** Toggle state is visible in-session, resets safely on session end, and does not break playback.

**Verification wording:**
- Android: with toggle ON and permission granted, incoming non-critical notifications are suppressed by OS during session.
- iOS: with toggle ON, app sets interruption preference successfully and app-owned interruptions are suppressed; test notes document that third-party app notifications remain OS-controlled.

### 4) Architecture and implementation tasks for planner

**Planner tasks (prescriptive):**
1. **`DndService` capability matrix**
   - `supported_full` (Android), `supported_partial` (iOS), `unsupported`.
   - Shared API returns capability + runtime status.
2. **iOS native bridge (`QuietSessionModule`)**
   - Expose `setPrefersNoInterruptionsFromSystemAlerts(enabled)`.
   - Expose `openNotificationSettings()`.
   - Optional: expose read-only Focus status (`INFocusStatusCenter`) for UI indicator.
3. **Session lifecycle wiring**
   - Apply iOS preference only during active playback session.
   - Best-effort restore to previous preference on session end/stop.
4. **UI and copy**
   - iOS label `Quiet Session` (not `Do Not Disturb`).
   - One-time explainer modal for platform limitation.
5. **Telemetry + QA**
   - Log `quiet_session_toggled`, `dnd_permission_prompted`, `dnd_permission_granted`.
   - Add platform-specific e2e checks in verification plan.

### 5) App Store policy/review risks for workaround approaches

| Approach | Risk | Confidence | Why |
|---------|------|------------|-----|
| Private URL schemes to hidden Focus/DND settings (`App-Prefs:` variants) | **HIGH rejection risk** | HIGH | Violates public API requirement (App Review 2.5.1) |
| Any private API / reflection for Focus control | **HIGH rejection risk** | HIGH | App Review 2.5.1 (public APIs only) |
| Behavior that alters native switch/system behavior unexpectedly | **HIGH rejection risk** | HIGH | App Review 2.5.9 |
| Asking users to change unrelated system settings | **MEDIUM-HIGH risk** | HIGH | App Review 2.4.4; guidance must be tied to core functionality |
| Using `AVAudioSession` interruption preferences for active playback sessions | **LOW risk** | HIGH | Public API; intended audio-session purpose aligns with 2.5.4 |

**Concrete recommendation:** Do not attempt hidden/system Focus deep links or private frameworks. Ship transparent iOS `Quiet Session` partial behavior only.

## Deep Dive: Android DND Restore Semantics (High-Risk Unknown)

### Chosen restore policy (prescriptive)

**Policy:** `session-scoped best-effort restore + orphan recovery`.

1. On DND enable, snapshot current filter (`getCurrentInterruptionFilter`) as `priorFilter`.
2. Apply requested in-session filter (typically `INTERRUPTION_FILTER_NONE`).
3. On normal session end (stop/timer end/user toggle off), restore to `priorFilter`.
4. On background transition, **do not auto-restore immediately** if playback remains active; restore when session truly ends.
5. On permission revocation, force local toggle OFF and stop attempting writes.
6. On crash/process death/app kill, restoration is not guaranteed at time of death; on next launch, run orphan check and offer one-tap restore if state appears app-induced.

This policy minimizes user surprise while respecting that dead processes cannot run cleanup code.

### 1) Restore behavior by failure mode

| Scenario | Restore expectation | Recommendation | Confidence |
|---------|---------------------|----------------|------------|
| Session end (normal) | Must restore | Restore immediately to captured `priorFilter` | HIGH |
| Session error (caught) | Should restore | Restore in `finally` path; log success/failure | HIGH |
| App background while playback active | Should not restore yet | Keep DND state until playback session ends | HIGH |
| User force-kills app / process death / crash | Cannot guarantee immediate restore | Detect on next cold start and prompt `Restore previous notification mode` | MEDIUM-HIGH |
| Permission revoked mid-session | Must stop control attempts | Observe policy-access change broadcast, mark toggle unavailable, present fix CTA | HIGH |

**Grounding in official source:**
- Interruption filter is global (`getCurrentInterruptionFilter` docs).
- `ACTION_NOTIFICATION_POLICY_ACCESS_GRANTED_CHANGED` exists for grant/revoke transitions.
- `ACTION_INTERRUPTION_FILTER_CHANGED` exists for external/user changes.

### 2) Safe in-session state machine

**States:**
- `IDLE`
- `REQUESTING_PERMISSION`
- `ACTIVE_OWNED` (app believes it owns current session DND state)
- `ACTIVE_EXTERNAL_CHANGED` (system/user changed filter while session active)
- `RESTORING`
- `UNAVAILABLE` (permission revoked / unsupported)

**Transitions (prescriptive):**
1. `IDLE -> REQUESTING_PERMISSION` on toggle ON when no access.
2. `REQUESTING_PERMISSION -> IDLE` if denied/cancelled.
3. `REQUESTING_PERMISSION -> ACTIVE_OWNED` after grant + successful apply.
4. `IDLE -> ACTIVE_OWNED` on toggle ON when access already granted.
5. `ACTIVE_OWNED -> ACTIVE_EXTERNAL_CHANGED` on `ACTION_INTERRUPTION_FILTER_CHANGED` where current filter != expected.
6. `ACTIVE_OWNED -> RESTORING` on session end/toggle OFF/error.
7. `RESTORING -> IDLE` after restore attempt (even if failed; failed flag retained for UX + telemetry).
8. `ANY -> UNAVAILABLE` on `ACTION_NOTIFICATION_POLICY_ACCESS_GRANTED_CHANGED` false.

**Version caveat:** For apps targeting `Build.VERSION_CODES.VANILLA_ICE_CREAM` and above, Android source states `setInterruptionFilter` generally no longer changes global mode directly and instead activates/deactivates an app-associated `AutomaticZenRule` (with exceptions like companion device managers). Planner must test both target-SDK behavior and legacy-device behavior.

### 3) UX copy and safeguards

**Required UX safeguards:**
- Use explicit label: `Silence notifications during this session`.
- First enable confirmation: `We'll restore your previous notification mode when this session ends.`
- If restore failed/orphan detected next launch: `Quiet mode may still be active from a previous session.` + action `Restore previous mode`.
- If external change detected during session: non-blocking banner `Notification mode changed outside the app.` + action `Re-apply`.
- If permission revoked: `Allow Do Not Disturb access to keep this feature working.` + deep-link to policy settings.

### 4) Telemetry/events for production correctness

Add these events (analytics + debugging):
- `dnd_toggle_requested` (`platform`, `target_state`, `session_id`)
- `dnd_apply_result` (`success`, `error_code`, `filter_applied`, `api_behavior_mode`)
- `dnd_restore_attempted` (`reason`: `session_end|error|manual_off|startup_orphan`)
- `dnd_restore_result` (`success`, `restored_filter`, `current_filter_after`)
- `dnd_external_change_detected` (`expected_filter`, `actual_filter`)
- `dnd_permission_changed` (`granted` boolean)
- `dnd_orphan_detected_on_startup` (`detected`, `user_restored`)

**Validation KPI:** restore success rate >= 99% for graceful session endings; orphan rate tracked separately.

### 5) Platform/version and OEM caveats

**Officially evidenced caveats (HIGH confidence):**
- Settings action may not always resolve (`ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS` comment: matching Activity may not exist).
- Managed profiles cannot grant policy access (Settings source comment).
- Access/broadcast delivery depends on registered receivers and policy access for some broadcasts.

**Field caveats (MEDIUM confidence):**
- OEM ROMs may vary in UI flow timing/wording for policy-access screens and may delay state propagation; design retries and re-checks after return from settings.

**Concrete recommendation:** Always re-read `isNotificationPolicyAccessGranted()` and `getCurrentInterruptionFilter()` after returning from settings and before each apply/restore operation.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@react-native-firebase/app` | 23.8.6 | Native Firebase bootstrap for RN | Required base module for RN Firebase services |
| `@react-native-firebase/analytics` | 23.8.6 | Firebase Analytics event logging on iOS/Android | Expo docs explicitly direct Analytics use to React Native Firebase |
| Android Notification Policy APIs | Android framework APIs | DND policy access + interruption filter control | Official OS mechanism for app-mediated DND behavior |
| `wcag-contrast` | 3.0.0 | Deterministic contrast ratio assertions in tests | Fast automated WCAG AA guardrail for theme tokens/components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `expo-notifications` | SDK 54 bundled | App notification handling, channels, foreground behavior | Use for app-owned notifications and suppression behavior; not system-wide DND toggle |
| `eas-cli` / EAS Submit | current | Upload builds to TestFlight / Play tracks | Final release pipeline for internal testing rollout |
| Xcode Instruments (`xctrace`) | Xcode 26.2 SDK toolchain | Memory profiling (Allocations/Leaks) | 15-minute playback memory slope verification on iOS |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@react-native-firebase/analytics` | Firebase JS SDK `firebase/analytics` | Not suitable in RN/Expo app runtime for this requirement per Expo guidance |
| Android native DND API | Third-party RN wrappers (`react-native-do-not-disturb`) | Old/unmaintained wrappers are thin and often incomplete; direct native module is safer |
| Automated contrast tests | Manual visual-only checks | Manual-only checks miss regressions and are hard to enforce in CI |

**Installation:**
```bash
npx expo install @react-native-firebase/app @react-native-firebase/analytics
npm install wcag-contrast
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── services/
│   ├── AnalyticsService.ts      # Typed event catalog + log wrappers
│   └── DndService.ts            # Platform facade (android/ios behavior split)
├── hooks/
│   ├── useSessionDnd.ts         # In-session toggle orchestration
│   └── useTrackKpiEvents.ts     # Optional convenience wrappers
├── stores/
│   └── uiStore.ts               # dndEnabled, dndCapability, analyticsConsent(optional)
├── constants/
│   └── analyticsEvents.ts       # Canonical KPI event names and params
└── theme/
    └── contrast.spec.ts         # WCAG AA ratio tests for dark theme tokens
```

### Pattern 1: Platform-Gated DND Facade
**What:** Single `DndService` API with divergent native implementations.
**When to use:** Any place UI toggles DND state during playback.
**Example:**
```typescript
// Source: Android Settings + NotificationManager APIs
// ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS, isNotificationPolicyAccessGranted(), setInterruptionFilter()
export async function setSessionDnd(enabled: boolean): Promise<'applied' | 'needs_permission' | 'unsupported'> {
  if (Platform.OS === 'android') {
    const granted = await NativeModules.DndModule.isPolicyAccessGranted();
    if (!granted) {
      await NativeModules.DndModule.openPolicyAccessSettings();
      return 'needs_permission';
    }
    await NativeModules.DndModule.setInterruptionFilter(enabled ? 'none' : 'all');
    return 'applied';
  }

  // iOS fallback: no public API to force Focus/DND globally.
  // Keep UX honest: explain limitation and provide app-level quiet behavior.
  return 'unsupported';
}
```

### Pattern 2: Typed Analytics Gateway
**What:** Central analytics wrapper with strict event names + param schema.
**When to use:** All KPI events in ANLX-01.
**Example:**
```typescript
// Source: https://rnfirebase.io/analytics/usage
import analytics from '@react-native-firebase/analytics';

type KpiEvent =
  | 'sound_played'
  | 'favorite_saved'
  | 'loop_enabled'
  | 'timer_set'
  | 'paywall_viewed'
  | 'subscription_purchased';

export async function track(event: KpiEvent, params: Record<string, string | number | boolean>) {
  await analytics().logEvent(event, params);
}
```

### Pattern 3: Contrast as CI Gate
**What:** Enforce WCAG 1.4.3 thresholds in tests for all dark-mode interactive text tokens.
**When to use:** Theme token updates, component library changes.
**Example:**
```typescript
// Source: WCAG 2.1 SC 1.4.3 (4.5:1 threshold)
import { hex } from 'wcag-contrast';

it('button text contrast in dark mode is AA', () => {
  expect(hex('#F5F7FA', '#121417')).toBeGreaterThanOrEqual(4.5);
});
```

### Pattern 4: iOS Quiet Session Controller
**What:** Dedicated controller for iOS partial interruption suppression using `AVAudioSession` public API.
**When to use:** Toggle ON during active playback only.
**Example:**
```swift
// Source: AVAudioSession.h (iOS 14.5+)
import AVFAudio

func setQuietSession(_ enabled: Bool) throws {
  let session = AVAudioSession.sharedInstance()
  _ = try session.setPrefersNoInterruptionsFromSystemAlerts(enabled)
}
```

### Pattern 5: Android DND Session Ownership
**What:** State machine with `priorFilter` snapshot, ownership flag, and startup orphan recovery.
**When to use:** Every Android DND toggle path.
**Example:**
```typescript
// Source: NotificationManager#getCurrentInterruptionFilter, setInterruptionFilter,
// ACTION_INTERRUPTION_FILTER_CHANGED, ACTION_NOTIFICATION_POLICY_ACCESS_GRANTED_CHANGED
type DndState = 'IDLE' | 'ACTIVE_OWNED' | 'RESTORING' | 'UNAVAILABLE';

async function enableSessionDnd() {
  priorFilter = await dnd.getCurrentInterruptionFilter();
  await dnd.setInterruptionFilter('none');
  state = 'ACTIVE_OWNED';
}

async function restoreSessionDnd(reason: 'session_end' | 'error' | 'manual_off') {
  state = 'RESTORING';
  if (priorFilter != null) await dnd.setInterruptionFilter(priorFilter);
  state = 'IDLE';
}
```

### Anti-Patterns to Avoid
- **Cross-platform parity assumption for DND:** Android and iOS capability differs; do not ship a fake "enabled" state on iOS.
- **Direct `analytics().logEvent()` calls in screens/components:** causes schema drift and inconsistent naming.
- **Manual-only accessibility signoff:** misses regressions after token changes.
- **Store submission as a final-day task:** hides provisioning and metadata blockers until too late.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Analytics transport and event queueing | Custom HTTP analytics endpoint for MVP KPIs | Firebase Analytics SDK (`@react-native-firebase/analytics`) | Handles batching, retries, attribution, debug tooling, and dashboard integration |
| DND settings UX routing on Android | Custom deep-link guessing for settings intents | Official `ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS` flow | Correct OS-supported entry point for user grant |
| Contrast validation process | Spreadsheet/manual eyeballing only | Automated `wcag-contrast` tests + manual spot audit | Deterministic gate + human sanity check |
| Store binary uploads | Manual ad hoc uploads each time | EAS Submit profiles | Repeatable CI-friendly release path |

**Key insight:** The biggest failure risk in this phase is false assumptions about platform capability (especially DND), not implementation complexity.

## Common Pitfalls

### Pitfall 1: Wrong Firebase SDK for Analytics in Expo/RN
**What goes wrong:** KPI events never appear correctly or integration is web-biased.
**Why it happens:** Reusing Firebase JS SDK assumptions from Auth/Firestore.
**How to avoid:** Use RN Firebase modules for Analytics in native RN runtime.
**Warning signs:** `logEvent` code exists but DebugView remains empty on device.

### Pitfall 2: Android DND Toggle Without Policy Access Grant
**What goes wrong:** Toggle appears to work but no system behavior change.
**Why it happens:** Not checking/granting notification policy access before applying filters.
**How to avoid:** Gate toggle with `isNotificationPolicyAccessGranted` and route to settings intent.
**Warning signs:** Toggle state changes in UI but notifications continue normally.

### Pitfall 3: iOS DND Promise Mismatch
**What goes wrong:** Product claims "DND enabled" on iOS without real system suppression.
**Why it happens:** Assuming Android-like APIs exist on iOS.
**How to avoid:** Explicit capability model (`supported`, `unsupported`, `needs_user_action`) and transparent UX copy.
**Warning signs:** No iOS API call exists beyond reading Focus status/notification interruption metadata.

### Pitfall 4: Analytics Event Taxonomy Drift
**What goes wrong:** Duplicate event names (`sound_play`, `play_sound`, `soundPlayed`) fragment reporting.
**Why it happens:** Event names defined inline by multiple contributors.
**How to avoid:** Single event map + lint rule/tests around allowed names.
**Warning signs:** Similar events appearing separately in Analytics console.

### Pitfall 5: Memory Stability Checked Only in Simulator
**What goes wrong:** Memory growth issues missed until beta testers report crashes.
**Why it happens:** Simulator behavior differs from real-device audio/video pipelines.
**How to avoid:** Profile real iPhone with Instruments Allocations/Leaks during 15-minute playback.
**Warning signs:** Rising allocation footprint without returning to baseline after stop/unload.

### Pitfall 6: iOS Quiet Session Misrepresented as Global DND
**What goes wrong:** UX claims "DND ON" while iOS still shows third-party notifications.
**Why it happens:** Conflating partial audio-session interruption preference with OS-wide Focus control.
**How to avoid:** Rename iOS control to `Quiet Session`; document behavior in-product and QA scripts.
**Warning signs:** Support tickets saying "DND switch does nothing on iPhone".

### Pitfall 7: Android Orphaned DND After Abnormal Termination
**What goes wrong:** App crashes/gets killed while DND is active and user remains in unexpected notification mode.
**Why it happens:** Process death prevents cleanup code from running.
**How to avoid:** Startup orphan check + explicit `Restore previous mode` action + telemetry.
**Warning signs:** Next-launch mismatch between persisted session ownership flag and current filter.

## Code Examples

Verified patterns from official and SDK sources:

### Android DND Permission Entry Point
```java
// Source: android.provider.Settings ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS
Intent intent = new Intent(android.provider.Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS);
startActivity(intent);
```

### Android DND Filter Application
```java
// Source: NotificationManager#setInterruptionFilter, requires policy access
NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
if (nm.isNotificationPolicyAccessGranted()) {
  nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_NONE);
}
```

### Android Restore + Broadcast Hooks
```java
// Source: NotificationManager constants
IntentFilter filter = new IntentFilter();
filter.addAction(NotificationManager.ACTION_INTERRUPTION_FILTER_CHANGED);
filter.addAction(NotificationManager.ACTION_NOTIFICATION_POLICY_ACCESS_GRANTED_CHANGED);

int current = nm.getCurrentInterruptionFilter(); // snapshot or verify
// ... later on session end:
nm.setInterruptionFilter(previousFilter);
```

### RN Firebase Analytics Event Logging
```typescript
// Source: https://rnfirebase.io/analytics/usage
import analytics from '@react-native-firebase/analytics';

await analytics().logEvent('sound_played', {
  sound_id: 'rain_01',
  category: 'rain',
});
```

### Firebase DebugView Device Validation
```bash
# Source: https://firebase.google.com/docs/analytics/debugview
adb shell setprop debug.firebase.analytics.app com.yourcompany.yourapp
```

### iOS Quiet Session Preference
```swift
// Source: AVAudioSession.h (setPrefersNoInterruptionsFromSystemAlerts)
import AVFAudio

let session = AVAudioSession.sharedInstance()
_ = try session.setPrefersNoInterruptionsFromSystemAlerts(true)
```

### iOS Focus Status (Read-Only)
```swift
// Source: Intents/INFocusStatusCenter.h
import Intents

INFocusStatusCenter.default.requestAuthorization { status in
  let focused = INFocusStatusCenter.default.focusStatus.isFocused
  // Use for UI messaging only; no API exists here to toggle Focus mode.
}
```

### Open iOS App Notification Settings
```swift
// Source: UIKit/UIApplication.h
import UIKit

if let url = URL(string: UIApplication.openNotificationSettingsURLString) {
  UIApplication.shared.open(url)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `expo-av` as default audio module | `expo-audio` as preferred module; `expo-av` Audio marked deprecated in Expo docs | Expo SDK 54 docs | Future work should avoid new `expo-av` coupling unless migration risk outweighs benefit |
| Firebase JS SDK assumed sufficient for all Firebase services in Expo | Expo guidance: use React Native Firebase for Analytics/Crashlytics/Dynamic Links | Expo docs updated Oct 2025 | ANLX-01 should not be implemented with web analytics SDK in RN runtime |
| Manual store uploads as default | EAS Submit standardized for TestFlight/Play tracks | EAS docs (2025-2026) | Faster, repeatable release pipeline and CI compatibility |

**Deprecated/outdated:**
- `expo-av` Audio for net-new work: documented deprecated in current Expo docs in favor of `expo-audio`.
- Assumption that iOS app can directly toggle global Focus/DND like Android: unsupported in inspected public SDK surface (read Focus status APIs only).

## Open Questions

1. **Analytics consent policy for this release?**
   - What we know: ANLX-01 requires KPI tracking; no explicit consent rule in current planning docs.
   - What's unclear: Region-specific consent gating requirement (GDPR/ATT policy stance).
   - Recommendation: Add a planner decision node for consent gating before shipping beta.

2. **Target SDK behavior cutover testing for Android `setInterruptionFilter`**
   - What we know: Android source states target `VANILLA_ICE_CREAM+` uses app-associated `AutomaticZenRule` semantics for most apps.
   - What's unclear: Exact device matrix impact in this project's targetSdk/build config and OEM variants.
   - Recommendation: Add a verification task to test at least one modern Android and one legacy behavior path.

## Sources

### Primary (HIGH confidence)
- https://docs.expo.dev/guides/using-firebase/ - Expo official guidance on JS SDK vs React Native Firebase; Analytics caveat
- https://rnfirebase.io/analytics/usage - RN Firebase Analytics setup/usage and DebugView notes
- https://firebase.google.com/docs/analytics/events - Firebase event logging model (updated 2026-02-18)
- https://firebase.google.com/docs/analytics/debugview - Firebase DebugView verification commands (updated 2026-02-18)
- Android AOSP source (`android.provider.Settings`, `android.app.NotificationManager`, `core/res/AndroidManifest.xml`) inspected via:
  - https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/java/android/provider/Settings.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/java/android/app/NotificationManager.java
  - https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/res/AndroidManifest.xml
  - (Key areas used) `ACTION_NOTIFICATION_POLICY_ACCESS_GRANTED_CHANGED`, `ACTION_INTERRUPTION_FILTER_CHANGED`, `getCurrentInterruptionFilter`, `setInterruptionFilter` Javadocs and target-SDK caveat comments
- iOS SDK headers (local Xcode SDK inspection):
  - `UserNotifications.framework/Headers/UNUserNotificationCenter.h`
  - `UserNotifications.framework/Headers/UNNotificationContent.h`
  - `UserNotifications.framework/Headers/UNNotificationSound.h`
  - `Intents.framework/Headers/INFocusStatusCenter.h`
  - `Intents.framework/Headers/INFocusStatus.h`
  - `AVFAudio.framework/Headers/AVAudioSession.h`
  - `UIKit.framework/Headers/UIApplication.h`
- https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html - WCAG AA contrast threshold details (updated 2025-10-31)
- https://developer.apple.com/app-store/review/guidelines/ - App Review rules for public APIs and system behavior (2.4.4, 2.5.1, 2.5.4, 2.5.9)
- https://developer.apple.com/testflight/ - TestFlight tester limits and flow
- https://support.google.com/googleplay/android-developer/answer/9845334 - Play internal/open/closed testing behavior
- https://docs.expo.dev/submit/introduction/ - EAS Submit behavior and constraints
- https://docs.expo.dev/submit/ios/ - iOS submission prerequisites
- https://docs.expo.dev/submit/android/ - Android submission prerequisites

### Secondary (MEDIUM confidence)
- `xcrun xctrace list instruments` output from local Xcode toolchain confirms availability of Allocations/Leaks templates for iOS memory profiling.

### Tertiary (LOW confidence)
- https://github.com/eTryp/react-native-do-not-disturb - Example community wrapper demonstrating Android settings intent flow and incomplete iOS implementation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Expo/Firebase official docs and npm versions verified.
- Architecture: HIGH (Android) / MEDIUM-HIGH (iOS) - Android restore policy and state machine now grounded in NotificationManager official source; iOS remains constrained by API-surface inference.
- Pitfalls: MEDIUM-HIGH - Policy risks now grounded in explicit App Review clauses and Android broadcast/filter lifecycle constraints.

**Research date:** 2026-02-20
**Valid until:** 2026-03-06 (14 days; this phase depends on fast-moving SDK/store-policy details)
