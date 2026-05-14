---
name: git-commit-separation
description: Create one or more git commits while separating files by coherent change and respecting chronological and dependency order.
license: MIT
compatibility: Requires git.
metadata:
  author: opencode
  version: '1.0'
---

Create git commits that follow `.opencode/rules/git-commit-grouping-and-order.md`.

If the user does not specify a file scope, assume they want **everything**, including untracked files, committed. If the user does specify files or a narrower scope, commit only the files they specified.

**Input**: Optional file paths, commit scope, or commit intent. The user may ask to commit everything or may specify a subset of files.

**Steps**

1. **Determine the commit scope**
   - If the user specifies files, directories, or an explicit subset, use only that scope.
   - If the user does not specify a scope, treat the request as "commit everything," including untracked files.
   - If the requested scope is ambiguous, ask one short clarification question before staging anything.

2. **Inspect the repository state**

   Run these git commands before committing:

   ```bash
   git status --short
   git diff --staged
   git diff
   git log --oneline -10
   ```

   Use them to understand:
   - tracked and untracked files in scope
   - staged and unstaged changes
   - whether multiple coherent changes are mixed together
   - recent commit message style

3. **Apply the grouping rule**

   Follow `.opencode/rules/git-commit-grouping-and-order.md`.
   - Separate unrelated work into different commits when it can stand alone.
   - Keep related files together when they belong to one coherent change.
   - Commit older completed work before newer completed work.
   - Commit independent work before dependent work.
   - Do not mix repository-process changes, such as rules, skills, commands, or plans, into the same commit as unrelated application changes unless they are truly one unit of work.

4. **Propose the commit split**

   Before creating commits, summarize the proposed grouping in a short list.

   Example:
   - Commit 1: new rule and AGENTS update
   - Commit 2: Firebase OpenSpec artifacts and `src/lib/firebase.ts`

   If the grouping is straightforward and clearly follows the rule, proceed. If there are multiple reasonable ways to split the work, ask the user one short question.

5. **Stage only the files for the current commit**
   - Add untracked files when they belong in the current commit.
   - Do not stage files outside the current commit's unit of work.
   - When the user specified a subset, do not include files outside that subset.

6. **Create commits in order**

   For each commit:
   - draft a concise commit message that reflects why the grouped change exists
   - run `git commit -m "..."`
   - run `git status --short` after each commit to confirm what remains

7. **Handle commit blockers**
   - If hooks fail, inspect the resulting file changes and create a new commit flow that still respects the grouping rule.
   - If a hook reformats files across multiple commit groups, pause and explain the conflict instead of guessing.
   - If the worktree contains unrelated user changes outside the requested scope, leave them alone.

8. **Report the result**

   Summarize:
   - commits created, in order
   - files included in each commit
   - any remaining modified or untracked files

**Output Expectations**

On success, report:

- the commit grouping that was used
- the commit messages that were created
- confirmation that the rule-based order was respected

On pause, report:

- why the grouping or scope was ambiguous
- what clarification is needed

**Guardrails**

- Always follow `.opencode/rules/git-commit-grouping-and-order.md`
- Default to committing everything, including untracked files, only when the user did not specify a narrower scope
- When the user specifies files, commit only those files
- Never include unrelated files just because they are present in the worktree
- Prefer the smallest correct set of commits over one large mixed commit
- Ask at most one short clarification question when the split is genuinely ambiguous
- Do not push unless the user explicitly asks
