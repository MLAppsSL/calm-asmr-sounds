## 1. Dependency Setup

- [x] 1.1 Install the Expo native build packages: `expo-dev-client`, `expo-router`, `expo-build-properties`, `expo-av`, and `@react-native-async-storage/async-storage`
- [x] 1.2 Install the React Native Firebase packages: `@react-native-firebase/app`, `auth`, `firestore`, `storage`, and `analytics`
- [x] 1.3 Install `zustand` and the developer tooling packages: `eslint-config-expo`, `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`, `husky`, and `lint-staged`
- [x] 1.4 Update `package.json` scripts and top-level `lint-staged` configuration to match the foundation requirements: `prepare: "husky"`, `lint: "expo lint"`, `lint:fix: "expo lint --fix"`, `eslint --max-warnings=0 --fix` for staged `*.ts` and `*.tsx`, and `prettier --write` for staged TypeScript, JSON, and Markdown files

## 2. Native Build Configuration

- [x] 2.1 Replace `app.json` with the required Expo config for `name`, `slug`, `version`, `orientation`, `userInterfaceStyle`, `ios.supportsTablet`, `ios.bundleIdentifier`, `android.package`, `android.adaptiveIcon`, deep linking, the `expo-router` plugin, `experiments.typedRoutes`, background audio, the RNFB config plugins exposed by the installed packages (`@react-native-firebase/app` and `@react-native-firebase/auth`), `expo-build-properties`, and the planned iOS Podfile patch plugin
- [x] 2.2 Create `eas.json` with the agreed `cli.version`, `cli.appVersionSource`, `development`, `preview`, and `production` profiles, per-profile `env.APP_VARIANT`, `production.autoIncrement`, and `submit.production`, including the internal development client configuration
- [x] 2.3 Confirm `.gitignore` includes `.env`, `*.local`, `.expo/`, `node_modules/`, and `dist/`, while preserving committed templates and leaving Firebase native config files available to be committed later after the human checkpoint is completed

## 3. Tooling And Workspace Guardrails

- [x] 3.1 Update `tsconfig.json` to the agreed moderate strictness baseline with `extends: "expo/tsconfig.base"`, `strict: false`, `strictNullChecks: true`, `noImplicitAny: true`, the `@/*` -> `src/*` path alias, and the include entries for `**/*.ts`, `**/*.tsx`, `.expo/types/**/*.d.ts`, and `expo-env.d.ts`
- [x] 3.2 Configure `eslint.config.js` and `.prettierrc` so Expo linting and Prettier work together without rule conflicts, using `eslint-config-expo/flat`, `eslint-config-prettier`, `eslint-plugin-prettier`, and ignores for `dist/`, `node_modules/`, and `.expo/`, with the committed `.prettierrc` values for `semi`, `singleQuote`, `trailingComma`, `printWidth`, `tabWidth`, and `bracketSameLine`
- [x] 3.3 Initialize Husky and write `.husky/pre-commit` to run `npx lint-staged`
- [x] 3.4 Create `.env.example` with all 13 planned `EXPO_PUBLIC_` keys grouped by service
- [x] 3.5 Create `.vscode/settings.json` with `editor.formatOnSave`, `editor.defaultFormatter: "esbenp.prettier-vscode"`, `source.fixAll.eslint: "explicit"`, and matching TypeScript and TypeScript React formatter defaults

## 4. Verification

- [x] 4.1 Run `npx tsc --noEmit` and fix any scaffold typing issues introduced by the configuration changes
- [x] 4.2 Run `npx eslint .` and fix any lint or Prettier integration issues in the scaffold
- [x] 4.3 Validate that the resulting files satisfy the foundation must-haves before moving to the next Phase 1 plan
