# Stateful Runtime Hardening

Applies when adding or updating timer, audio, store, service, or verification-harness logic, especially code with asynchronous state transitions.

Rule:

- Use stable identifiers for fixture, catalog, and harness selections. Do not depend on array positions when the data can be reordered.
- Scope polling and refresh work to the period it is actually needed, and prefer the coarsest interval that still satisfies the UI or runtime requirement.
- When a component subscribes to multiple Zustand values from the same store, group related selections and use `useShallow` when appropriate to avoid unnecessary re-renders.
- Keep production APIs type-safe. Do not hide dev-only or unsupported paths behind unsafe type assertions when a separate explicit helper or path is clearer.
- Add or update focused automated tests when a service introduces non-trivial runtime behavior such as recovery, expiry handling, async sequencing, or lifecycle-driven state changes.
- Avoid state updates that only recreate equivalent state and trigger subscribers without changing behavior.
- Review async flows for ownership and race conditions. When logic awaits and then mutates shared store or playback state, verify that the same session still owns that state before applying destructive cleanup.
- Before calling this work ready for merge, run the same relevant repo-wide quality checks that CI will run instead of relying only on targeted checks.

Notes:

- This rule is aimed at the class of issues that often surface in PR review for stateful runtime code: brittle selectors, unnecessary churn, type escapes, missing tests, and stale async cleanup.
- Prefer small preventive changes during implementation over waiting for review feedback to surface these problems.
