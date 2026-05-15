## 1. Verification Surface And Documentation

- [ ] 1.1 Audit the existing Firebase verification route, screen, and README flow against plan `01-04` to identify the exact gaps for build completion, launch checks, Firestore reachability, and Storage reachability.
- [ ] 1.2 Update the temporary device-verification documentation so it defines the required EAS `development` build commands, artifact expectations, install flow, and explicit pass/fail criteria for both iOS and Android.
- [ ] 1.3 Document the blocking human checkpoint clearly: real devices are required, and Expo Go, web, or simulator-only validation does not satisfy the Phase 1 gate.

## 2. Firebase Smoke-Test Expansion

- [ ] 2.1 Extend the existing temporary Firebase verification surface to report native app initialization status and readable Auth state from the shared `src/lib/firebase.ts` module.
- [ ] 2.2 Add Firestore smoke-test behavior that can call `firestore().collection(...)` from the same verification surface and show whether the call succeeds or fails with a useful error.
- [ ] 2.3 Add Storage smoke-test behavior that can call `storage().ref(...)` from the same verification surface and show whether the call succeeds or fails with a useful error.
- [ ] 2.4 Keep the verification implementation temporary and Phase-1-scoped, without introducing a second parallel Firebase access path or product-facing feature surface.

## 3. Local Validation

- [ ] 3.1 Run the project checks needed after the verification-surface and documentation changes, and fix any type, lint, or formatting regressions.
- [ ] 3.2 Manually review the updated verification flow to confirm it matches the new OpenSpec requirements for build gating and Firebase smoke coverage.

## 4. EAS And Device Checkpoint

- [ ] 4.1 Trigger EAS `development` builds for iOS and Android and capture whether each build finishes successfully with an installable artifact URL.
- [ ] 4.2 Install the resulting iOS and Android development builds on real devices and confirm the app launches without crash or red screen before any deeper smoke test.
- [ ] 4.3 Run the temporary verification flow on both devices and confirm Auth, Firestore, and Storage are reachable without `app not initialized` errors.
- [ ] 4.4 Record the outcome in `.planning/phases/01-foundation/01-04-SUMMARY.md`, and if either build or device check fails, stop and report the failure instead of marking Phase 1 complete.
