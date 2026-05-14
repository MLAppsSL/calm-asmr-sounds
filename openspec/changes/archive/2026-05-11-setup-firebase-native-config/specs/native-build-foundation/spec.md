## MODIFIED Requirements

### Requirement: Firebase native config files are a required committed checkpoint

The project SHALL keep `ios.googleServicesFile` and `android.googleServicesFile` configured in `app.json`, and any change that initializes RNFB services MUST stop and notify the user unless real `GoogleService-Info.plist` and `google-services.json` files have already been placed at the project root and tracked in git through the required human checkpoint. Those native files MUST include a non-empty `project_info.project_id` in `google-services.json`, a non-empty `PROJECT_ID` in `GoogleService-Info.plist`, and any other Firebase-required values needed for native initialization for the intended app identities. When Google Analytics is intended to be enabled for the foundation, the checkpoint documentation and native config files MUST reflect that enabled state consistently.

#### Scenario: Bootstrap config can be reviewed before Firebase files are supplied

- **WHEN** a developer reviews the change artifacts for this Firebase follow-up work
- **THEN** they can see that `ios.googleServicesFile` and `android.googleServicesFile` remain required config links, and that implementation cannot continue until the real native files are supplied by the human checkpoint and kept as tracked repository files

#### Scenario: Apply flow halts when native Firebase files are missing

- **WHEN** implementation begins and either `GoogleService-Info.plist` or `google-services.json` is missing from the project root
- **THEN** the work MUST stop immediately and notify the user that the Firebase checkpoint is incomplete

#### Scenario: Apply flow halts when native Firebase files are incomplete

- **WHEN** implementation begins and either native Firebase config file is present but missing a non-empty project ID or any other Firebase-required value needed for native initialization
- **THEN** the work MUST stop immediately and notify the user that the Firebase checkpoint is incomplete

### Requirement: Tracked Firebase native API keys require manual restriction

If `GoogleService-Info.plist` and `google-services.json` remain committed in the repository, the corresponding Firebase API keys MUST be restricted in Google Cloud to the shipped app identities before the tracked native files are treated as safe for a public repository.

#### Scenario: iOS plist key has an app restriction

- **WHEN** the repository tracks `GoogleService-Info.plist`
- **THEN** the `API_KEY` value is expected to be restricted in Google Cloud to the iOS bundle ID `com.mlapps.calmsounds` at minimum

#### Scenario: Android google-services key has an app restriction

- **WHEN** the repository tracks `google-services.json`
- **THEN** the `api_key[0].current_key` value is expected to be restricted in Google Cloud to the Android package `com.mlapps.calmsounds` together with the app signing SHA-1 and SHA-256 certificate fingerprints
