## ADDED Requirements

### Requirement: TypeScript uses the agreed moderate strictness baseline
The project SHALL configure TypeScript with `strictNullChecks: true` without requiring full `strict: true`, and the scaffold MUST compile with `npx tsc --noEmit` after the foundation changes are applied.

#### Scenario: TypeScript baseline matches the planning decision
- **WHEN** a developer inspects `tsconfig.json` and runs `npx tsc --noEmit`
- **THEN** `strictNullChecks` is enabled and the command exits successfully on the scaffold

### Requirement: Linting and formatting are enforced before commit
The project SHALL expose Expo lint scripts, integrate Prettier with ESLint, and run `lint-staged` from a Husky `pre-commit` hook so staged TypeScript, JSON, and Markdown files are validated or formatted before commit completes.

#### Scenario: Pre-commit checks run on staged files
- **WHEN** a developer stages a file and creates a commit
- **THEN** `.husky/pre-commit` runs `npx lint-staged` and the configured staged-file tasks execute before the commit is accepted

#### Scenario: Formatting violations block a commit until fixed
- **WHEN** a staged TypeScript file contains a Prettier violation
- **THEN** the pre-commit workflow fails and prevents the commit from succeeding until the staged file is corrected

### Requirement: Workspace formatting defaults are committed
The project SHALL commit workspace editor settings that enable format-on-save and ESLint fixes for TypeScript files.

#### Scenario: VS Code settings support the agreed workflow
- **WHEN** a developer inspects `.vscode/settings.json`
- **THEN** the file enables `editor.formatOnSave`, uses the Prettier formatter by default, and configures ESLint code actions on save
