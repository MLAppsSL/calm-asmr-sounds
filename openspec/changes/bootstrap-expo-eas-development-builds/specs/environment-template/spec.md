## ADDED Requirements

### Requirement: The repository documents all planned public environment keys
The project SHALL commit a `.env.example` file that lists all 13 known `EXPO_PUBLIC_` keys required across Firebase, RevenueCat, and Unity Ads with empty values.

#### Scenario: The committed env template covers every planned key
- **WHEN** a developer inspects `.env.example`
- **THEN** the file contains the seven Firebase keys, two RevenueCat keys, and four Unity Ads keys with blank assignments

### Requirement: Real local environment values remain uncommitted
The project SHALL keep `.env` gitignored while preserving `.env.example` as a committed template.

#### Scenario: Local secret values are excluded from version control
- **WHEN** a developer inspects `.gitignore`
- **THEN** `.env` is ignored and `.env.example` remains available as the committed reference template
