## ADDED Requirements

### Requirement: Phase 1 development builds produce installable artifacts for both platforms

The project SHALL define a verification workflow for Phase 1 that triggers EAS `development` builds for both iOS and Android and treats the foundation gate as incomplete unless both builds reach a finished state with installable artifacts.

#### Scenario: Build workflow produces both platform artifacts

- **WHEN** a developer runs the documented EAS development-build flow for Phase 1
- **THEN** the workflow yields a finished iOS build artifact and a finished Android build artifact, or stops with recorded failure details instead of claiming verification succeeded

### Requirement: Installed development builds expose a Firebase smoke-test flow

The project SHALL provide a temporary verification flow in the installed native app that can confirm launch success, native Firebase app availability, readable Auth state, callable Firestore access, and callable Storage access without additional setup code beyond the shared RNFB module.

#### Scenario: Verification flow confirms runtime Firebase reachability

- **WHEN** a developer opens the temporary verification flow from an installed iOS or Android development build
- **THEN** the app reports whether native Firebase initialization is present and whether `auth().currentUser`, `firestore().collection(...)`, and `storage().ref(...)` can be reached without throwing initialization errors

### Requirement: Real-device verification remains a blocking checkpoint

The Phase 1 verification workflow MUST require real iOS and Android hardware for final sign-off, and it MUST NOT treat Expo Go, web, or simulator-only checks as equivalent substitutes for the device-build gate.

#### Scenario: Non-device runtimes are rejected as final proof

- **WHEN** a developer attempts to use Expo Go, web, or simulator-only testing as the only verification evidence for this workflow
- **THEN** the documented process marks the Phase 1 device-build verification as incomplete and instructs the developer to complete the real-device checkpoint
