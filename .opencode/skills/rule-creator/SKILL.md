---
name: rule-creator
description: Create a new OpenCode rule in `.opencode/rules/` from a user-provided description, following the repository's local conventions.
license: MIT
compatibility: No external CLI required.
metadata:
  author: local
  version: "1.0"
---

Create a new OpenCode rule from a short description.

Use this when the user wants a reusable rule added under `.opencode/rules/`.

When a paired command exists or is created for this workflow, that command should explicitly delegate to this skill rather than duplicating the workflow logic independently.

---

**Input**: The user should provide the rule name and a description of what the rule should cover. If only a description is provided, derive a concise kebab-case rule name.

**Steps**

1. **Clarify the request only if needed**

   If the intended rule is too vague, internally inconsistent, or missing key scope details, ask one short clarifying question before writing the rule.

2. **Inspect the local conventions**

   Read one or two existing files from:
   - `.opencode/skills/*/SKILL.md`
   - `.opencode/commands/*.md`
   - `.opencode/rules/` when example rules exist

   Match the repository's tone and structure instead of inventing a new format.

3. **Determine the rule name and location**

   - Use the provided rule name when available.
   - Otherwise derive a concise kebab-case name from the description.
   - Create the rule under `.opencode/rules/<rule-name>.md` unless the repository clearly uses a different local naming pattern.

4. **Write the rule file**

   Keep the rule narrowly scoped and practical. Include:
   - a clear title
   - what the rule applies to
   - the effective rule that must be respected
   - any short notes needed to remove ambiguity

    Prefer direct wording over long policy text.

5. **Add the rule to `AGENTS.md`**

   Update `AGENTS.md` so the new rule is explicitly mentioned and linked.

   Add a concise entry that:
   - names the rule
   - links to `.opencode/rules/<rule-name>.md`
   - gives a short note about when the agent should use or remember it

   Treat this `AGENTS.md` update as required for every rule created with this skill.

6. **Validate the rule quality**

   Check that the new rule:
   - has a specific scope
   - states an actionable requirement
   - avoids duplicating unrelated policy
   - does not conflict with the user's request

7. **Optionally create a paired command when requested**

   If the user also wants a command, create `.opencode/commands/<command-name>.md` that delegates to this skill.

   The command should:
   - explicitly say it delegates to the `rule-creator` skill
   - treat this skill as the source of truth for the workflow
   - avoid duplicating logic unnecessarily

8. **Verify the created paths exist**

   Confirm the new rule file exists before finishing.
   Confirm the `AGENTS.md` entry was added.

9. **Report what was created**

    Summarize:
    - rule name
    - created file paths
    - what the new rule does
    - that `AGENTS.md` was updated with the rule link

**Output**

After creation, summarize:
- Rule name and path
- What the rule applies to in one sentence
- The main requirement it enforces
- The `AGENTS.md` entry that was added for discoverability
- Any paired command path, if created

**Guardrails**
- Reuse the existing `.opencode` file style
- Keep the rule concrete and enforceable
- Ask the user directly when the requested rule is vague or contradictory
- Update `AGENTS.md` for every created rule so the agent can find it easily
- Do not create extra files beyond the requested rule, the required `AGENTS.md` update, and the optional command
- Prefer the smallest correct rule over a broad framework document
- When both a skill and command exist, prefer the pattern: command delegates, skill defines the workflow
