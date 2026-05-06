## 1. Dependency Setup

- [ ] 1.1 Install the Expo native build packages: `expo-dev-client`, `expo-build-properties`, `expo-audio`, and `@react-native-async-storage/async-storage`
- [ ] 1.2 Install the React Native Firebase packages: `@react-native-firebase/app`, `auth`, `firestore`, `storage`, and `analytics`
- [ ] 1.3 Install `zustand` and the developer tooling packages: `eslint-config-expo`, `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`, `husky`, and `lint-staged`
- [ ] 1.4 Update `package.json` scripts and top-level `lint-staged` configuration to match the foundation requirements

## 2. Native Build Configuration

- [ ] 2.1 Replace `app.json` with the required Expo config for deep linking, background audio, RNFB plugins, `expo-build-properties`, and `expo-audio`
- [ ] 2.2 Create `eas.json` with `development`, `preview`, and `production` profiles, including the internal development client configuration
- [ ] 2.3 Confirm `.gitignore` keeps local `.env` values out of version control while preserving committed templates and native config files

## 3. Tooling And Workspace Guardrails

- [ ] 3.1 Update `tsconfig.json` to the agreed moderate strictness baseline with `strictNullChecks: true`
- [ ] 3.2 Configure `eslint.config.js` and `.prettierrc` so Expo linting and Prettier work together without rule conflicts
- [ ] 3.3 Initialize Husky and write `.husky/pre-commit` to run `npx lint-staged`
- [ ] 3.4 Create `.env.example` with all 13 planned `EXPO_PUBLIC_` keys grouped by service
- [ ] 3.5 Create `.vscode/settings.json` with the committed format-on-save and ESLint-on-save defaults

## 4. Verification

- [ ] 4.1 Run `npx tsc --noEmit` and fix any scaffold typing issues introduced by the configuration changes
- [ ] 4.2 Run `npx eslint .` and fix any lint or Prettier integration issues in the scaffold
- [ ] 4.3 Validate that the resulting files satisfy the foundation must-haves before moving to the next Phase 1 plan
