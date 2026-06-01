---
name: review-addresser
description: Address GitHub PR review comments on the current branch using the GitHub CLI, validate each comment before changing code, and ask the user to choose when multiple reasonable fixes exist.
license: MIT
compatibility: Requires `gh`, `git`, and the repo's local verification commands.
metadata:
  author: opencode
  version: '1.0'
---

Address pull request review comments on the current branch with the GitHub CLI, using the smallest sound fixes and asking the user to decide when multiple valid approaches remain.

**Input**: A request to address review comments for the current branch, optionally including a PR number, specific comments, constraints, or whether to create follow-up commits.

**Steps**

1. **Inspect the branch and PR context first**
   - Identify the current branch and inspect the working tree before making changes.
   - Use the GitHub CLI to locate the relevant pull request when one is not explicitly provided.
   - Gather the active review comments and review threads that still need action.

2. **Read the referenced code before accepting a comment**
   - Open the files and surrounding code mentioned by each comment.
   - Validate whether the comment points to a real bug, regression risk, missing test, or maintainability issue.
   - Do not assume every review comment is correct just because it was left on the PR.

3. **Classify each review item explicitly**
   - For every actionable comment, classify it as one of:
     - fix now
     - ask the user to choose
     - not changing
   - Use `ask the user to choose` when there are multiple reasonable fixes and none is clearly better than the others.
   - When asking, keep the question short and present the concrete tradeoff.

4. **Follow repo rules before editing**
   - Inspect applicable repo rules under `.opencode/rules/` before editing affected code.
   - Apply rule guidance that matches the touched area, especially `stateful-runtime-hardening` for timers, audio, stores, services, harnesses, or async runtime state.
   - Keep the change minimal and scoped to the validated review concern.

5. **Implement the best fix for accepted comments**
   - Prefer the smallest correct code change over broad refactors.
   - Add or update focused tests when the comment concerns behavior that could regress silently.
   - Keep related edits together and avoid unrelated cleanup.

6. **Verify with relevant checks**
   - Run the repo commands needed to verify the affected code paths.
   - When review-driven changes are broad or touch shared runtime code, prefer CI-parity checks over only narrow targeted checks.
   - If full verification cannot run locally, state exactly what was run and what remains.

7. **Report resolution status clearly**
   - Summarize which comments were fixed, which required user input, and which were intentionally not changed.
   - Include the reasoning for rejected or deferred comments.
   - List the verification commands that were run and any remaining risks.

**Output Expectations**

On completion, report:

- the PR or branch context that was reviewed
- each review comment's disposition: fixed, user decision needed, or not changed
- the files updated and the fix applied
- the verification commands that were run
- any remaining decisions, risks, or follow-up work

**Guardrails**

- Use `gh` for pull request and review-comment retrieval when PR context is needed
- Read the actual code before agreeing with a review comment
- Ask the user when multiple reasonable fixes exist and none is clearly superior
- Follow every relevant repo rule before and during edits
- Prefer minimal, test-backed fixes over broad rewrites
- Do not create unrelated files or changes
- Verify the created or modified paths exist before finishing
