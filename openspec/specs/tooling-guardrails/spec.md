## ADDED Requirements

### Requirement: TypeScript uses the agreed moderate strictness baseline

The project SHALL configure TypeScript with `extends: "expo/tsconfig.base"`, `strict: false`, `strictNullChecks: true`, `noImplicitAny: true`, and an `@/*` path alias that maps to `src/*`, and it SHALL include `**/*.ts`, `**/*.tsx`, `.expo/types/**/*.d.ts`, and `expo-env.d.ts` in the scaffold include list, without requiring full `strict: true`, and the scaffold MUST compile with `npx tsc --noEmit` after the foundation changes are applied.

#### Scenario: TypeScript baseline matches the planning decision

- **WHEN** a developer inspects `tsconfig.json` and runs `npx tsc --noEmit`
- **THEN** `extends` is `expo/tsconfig.base`, `strict` is `false`, `strictNullChecks` is enabled, `noImplicitAny` is enabled, `@/*` maps to `src/*`, the include list contains `**/*.ts`, `**/*.tsx`, `.expo/types/**/*.d.ts`, and `expo-env.d.ts`, and the command exits successfully on the scaffold

### Requirement: Package scripts and staged-file checks match the Phase 1 contract

The project SHALL expose `prepare: "husky"`, `lint: "expo lint"`, and `lint:fix: "expo lint --fix"` scripts in `package.json`, and it SHALL configure top-level `lint-staged` entries so staged `*.ts` and `*.tsx` files run `eslint --max-warnings=0 --fix` followed by `prettier --write`, while staged `*.json` and `*.md` files run `prettier --write`.

#### Scenario: Package scripts support the expected workflow

- **WHEN** a developer inspects `package.json`
- **THEN** the `scripts` section includes `prepare: "husky"`, `lint: "expo lint"`, and `lint:fix: "expo lint --fix"`

#### Scenario: Lint-staged blocks warnings on staged TypeScript files

- **WHEN** a developer inspects the top-level `lint-staged` configuration in `package.json`
- **THEN** staged `*.ts` and `*.tsx` files are checked with `eslint --max-warnings=0 --fix` and `prettier --write`, and staged `*.json` and `*.md` files run `prettier --write`

### Requirement: Linting and formatting are enforced before commit

The project SHALL expose Expo lint scripts, integrate Prettier with ESLint, and run `lint-staged` from a Husky `pre-commit` hook so staged TypeScript, JSON, and Markdown files are validated or formatted before commit completes.

#### Scenario: Pre-commit checks run on staged files

- **WHEN** a developer stages a file and creates a commit
- **THEN** `.husky/pre-commit` runs `npx lint-staged` and the configured staged-file tasks execute before the commit is accepted

#### Scenario: Formatting violations block a commit until fixed

- **WHEN** a staged TypeScript file contains a Prettier violation
- **THEN** the pre-commit workflow fails and prevents the commit from succeeding until the staged file is corrected

### Requirement: Prettier settings are committed explicitly

The project SHALL commit a `.prettierrc` file that sets `semi: true`, `singleQuote: true`, `trailingComma: "all"`, `printWidth: 100`, `tabWidth: 2`, and `bracketSameLine: false`.

#### Scenario: Formatting baseline matches the agreed Phase 1 file

- **WHEN** a developer inspects `.prettierrc`
- **THEN** the file contains the committed formatting keys and values required by the Phase 1 contract

### Requirement: ESLint uses the agreed flat-config integration

The project SHALL configure `eslint.config.js` with `eslint-config-expo/flat`, `eslint-config-prettier`, and `eslint-plugin-prettier`, and it SHALL ignore `dist/`, `node_modules/`, and `.expo/`.

#### Scenario: ESLint config matches the agreed file structure

- **WHEN** a developer inspects `eslint.config.js`
- **THEN** the file composes the Expo flat config with Prettier integration and ignores `dist/`, `node_modules/`, and `.expo/`

### Requirement: Workspace formatting defaults are committed

The project SHALL commit workspace editor settings that enable format-on-save and ESLint fixes for TypeScript files.

#### Scenario: VS Code settings support the agreed workflow

- **WHEN** a developer inspects `.vscode/settings.json`
- **THEN** the file enables `editor.formatOnSave`, uses `esbenp.prettier-vscode` as the default formatter, configures `source.fixAll.eslint: "explicit"`, and sets matching formatter defaults for TypeScript and TypeScript React files
