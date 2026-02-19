# Phase 6: Freemium and Monetization - Research

**Researched:** 2026-02-19
**Domain:** RevenueCat in-app subscriptions, Supabase RLS premium gating, premium entitlement propagation
**Confidence:** HIGH (RevenueCat SDK APIs verified against official docs; Supabase RLS patterns verified against official Supabase docs; integration patterns verified across multiple sources)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Lock indicators
- Card style and lock badge design: Claude's discretion — pick what looks clean and modern for a calm ambient app
- Lock label (icon vs icon + text): Claude's discretion
- Tapping a locked sound card immediately opens the paywall — no preview clip, no teaser
- Free users cannot favorite a premium sound — tapping the favorite button on a premium sound opens the paywall instead

#### Paywall screen
- Use RevenueCat's native paywall (not a custom-built screen)
- Visual template: RevenueCat default template — fast to implement, no custom design needed
- Paywall is blocked during fullscreen immersive mode (as per ROADMAP); behavior during regular player playback: Claude's discretion (least disruptive rule)
- Benefits to highlight on the paywall: Unlock all premium sounds, Infinity mode (no time limit), Custom timer duration

#### Purchase feedback
- After successful purchase: paywall dismisses and sounds unlock instantly — no celebration screen or animation
- All three unlocks happen immediately on purchase with no app restart: premium sounds playable, Infinity mode enabled, custom timer duration available
- Purchase failure or cancellation: show a brief error message ("Purchase didn't complete. Try again.") then dismiss
- Restore purchases is accessible from both the paywall screen and the Settings screen

#### Subscription model
- Plans: Monthly + Annual (both configured and managed via RevenueCat)
- No free trial — direct purchase only
- Proactive paywall entry points (beyond tapping a locked sound): library header/banner, Favorites screen nudge, Settings screen
- Premium status indicator: none — once subscribed, sounds just work; no badge or "Premium Member" label needed

### Claude's Discretion

- Lock indicator visual design (card style, badge position, icon choice)
- Lock label: icon-only vs icon + "Premium" text
- Whether paywall is blocked during regular player screen (apply "no interruption during active playback" rule or restrict only to fullscreen immersive mode)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUDIO-05 | [PREMIUM] User can activate Infinity mode — audio plays with no time limit, looping forever | Timer gating: read `isPremium` from RevenueCat entitlement check via `Purchases.getCustomerInfo()`; store in Zustand `authStore`; audio timer simply does not start if `isInfinityMode` is true and user is premium |
| AUDIO-06 | [PREMIUM] User can set a custom timer duration of their choosing | Same entitlement gate as AUDIO-05 — custom timer UI and custom duration input are hidden/disabled behind `isPremium`; when enabled, user picks any duration |
| LIB-04 | Premium sounds are visible in the library but locked with a visual premium indicator | `isPremium` field already in sounds catalog (`config/sounds.ts`); lock overlay rendered on SoundCard when `sound.isPremium && !userIsPremium`; tapping opens paywall |
| AUTH-04 | User sees a premium paywall screen built with RevenueCat, enabling in-app subscription purchase to unlock premium features | `RevenueCatUI.presentPaywall()` from `react-native-purchases-ui`; PAYWALL_RESULT enum handles PURCHASED/RESTORED/CANCELLED; entitlement ID `"premium"` checked via `Purchases.getCustomerInfo()`; Supabase RLS gates sound URLs server-side |
</phase_requirements>

---

## Summary

Phase 6 implements the freemium paywall using three interacting layers: (1) **RevenueCat SDK** for payment processing and entitlement management, (2) **Supabase RLS** for server-side enforcement that premium audio URLs are never returned to non-premium users, and (3) **client-side gating** in the UI (lock badges, paywall routing, Infinity mode and custom timer controls).

The RevenueCat layer is the industry-standard solution for React Native IAP. Two packages are required: `react-native-purchases` (core SDK — configure, identify user, check entitlements) and `react-native-purchases-ui` (paywall display — `RevenueCatUI.presentPaywall()`). Both packages are already in the project's tech stack from the STACK.md research. RevenueCat runs in Preview API Mode inside Expo Go, but real purchases require an EAS Development Build — the project already uses Development Builds from Phase 1. The latest version confirmed is **9.10.1** (released February 18, 2026).

The Supabase layer uses Row Level Security to enforce server-side premium gating. The strategy is: a `sounds` table in Supabase stores premium sound URLs; an RLS policy restricts the `url` column (or entire premium-sound rows) to users where `(auth.jwt() -> 'app_metadata' ->> 'is_premium')::boolean = true`. The `app_metadata` field is server-controlled only (users cannot modify it via the client), making it safe for authorization decisions. A Supabase Edge Function receives RevenueCat webhooks (`INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`) and updates the user's `app_metadata.is_premium` flag using the service role key. This is the correct server-authoritative architecture: no premium URL ever reaches an unauthorized client.

The client-side layer is straightforward: `isPremium` state in Zustand `authStore`, updated by calling `Purchases.getCustomerInfo()` at app startup and listening to `Purchases.addCustomerInfoUpdateListener`. The premium flag drives lock badge visibility, paywall routing, and Infinity mode / custom timer availability. Premium state updates are immediate — no app restart required — because `addCustomerInfoUpdateListener` fires synchronously after purchase completion.

