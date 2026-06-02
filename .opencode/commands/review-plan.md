---
description: Review an OpenSpec change against its original plan and surface discrepancies, weak decisions, or missing detail
---

Review an OpenSpec change against its original planning document.

Use this command when the user wants a structured critique of an existing OpenSpec change before implementation or before finalizing it.

This command should delegate to the `plan-reviewer` skill and use that skill as the source of truth for the workflow.

---

**Input**: The argument after `/review-plan` should include the source plan path or identifier and the OpenSpec change name or path. If only one is provided, infer the other only when it is obvious from the repository context.

**Steps**

1. **Clarify only if needed**

   If the review target is ambiguous, ask one short question.

2. **Load and follow the skill**

   Use the `plan-reviewer` skill as the primary workflow for the task.

3. **Inspect the actual artifacts**

   Read the original plan and the OpenSpec change artifacts before making any judgement.

4. **Report findings as a review**

   List only real findings that matter, with possible fixes and a recommended choice for each one.

5. **Confirm referenced paths exist**

   Verify the plan and change paths you relied on are present before finishing.

**Guardrails**

- Delegate to `plan-reviewer` instead of inventing a separate workflow here
- Reuse the repository's established review tone: findings first, summary second
- Focus on discrepancies, risky choices, and missing specification detail
- Do not create unrelated files
