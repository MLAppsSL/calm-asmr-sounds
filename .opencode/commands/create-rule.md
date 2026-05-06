---
description: Create a new OpenCode rule from a provided description
---

Create a new OpenCode rule from a provided description.

Use this command when the user wants a reusable rule added under `.opencode/rules/`.

This command should delegate to the `rule-creator` skill and use that skill as the primary workflow for the task.

---

**Input**: The argument after `/create-rule` should include the rule name and description. If only a description is provided, derive a concise kebab-case rule name.

**Steps**

1. **Clarify only if needed**

   If the requested rule is too vague, contradictory, or missing scope, ask one short clarifying question.

2. **Load and follow the skill**

   Use the `rule-creator` skill as the source of truth for carrying out this task.

3. **Inspect local examples**

   Read one or two existing files from:
   - `.opencode/skills/*/SKILL.md`
   - `.opencode/commands/*.md`
   - `.opencode/rules/` when example rules exist

   Match the repository's established format and tone.

4. **Choose the rule name**

   - Use the provided name when explicit.
   - Otherwise derive a concise kebab-case name from the description.

5. **Create the rule**

   Write `.opencode/rules/<rule-name>.md` with:
   - a clear title
   - what the rule applies to
   - the effective rule that must be respected
   - any brief notes needed to remove ambiguity

6. **Add the rule to `AGENTS.md`**

   Update `AGENTS.md` so the new rule is explicitly mentioned and linked.

   Add a concise entry that:
   - names the rule
   - links to `.opencode/rules/<rule-name>.md`
   - gives a short note about when the agent should use or remember it

   This update is required for every rule created through this command.

7. **Confirm the result**

   Summarize:
   - rule name
   - created file paths
   - what the new rule does
   - that `AGENTS.md` was updated with the rule link

**Guardrails**
- Delegate to `rule-creator` instead of inventing a separate workflow here
- Reuse the existing `.opencode` conventions in this repository
- Keep the generated rule narrowly scoped and practical
- Ask the user directly when the requested behavior needs more detail
- Update `AGENTS.md` for every created rule so the agent can find it easily
- Do not create unrelated files beyond the rule and required `AGENTS.md` update
- Verify the created paths exist before finishing