**Primary recommendation:** Initialize RevenueCat in the root layout with `Purchases.configure()` and call `Purchases.logIn(user.id)` when Supabase auth state changes. Store `isPremium` in Zustand. Gate sound URLs server-side via Supabase RLS + `app_metadata`. Present the paywall with `RevenueCatUI.presentPaywall()` — never hand-roll a paywall screen.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-purchases | 9.10.1 (already in project per STACK.md) | Core RevenueCat SDK — `Purchases.configure()`, `Purchases.logIn()`, `Purchases.getCustomerInfo()`, `addCustomerInfoUpdateListener` | Industry standard for React Native IAP; handles receipt validation, subscription lifecycle, entitlement checks; already approved in STACK.md |
| react-native-purchases-ui | 9.10.1 (companion to purchases) | RevenueCat native paywall — `RevenueCatUI.presentPaywall()`, `RevenueCatUI.presentPaywallIfNeeded()` | Required separate package for paywall UI; same release cadence as `react-native-purchases` |
| @supabase/supabase-js | ~2.x (already installed from Phase 5) | Supabase client — used in FavoritesService (Phase 5); extended in Phase 6 for premium gating via RLS | Already installed; supabase client initialized with AsyncStorage in Phase 5 |
| zustand | ^5.x (already installed) | `authStore` — stores `isPremium: boolean` flag; updated after RevenueCat entitlement check | Already installed; authStore exists from Phase 1 scaffold |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-dev-client | ~5.x (already in project) | Required for real purchase testing — RevenueCat runs in Preview API Mode in Expo Go | Development builds already required from Phase 1; no new install needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-native-purchases-ui (RevenueCat native paywall) | Custom-built paywall screen | Locked decision: use RevenueCat default template. Custom paywall requires design work and ties you to manual updates when store policies change. RevenueCat native paywall is remotely configurable. |
| Supabase RLS on `sounds` table | Custom server endpoint / Supabase Edge Function to serve URLs | RLS is enforced at the database level on every query — zero bypass possible. Custom endpoint is additional infrastructure. RLS is simpler and more reliable. |
| `app_metadata` for isPremium | Separate `profiles` table with `is_premium` column | `app_metadata` is not user-modifiable; Supabase Auth manages it. A separate `profiles` table is also valid but requires an additional query on every RLS evaluation. `app_metadata` is accessible directly in `auth.jwt()` with no extra join. |

**Installation:**
```bash
# Both packages installed together (same version required)
npx expo install react-native-purchases react-native-purchases-ui

# After install, must rebuild the development build (native module)
eas build --platform ios --profile development
eas build --platform android --profile development
```

---

## Architecture Patterns

### Recommended Project Structure

Phase 6 additions to the existing structure from Phases 1–5:

```
src/
├── context/
│   └── AuthContext.tsx          # MODIFIED — call Purchases.logIn/logOut on auth change
├── stores/
│   └── authStore.ts             # MODIFIED — add isPremium: boolean field
├── services/
│   └── PremiumService.ts        # NEW — RevenueCat entitlement check; getCustomerInfo()
├── hooks/
│   └── usePremiumStatus.ts      # NEW — initializes isPremium in authStore; listens for updates
├── components/
│   └── PremiumGate.tsx          # NEW — wrapper: children or lock overlay based on isPremium
└── config/
    └── sounds.ts                # MODIFIED — ensure isPremium: boolean field on each sound

app/
├── _layout.tsx                  # MODIFIED — RevenueCat configure() at startup; usePremiumStatus
└── (tabs)/
    ├── library.tsx              # MODIFIED — LockBadge on premium cards; paywall routing
    └── settings.tsx             # MODIFIED — Restore Purchases row; paywall entry point

supabase/
├── functions/
│   └── revenuecat-webhook/      # NEW — Edge Function: receives RC webhooks, updates app_metadata
└── migrations/
    └── [timestamp]_sounds_rls.sql  # NEW — RLS policy restricting premium sound URLs
```

### Pattern 1: RevenueCat SDK Initialization

Initialize once at app startup in the root layout. Configure before any entitlement check runs. Pass the Supabase user ID when the user is authenticated so RevenueCat and Supabase reference the same identity.

**The `app_user_id` passed to `Purchases.logIn()` MUST match the Supabase `user.id`** — this is the critical link that allows RevenueCat webhooks to identify which Supabase user to update.

```typescript
// Source: https://www.revenuecat.com/docs/getting-started/configuring-sdk
// Source: https://www.revenuecat.com/docs/customers/identifying-customers
// app/_layout.tsx (inside RootLayoutInner, after AuthProvider)
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

// In root layout useEffect — runs once at app startup
useEffect(() => {
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  // Configure with platform-specific API key
  // CRITICAL: Configure BEFORE calling logIn or getCustomerInfo
  if (Platform.OS === 'ios') {
    Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_RC_APPLE_API_KEY! });
  } else if (Platform.OS === 'android') {
    Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_RC_GOOGLE_API_KEY! });
  }
}, []); // Only once at startup
```

### Pattern 2: Linking RevenueCat Identity to Supabase User

Call `Purchases.logIn(user.id)` when Supabase auth state changes to an authenticated user. Call `Purchases.logOut()` on sign out. This ensures RevenueCat's customer record matches the Supabase user, which the webhook handler uses to update `app_metadata`.

```typescript
// Source: https://www.revenuecat.com/docs/customers/identifying-customers
// In AuthContext.tsx or a usePremiumStatus hook, react to auth state changes:
import Purchases from 'react-native-purchases';

// On sign in (in AuthContext or usePremiumStatus hook):
if (user) {
  // user.id is the Supabase UUID — use it as the RevenueCat app_user_id
  const { customerInfo } = await Purchases.logIn(user.id);
  const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
  // Update authStore.isPremium with this value
}

// On sign out:
await Purchases.logOut();
// authStore.isPremium = false
```

