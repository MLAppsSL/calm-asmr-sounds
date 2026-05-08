## Context

The `01-01` foundation change installed RNFB packages and wired `app.json` to look for `google-services.json` and `GoogleService-Info.plist`, but the repository still lacks the concrete Firebase setup and the shared module that future phases are supposed to import. The source plan for `01-02` is intentionally non-autonomous because Firebase Console setup and `.env` population depend on credentials and platform files that cannot be generated inside the repository.

This change therefore spans two different execution surfaces: human-owned setup outside the repo and repo-owned code/spec work inside the repo. The main design need is to make that boundary explicit so implementation does not continue under false assumptions.

There is also a small contradiction in the source plan: the frontmatter lists only the two native config files and `src/lib/firebase.ts` under `files_modified`, while the objective, verification, and success criteria also require a populated local `.env`. The design resolves that by treating `.env` as required human-local setup, not a committed artifact.

## Goals / Non-Goals

**Goals:**

- Require a blocking human checkpoint before any Firebase apply work continues.
- Provide a single RNFB service module at `src/lib/firebase.ts` for `auth`, `firestore`, `storage`, and `analytics`.
- Preserve the RNFB-native initialization path and explicitly ban JS SDK `initializeApp()` usage in this module.
- Update the OpenSpec contract so the Firebase native files are no longer merely deferred background context, but a hard prerequisite for this follow-up plan.
- Give the human operator a short, concrete checklist for Firebase Console work and local verification.

**Non-Goals:**

- Building authentication flows, Firestore data access logic, storage upload flows, or analytics event tracking.
- Validating a live Firebase project connection inside this change proposal.
- Changing the previously agreed package set, Expo config shape, or EAS profiles from `01-01`.
- Committing `.env` or inventing placeholder Firebase credential files.

## Decisions

### Use a hard human gate before any repo-side implementation

The change will require the human to create the Firebase project, enable the required products, place `google-services.json` and `GoogleService-Info.plist` at the project root, and populate local `.env` values before implementation proceeds.

Rationale: RNFB reads the native files at build time and those files originate from Firebase Console. Continuing without them would produce an apply flow that cannot be verified and would encourage fake placeholders.

Alternative considered: Let implementation create `src/lib/firebase.ts` first and defer the rest.
Rejected because the source plan explicitly defines a blocking human checkpoint and says apply must resume only after the native files and `.env` are ready.

### Keep `src/lib/firebase.ts` as a minimal RNFB re-export module

The module will import the four RNFB service accessors and export them directly, with no wrapper logic and no JS SDK initialization.

Rationale: The plan already locks the expected file content and warns about the RNFB dual-package hazard. A thin module gives later phases one stable import surface while minimizing room for incorrect initialization logic.

Alternative considered: Create a helper that calls `initializeApp()` or mixes RNFB with the Firebase JS SDK.
Rejected because RNFB auto-initializes from the native config files and the mixed approach can cause runtime errors.

### Treat `.env` as required local setup, not a committed repository delta

The change will reference `.env.example` as the source template and require the operator to create or update local `.env` with the seven Firebase values before apply resumes.

Rationale: The source plan requires `.env` population but `.env` is intentionally gitignored and must stay local.

Alternative considered: Ignore `.env` in the change artifacts because it is not committed.
Rejected because the plan's verification and success criteria depend on those values being present locally.

### Record stop-and-notify behavior in the tasks instead of assuming prerequisites

The task flow will explicitly state that implementation MUST stop and notify the user if either native config file is missing, malformed, or if `.env` still lacks the seven Firebase values.

Rationale: The user asked for a change that will be applied after they do their part, so the safest contract is to assume completion only after the checkpoint is satisfied and otherwise fail fast.

Alternative considered: Phrase the checkpoint as a suggestion.
Rejected because the plan marks the work as non-autonomous and blocking.

## Risks / Trade-offs

- [Human setup is error-prone] -> Mitigation: keep the guide short, include exact bundle/package identifiers, and require local verification commands before resuming apply.
- [The native files contain sensitive project-specific configuration] -> Mitigation: require real downloaded files from Firebase Console and avoid generating or fabricating placeholders in the repository.
- [The `.env` requirement is easy to overlook because it is gitignored] -> Mitigation: call out the contradiction from the source plan and make `.env` checks part of the blocking gate.
- [Future contributors may reintroduce JS SDK initialization] -> Mitigation: document the RNFB auto-initialization rule and the `initializeApp()` prohibition in both design and tasks.

## Migration Plan

1. Complete the Firebase Console setup manually.
2. Place `google-services.json` and `GoogleService-Info.plist` at the project root.
3. Copy the seven Firebase web config values into local `.env` from `.env.example`.
4. Resume implementation only after the checkpoint is verified.
5. Create `src/lib/firebase.ts` as the RNFB re-export module.
6. Run `npx tsc --noEmit` and the file presence checks from the plan.

Rollback strategy: remove `src/lib/firebase.ts` and revert the native config files from the worktree if the Firebase setup needs to be redone, while keeping `.env` local and uncommitted.

## Open Questions

- None for the repository-side implementation. The remaining uncertainty is operational: the human must supply valid Firebase project artifacts before apply can continue.
