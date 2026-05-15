## MODIFIED Requirements

### Requirement: EAS build profiles support development and release workflows

The project SHALL define `cli.version: ">= 16.0.0"`, `cli.appVersionSource: "local"`, `development`, `preview`, and `production` build profiles in `eas.json`, `env.APP_VARIANT` entries for each build profile, `production.autoIncrement: true`, and `submit.production`, and the development profile MUST produce an internal development client build that remains usable for Phase 1 verification on both iOS and Android through EAS Build.

#### Scenario: Build profiles exist for all planned workflows

- **WHEN** a developer inspects `eas.json`
- **THEN** the file defines `cli.version: ">= 16.0.0"`, `cli.appVersionSource: "local"`, `development`, `preview`, and `production` profiles, `env.APP_VARIANT` values for each profile, `production.autoIncrement: true`, `submit.production`, and the `development` profile sets `developmentClient: true` and `distribution: "internal"`

#### Scenario: Development profile can be used for the Phase 1 build gate

- **WHEN** a developer runs the documented Phase 1 EAS build flow with the `development` profile for iOS and Android
- **THEN** the profile is expected to produce installable internal artifacts for both platforms, and any errored build blocks the foundation verification from being marked complete
