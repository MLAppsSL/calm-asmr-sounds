## MODIFIED Requirements

### Requirement: Firebase native config files are a required committed checkpoint

The project SHALL keep `ios.googleServicesFile` and `android.googleServicesFile` configured in `app.json`, and any change that initializes RNFB services MUST stop and notify the user unless real `GoogleService-Info.plist` and `google-services.json` files have already been placed at the project root and tracked in git through the required human checkpoint. Those native files MUST include a non-empty `project_info.project_id` in `google-services.json`, a non-empty `PROJECT_ID` in `GoogleService-Info.plist`, and any other Firebase-required values needed for the app's native initialization with correct real values from Firebase Console.

#### Scenario: Bootstrap config can be reviewed before Firebase files are supplied

- **WHEN** a developer reviews the change artifacts for this Firebase follow-up work
- **THEN** they can see that `ios.googleServicesFile` and `android.googleServicesFile` remain required config links, and that implementation cannot continue until the real native files are supplied by the human checkpoint and kept as tracked repository files

#### Scenario: Apply flow halts when native Firebase files are missing

- **WHEN** implementation begins and either `GoogleService-Info.plist` or `google-services.json` is missing from the project root
- **THEN** the work MUST stop immediately and notify the user that the Firebase checkpoint is incomplete

#### Scenario: Apply flow halts when native Firebase files are incomplete

- **WHEN** implementation begins and either native Firebase config file is present but missing a non-empty project ID or any other Firebase-required value needed for native initialization
- **THEN** the work MUST stop immediately and notify the user that the Firebase checkpoint is incomplete