### Pattern 3: Checking Entitlement Status

The entitlement identifier `"premium"` is configured in the RevenueCat dashboard. After `logIn()`, check `customerInfo.entitlements.active`:

```typescript
// Source: https://www.revenuecat.com/docs/customers/customer-info
import Purchases from 'react-native-purchases';

// Point-in-time check (safe to call repeatedly — SDK caches):
try {
  const customerInfo = await Purchases.getCustomerInfo();
  const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
  // Update authStore.isPremium = isPremium
} catch (e) {
  // Network failure — keep existing isPremium state (don't downgrade on error)
  console.warn('RevenueCat getCustomerInfo failed:', e);
}

// Real-time listener (fires immediately after purchase):
Purchases.addCustomerInfoUpdateListener((info) => {
  const isPremium = typeof info.entitlements.active['premium'] !== 'undefined';
  useAuthStore.getState().setIsPremium(isPremium);
});
```

**Key: use `addCustomerInfoUpdateListener` for immediate post-purchase unlock** — this fires before `presentPaywall()` resolves, so the user sees unlocked content when the paywall dismisses.

### Pattern 4: Presenting the RevenueCat Native Paywall

```typescript
// Source: https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls
// Source: GitHub — react-native-purchases-ui/src/index.tsx
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

// Minimal call — uses the "current" offering configured in RevenueCat dashboard:
async function openPaywall(): Promise<void> {
  // Do not call if user is in fullscreen immersive mode (locked decision)
  // Apply "no interruption during active playback" for regular player screen (Claude's discretion)

  const result: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

  switch (result) {
    case PAYWALL_RESULT.PURCHASED:
    case PAYWALL_RESULT.RESTORED:
      // addCustomerInfoUpdateListener already fired and updated authStore
      // No celebration screen needed (locked decision — sounds just unlock)
      break;
    case PAYWALL_RESULT.CANCELLED:
      // No action needed — user dismissed paywall voluntarily
      break;
    case PAYWALL_RESULT.ERROR:
      // Show brief error message per locked decision:
      // "Purchase didn't complete. Try again."
      // Then dismiss (do not leave paywall open on error)
      break;
    case PAYWALL_RESULT.NOT_PRESENTED:
      // Offering not configured in RevenueCat dashboard — dev/config issue
      console.warn('RevenueCat: no offering configured, paywall not shown');
      break;
  }
}
```

**`presentPaywallIfNeeded` alternative:** Can pass `requiredEntitlementIdentifier: 'premium'` to auto-skip paywall for existing subscribers. Use this for proactive entry points (library banner, Favorites nudge) where it's possible the user already subscribed from another entry point.

### Pattern 5: Supabase RLS — Server-Side Premium Gating

**This is the critical security layer.** Premium sound URLs must never be returned by Supabase to non-premium users, regardless of what the client sends.

Two implementation options:

**Option A: RLS on sounds table (simpler, recommended)**

The `sounds` table has a `url` column for the audio file URL. Premium sounds have a non-null `url`; free sounds also have `url`. The RLS policy restricts SELECT on the `url` column (or the row) for premium sounds:

```sql
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security
-- Source: https://supabase.com/docs/guides/auth/oauth-server/token-security

-- Enable RLS on sounds table
ALTER TABLE sounds ENABLE ROW LEVEL SECURITY;

-- Free sounds: accessible to all authenticated + anonymous users
CREATE POLICY "free_sounds_readable_by_all"
ON sounds FOR SELECT
USING (is_premium = false);

-- Premium sounds: only users with is_premium = true in app_metadata
CREATE POLICY "premium_sounds_readable_by_premium_users"
ON sounds FOR SELECT
USING (
  is_premium = false
  OR (
    auth.jwt() IS NOT NULL
    AND (auth.jwt() -> 'app_metadata' ->> 'is_premium')::boolean = true
  )
);
```

**Option B: Separate `premium_sounds` table (stronger isolation)**

Premium URLs live in a separate table entirely. Non-premium users cannot query it at all. This is architecturally cleaner but requires more migration work and more complex sound catalog logic.

**Recommendation: Option A** — matches the existing `sounds` catalog pattern from Phase 2, minimal migration, and RLS provides the same security guarantees as a separate table.

**CRITICAL: `app_metadata` is safe for authorization; `user_metadata` is NOT.** From official Supabase docs: `raw_app_meta_data` cannot be updated by the user, making it safe for authorization decisions. `raw_user_meta_data` can be modified by authenticated users via `supabase.auth.update()` — never use it for security-sensitive claims.

### Pattern 6: Supabase Edge Function for RevenueCat Webhooks

RevenueCat sends webhooks for subscription lifecycle events. A Supabase Edge Function receives these and updates `app_metadata.is_premium` on the matching user using the service role key.

