## 1. Root Startup Gating

- [x] 1.1 Update `app/_layout.tsx` to hold the splash screen at module load, wait for persisted `useUIStore` hydration, evaluate `hasSeenOnboarding`, and route users to `/(onboarding)` or `/(tabs)` before revealing the shell.
- [x] 1.2 Preserve the existing root stack declarations for `(tabs)`, `(onboarding)`, `(auth)`, and `player`, and ensure startup errors fall back to the tabs shell instead of trapping users in onboarding or flashing the wrong shell first.

## 2. Onboarding Flow

- [x] 2.1 Finalize `app/(onboarding)/index.tsx` as the Welcome screen so its content, icon treatment, label, and `Begin` navigation match the Phase `03-03` onboarding contract.
- [x] 2.2 Finalize `app/(onboarding)/quiet-mode.tsx` so it renders the pre-enabled visual DND toggle, the expected supporting copy, and both completion CTAs.
- [x] 2.3 Implement or align the shared onboarding completion handler so both `Continue` and `Not now` persist `useUIStore.hasSeenOnboarding` and replace the flow with `/(tabs)`.

## 3. Settings Shell

- [x] 3.1 Replace `app/(tabs)/settings.tsx` with the full Phase `03-03` settings shell layout and rows for Dark Mode, Session Duration, Loop Mode, Auto-play Next, Silence Notifications, Support and FAQ, and Share with Friends.
- [x] 3.2 Wire the Dark Mode control in Settings to `useUIStore` so it reflects `isDarkMode` and calls `toggleDarkMode`.
- [x] 3.3 Keep the remaining settings rows as explicit shell-only affordances that provide clear `coming soon` feedback instead of hidden behavior or silent no-op taps.

## 4. Validation

- [x] 4.1 Run the relevant project checks after the shell updates land and fix any lint, formatting, or type regressions introduced by the slice.
- [ ] 4.2 Manually verify first-launch onboarding, returning-user bypass to tabs, onboarding completion via both CTAs, and dark-mode persistence across app restart.
- [x] 4.3 Create the Phase `03-03` summary artifact after implementation using the project planning summary format.
