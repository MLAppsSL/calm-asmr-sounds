---
description: Validate the current branch against planning and OpenSpec artifacts, then create a PR when it is ready
---

Create a pull request for the current branch.

Use this command when the user wants a PR body that reflects what the branch actually delivered, not just what the branch originally intended to do.

This command should delegate to the `pr-maker` skill and use that skill as the source of truth for the workflow.

---

**Input**: The argument after `/create-pr` should include any explicitly known PR details such as the base branch, plan identifiers, OpenSpec change name, or title preference. If some of these are omitted, infer them only when they are obvious from the branch and repository context.

**Steps**

1. **Clarify only if needed**

   Ask one short question only when a required PR detail cannot be inferred safely.

2. **Load and follow the skill**

   Use the `pr-maker` skill as the primary workflow for the task.

3. **Inspect the branch, plans, and change artifacts**

   Check the branch diff, the relevant files under `.planning/`, the relevant OpenSpec change under `openspec/changes/`, and the actual changed files before deciding the branch is ready.

4. **Stop on readiness or CI failures**

   If required files are missing, OpenSpec tasks are still incomplete, or the branch fails the repository's CI-parity checks, do not create the PR and notify the user with the blockers.

5. **Create the PR only when the branch is ready**

   Build the PR body from the actual branch content using the repository template, then create the PR with `gh`.

6. **Confirm the result**

   Summarize the plan identifiers, what the branch delivered, the checks run, and the PR URL.

**Guardrails**

- Delegate to `pr-maker` instead of inventing a separate workflow here
- Do not create a PR when readiness checks or CI-parity checks fail
- Keep the PR body aligned with the real branch diff, not just the original intent
- Do not create unrelated files
