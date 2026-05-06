## ADDED Requirements

### Requirement: Development build dependencies are present
The project SHALL include the Expo and native module dependencies required to create an EAS Development Build with React Native Firebase, background audio support, AsyncStorage-backed auth persistence, and Zustand state management.

#### Scenario: Native dependency baseline is installed
- **WHEN** a developer reviews `package.json` after applying this change
- **THEN** the dependency graph includes `expo-dev-client`, `expo-build-properties`, `expo-audio`, `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`, `@react-native-firebase/storage`, `@react-native-firebase/analytics`, `@react-native-async-storage/async-storage`, and `zustand`

### Requirement: Expo app config declares the required native capabilities
The project SHALL define its native build configuration in `app.json`, including a deep-linking scheme, New Architecture enabled, iOS background audio support, Firebase native service file references, all required React Native Firebase config plugins, `expo-build-properties` with static iOS frameworks, and the `expo-audio` plugin with microphone access disabled.

#### Scenario: iOS and Android native config is declared from Expo config
- **WHEN** a developer inspects `app.json`
- **THEN** the file includes `scheme: "calm-sounds"`, `newArchEnabled: true`, `ios.infoPlist.UIBackgroundModes: ["audio"]`, `ios.googleServicesFile`, `android.googleServicesFile`, the five RNFB plugins, `expo-build-properties` configured with `ios.useFrameworks: "static"`, and `expo-audio` configured with `microphonePermission: false`

### Requirement: EAS build profiles support development and release workflows
The project SHALL define `development`, `preview`, and `production` build profiles in `eas.json`, and the development profile MUST produce an internal development client build.

#### Scenario: Build profiles exist for all planned workflows
- **WHEN** a developer inspects `eas.json`
- **THEN** the file defines `development`, `preview`, and `production` profiles, and the `development` profile sets `developmentClient: true` and `distribution: "internal"`
