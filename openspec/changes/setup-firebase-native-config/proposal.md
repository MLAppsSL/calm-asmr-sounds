## Why

The Phase 1 foundation already references Firebase native configuration in `app.json`, but the project still cannot proceed with RNFB-backed work until the real platform config files exist and a shared service module exposes the RNFB packages safely. This change turns the planned Firebase checkpoint into an implementation-ready contract with an explicit human gate, so apply work stops immediately if the required console setup and local `.env` values are not in place.

## What Changes

- Add a blocking human checkpoint for Firebase Console setup, native config file placement at the project root, and local `.env` population from `.env.example`.
- Add a Firebase service module at `src/lib/firebase.ts` that re-exports RNFB `auth`, `firestore`, `storage`, and `analytics` without calling `initializeApp()`.
- Convert the Phase 1 Firebase-native-file follow-up from a planned note into an explicit requirement that must be satisfied before implementation can continue.
- Document the contradiction in the source plan that `.env` must be populated locally even though it is not listed in `files_modified`, and treat that as human-only setup rather than a committed repository change.

## Capabilities

### New Capabilities

- `firebase-service-module`: Provide a single RNFB import surface for `auth`, `firestore`, `storage`, and `analytics` that future phases can consume without JS SDK initialization.

### Modified Capabilities

- `native-build-foundation`: Change the Firebase native config follow-up from a deferred checkpoint note into a hard prerequisite for Firebase initialization work, including stop-and-notify behavior when required files are missing.
- `environment-template`: Clarify that `.env.example` remains the committed template while real Firebase values must be copied into a local `.env` before apply work can continue.

## Impact

- Affected files: `src/lib/firebase.ts`, `google-services.json`, `GoogleService-Info.plist`, local `.env`, and new OpenSpec change artifacts under `openspec/changes/setup-firebase-native-config/`
- Affected systems: Firebase Console project setup, RNFB native initialization, TypeScript import surface for app code, and the human checkpoint workflow before implementation
- Dependencies and constraints: existing `@react-native-firebase/*` packages from `01-01`, native file references already declared in `app.json`, and the requirement to avoid `initializeApp()` because of the RNFB dual-package hazard