```typescript
// supabase/functions/revenuecat-webhook/index.ts
// Source: https://www.revenuecat.com/docs/integrations/webhooks
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Service role bypasses RLS
);

Deno.serve(async (req) => {
  // Verify RevenueCat authorization header
  const authHeader = req.headers.get('Authorization');
  const expectedSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const event = await req.json();
  const supabaseUserId = event.app_user_id; // Set to Supabase user.id via Purchases.logIn()
  const eventType = event.type; // 'INITIAL_PURCHASE', 'RENEWAL', 'CANCELLATION', etc.

  // Determine premium status from event type
  const isPremium = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION'].includes(eventType);
  // Note: on CANCELLATION, is_premium stays true until period ends (RevenueCat handles entitlement)
  // Better: call RevenueCat REST API to get current entitlement state (recommended by RevenueCat)

  // Update Supabase user app_metadata
  const { error } = await supabaseAdmin.auth.admin.updateUserById(supabaseUserId, {
    app_metadata: { is_premium: isPremium },
  });

  if (error) {
    console.error('Failed to update user app_metadata:', error);
    return new Response('Error', { status: 500 });
  }

  // Must return 200 — RevenueCat retries on any other status
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**RevenueCat webhook event types to handle:**
- `INITIAL_PURCHASE` → set `is_premium: true`
- `RENEWAL` → set `is_premium: true`
- `UNCANCELLATION` → set `is_premium: true` (user reversed a cancellation)
- `CANCELLATION` → **do NOT immediately revoke** — subscription remains active until period end; RevenueCat will stop sending `RENEWAL` events when it actually expires; alternatively, always call the RevenueCat REST API to get the current entitlement state
- `EXPIRATION` → set `is_premium: false` (subscription actually ended)
- `BILLING_ISSUE` → optionally set `is_premium: false` depending on grace period policy

**RevenueCat's recommendation:** On any webhook, call the `GET /subscribers/{app_user_id}` REST endpoint to get the authoritative current state, rather than inferring from event type. This handles edge cases (grace periods, billing retry, mid-period cancellation). For a simple implementation, handling `INITIAL_PURCHASE` → true and `EXPIRATION` → false is sufficient.

### Pattern 7: Paywall Gate — Blocking Logic

The paywall must NOT appear during fullscreen immersive mode (locked decision). During regular player playback, apply the "least disruptive" rule (Claude's discretion).

**Recommendation for Claude's Discretion — paywall during regular player screen:** Do NOT interrupt active playback. If audio is playing (check `audioStore.isPlaying`), do not present the paywall immediately. Instead, show a brief toast or banner: "Subscribe to unlock premium sounds" with a dismiss option. When the user explicitly taps the banner, then present the paywall. This preserves the calm experience without blocking paywall discovery.

```typescript
// Gating logic before calling openPaywall():
import { useAudioStore } from '@/src/stores/audioStore';
import { useUIStore } from '@/src/stores/uiStore';

function shouldBlockPaywall(): boolean {
  const isFullscreen = useUIStore.getState().isFullscreenMode;
  // Locked: block during fullscreen immersive mode
  if (isFullscreen) return true;
  // Claude's discretion: do not interrupt active playback during regular player
  // Instead, show non-blocking banner (separate implementation)
  return false;
}
```

### Pattern 8: Lock Badge Component

```typescript
// src/components/LockBadge.tsx
// Claude's discretion: clean, modern lock indicator for calm ambient app
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Already installed via Expo

