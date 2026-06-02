## ADDED Requirements

### Requirement: Local favorites adapter exposes the migration-safe local favorites interface

The project SHALL provide `src/favorites/data/services/LocalFavoritesAdapter.ts` exporting a `LocalFavoritesAdapter` implementation that exposes the local favorites read and write interface needed by later favorites migration work.

#### Scenario: Adapter exports the expected local interface

- **WHEN** a developer imports the local favorites adapter module
- **THEN** the module exports `LocalFavoritesAdapter`
- **AND** the adapter exposes favorites reads, directional writes, and whole-list replacement behavior needed for later migration flows

#### Scenario: Adapter lives inside the favorites slice

- **WHEN** a developer reviews the adapter implementation path
- **THEN** it lives under `src/favorites/data/services/LocalFavoritesAdapter.ts`
- **AND** favorites-specific service code is not stored under `shared/`

#### Scenario: No shared compatibility re-export is required

- **WHEN** a developer updates favorites-specific imports for the new slice
- **THEN** callers import the adapter from the favorites slice directly
- **AND** the architecture does not depend on a temporary `shared/` compatibility layer for favorites services

### Requirement: Local favorites adapter reads and writes through the shared favorites store

The local favorites adapter SHALL treat `useFavoritesStore` as the source of truth and SHALL not implement a separate persistence path.

#### Scenario: Adapter uses the shared store for reads and writes

- **WHEN** the adapter retrieves or mutates favorites
- **THEN** it reads from and writes through `useFavoritesStore.getState()`
- **AND** it relies on the store to own persistence and ordering rules

#### Scenario: Adapter does not bypass the store with direct persistence access

- **WHEN** a developer reviews the local favorites adapter implementation
- **THEN** the adapter does not import or call AsyncStorage directly

### Requirement: Local favorites adapter matches the future async migration boundary

The local favorites adapter SHALL keep local favorites operations compatible with a future cloud adapter surface so higher-level migration logic can switch implementations without changing its control flow.

#### Scenario: Reads are promise-based

- **WHEN** a caller requests all favorites or checks whether an item is favorited through the adapter
- **THEN** those read operations return Promises even if the local implementation completes from in-memory state

#### Scenario: Directional writes are promise-based

- **WHEN** a caller adds, removes, or replaces favorites through the adapter
- **THEN** those write operations return `Promise<void>` even if the local implementation completes synchronously

#### Scenario: Adapter returns favorites in migration-safe order

- **WHEN** a caller requests all local favorites through the adapter
- **THEN** it receives the favorites ordered by most recently added first
- **AND** that order reflects the shared favorites store sorting contract
