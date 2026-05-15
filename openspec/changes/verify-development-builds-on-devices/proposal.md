## Why

The foundation work already configures Expo, EAS, and React Native Firebase for native development builds, but the project still has not proven that those settings produce installable artifacts that launch cleanly on real iOS and Android devices. Plan `01-04` closes that gap by turning device-build verification into an explicit implementation contract instead of leaving it as a manual assumption.

## What Changes

- Add a real-device verification capability that requires successful EAS `development` builds for both iOS and Android before the foundation phase is considered complete.
- Require a documented smoke-test flow that verifies app launch, Firebase native initialization, and Firestore and Storage reachability from an installed development build.
- Extend the temporary Firebase verification surface and review documentation so the repository can prove more than Auth alone during device testing.

## Capabilities

### New Capabilities

- `device-build-verification`: Defines the required EAS build outputs, real-device install checks, and runtime smoke-test expectations for Phase 1 development builds.

### Modified Capabilities

- `native-build-foundation`: Tighten the build-foundation contract so it is not only configured for development builds, but also verified through successful EAS build output and installed device launch behavior.
- `firebase-service-module`: Extend the Firebase verification contract from Auth-only confidence to smoke-test access for Firestore and Storage from the shared RNFB service surface.

## Impact

- Affected files: `README.md`, Firebase verification UI/routes, possible shared Firebase helpers, and new OpenSpec specs under `openspec/changes/verify-development-builds-on-devices/specs/`
- Affected systems: EAS Build workflow, internal device installation flow, real-device QA checklist, and RNFB runtime verification for Auth, Firestore, and Storage
- Dependencies: existing EAS `development` profile, committed Firebase native config files, and physical iOS and Android devices for the blocking verification step