// Lock badge: small icon + "Premium" text overlaid on sound card corner
// Design: subtle frosted glass effect, top-right corner, no border
export function LockBadge() {
  return (
    <View style={styles.badge}>
      <Ionicons name="lock-closed" size={10} color="rgba(255,255,255,0.9)" />
      <Text style={styles.label}>Premium</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  label: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
```

**Lock indicator recommendation (Claude's discretion):** Icon + "Premium" text (not icon-only). At small card sizes, an icon-only lock can be confused with other status indicators. The word "Premium" communicates the action required. Use a subtle, non-distracting style consistent with the calm aesthetic.

### Pattern 9: PremiumGate Component

```typescript
// src/components/PremiumGate.tsx
// Wrapper: renders children if premium, lock overlay if not premium
import { Pressable } from 'react-native';
import { useAuthStore } from '@/src/stores/authStore';

interface PremiumGateProps {
  children: React.ReactNode;
  onLockedPress?: () => void; // Called when non-premium user taps
  showLockBadge?: boolean;
}

export function PremiumGate({ children, onLockedPress, showLockBadge = true }: PremiumGateProps) {
  const isPremium = useAuthStore((s) => s.isPremium);

  if (isPremium) {
    // Premium user — render normally with no lock UI
    return <>{children}</>;
  }

  // Non-premium — wrap in pressable that opens paywall, add lock badge
  return (
    <Pressable onPress={onLockedPress} style={{ position: 'relative' }}>
      {children}
      {showLockBadge && <LockBadge />}
    </Pressable>
  );
}
```

### Pattern 10: Infinity Mode and Custom Timer Gating (AUDIO-05, AUDIO-06)

Both are client-side UI gates reading from `authStore.isPremium`. The audio engine itself does not need modification — Infinity mode is simply "no timer started" and custom timer is the user-chosen duration.

```typescript
// In the timer selection UI:
const isPremium = useAuthStore((s) => s.isPremium);

// Infinity mode toggle:
// - If isPremium: toggle works normally → sets audioStore.timerMode = 'infinity'
// - If !isPremium: toggle press opens paywall → no state change

// Custom timer duration:
// - If isPremium: custom duration input is visible and editable
// - If !isPremium: custom duration input is hidden or grayed with "Premium" label
//   Tapping the grayed area opens paywall
```

### Anti-Patterns to Avoid

- **Client-side-only premium gating:** Never rely on `if (isPremium)` in the React Native client as the only gate for premium audio URLs. If Supabase returns the URL, a network-inspecting user can access it. RLS is mandatory, not optional.
- **Using `user_metadata` for `isPremium` in RLS:** `user_metadata` is user-modifiable — an authenticated user could set their own `is_premium: true`. Always use `app_metadata`, which only Supabase service role can write.
- **Presenting paywall during fullscreen immersive mode:** Locked decision — block the paywall in `isFullscreenMode` state.
- **Calling `Purchases.configure()` more than once:** Like Firebase `initializeApp`, this throws if called twice. Guard with a flag or call only in a `useEffect` with `[]` deps.
- **Not calling `Purchases.logIn(user.id)` after Supabase sign-in:** Without `logIn`, RevenueCat assigns an anonymous ID. The webhook handler won't know which Supabase user to update, breaking the server-side premium flag.
- **Assuming purchase completes synchronously after `presentPaywall()` resolves:** The `addCustomerInfoUpdateListener` fires during the paywall flow. The Zustand `isPremium` flag updates via the listener before `PAYWALL_RESULT.PURCHASED` is returned. Both paths should update the UI.
- **Not handling `PAYWALL_RESULT.ERROR` separately from `CANCELLED`:** Locked decision: show "Purchase didn't complete. Try again." on ERROR. On CANCELLED, no message. These are distinct user experiences.
- **JWT staleness after `app_metadata` update:** After the webhook updates `is_premium` in `app_metadata`, the change is NOT reflected in existing JWT tokens until the user's session refreshes. For immediate unlock (locked decision: unlock without app restart), the client should rely on `getCustomerInfo()` / `addCustomerInfoUpdateListener` for real-time UI updates, not on Supabase JWT claims. The RLS policy refresh happens on the next Supabase request after the session token naturally refreshes (typically within 1 hour for Supabase). This is acceptable — the secure gating is the RLS rule, not the JWT check.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Subscription paywall UI | Custom screen with price display, subscribe button, legal copy | `RevenueCatUI.presentPaywall()` | Locked decision; store policies change, pricing changes, trial logic — RevenueCat dashboard handles all of these without code deploys |
| Receipt validation | Server-side StoreKit/Google Play receipt verification | RevenueCat backend | Receipt validation is complex, version-specific, and has edge cases (jailbreak bypass, receipt replay). RevenueCat handles this on their servers. |
| Subscription state management | Polling getCustomerInfo on a timer | `Purchases.addCustomerInfoUpdateListener` | RevenueCat SDK fires this on purchase, restore, and entitlement changes — no polling needed |
| Premium URL protection | `if (isPremium)` check before loading audio URL | Supabase RLS on sounds table | Client-side booleans are bypassable via Flipper, frida, or network inspection. RLS runs inside the database — no client can bypass it. |
| Webhook endpoint | Custom web server for RevenueCat webhooks | Supabase Edge Function | Edge Functions are co-located with Supabase, have access to service role key via env vars, and deploy with `supabase functions deploy` — no separate server needed |

**Key insight:** The hardest parts of freemium — receipt validation, subscription state edge cases (grace period, billing retry, mid-cycle cancellation), and server-side enforcement — are all delegated to RevenueCat and Supabase respectively. The React Native app's job is to wire these together correctly.

---

## Common Pitfalls

### Pitfall 1: RevenueCat Not Configured Before First Entitlement Check

**What goes wrong:** `Purchases.getCustomerInfo()` or `Purchases.logIn()` throws "RevenueCat not configured" if called before `Purchases.configure()`.

**Why it happens:** `configure()` must run before any other RevenueCat call. If the root layout has multiple async operations, the order is not guaranteed.

**How to avoid:** Call `Purchases.configure()` synchronously in a `useEffect(() => {...}, [])` in the root layout — before any auth state listener runs. Use `Platform.OS` for platform-specific API keys. The configure call is synchronous and fast.

**Warning signs:** Runtime error "Purchases has not been configured." on first app open or after reinstall.

### Pitfall 2: RevenueCat App User ID Mismatch with Supabase

**What goes wrong:** RevenueCat records purchases under `$RCAnonymousID:abc123` but the Supabase webhook handler receives `$RCAnonymousID:abc123` as `app_user_id` — this doesn't match any Supabase user UUID, so `app_metadata` is never updated, and RLS always blocks premium content.

**Why it happens:** `Purchases.configure()` was called without a user ID. RevenueCat assigns an anonymous ID. Without `Purchases.logIn(supabase_user_id)`, the link between RevenueCat and Supabase is never made.

**How to avoid:** In the auth state change handler (AuthContext or `usePremiumStatus` hook), ALWAYS call `Purchases.logIn(user.id)` on Supabase sign-in and `Purchases.logOut()` on sign-out. The `user.id` is the Supabase UUID — pass this as the RevenueCat `app_user_id`.

**Warning signs:** Purchases appear in RevenueCat dashboard under anonymous IDs; Supabase users never get `is_premium: true` in `app_metadata`; premium sounds remain locked after purchase.

### Pitfall 3: Premium Flag Not Updating Without App Restart

**What goes wrong:** User completes purchase, paywall dismisses, sounds are still locked. User must close and reopen the app to see premium content.

**Why it happens:** `isPremium` is only read once at startup and stored in Zustand. No listener for post-purchase updates.

**How to avoid:** Register `Purchases.addCustomerInfoUpdateListener` in the root layout or in `usePremiumStatus`. This listener fires immediately after RevenueCat confirms the purchase — before `presentPaywall()` returns `PAYWALL_RESULT.PURCHASED`. The Zustand `authStore.isPremium` updates in real time. Locked decision requires this — no app restart.

**Warning signs:** Premium content unlocks after force-quitting and reopening the app, but not immediately after purchase.

### Pitfall 4: Paywall Shown During Fullscreen Immersive Mode

**What goes wrong:** User is in fullscreen immersive mode (no UI, just audio + background). A paywall entry point (e.g., background tapping triggers a sound card tap) presents the paywall over the fullscreen view, disrupting the experience.

**Why it happens:** No guard on paywall entry points checking for fullscreen state.

**How to avoid:** Before calling `RevenueCatUI.presentPaywall()` anywhere in the app, check `useUIStore.getState().isFullscreenMode` and return early if true. This check must be in every callsite or in a shared `openPaywall()` helper function.

**Warning signs:** Paywall appears over the ambient video background; immersive mode is interrupted.

### Pitfall 5: Supabase RLS Policy Uses user_metadata Instead of app_metadata

**What goes wrong:** RLS policy written as `(auth.jwt() -> 'user_metadata' ->> 'is_premium')::boolean = true`. A user opens their browser dev tools, calls `supabase.auth.update({ data: { is_premium: true } })`, and gets access to all premium sounds without paying.

**Why it happens:** Both `user_metadata` and `app_metadata` exist in the JWT. `user_metadata` is user-writable. `app_metadata` is only writable by the service role key (server-side only).

**How to avoid:** ALWAYS use `app_metadata` in RLS policies for authorization. The correct path is `auth.jwt() -> 'app_metadata' ->> 'is_premium'`. The webhook handler updates `app_metadata` via `supabaseAdmin.auth.admin.updateUserById()`.

**Warning signs:** Security bypass discovered in penetration testing; users gaining premium access without purchase.

### Pitfall 6: JWT Staleness Causes Apparent RLS Failure After Purchase

**What goes wrong:** User purchases, RevenueCat webhook fires, `app_metadata.is_premium` is set to `true` in Supabase. But the user's next Supabase query still fails the RLS check — premium sounds remain inaccessible until they log out and back in.

**Why it happens:** The Supabase JWT the client holds is valid for 1 hour (configurable). The RLS policy reads `auth.jwt()` — which is the client's current, cached JWT. Even though `app_metadata` was updated in the database, the client's JWT doesn't contain the new value until the session refreshes.

**How to avoid:** The client's **immediate post-purchase** unlock should rely entirely on the RevenueCat entitlement check (`getCustomerInfo()`), NOT on making new Supabase queries for premium sounds. Only after the JWT naturally refreshes (≤1 hour) will the RLS policy allow premium Supabase queries. For this app's UX, this is acceptable: after purchase, the app knows `isPremium = true` from RevenueCat; sounds play immediately; Supabase URL fetching for premium sounds will work after the next session refresh. If truly immediate Supabase access is required, call `supabase.auth.refreshSession()` after purchase to force-refresh the JWT.

**Warning signs:** User must log out and back in after purchase for premium content to load from Supabase.

### Pitfall 7: EAS Build Required After Installing Native Modules

**What goes wrong:** Developer installs `react-native-purchases` and `react-native-purchases-ui`, runs `npx expo start`, everything works in Expo Go. But on a physical device the SDK crashes with "Invariant Violation: `new NativeEventEmitter()` requires a non-null argument."

**Why it happens:** RevenueCat runs in Preview API Mode (JavaScript mocks) in Expo Go. Native modules require a real EAS Development Build.

**How to avoid:** After `npx expo install react-native-purchases react-native-purchases-ui`, always rebuild the EAS Development Build before testing on device. The project already has Development Builds from Phase 1 — the workflow is established.

**Warning signs:** App works in Expo Go simulator but crashes on device; NativeEventEmitter error in console.

### Pitfall 8: Webhook Missing Authorization Verification

**What goes wrong:** The RevenueCat webhook Edge Function is publicly accessible. Anyone who discovers the URL can send fake purchase events and grant themselves premium access.

**Why it happens:** Edge Functions are HTTP endpoints — no authentication by default.

**How to avoid:** Set a webhook authorization header in the RevenueCat dashboard (Settings → Webhooks → Authorization Header). Verify this header in the Edge Function before processing any event. Use a long random string stored in Supabase Edge Function secrets (`supabase secrets set REVENUECAT_WEBHOOK_SECRET=...`).

**Warning signs:** Webhook accepted without Authorization header; fake purchase events processed.

---

## Code Examples

Verified patterns from official sources:

### RevenueCat SDK: Initialize and Identify

```typescript
// Source: https://www.revenuecat.com/docs/getting-started/configuring-sdk
// Source: https://www.revenuecat.com/docs/customers/identifying-customers
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

// In root layout useEffect (run once):
if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
Purchases.configure({
  apiKey: Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_RC_APPLE_API_KEY!
    : process.env.EXPO_PUBLIC_RC_GOOGLE_API_KEY!,
});

// When Supabase auth state changes to authenticated:
const { customerInfo } = await Purchases.logIn(supabaseUser.id);
const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';

// On sign out:
await Purchases.logOut();
```

### RevenueCat: Listen for Real-Time Entitlement Changes

```typescript
// Source: https://www.revenuecat.com/docs/customers/customer-info
import Purchases from 'react-native-purchases';

// Register in root layout useEffect — fires on purchase, restore, and subscription changes
const cleanup = Purchases.addCustomerInfoUpdateListener((info) => {
  const isPremium = typeof info.entitlements.active['premium'] !== 'undefined';
  useAuthStore.getState().setIsPremium(isPremium);
});

// Return cleanup from useEffect
return cleanup;
```

### RevenueCat: Present Native Paywall

```typescript
// Source: https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls
// Source: GitHub react-native-purchases-ui/src/index.tsx
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

async function openPaywall(): Promise<void> {
  // Guard: never show during fullscreen immersive mode
  if (useUIStore.getState().isFullscreenMode) return;

  const result = await RevenueCatUI.presentPaywall();

  switch (result) {
    case PAYWALL_RESULT.PURCHASED:
    case PAYWALL_RESULT.RESTORED:
      // isPremium already updated by addCustomerInfoUpdateListener — no action needed
      break;
    case PAYWALL_RESULT.CANCELLED:
      break; // Silent — user chose to close
    case PAYWALL_RESULT.ERROR:
      // Locked decision: show "Purchase didn't complete. Try again."
      Alert.alert('Purchase Failed', "Purchase didn't complete. Try again.");
      break;
    case PAYWALL_RESULT.NOT_PRESENTED:
      console.warn('RevenueCat: paywall offering not configured');
      break;
  }
}
```

### Supabase RLS Policy for Premium Sounds

```sql
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security
-- Source: https://supabase.com/docs/guides/auth/oauth-server/token-security

-- Enable RLS
ALTER TABLE sounds ENABLE ROW LEVEL SECURITY;

-- All users can read free sounds (is_premium = false)
-- Premium users can read all sounds
-- Non-premium users cannot read premium sound rows at all (URL stays server-side)
CREATE POLICY "sounds_select_policy"
ON sounds FOR SELECT
USING (
  -- Free sounds: accessible to everyone
  is_premium = false
  OR
  -- Premium sounds: only if user has is_premium = true in app_metadata (server-set only)
  (
    (auth.jwt() -> 'app_metadata' ->> 'is_premium')::boolean IS TRUE
  )
);
```

### Supabase: Force JWT Refresh After Purchase (if needed)

```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-refreshsession
// Call after PAYWALL_RESULT.PURCHASED to update JWT with new app_metadata:
import { supabase } from '@/src/lib/supabase';

const { error } = await supabase.auth.refreshSession();
// After this call, auth.jwt() in RLS will reflect the updated app_metadata
```

### authStore: Add isPremium Field

```typescript
// src/stores/authStore.ts — extend existing store
import { create } from 'zustand';

interface AuthStore {
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isPremium: false,
  setIsPremium: (value) => set({ isPremium: value }),
}));
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom paywall UI | `RevenueCatUI.presentPaywall()` native paywall | RevenueCat 2023 | Paywall is remotely configurable from RevenueCat dashboard without app update |
| `Purchases.identify()` | `Purchases.logIn()` | RevenueCat SDK v4+ | `identify()` is deprecated; `logIn()` is the current method for linking user IDs |
| Manual receipt validation server | RevenueCat handles all receipt validation | RevenueCat always | No server-side receipt validation needed |
| `isPremium` in Firestore user document | `isPremium` in Supabase `app_metadata` | Phase 5 decision (Supabase, not Firebase) | `app_metadata` is unmodifiable by clients; Supabase Admin API updates it; RLS reads it |
| Supabase Firestore Security Rules (mentioned in Phase 6 domain description) | Supabase RLS (PostgreSQL Row Level Security) | This project uses Supabase, not Firebase | Supabase uses PostgreSQL RLS via `CREATE POLICY`; not Firestore Security Rules |

