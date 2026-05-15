## 1. Verification Surface And Documentation

- [x] 1.1 Audit the existing Firebase verification route, screen, and README flow against plan `01-04` to identify the exact gaps for build completion, launch checks, Firestore reachability, and Storage reachability.
- [x] 1.2 Update `README.md` so the temporary device-verification instructions define the required EAS `development` build commands, artifact expectations, install flow, and explicit pass/fail criteria for both iOS and Android.
- [x] 1.3 Document the blocking human checkpoint clearly: real devices are required, and Expo Go, web, or simulator-only validation does not satisfy the Phase 1 gate.
- [x] 1.4 Document Phase 1 explicitly as a Metro-backed Expo development-client workflow, and remove any expectation that this verification passes without Metro.

## 2. Firebase Smoke-Test Expansion

- [x] 2.1 Extend the existing temporary Firebase verification surface to report native app initialization status and readable Auth state from the shared `src/lib/firebase.ts` module.
- [x] 2.2 Add an explicit Firestore test button that calls `firestore().collection(...)` from the same verification surface and shows whether the call succeeds or fails with a useful error.
- [x] 2.3 Add an explicit Storage test button that calls `storage().ref(...)` from the same verification surface and shows whether the call succeeds or fails with a useful error.
- [x] 2.4 Keep the verification implementation temporary and Phase-1-scoped, without introducing a second parallel Firebase access path or product-facing feature surface.

## 3. Local Validation

- [x] 3.1 Run the project checks needed after the verification-surface and documentation changes, and fix any type, lint, or formatting regressions.
- [x] 3.2 Manually review the updated verification flow to confirm it matches the new OpenSpec requirements for build gating and Firebase smoke coverage.

## 4. EAS And Device Checkpoint

- [ ] 4.1 Trigger EAS `development` builds for iOS and Android and capture whether each build finishes successfully with an installable artifact URL.
- [ ] 4.2 Install the resulting iOS and Android development builds on real devices, connect Metro as required by the Expo development client, and confirm the app launches without crash or red screen before any deeper smoke test.
- [ ] 4.3 Run the temporary verification flow on both devices and confirm Auth, Firestore, and Storage are reachable without `app not initialized` errors.
- [ ] 4.4 Verify on iOS that the installed build registers background audio support from `UIBackgroundModes: ["audio"]` as required by the Phase 1 gate.
- [ ] 4.5 Record the outcome in `.planning/phases/01-foundation/01-04-SUMMARY.md`, and if either build or device check fails, stop and report the failure instead of marking Phase 1 complete.
