## ADDED Requirements

### Requirement: The repository documents all planned public environment keys

The project SHALL commit a `.env.example` file that lists all 13 known `EXPO_PUBLIC_` keys required across Firebase, RevenueCat, and Unity Ads with empty values.

#### Scenario: The committed env template covers every planned key

- **WHEN** a developer inspects `.env.example`
- **THEN** the file contains the seven Firebase keys, two RevenueCat keys, and four Unity Ads keys with blank assignments

### Requirement: Real local environment values remain uncommitted

The project SHALL keep `.env` gitignored while preserving `.env.example` as a committed template, and Firebase initialization work MUST require the human to populate local `.env` with the seven `EXPO_PUBLIC_FIREBASE_*` values from Firebase Console before implementation continues.

#### Scenario: Local secret values are excluded from version control

- **WHEN** a developer inspects `.gitignore`
- **THEN** `.env`, `*.local`, `.expo/`, `node_modules/`, and `dist/` are ignored, `.env.example` remains available as the committed reference template, and `google-services.json` and `GoogleService-Info.plist` are not ignored

#### Scenario: Apply flow halts when Firebase env values are not populated locally

- **WHEN** implementation begins and local `.env` is missing or does not contain all seven `EXPO_PUBLIC_FIREBASE_*` values
- **THEN** the work MUST stop immediately and notify the user that the Firebase local environment checkpoint is incomplete
