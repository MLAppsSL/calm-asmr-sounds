---
description: Address GitHub PR review comments for the current branch using the review-addresser skill
---

Address GitHub PR review comments for the current branch using the `review-addresser` skill.

Use this command when the user wants review comments pulled from GitHub and handled with validated, repo-compliant fixes.

This command should delegate to the `review-addresser` skill and use that skill as the source of truth for the workflow.

---

**Input**: The argument after `/address-review` may include a PR number, branch context, specific comments to prioritize, or constraints for how fixes should be made.

**Steps**

1. **Clarify only if needed**

   If the request is too vague to identify the relevant PR or review comments, ask one short clarifying question.

2. **Load and follow the skill**

   Use the `review-addresser` skill as the primary workflow for the task.

3. **Inspect local and PR context**

   Review the current branch, inspect the working tree, and use `gh` to identify the relevant pull request and its active review comments.

4. **Validate each comment before changing code**

   Read the referenced code and decide whether each comment should be fixed, deferred for user choice, or intentionally left unchanged.

5. **Ask the user to choose when needed**

   If multiple fixes are reasonable and no option is clearly better, ask the user for a decision before editing.

6. **Implement and verify**

   Apply the best minimal fixes that follow all repo rules, then run the relevant verification commands.

7. **Confirm the result**

   Summarize the addressed comments, any unresolved decisions, the files changed, and the checks that were run.

**Guardrails**

- Delegate to `review-addresser` instead of inventing a separate workflow
- Use `gh` when PR review context is required
- Reuse the repository's `.opencode` conventions and repo rules
- Ask the user when there is no clearly best fix
- Do not create unrelated files
- Verify the created paths exist before finishing
