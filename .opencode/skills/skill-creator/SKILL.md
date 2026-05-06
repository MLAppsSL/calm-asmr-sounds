---
name: skill-creator
description: Create a new OpenCode skill from a user-provided description, matching the repository's existing skill and command conventions.
license: MIT
compatibility: No external CLI required.
metadata:
  author: local
  version: "1.0"
---

Create a new OpenCode skill from a short description.

Use this when the user wants a reusable workflow added under `.opencode/skills/`.

When a paired command exists or is created for this workflow, that command should explicitly delegate to this skill rather than duplicating the workflow logic independently.

---

**Input**: The user should provide the skill name and a description of what the skill should do. If only a description is provided, derive a kebab-case skill name.

**Steps**

1. **Clarify the request only if needed**

   If the intended behavior is too vague to write useful instructions, ask one short clarifying question.

2. **Inspect the local conventions**

   Read one or two existing files from:
   - `.opencode/skills/*/SKILL.md`
   - `.opencode/commands/*.md`

   Match the repository's tone and file structure instead of inventing a new format.

3. **Determine the skill name and location**

   - Use the provided skill name when available.
   - Otherwise derive a concise kebab-case name from the description.
   - Create the skill at `.opencode/skills/<skill-name>/SKILL.md`.

4. **Write the skill file**

   Include:
   - Frontmatter with `name` and `description`
   - A short opening summary
   - Clear input expectations
   - Step-by-step execution instructions
   - Output expectations
   - Guardrails to keep the skill focused and safe

   The skill should tell the agent to:
   - inspect the repo before writing
   - prefer minimal changes
   - ask only when required
   - verify created files exist

5. **Optionally create a paired command when requested**

   If the user also wants a command, create `.opencode/commands/<command-name>.md` that invokes the same behavior with command-oriented wording.

   The command should:
   - explicitly say it delegates to this skill
   - treat this skill as the source of truth for the workflow
   - avoid duplicating logic unnecessarily

6. **Report what was created**

   Summarize:
   - skill name
   - file path
   - whether a command was also created

**Output**

After creation, summarize:
- Skill name and path
- What the skill is for in one sentence
- Any paired command path, if created

**Guardrails**
- Reuse the existing `.opencode` file style
- Keep instructions concrete and executable
- Do not create extra files beyond the requested skill and optional command
- Prefer concise skills over broad framework documents
- When both a skill and command exist, prefer the pattern: command delegates, skill defines the workflow
