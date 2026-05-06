## ADDED Requirements

### Requirement: Development build dependencies are present
The project SHALL include the Expo and native module dependencies required to create an EAS Development Build with React Native Firebase, background audio support, AsyncStorage-backed auth persistence, and Zustand state management, using `expo-av` on Expo SDK 54 because `expo-audio` is not yet production-ready for that SDK line.

#### Scenario: Native dependency baseline is installed
- **WHEN** a developer reviews `package.json` after applying this change
- **THEN** the dependency graph includes `expo-dev-client`, `expo-build-properties`, `expo-av`, `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`, `@react-native-firebase/storage`, `@react-native-firebase/analytics`, `@react-native-async-storage/async-storage`, and `zustand`

### Requirement: Expo app config declares the required native capabilities
The project SHALL define its native build configuration in `app.json`, including a deep-linking scheme, New Architecture enabled, iOS background audio support, Firebase native service file references, all required React Native Firebase config plugins, `expo-build-properties` with static iOS frameworks, and any needed Expo-managed configuration for `expo-av`. The implementation SHALL also include the planned iOS Podfile patch plugin beyond `useFrameworks: static` so RNFB remains buildable on Expo SDK 54.

#### Scenario: iOS and Android native config is declared from Expo config
- **WHEN** a developer inspects `app.json`
- **THEN** the file includes `scheme: "calm-sounds"`, `newArchEnabled: true`, `ios.infoPlist.UIBackgroundModes: ["audio"]`, `ios.googleServicesFile`, `android.googleServicesFile`, the five RNFB plugins, `expo-build-properties` configured with `ios.useFrameworks: "static"`, and the planned Podfile patch plugin configuration required for RNFB iOS builds on Expo SDK 54

### Requirement: Firebase native config files remain a planned follow-up checkpoint
This bootstrap change SHALL reference the Firebase native service files from Expo config, but it SHALL NOT require those files to already exist in the repository because obtaining them remains a human checkpoint in the next foundation plan.

#### Scenario: Bootstrap config can be reviewed before Firebase files are supplied
- **WHEN** a developer reviews the change artifacts for this bootstrap work
- **THEN** they can see that `ios.googleServicesFile` and `android.googleServicesFile` are part of the required config, and they can also see that adding `GoogleService-Info.plist` and `google-services.json` remains deferred to the next foundation plan's human checkpoint

### Requirement: EAS build profiles support development and release workflows
The project SHALL define `development`, `preview`, and `production` build profiles in `eas.json`, and the development profile MUST produce an internal development client build.

#### Scenario: Build profiles exist for all planned workflows
- **WHEN** a developer inspects `eas.json`
- **THEN** the file defines `development`, `preview`, and `production` profiles, and the `development` profile sets `developmentClient: true` and `distribution: "internal"`
