---
name: pr-comment-hardening
description: PR comments, review feedback, or pasted code-review notes. Use when the user wants each comment validated, fixed if warranted, and verified with CI-parity checks before calling the branch ready.
license: MIT
compatibility: Requires git and the repo quality-check commands.
metadata:
  author: opencode
  version: '1.0'
---

Validate and apply pull request review comments without blindly accepting every comment.

**Input**: A set of pasted PR comments, review notes, or a request to sweep a branch for review-driven hardening.

**Steps**

1. **Inspect before deciding**
   - Read the relevant files and understand the current implementation before treating a comment as correct.
   - Identify which comments are clearly valid, which are debatable, and which are not issues.

2. **Map every comment explicitly**
   - For each comment, classify it as one of:
     - fix now
     - not an issue
     - reasonable but not worth changing
   - Keep this mapping visible in the working notes or final summary.

3. **Prefer preventive fixes over cosmetic ones**
   - Prioritize comments about deterministic behavior, stale async cleanup, type escapes, render churn, brittle selectors, missing tests, and CI reliability.
   - Prefer the smallest change that closes the real risk.

4. **Harden stateful runtime code deliberately**
   - Follow `.opencode/rules/stateful-runtime-hardening.md` when the touched code involves timers, audio, stores, services, or async runtime state.
   - Check for ownership races after `await`, cleanup that can hit newer state, and state updates that do not materially change behavior.

5. **Add focused verification**
   - If a comment points at non-trivial runtime behavior, add or extend automated tests near the affected service or module instead of relying on reasoning alone.
   - Cover the concrete regression the comment is warning about.

6. **Run CI-parity checks before calling it done**
   - Run the same repo-wide checks CI will run when they are relevant to the changed files.
   - In this repo, default to:
     - `npx tsc --noEmit`
     - `npx eslint .`
     - `npx prettier src --check`
     - `npm test`
   - Do not claim merge readiness based only on targeted checks if CI runs broader commands.

7. **Report accepted vs rejected comments clearly**
   - Summarize which comments were fixed, which were intentionally left alone, and why.
   - Call out any residual risk that could not be verified locally.

**Output Expectations**

On completion, report:

- the comments that were accepted and how they were fixed
- the comments that were rejected or deferred and why
- the verification commands that were run
- whether the branch looks merge-ready from a code and CI-parity perspective

**Guardrails**

- Do not assume every review comment is correct
- Do not dismiss comments without inspecting the code they refer to
- Prefer minimal fixes over broad refactors
- Add tests when runtime behavior is subtle enough to regress silently
- Run repo-wide CI-parity checks before declaring the branch ready
