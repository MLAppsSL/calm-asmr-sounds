## 1. Root Startup Gating

- [ ] 1.1 Update `app/_layout.tsx` to hold the splash screen at module load, read the `has_seen_onboarding` AsyncStorage flag on mount, and route users to `/(onboarding)` or `/(tabs)` before revealing the shell.
- [ ] 1.2 Preserve the existing root stack declarations for `(tabs)`, `(onboarding)`, `(auth)`, and `player`, and ensure startup errors fall back to the tabs shell instead of trapping users in onboarding.

## 2. Onboarding Flow

- [ ] 2.1 Replace `app/(onboarding)/index.tsx` with the Welcome screen that shows the icon treatment, headline, supporting label, and `Begin` action into `/(onboarding)/quiet-mode`.
- [ ] 2.2 Replace `app/(onboarding)/quiet-mode.tsx` with the Quiet Mode screen that renders the pre-enabled visual DND toggle and both completion CTAs.
- [ ] 2.3 Implement the shared onboarding completion handler so both `Continue` and `Not now` write `has_seen_onboarding` and replace the flow with `/(tabs)`.

## 3. Settings Shell

- [ ] 3.1 Replace `app/(tabs)/settings.tsx` with the full Phase `03-03` settings shell layout and rows for Dark Mode, Session Duration, Loop Mode, Auto-play Next, Silence Notifications, Support and FAQ, and Share with Friends.
- [ ] 3.2 Wire the Dark Mode control in Settings to `useUIStore` so it reflects `isDarkMode` and calls `toggleDarkMode`, while the remaining rows stay explicit shell-only affordances.

## 4. Validation

- [ ] 4.1 Run the relevant project checks after the shell updates land and fix any lint, formatting, or type regressions introduced by the slice.
- [ ] 4.2 Manually verify first-launch onboarding, returning-user bypass to tabs, onboarding completion via both CTAs, and dark-mode persistence across app restart.
- [ ] 4.3 Create the Phase `03-03` summary artifact after implementation using the project planning summary format.
