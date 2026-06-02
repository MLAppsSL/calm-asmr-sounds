---
name: pr-maker
description: Validate branch readiness against planning and OpenSpec artifacts, then create a pull request with a branch-accurate summary. Use when the user wants help preparing or opening a PR for the current branch.
license: MIT
compatibility: Requires local git state and GitHub CLI access for PR creation.
metadata:
  author: local
  version: '1.0'
---

Validate a branch before PR creation, stop when the branch is not ready, and write a PR body that reflects what the branch actually delivered.

Use this when the user wants to create a PR and the branch work is expected to map back to one or more files under `.planning/`, one OpenSpec change, and the real code diff.

---

**Input**: The user should provide enough context to identify the PR target, usually the current branch plus any explicit base branch, plan identifiers, or PR title preferences. Infer missing details only when they are obvious from the repository and git state.

**Steps**

1. **Clarify only if a required PR detail is truly ambiguous**

   Ask one short question only when you cannot determine a safe base branch, the relevant plan/change, or a usable PR title from repository context.

2. **Inspect branch and repository context first**

   Before drafting anything, inspect:
   - current branch and tracking branch
   - git status
   - diff against the intended base branch
   - recent commits on the branch

   Use the actual branch diff as the source of truth for what changed.

3. **Locate the original planning artifacts**

   Find the source plan or plans under `.planning/`, usually matching identifiers like `01-01`, `04-03`, or the branch topic.

   Read the relevant planning files and extract:
   - plan identifiers
   - required deliverables
   - explicit scope boundaries
   - verification expectations

4. **Locate and inspect the OpenSpec change for the branch**

   Read the relevant change under `openspec/changes/<change-name>/`.

   Inspect the required artifacts when present:
   - `proposal.md`
   - `design.md`
   - `tasks.md`
   - relevant files under `specs/`

   Treat the OpenSpec change as part of the contract, but do not assume it fully matches the original plan.

5. **Compare plan, OpenSpec, and actual code before allowing PR creation**

   Check whether the branch is PR-ready by comparing all three sources:
   - the original plan under `.planning/`
   - the OpenSpec change artifacts
   - the actual changed files and commits

   Look for blockers such as:
   - required files or outputs missing from the branch
   - unchecked or clearly incomplete tasks in `tasks.md`
   - major plan requirements not implemented
   - code that obviously diverged from both the plan and the OpenSpec change without explanation
   - missing verification for work that the repository expects to be tested

6. **Stop immediately when the branch is not ready**

   If readiness checks fail, do not create a PR.

   Return a concise blocker report that includes:
   - why the branch is not ready
   - which plan, OpenSpec task, or file is missing or incomplete
   - what the user should finish before PR creation

7. **Run CI-parity checks before creating the PR**

   Match the repository workflow as closely as possible.

   If a root `package.json` exists, run these checks in this order:
   - `npm ci` when `package-lock.json` exists, otherwise `npm install`
   - `npx tsc --noEmit`
   - `npx eslint .`
   - `npx prettier src --check` when `src/` exists
   - `npx lint-staged --diff="<base-sha>...<head-sha>"`
   - `npm test`

   If there is no root `package.json`, report that the scaffold is absent and skip Node-based checks the same way the workflow does.

   If any required check fails, stop and notify the user instead of creating a PR.

8. **Draft the PR from what the branch actually added**

   Build the PR body from the branch diff first, then reconcile it with the plan and OpenSpec artifacts.

   The body should emphasize:
   - the plan identifiers covered by the branch
   - the actual features, screens, flows, fixes, or files delivered
   - the real testing status and commands run
   - known issues only when they are real and current

   Do not pad the PR with planned work that is not present on the branch.

9. **Use this PR template exactly, removing placeholder text**

   Fill the sections with concrete content only:

   ```md
   ## 🗂️ Plan or Plans Added

   List the plan identifiers included in this PR.
   Example: `01-01`, `01-02`

   -

   ## ✨ Content Added

   Describe the actual work delivered from the plans above.
   Mention the main features, screens, flows, fixes, or files added/updated.

   -

   ## ✅ Testing

   Describe what was tested for this PR.
   Include manual checks, automated tests, or note if testing is still pending.

   -

   ## 📸 Screenshots

   Add screenshots, recordings, or visual references when the PR includes UI changes or test screens.
   If not applicable, leave `N/A`.

   - N/A

   ## ⚠️ Known Issues / Follow-ups

   List any known limitations, pending improvements, or follow-up work related to this PR.
   If there is nothing to add, leave `N/A`.

   - N/A

   ## 📝 Additional Notes

   Include any extra context reviewers should know.
   Examples: pending work, tradeoffs, known issues, setup notes, or review guidance.

   -
   ```

   Remove instructional placeholder lines from the final PR body and leave only the completed content.

10. **Create the PR only after readiness and checks pass**

Use `gh pr create` with the resolved base branch, title, and completed body.

Prefer a concise title that matches the branch's delivered scope. If the title cannot be inferred safely, ask one short question before creating the PR.

11. **Verify the referenced artifacts before finishing**

Confirm that the `.planning` files, `openspec/changes/...` files, and key changed files referenced in the PR body actually exist in the workspace.

**Output**

Return one of these outcomes:

- If blocked: a readiness report listing the blockers and the checks not yet passed
- If successful: the PR title, base branch, plan identifiers, checks run, and the created PR URL

Also include a short note when the OpenSpec change and the original plan diverged, and explain which actual branch changes were prioritized in the PR summary.

**Guardrails**

- Inspect the real branch diff before writing the PR body
- Do not create a PR when required files, tasks, or checks are incomplete
- Do not claim planned work was delivered unless it exists on the branch
- Prefer the branch diff as the source of truth, then reconcile it against `.planning` and OpenSpec
- Keep the PR summary factual, reviewer-oriented, and scoped to this branch only
- Use `gh` for PR creation rather than describing a PR body without opening it, unless the user asked for a draft only
