# Git Commit Grouping And Order

Applies when creating one or more git commits for completed work.

Rule:

- Separate commits by coherent unit of work. Do not mix unrelated changes in the same commit when they can be committed independently.
- Keep closely related files together in one commit when they belong to the same change, but do not split commits more finely than necessary.
- When multiple changes were completed over time, commit them in chronological order: oldest completed work first, then later work.
- When one change depends on another, commit the independent change first and the dependent change after it.
- If a new rule, plan artifact, or other repository-process change was created alongside application code or another separate change, commit the repository-process change separately unless both pieces are part of the same single unit of work.

Notes:

- This rule is about commit boundaries and ordering, not commit message style.
- Prefer the smallest set of commits that preserves clear history, dependency order, and separation of unrelated work.
