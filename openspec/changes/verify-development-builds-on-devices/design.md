## Context

The repository already has the native build foundation, committed Firebase config files, and a temporary Firebase Auth test route, but the Phase 1 gate defined in plan `01-04` is stricter than the current repo contract. The project still needs an explicit implementation path for proving that EAS `development` builds finish successfully for both platforms, install on real devices, launch without crashing, and can reach Firebase services from the installed app.

This change crosses documentation, verification UI, and OpenSpec contract boundaries. It also depends on two systems the repository cannot fully control in CI or local automation: EAS cloud builds and physical iOS/Android hardware. Any design that implies the entire plan can be verified by local commands alone would be a bad fit for the actual constraints.

## Goals / Non-Goals

**Goals:**

- Define a concrete Phase 1 verification contract for EAS `developmentClient` builds on both iOS and Android.
- Reuse and extend the existing Firebase verification surface so it can smoke-test Firestore and Storage in addition to Auth.
- Document the required human verification flow clearly enough that implementation can stop on real failures instead of guessing.
- Keep iOS background-audio verification in the Phase 1 device checklist so the change preserves the original plan gate.

**Non-Goals:**

- Replace EAS with a local-only build workflow.
- Automate real-device installation or claim simulator/web coverage is equivalent to Phase `01-04`.
- Introduce product-facing Firebase UI beyond the temporary verification surface.

## Decisions

### Reuse the existing Firebase verification screen instead of adding a second temporary test flow

The implementation should extend the current native Firebase test surface and its `README.md` verification instructions rather than create a separate verification screen for Firestore and Storage.

Rationale: The repo already has a temporary auth verification route and README flow. Reusing that surface keeps the change smaller and ensures all Firebase smoke checks exercise the same shared RNFB import path.

Alternative considered: Add a brand-new device verification screen.
Rejected because it would duplicate temporary test UI and split the Phase 1 validation story across multiple places.

### Treat EAS build completion and real-device launch as a blocking human checkpoint

The change should define tasks and documentation that guide the operator through `eas build --profile development`, artifact installation, and on-device verification, but it must keep this step explicitly human-driven.

Rationale: EAS builds run on Expo infrastructure, and device install plus launch behavior cannot be proven from the repository alone. Encoding this as a human checkpoint is more accurate than inventing fake automation.

Alternative considered: Declare the change complete after local lint/typecheck or emulator-only validation.
Rejected because that would not satisfy plan `01-04` or prove native Firebase and background-audio configuration on real hardware.

### Keep Phase 1 on a Metro-backed Expo development client workflow

The change should treat the `development` EAS profile as an Expo development client workflow, which means native install and runtime verification are performed on real devices while Metro may still be required to serve the JavaScript bundle during testing.

Rationale: The repository already uses `developmentClient: true` and `expo-dev-client`. Keeping the Phase 1 gate aligned with that setup proves the native shell, RNFB integration, and app configuration without redefining the phase around standalone packaging behavior.

Alternative considered: Require the Phase 1 device gate to launch without Metro.
Rejected because that expectation does not match the current development-client profile and would require a different build contract.

### Use explicit Firestore and Storage buttons on the temporary verification screen

The temporary verification flow should keep passive status for native app presence and Auth readability, but expose explicit Firestore and Storage action buttons so the operator can run and rerun each smoke check on demand from the installed app.

Rationale: Firestore and Storage checks are clearer when tied to an intentional user action, easier to rerun after transient network issues, and simpler to interpret on a physical device than automatically firing every probe on screen load.

Alternative considered: Passive status rows for all Firebase checks.
Rejected because it makes failures harder to distinguish from slow startup or network timing noise.

### Preserve iOS background-audio verification in the device checklist

The change should keep an explicit requirement to verify that the built iOS app registers background audio support from `UIBackgroundModes: ["audio"]` during the real-device checkpoint.

Rationale: The source Phase 1 plan includes background-audio registration as part of the gate. Removing it would weaken the verification contract and leave part of the native foundation unproven.

Alternative considered: Defer background-audio verification entirely to a later phase.
Rejected because Phase `01-04` already treats it as part of the foundation build gate.

### Require README verification instructions to ship with the implementation

The change should require `README.md` to be updated during implementation so the documented verification flow matches the actual temporary screen behavior, Metro-backed development-client workflow, and iOS background-audio checkpoint.

Rationale: The Phase 1 gate is executed by following repository instructions. Leaving `README.md` for a later cleanup would create a mismatch between the contract and the steps reviewers use on real devices.

Alternative considered: Update the implementation first and clean up `README.md` later.
Rejected because it would leave the repository with stale verification instructions during the phase-gate workflow.

### Expand the verification contract from Auth-only confidence to service reachability checks

The temporary verification flow should prove three things from the installed app: RNFB native app initialization is present, `auth().currentUser` is readable, and Firestore plus Storage APIs can be called from explicit on-screen actions without `app not initialized` or first-call connectivity failures.

Rationale: The existing auth-only flow leaves a gap between native config presence and broader Firebase readiness. Plan `01-04` explicitly requires smoke confidence for Firestore and Storage as part of the phase gate.

Alternative considered: Keep Firestore and Storage validation in README text only.
Rejected because a documented expectation without a repository-backed verification surface is easy to skip and harder to reproduce.

## Risks / Trade-offs

- [Real-device verification cannot be fully automated] -> Mitigation: model it as a blocking human checkpoint in tasks and docs, with explicit pass/fail criteria.
- [Temporary verification UI could drift from product code] -> Mitigation: keep it scoped to Phase 1 smoke testing and reuse the shared `src/lib/firebase.ts` module rather than adding parallel service wiring.
- [Cloud build failures may be caused by credentials or external EAS state] -> Mitigation: require captured build status and logs as part of the verification workflow before claiming completion.
- [Operators may assume the installed development client should run without Metro] -> Mitigation: document Phase 1 explicitly as a Metro-backed development-client workflow and reject Metro-free launch as a requirement for this change.

## Migration Plan

1. Update the OpenSpec contract for native build verification and Firebase smoke testing.
2. Extend the temporary Firebase verification surface and update `README.md` device-check instructions to cover explicit Firestore and Storage checks.
3. Run local repo verification for code and documentation changes.
4. Trigger EAS `development` builds for iOS and Android.
5. Install both artifacts on real devices, connect Metro as required by the development client, and execute the documented smoke-test checklist including iOS background-audio verification.
6. If either build fails or a device check fails, stop and record the failure instead of marking Phase 1 complete.

Rollback strategy: revert the temporary verification-surface and documentation changes if they prove misleading or too broad, while keeping the previously working Auth-only setup intact.

## Open Questions

- Whether the final `01-04` summary should live only under `.planning/` or also be linked from `README.md` for future device-build reviews.
