## MODIFIED Requirements

### Requirement: Firebase native config files remain a planned follow-up checkpoint

The project SHALL keep `ios.googleServicesFile` and `android.googleServicesFile` configured in `app.json`, and any change that initializes RNFB services MUST stop and notify the user unless real `GoogleService-Info.plist` and `google-services.json` files have already been placed at the project root through the required human checkpoint.

#### Scenario: Bootstrap config can be reviewed before Firebase files are supplied

- **WHEN** a developer reviews the change artifacts for this Firebase follow-up work
- **THEN** they can see that `ios.googleServicesFile` and `android.googleServicesFile` remain required config links, and that implementation cannot continue until the real native files are supplied by the human checkpoint

#### Scenario: Apply flow halts when native Firebase files are missing

- **WHEN** implementation begins and either `GoogleService-Info.plist` or `google-services.json` is missing from the project root
- **THEN** the work MUST stop immediately and notify the user that the Firebase checkpoint is incomplete