**Important clarification:** The Phase 6 domain description mentions "Firestore Security Rules" — this appears to be a holdover from earlier Firebase-centric planning. This project uses **Supabase**, not Firebase. The correct mechanism is **Supabase Row Level Security (RLS)** policies, implemented in PostgreSQL SQL. The security guarantee is identical (premium URLs never returned to non-premium users), but the syntax and deployment are entirely different.

**Deprecated/outdated:**
- `Purchases.identify()` — deprecated in react-native-purchases v4+; replaced by `Purchases.logIn()`
- Firestore Security Rules — this project uses Supabase RLS, not Firestore; ignore any Firebase-specific patterns from prior research documents

---

## Open Questions

1. **Does the `sounds` table already exist in Supabase with `is_premium` and `url` columns?**
   - What we know: Phase 2 plan (`02-02-PLAN.md`) established a static `src/config/sounds.ts` catalog. Phase 3 mentions the sound catalog with free/premium labels in the UI (LIB-03). However, there is no confirmed `sounds` Supabase table — Phase 2 used Firebase Storage URLs resolved at play-time from the static catalog.
   - What's unclear: Whether a `sounds` Supabase table was created in Phase 3 (which used Supabase) or whether sounds are still served from the static catalog + Firebase Storage.
   - Recommendation: The planner must check Phase 3 plans for any `sounds` Supabase table creation. If sounds are still purely in `config/sounds.ts` with Firebase Storage URLs, Phase 6 must migrate premium sound URLs into Supabase Storage + a `sounds` Supabase table protected by RLS. This is a significant architectural decision that affects Phase 6 scope.

