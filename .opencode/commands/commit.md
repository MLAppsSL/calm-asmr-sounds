---
description: Create one or more git commits with correct file grouping and order
---

Create one or more git commits while separating files correctly and respecting commit order.

This command delegates to the `git-commit-separation` skill and uses that skill as the source of truth for the workflow.

If I do not specify a scope, I mean **commit everything**, including untracked files. If I do specify files or a narrower scope, commit only the files I specified.

Use this command when I want you to commit work from the current repository and I expect the commit split to follow `.opencode/rules/git-commit-grouping-and-order.md`.

**Input**: Optional file paths, directories, or a short description of what to commit.

**Required behavior**

1. Determine whether I specified a subset.
2. If I did not specify a subset, treat the request as permission to commit everything, including untracked files.
3. If I did specify a subset, commit only that subset.
4. Inspect git state, separate files into coherent commits, and create the commits in chronological and dependency order.
5. Ask one short clarification question only if the requested scope or commit grouping is genuinely ambiguous.

Follow the `git-commit-separation` skill for the full workflow.
