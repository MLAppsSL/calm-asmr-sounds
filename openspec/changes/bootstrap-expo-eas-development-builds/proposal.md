## Why

Phase 1 cannot proceed on Expo Go because the app depends on native capabilities that must be present in an EAS Development Build from the start: background audio, React Native Firebase modules, and the custom dev client. This change establishes the native build configuration and developer guardrails that every later phase depends on.

## What Changes

- Add the Expo native build dependencies required for development builds, including `expo-dev-client`, React Native Firebase modules, `expo-build-properties`, `expo-audio`, AsyncStorage, and Zustand.
- Configure `app.json` for EAS development builds with deep linking, background audio capability, Firebase native config files, and the required config plugins for RNFB and Expo audio.
- Create `eas.json` with `development`, `preview`, and `production` profiles so the project can produce installable internal and release builds.
- Lock in the baseline TypeScript, ESLint, Prettier, Husky, and lint-staged setup so formatting and lint failures are blocked before commit.
- Add the committed developer workspace files and environment template needed by later phases, including `.vscode/settings.json`, `.env.example`, and `.gitignore` updates for local env files.

## Capabilities

### New Capabilities
- `native-build-foundation`: The project can produce EAS development and release builds with the native Expo and Firebase configuration required for background audio and future device testing.
- `tooling-guardrails`: The project enforces the agreed TypeScript, linting, formatting, and pre-commit checks for the Expo scaffold.
- `environment-template`: The project provides a committed `.env.example` template and gitignore behavior for all public configuration keys used across planned phases.

### Modified Capabilities
None.

## Impact

- Affected files: `package.json`, `app.json`, `eas.json`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `.gitignore`, `.env.example`, `.vscode/settings.json`, `.husky/pre-commit`
- Affected systems: Expo config plugin pipeline, EAS Build profiles, RNFB native integration, local developer workflow, commit-time quality gates
- New dependencies: `expo-dev-client`, `expo-build-properties`, `expo-audio`, `@react-native-firebase/*`, `@react-native-async-storage/async-storage`, `zustand`, `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`, `husky`, `lint-staged`
