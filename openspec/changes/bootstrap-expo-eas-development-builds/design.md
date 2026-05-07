## Context

The project is at Phase 1 and has not yet established the native foundation required for device-based Expo development. The roadmap and foundation plan require EAS Development Builds instead of Expo Go because the app needs background audio support, React Native Firebase native modules, and a custom dev client before any feature work can be trusted.

The main implementation surface spans multiple root-level configuration files rather than product code: Expo config, EAS build profiles, TypeScript and linting setup, pre-commit hooks, and env templates. This is a cross-cutting setup change that must be consistent across iOS, Android, and local developer workflow.

The planning set contains conflicting audio-library notes, but this change now resolves that inconsistency explicitly: Expo SDK 54 remains the target baseline, and `expo-av` is the chosen audio package for this bootstrap because `expo-audio` is not yet production-ready on that SDK line.

## Goals / Non-Goals

**Goals:**
- Produce a clean Expo scaffold that can be turned into an EAS Development Build with all required native plugins declared in config, including the Expo Router plugin baseline expected by later phases.
- Establish the three EAS build profiles needed for internal development, QA preview, and production release.
- Enforce the agreed quality baseline through TypeScript, Expo ESLint, Prettier, Husky, and lint-staged.
- Commit the shared environment template and workspace settings that later phases rely on.

**Non-Goals:**
- Implement audio playback behavior, caching, or timer logic.
- Initialize Firebase service modules or validate a live Firebase project connection.
- Create product UI, route placeholders, or Zustand stores beyond dependency installation.
- Execute cloud builds or complete real-device verification; those belong to later foundation plans.

## Decisions

### Use EAS Development Builds as the only supported dev runtime
The project will install and configure `expo-dev-client` and define a dedicated `development` profile in `eas.json`.

Rationale: Expo Go cannot host the native modules and Info.plist changes required by RNFB and background audio. Treating development builds as the default removes ambiguity before later phases add more native dependencies.

Alternative considered: Continue using Expo Go for early UI work.
Rejected because it would hide integration problems until much later and cannot represent the required native behavior.

### Use `expo-av` on Expo SDK 54 for the bootstrap audio baseline
The scaffold will install `expo-av` rather than `expo-audio` because the project is intentionally staying on Expo SDK 54 for stability, and the current planning research does not treat `expo-audio` as production-ready on that SDK line.

Rationale: This keeps the foundation aligned with the more conservative stack decision already documented in planning research and avoids bootstrapping the project on an audio package whose maturity is still in question for the chosen SDK.

Alternative considered: Use `expo-audio` immediately because it is the newer API.
Rejected because the current project baseline is Expo SDK 54, not the newer SDK line where `expo-audio` is expected to become the default path.

### Configure native app capabilities in `app.json` through config plugins
The Expo config will declare the Phase 1 identity and platform baseline in `app.json`: `name: "Calm Sounds"`, `slug: "calm-asmr-sounds"`, `version: "1.0.0"`, `orientation: "portrait"`, `userInterfaceStyle: "dark"`, `ios.supportsTablet: false`, `ios.bundleIdentifier: "com.calmsounds.app"`, `android.package: "com.calmsounds.app"`, `android.adaptiveIcon.foregroundImage: "./assets/images/adaptive-icon.png"`, `android.adaptiveIcon.backgroundColor: "#000000"`, plus the deep-linking scheme, the `expo-router` plugin, typed routes enabled through `experiments.typedRoutes`, `UIBackgroundModes: ["audio"]`, Firebase service file paths, all RNFB plugins, `expo-build-properties` with `useFrameworks: static`, and the planned extra Podfile patch plugin needed for RNFB iOS compatibility on Expo SDK 54.

Rationale: Phase 1 requires native behavior to be reproducible from configuration alone, without manual ios/android edits. Using config plugins keeps the project aligned with Expo-managed EAS workflows, preserves the routing baseline expected by later phases, and the extra Podfile patch closes the known RNFB iOS build gap that `useFrameworks: static` does not solve by itself.

Alternative considered: Defer some plugin declarations until the related feature phase.
Rejected because missing native declarations cannot be delivered safely via OTA and would undermine the foundation phase gate.

### Keep developer tooling strict enough to block low-quality commits, but not fully strict in TypeScript
The project will use `strict: false`, `strictNullChecks: true`, `noImplicitAny: true`, and the `@/*` path alias to `src/*`, while keeping the agreed Expo lint defaults with Prettier integrated into both editor and pre-commit workflows.

Rationale: The planning docs explicitly call for moderate strictness rather than full `strict: true`. This captures the most important null-safety baseline, keeps implicit-any usage from spreading in the initial scaffold, and standardizes the import path pattern later phases already expect.

Alternative considered: Enable full strict TypeScript or defer lint-staged until product code exists.
Rejected because full strictness exceeds the stated decision, and delaying commit-time guardrails would make later cleanup more expensive.

