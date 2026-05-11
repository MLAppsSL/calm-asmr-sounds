---
description: Create a new OpenCode skill from a provided description
---

Create a new OpenCode skill from a provided description.

Use this command when the user wants a reusable workflow added under `.opencode/skills/`.

This command should delegate to the `skill-creator` skill and use that skill as the primary workflow for the task.

---

**Input**: The argument after `/create-skill` should include the skill name and description. If only a description is provided, derive a kebab-case skill name.

**Steps**

1. **Clarify only if needed**

   If the requested behavior is too vague to turn into a useful skill, ask one short clarifying question.

2. **Load and follow the skill**

   Use the `skill-creator` skill as the source of truth for carrying out this task.

3. **Inspect local examples**

   Read one or two existing files from:
   - `.opencode/skills/*/SKILL.md`
   - `.opencode/commands/*.md`

   Match the repository's established format and tone.

4. **Choose the skill name**

   - Use the provided name when explicit.
   - Otherwise derive a concise kebab-case name from the description.

5. **Create the skill**

   Write `.opencode/skills/<skill-name>/SKILL.md` with:
   - frontmatter
   - a short summary
   - input expectations
   - step-by-step instructions
   - output expectations
   - guardrails

6. **Optionally create a paired command**

   If the user asks for one, add `.opencode/commands/<command-name>.md` using command-oriented wording that mirrors the skill's behavior.

7. **Confirm the result**

   Summarize:
   - skill name
   - created file paths
   - what the new skill does

**Guardrails**
- Delegate to `skill-creator` instead of inventing a separate workflow here
- Reuse the existing `.opencode` conventions in this repository
- Keep the generated skill narrowly scoped and practical
- Do not create unrelated files
- Verify the created paths exist before finishing