2. **Are Firebase Storage URLs still in use for audio files?**
   - What we know: Phase 2 plan uses Firebase Storage URLs cached locally via `expo-file-system`. STACK.md mentions Firebase Storage. But Phase 5 switched from Firebase to Supabase entirely.
   - What's unclear: Whether audio files were migrated to Supabase Storage in Phase 3/4/5 or whether they still use Firebase Storage.
   - Recommendation: If audio files remain in Firebase Storage, the Phase 6 plan must either: (a) migrate premium audio files to Supabase Storage (where RLS applies), or (b) use a Supabase Edge Function as a URL proxy that checks `is_premium` before returning the Firebase Storage signed URL. Option (a) is architecturally cleaner.

3. **RevenueCat dashboard configuration — who is responsible?**
   - What we know: Phase 6 requires products configured in App Store Connect (iOS) and Google Play Console (Android), then mirrored in the RevenueCat dashboard as entitlements, products, and offerings. This is a human-checkpointed step.
   - What's unclear: Whether App Store Connect products are already configured or need to be set up.
   - Recommendation: Phase 6 plan must include a human checkpoint: "Create Monthly and Annual subscription products in App Store Connect and Google Play Console, then configure entitlement `'premium'` and offering in RevenueCat dashboard before running sandbox tests."

