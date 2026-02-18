# Phase 1: Foundation - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the EAS Development Build infrastructure with native background audio configured, Firebase connected, TypeScript tooling set up, and Zustand + Expo Router scaffolding in place — before any product code is written. This phase is a non-negotiable precondition; all other phases depend on it.

</domain>

<decisions>
## Implementation Decisions

### Firebase project structure
- One Firebase project for now (not separate dev/prod projects)
- google-services.json and GoogleService-Info.plist committed directly to the repo (not gitignored)
- Firebase web SDK config stored in .env file using EXPO_PUBLIC_ prefix
- All four Firebase services initialized in Phase 1: Auth, Firestore, Storage, Analytics

### Environment config approach
- Full .env.example defined in Phase 1 with all known keys across all services (Firebase, RevenueCat, Unity Ads) — even if values are filled in later phases
- Actual .env file is gitignored; only .env.example is committed
- Unity Ads Game ID and placement IDs: EXPO_PUBLIC_ in .env (they are embedded in the app bundle anyway)
- RevenueCat API keys (separate iOS and Android keys): EXPO_PUBLIC_ in .env, consistent with Firebase and Unity pattern

### Expo Router shell scope
- Full route skeleton scaffolded in Phase 1: all major routes as placeholder screens
- Tab structure: 3 tabs — Library, Favorites, Settings
- Player screen: presented as a modal/stack on top of the tab navigator (not a tab)
- Onboarding: separate route group `app/(onboarding)/index.tsx`
- Auth screens: separate route group `app/(auth)/sign-in.tsx` and `app/(auth)/sign-up.tsx`

### TypeScript and linting strictness
- TypeScript: moderate strictness — `strictNullChecks: true` but NOT full `strict: true` mode
- ESLint: errors block commits via lint-staged (warnings are informational only)
- Prettier: VS Code format-on-save configured via `.vscode/settings.json` (committed) + enforced at commit via lint-staged
- ESLint ruleset: standard Expo defaults (`eslint-config-expo`), no custom rules added

### Claude's Discretion
- Zustand store scaffolding depth (interfaces + initial state structure)
- Exact .env.example key naming conventions
- lint-staged configuration details
- EAS build profile names and configuration
- Specific Prettier options (trailing commas, print width, etc.)

</decisions>

<specifics>
## Specific Ideas

- Three services with credentials to manage: Firebase (Auth, Firestore, Storage, Analytics), RevenueCat (premium subscriptions), Unity Ads (ads for free users)
- Monetization model: free users see Unity Ads, premium users pay via RevenueCat (no ads)
- All credential-type env vars follow EXPO_PUBLIC_ prefix pattern for consistency

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-02-18*
