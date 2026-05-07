## Why

Phase 1 cannot proceed on Expo Go because the app depends on native capabilities that must be present in an EAS Development Build from the start: background audio, React Native Firebase modules, and the custom dev client. This change establishes the native build configuration and developer guardrails that every later phase depends on.

## What Changes

- Add the Expo native build dependencies required for development builds, including `expo-dev-client`, `expo-router`, React Native Firebase modules, `expo-build-properties`, `expo-av`, AsyncStorage, and Zustand.
- Configure `app.json` for EAS development builds with the agreed Phase 1 app identity and platform fields, deep linking, Expo Router plugin support, typed routes enabled, background audio capability, Firebase native config file references, and the required config plugins for RNFB, `expo-av`, and the planned iOS Podfile patch.
- Create `eas.json` with the exact Phase 1 `cli`, `build`, and `submit` structure for `development`, `preview`, and `production` profiles so the project can produce installable internal and release builds.
- Lock in the baseline TypeScript, ESLint, Prettier, Husky, and lint-staged setup so formatting and lint failures are blocked before commit, including the exact `package.json` scripts, staged-file commands, `tsconfig` structure, ESLint flat-config composition, and VS Code workspace settings agreed in Phase 1.
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
- New dependencies: `expo-dev-client`, `expo-router`, `expo-build-properties`, `expo-av`, `@react-native-firebase/*`, `@react-native-async-storage/async-storage`, `zustand`, `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`, `husky`, `lint-staged`
