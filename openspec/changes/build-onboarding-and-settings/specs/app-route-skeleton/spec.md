## MODIFIED Requirements

### Requirement: Root startup can hold splash visibility while shell gating resolves

The root layout SHALL allow the shell startup flow to prevent the splash screen from auto-hiding until startup gating for the Phase 3 shell has had a chance to resolve, and that startup gating SHALL be able to route users into the onboarding group or tabs group based on the onboarding completion state.

#### Scenario: Splash gating is configured from the root layout module

- **WHEN** a developer reviews the root layout for the Phase 3 shell
- **THEN** the startup flow includes root-level splash-screen hold behavior that can support onboarding or shell gating without flashing incomplete UI

#### Scenario: Startup gating can route into onboarding or tabs before the shell renders

- **WHEN** the root layout finishes evaluating first-launch shell state
- **THEN** it can direct the user into `/(onboarding)` or `/(tabs)` before the shell is revealed
- **AND** the initial render does not briefly show the wrong route group first
