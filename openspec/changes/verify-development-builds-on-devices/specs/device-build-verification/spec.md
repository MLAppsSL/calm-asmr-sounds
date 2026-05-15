## ADDED Requirements

### Requirement: Phase 1 development builds produce installable artifacts for both platforms

The project SHALL define a verification workflow for Phase 1 that triggers EAS `development` builds for both iOS and Android, treats the `development` profile as an Expo development-client workflow, and treats the foundation gate as incomplete unless both builds reach a finished state with installable artifacts.

#### Scenario: Build workflow produces both platform artifacts

- **WHEN** a developer runs the documented EAS development-build flow for Phase 1
- **THEN** the workflow yields a finished iOS build artifact and a finished Android build artifact, or stops with recorded failure details instead of claiming verification succeeded

#### Scenario: Development-client workflow may require Metro during device verification

- **WHEN** a developer performs the documented Phase 1 runtime verification from the installed `development` builds
- **THEN** the process treats Metro as an allowed part of the Expo development-client workflow and MUST NOT require Metro-free launch behavior as proof of success

### Requirement: Installed development builds expose a Firebase smoke-test flow

The project SHALL provide a temporary verification flow in the installed native app that can confirm launch success, native Firebase app availability, readable Auth state, and explicit callable Firestore and Storage checks without additional setup code beyond the shared RNFB module.

#### Scenario: Verification flow confirms runtime Firebase reachability

- **WHEN** a developer opens the temporary verification flow from an installed iOS or Android development build
- **THEN** the app reports whether native Firebase initialization is present, whether `auth().currentUser` is readable, and whether explicit Firestore and Storage actions can call `firestore().collection(...)` and `storage().ref(...)` without throwing initialization errors

### Requirement: iOS device verification confirms background-audio registration

The Phase 1 verification workflow SHALL require an explicit iOS device check that confirms the installed build includes background-audio registration from `UIBackgroundModes: ["audio"]` before the foundation gate is marked complete.

#### Scenario: iOS build preserves background-audio support

- **WHEN** a developer completes the documented iOS device verification for Phase 1
- **THEN** the recorded checklist confirms that the installed build preserves the expected background-audio registration rather than omitting it from the native app configuration

### Requirement: Real-device verification remains a blocking checkpoint

The Phase 1 verification workflow MUST require real iOS and Android hardware for final sign-off, and it MUST NOT treat Expo Go, web, or simulator-only checks as equivalent substitutes for the device-build gate.

#### Scenario: Non-device runtimes are rejected as final proof

- **WHEN** a developer attempts to use Expo Go, web, or simulator-only testing as the only verification evidence for this workflow
- **THEN** the documented process marks the Phase 1 device-build verification as incomplete and instructs the developer to complete the real-device checkpoint