### Preserve the exact Phase 1 package and formatting guardrails
The scaffold will expose `prepare: "husky"`, `lint: "expo lint"`, and `lint:fix: "expo lint --fix"` scripts in `package.json`, configure `lint-staged` so staged `*.ts` and `*.tsx` files run `eslint --max-warnings=0 --fix` and `prettier --write`, and store the agreed `.prettierrc` fields (`semi`, `singleQuote`, `trailingComma`, `printWidth`, `tabWidth`, `bracketSameLine`).

Rationale: The remaining foundation plans assume not just that linting and formatting exist, but that commits are blocked on warnings for staged TypeScript files and that formatting remains stable across contributors and future generated scaffolds.

Alternative considered: Leave script names, staged-file commands, and formatting choices loosely defined.
Rejected because that would allow materially different scaffolds to satisfy the change while drifting from the locked Phase 1 implementation contract.

### Preserve the exact Phase 1 config-file structure where it is already settled
The scaffold will keep `eas.json` aligned with the agreed `cli.version`, `cli.appVersionSource`, per-profile `env.APP_VARIANT`, `production.autoIncrement`, and `submit.production` entries; `tsconfig.json` will extend `expo/tsconfig.base` and include Expo's typed environment files; `eslint.config.js` will use the flat Expo config plus Prettier integration and ignore `dist/`, `node_modules/`, and `.expo/`; `.vscode/settings.json` will set Prettier as the default formatter and enable explicit ESLint fixes on save; and `.gitignore` will include `.env`, `*.local`, `.expo/`, `node_modules/`, and `dist/` while leaving Firebase native config files available to commit later.

Rationale: These file shapes are not incidental formatting choices. Later plans and verification steps already assume this exact baseline, so leaving them underspecified would recreate the same drift this change is meant to prevent.

Alternative considered: Specify only high-level outcomes and let the implementation choose the exact file structures.
Rejected because several later plan checks are written against these concrete fields and paths, so a looser contract would still create reconciliation work before Phase 1 could be applied confidently.

### Commit a full `.env.example` now and keep real values local
The repository will document all 13 `EXPO_PUBLIC_` keys already known across Firebase, RevenueCat, and Unity Ads, while `.env` remains gitignored.

Rationale: Later phases depend on a stable env key contract even before all services are activated. Committing the template early reduces naming drift across phases.

Alternative considered: Add only the Firebase keys for Phase 1.
Rejected because the project planning explicitly wants the cross-phase env template established in the foundation work.

### Keep Firebase native config files as a later human checkpoint
The Expo config will reference `google-services.json` and `GoogleService-Info.plist`, but this bootstrap change does not assume those files already exist in the repository. Supplying them remains a blocking human checkpoint in the next foundation plan.

Rationale: The files come from Firebase Console project setup and cannot be generated safely inside this change. Keeping that boundary explicit avoids pretending the repository is already ready for RNFB runtime verification.

Alternative considered: Treat the presence of the native Firebase files as part of this bootstrap change.
Rejected because planning already defers those artifacts to the next foundation checkpoint, and this change is about preparing the scaffold and config surface rather than completing Firebase project provisioning.

## Risks / Trade-offs

- [RNFB iOS build fragility] -> Mitigation: declare `expo-build-properties` with `useFrameworks: static`, include the extra Podfile patch plugin from the start, and keep device-build verification as a required later checkpoint.
- [Commit-time tooling can slow first-time contributor setup] -> Mitigation: keep the lint rules close to Expo defaults and limit the hook to staged files through `lint-staged`.
- [Env template may imply runtime use of Firebase web config] -> Mitigation: document in the template and supporting notes that RNFB uses native config files on mobile and the public env keys are retained for consistency.
- [Firebase native service files are not yet available] -> Mitigation: keep their config references in place but defer the actual files to the next foundation plan's human checkpoint.

## Migration Plan

1. Install the native and tooling dependencies into the Expo scaffold, including `expo-router` if the baseline scaffold does not already provide it (Creating the scaffold if it doesn't exist yet).
2. Replace or update root configuration files (`app.json`, `eas.json`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `.gitignore`, `.env.example`, `.vscode/settings.json`) and align `package.json` scripts and `lint-staged` entries with the Phase 1 contract.
3. Initialize Husky and write the `pre-commit` hook to run `lint-staged`.
4. Verify the scaffold locally with `npx tsc --noEmit` and `npx eslint .`.
5. Leave Firebase native file placement, EAS build execution, and real-device smoke testing to the later foundation checkpoint plan.

Rollback strategy: revert the configuration file changes and dependency additions if the scaffold becomes unbuildable before later plans layer product code on top.

## Resolved Questions

- Expo SDK 54 remains the target baseline for this bootstrap, and `expo-av` is the chosen audio package because `expo-audio` is not yet treated as production-ready on that SDK line.
- RNFB on the chosen SDK is expected to require an extra Podfile patch plugin beyond `useFrameworks: static`, so that patch is part of the planned configuration surface.
- The Firebase native config files are not assumed to be present yet; supplying them remains a human checkpoint in the next foundation plan.