4. **`authStore` — does it already have an `isPremium` field from Phase 1 scaffold?**
   - What we know: Phase 1 plan (`01-03-PLAN.md`) created 4 Zustand stores including `authStore`. The Phase 1 plan may have included `isPremium` as a placeholder field.
   - What's unclear: Whether the Phase 1 scaffold `authStore` includes `isPremium: boolean` or only auth state (user, isLoading).
   - Recommendation: Planner checks Phase 1 plan and any SUMMARY.md. If `isPremium` is missing, Phase 6 plan task 1 must add it.

5. **Sandbox testing environment setup — App Store Connect and Play Console**
   - What we know: Real purchase testing requires physical devices + sandbox accounts. iOS requires a Sandbox Tester account in App Store Connect. Android requires Play Store internal testing track.
   - What's unclear: Whether sandbox accounts are already set up or need to be created.
   - Recommendation: Phase 6 plan must include sandbox testing instructions as a verification step: iOS sandbox tester account creation, Android internal testing track configuration.

---

## Sources

### Primary (HIGH confidence)

- `https://www.revenuecat.com/docs/getting-started/installation/expo` — Expo installation steps, `expo-dev-client` requirement, Preview API Mode in Expo Go
- `https://www.revenuecat.com/docs/getting-started/configuring-sdk` — `Purchases.configure()` parameters, singleton pattern, platform-specific API keys
- `https://www.revenuecat.com/docs/customers/identifying-customers` — `Purchases.logIn()` vs deprecated `identify()`, anonymous IDs, `Purchases.logOut()`
- `https://www.revenuecat.com/docs/customers/customer-info` — `getCustomerInfo()`, `addCustomerInfoUpdateListener`, `entitlements.active` structure
- `https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls` — `presentPaywall()`, `presentPaywallIfNeeded()`, `PAYWALL_RESULT` enum, listener callbacks
- `https://github.com/RevenueCat/react-native-purchases/blob/main/react-native-purchases-ui/src/index.tsx` — TypeScript types: `PAYWALL_RESULT`, `FullScreenPaywallViewProps`, function signatures
- `https://www.revenuecat.com/docs/integrations/webhooks` — Webhook event types, payload structure (`app_user_id`, `entitlement_ids`), authorization header, 200 response requirement, retry behavior
- `https://supabase.com/docs/guides/database/postgres/row-level-security` — `CREATE POLICY`, `auth.jwt()`, `auth.uid()`, enabling RLS on tables
- `https://supabase.com/docs/guides/auth/oauth-server/token-security` — `app_metadata` vs `user_metadata` security distinction; `raw_app_meta_data` not user-modifiable
- `https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac` — Custom claims via Auth Hooks, `auth.jwt() -> 'app_metadata'` usage in policies
- `https://github.com/RevenueCat/react-native-purchases` — Confirmed version 9.10.1 (February 18, 2026); minimum RN 0.73.0; Expo Go Preview API Mode behavior

### Secondary (MEDIUM confidence)

- `https://expo.dev/blog/expo-revenuecat-in-app-purchase-tutorial` — Expo + RevenueCat integration steps, platform-specific configure() call pattern
- `https://www.buildcamp.io/blogs/how-to-build-a-react-native-expo-app-with-supabase-and-revenuecat` — RevenueCat + Supabase integration patterns, user ID linking approach
- RevenueCat community forum (searched): `Purchases.logIn()` flow for identified users; entitlement identifier must match dashboard exactly; `addCustomerInfoUpdateListener` real-time update pattern

### Tertiary (LOW confidence)

- Community forum posts on JWT staleness after webhook — specific timing behavior unverified; the `supabase.auth.refreshSession()` workaround is from official Supabase docs (MEDIUM); the specific timing window (≤1 hour) is Supabase default, not validated against current Supabase configuration.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `react-native-purchases` 9.10.1 verified from GitHub (released Feb 18, 2026); RevenueCat Expo install steps verified from official docs; Supabase RLS verified from official docs
- Architecture: HIGH — RevenueCat `logIn()`, `getCustomerInfo()`, `addCustomerInfoUpdateListener` patterns verified from official RevenueCat docs; Supabase `app_metadata` for authorization verified from official Supabase security docs; webhook pattern verified from RevenueCat webhook docs
- Pitfalls: HIGH — user_metadata vs app_metadata security issue verified from official Supabase docs; `Purchases.configure()` singleton requirement verified from RevenueCat docs; JWT staleness is MEDIUM (known Supabase behavior, standard mitigation documented)

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days — RevenueCat SDK and Supabase RLS APIs are stable; webhook event types and entitlement check patterns unlikely to change in this window)
