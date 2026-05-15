## Context

The repository already has the native build foundation, committed Firebase config files, and a temporary Firebase Auth test route, but the Phase 1 gate defined in plan `01-04` is stricter than the current repo contract. The project still needs an explicit implementation path for proving that EAS `development` builds finish successfully for both platforms, install on real devices, launch without crashing, and can reach Firebase services from the installed app.

This change crosses documentation, verification UI, and OpenSpec contract boundaries. It also depends on two systems the repository cannot fully control in CI or local automation: EAS cloud builds and physical iOS/Android hardware. Any design that implies the entire plan can be verified by local commands alone would be a bad fit for the actual constraints.

## Goals / Non-Goals

**Goals:**

- Define a concrete Phase 1 verification contract for EAS development builds on both iOS and Android.
- Reuse and extend the existing Firebase verification surface so it can smoke-test Firestore and Storage in addition to Auth.
- Document the required human verification flow clearly enough that implementation can stop on real failures instead of guessing.

**Non-Goals:**

- Replace EAS with a local-only build workflow.
- Automate real-device installation or claim simulator/web coverage is equivalent to Phase `01-04`.
- Introduce product-facing Firebase UI beyond the temporary verification surface.

## Decisions

### Reuse the existing Firebase verification screen instead of adding a second temporary test flow

The implementation should extend the current native Firebase test surface and its documentation rather than create a separate verification screen for Firestore and Storage.

Rationale: The repo already has a temporary auth verification route and README flow. Reusing that surface keeps the change smaller and ensures all Firebase smoke checks exercise the same shared RNFB import path.

Alternative considered: Add a brand-new device verification screen.
Rejected because it would duplicate temporary test UI and split the Phase 1 validation story across multiple places.

### Treat EAS build completion and real-device launch as a blocking human checkpoint

The change should define tasks and documentation that guide the operator through `eas build --profile development`, artifact installation, and on-device verification, but it must keep this step explicitly human-driven.

Rationale: EAS builds run on Expo infrastructure, and device install plus launch behavior cannot be proven from the repository alone. Encoding this as a human checkpoint is more accurate than inventing fake automation.

Alternative considered: Declare the change complete after local lint/typecheck or emulator-only validation.
Rejected because that would not satisfy plan `01-04` or prove native Firebase and background-audio configuration on real hardware.

### Expand the verification contract from Auth-only confidence to service reachability checks

The temporary verification flow should prove three things from the installed app: RNFB native app initialization is present, `auth().currentUser` is readable, and Firestore plus Storage APIs can be called without `app not initialized` or first-call connectivity failures.

Rationale: The existing auth-only flow leaves a gap between native config presence and broader Firebase readiness. Plan `01-04` explicitly requires smoke confidence for Firestore and Storage as part of the phase gate.

Alternative considered: Keep Firestore and Storage validation in README text only.
Rejected because a documented expectation without a repository-backed verification surface is easy to skip and harder to reproduce.

## Risks / Trade-offs

- [Real-device verification cannot be fully automated] -> Mitigation: model it as a blocking human checkpoint in tasks and docs, with explicit pass/fail criteria.
- [Temporary verification UI could drift from product code] -> Mitigation: keep it scoped to Phase 1 smoke testing and reuse the shared `src/lib/firebase.ts` module rather than adding parallel service wiring.
- [Cloud build failures may be caused by credentials or external EAS state] -> Mitigation: require captured build status and logs as part of the verification workflow before claiming completion.

## Migration Plan

1. Update the OpenSpec contract for native build verification and Firebase smoke testing.
2. Extend the temporary Firebase verification surface and README/device-check instructions to cover Firestore and Storage reachability.
3. Run local repo verification for code and documentation changes.
4. Trigger EAS `development` builds for iOS and Android.
5. Install both artifacts on real devices and execute the documented smoke-test checklist.
6. If either build fails or a device check fails, stop and record the failure instead of marking Phase 1 complete.

Rollback strategy: revert the temporary verification-surface and documentation changes if they prove misleading or too broad, while keeping the previously working Auth-only setup intact.

## Open Questions

- Whether the Firestore and Storage smoke checks should be displayed as passive status rows or explicit buttons on the temporary verification screen.
- Whether the final `01-04` summary should live only under `.planning/` or also be linked from `README.md` for future device-build reviews.
