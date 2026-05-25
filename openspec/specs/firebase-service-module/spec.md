## ADDED Requirements

### Requirement: Firebase service module exports RNFB services

The project SHALL provide `src/lib/firebase.ts` as the shared RNFB import surface for later phases and temporary verification flows, and the module SHALL export named bindings `auth`, `firestore`, `storage`, and `analytics` from the installed `@react-native-firebase/*` packages so runtime smoke tests use the same service entry point as app code.

#### Scenario: Shared Firebase module is available to app code

- **WHEN** a developer imports from `src/lib/firebase.ts`
- **THEN** they can access named exports `auth`, `firestore`, `storage`, and `analytics` without additional setup code

#### Scenario: Verification flow uses the shared Firebase module

- **WHEN** a temporary device-verification screen or helper performs Firebase smoke checks
- **THEN** it imports the RNFB services from `src/lib/firebase.ts` rather than creating a parallel Firebase access path, including explicit Firestore and Storage actions triggered from that verification surface

### Requirement: Firebase service module does not perform JS SDK initialization

The `src/lib/firebase.ts` module MUST rely on RNFB native auto-initialization from `google-services.json` and `GoogleService-Info.plist`, and it MUST NOT call `initializeApp()` or mix in Firebase JS SDK initialization logic.

#### Scenario: Firebase module avoids dual-package initialization hazards

- **WHEN** a developer reviews `src/lib/firebase.ts`
- **THEN** the file contains RNFB service imports and exports only, and no `initializeApp()` call is present
