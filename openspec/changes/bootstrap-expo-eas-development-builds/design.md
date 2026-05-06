## Context

The project is at Phase 1 and has not yet established the native foundation required for device-based Expo development. The roadmap and foundation plan require EAS Development Builds instead of Expo Go because the app needs background audio support, React Native Firebase native modules, and a custom dev client before any feature work can be trusted.

The main implementation surface spans multiple root-level configuration files rather than product code: Expo config, EAS build profiles, TypeScript and linting setup, pre-commit hooks, and env templates. This is a cross-cutting setup change that must be consistent across iOS, Android, and local developer workflow.

There is one planning inconsistency to resolve in implementation detail: `01-01-PLAN.md` and the requested bootstrap scope use `expo-audio`, while `.planning/STATE.md` still contains an older note favoring `expo-av`. For this change, the Phase 1 plan is treated as the source of truth because it defines the current deliverables and must-have artifacts.

## Goals / Non-Goals

**Goals:**
- Produce a clean Expo scaffold that can be turned into an EAS Development Build with all required native plugins declared in config.
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

### Configure native app capabilities in `app.json` through config plugins
The Expo config will declare deep-linking scheme, `UIBackgroundModes: ["audio"]`, Firebase service file paths, all RNFB plugins, `expo-build-properties` with `useFrameworks: static`, and the `expo-audio` plugin with `microphonePermission: false`.

Rationale: Phase 1 requires native behavior to be reproducible from configuration alone, without manual ios/android edits. Using config plugins keeps the project aligned with Expo-managed EAS workflows.

Alternative considered: Defer some plugin declarations until the related feature phase.
Rejected because missing native declarations cannot be delivered safely via OTA and would undermine the foundation phase gate.

### Keep developer tooling strict enough to block low-quality commits, but not fully strict in TypeScript
The project will use `strictNullChecks: true` and the agreed Expo lint defaults with Prettier integrated into both editor and pre-commit workflows.

Rationale: The planning docs explicitly call for moderate strictness rather than full `strict: true`. This captures the most important null-safety baseline while keeping initial scaffold friction lower.

Alternative considered: Enable full strict TypeScript or defer lint-staged until product code exists.
Rejected because full strictness exceeds the stated decision, and delaying commit-time guardrails would make later cleanup more expensive.

### Commit a full `.env.example` now and keep real values local
The repository will document all 13 `EXPO_PUBLIC_` keys already known across Firebase, RevenueCat, and Unity Ads, while `.env` remains gitignored.

Rationale: Later phases depend on a stable env key contract even before all services are activated. Committing the template early reduces naming drift across phases.

Alternative considered: Add only the Firebase keys for Phase 1.
Rejected because the project planning explicitly wants the cross-phase env template established in the foundation work.

## Risks / Trade-offs

- [RNFB iOS build fragility] -> Mitigation: declare `expo-build-properties` with `useFrameworks: static` from the start and keep device-build verification as a required later checkpoint.
- [Commit-time tooling can slow first-time contributor setup] -> Mitigation: keep the lint rules close to Expo defaults and limit the hook to staged files through `lint-staged`.
- [Env template may imply runtime use of Firebase web config] -> Mitigation: document in the template and supporting notes that RNFB uses native config files on mobile and the public env keys are retained for consistency.

## Migration Plan

1. Install the native and tooling dependencies into the Expo scaffold (Creating the scaffold if it doesn't exist yet).
2. Replace or update root configuration files (`app.json`, `eas.json`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `.gitignore`, `.env.example`, `.vscode/settings.json`).
3. Initialize Husky and write the `pre-commit` hook to run `lint-staged`.
4. Verify the scaffold locally with `npx tsc --noEmit` and `npx eslint .`.
5. Leave EAS build execution and real-device smoke testing to the later foundation checkpoint plan.

Rollback strategy: revert the configuration file changes and dependency additions if the scaffold becomes unbuildable before later plans layer product code on top.

## Open Questions

- Does the current Expo SDK version in the repo still align with the Phase 1 research assumptions, especially around the chosen `expo-audio` plugin version?
- Will RNFB on the chosen SDK require any extra Podfile patch plugin beyond `useFrameworks: static`, or is the planned config sufficient in this scaffold?
- Are the Firebase native config files already present in the repository, or will that remain a human checkpoint in the next foundation plan?
