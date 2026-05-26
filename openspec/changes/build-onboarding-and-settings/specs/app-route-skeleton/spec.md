## MODIFIED Requirements

### Requirement: Root startup can hold splash visibility while shell gating resolves

The root layout SHALL allow the shell startup flow to prevent the splash screen from auto-hiding until both persisted UI-store hydration and startup gating for the Phase 3 shell have resolved, and that startup gating SHALL be able to route users into the onboarding group or tabs group based on the persisted onboarding completion state.

#### Scenario: Splash gating is configured from the root layout module

- **WHEN** a developer reviews the root layout for the Phase 3 shell
- **THEN** the startup flow includes root-level splash-screen hold behavior that can support onboarding or shell gating without flashing incomplete UI

#### Scenario: Startup gating can route into onboarding or tabs before the shell renders

- **WHEN** the root layout finishes evaluating first-launch shell state
- **THEN** it can direct the user into `/(onboarding)` or `/(tabs)` before the shell is revealed
- **AND** the initial render does not briefly show the wrong route group first

#### Scenario: Splash stays visible until hydration and onboarding routing are both ready

- **WHEN** the app starts and persisted shell state is still hydrating or the onboarding route decision is still unresolved
- **THEN** the splash screen remains visible
- **AND** the shell is not revealed until both steps have completed

#### Scenario: Startup fallback defaults to tabs on onboarding gate failure

- **WHEN** the startup flow cannot read or resolve the persisted onboarding state
- **THEN** the root layout falls back to the tabs shell
- **AND** the user is not left stuck in onboarding because of the startup failure
