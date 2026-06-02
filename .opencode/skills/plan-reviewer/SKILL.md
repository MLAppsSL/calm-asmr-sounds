---
name: plan-reviewer
description: Review an OpenSpec change against its original planning document and surface discrepancies, underspecified areas, or bad choices. Use when the user wants a structured critique before implementation or before archiving a change.
license: MIT
compatibility: No external CLI required beyond repository tools already in use.
metadata:
  author: local
  version: '1.0'
---

Review an OpenSpec change against its source plan and turn mismatches into actionable findings.

Use this when the user wants help checking whether an OpenSpec change still matches the original plan, or whether the change artifacts contain weak decisions, missing detail, or implementation traps.

---

**Input**: The user should provide at least a source plan path or identifier and the OpenSpec change name or path to review. If only one side is provided, infer the other only when it is obvious from the repository context.

**Steps**

1. **Clarify only if the review target is ambiguous**

   If you cannot tell which plan and which OpenSpec change should be compared, ask one short question.

2. **Inspect the source material before judging it**

   Read the original plan first, then read the OpenSpec change artifacts that define the current contract:
   - `proposal.md`
   - `design.md` when present
   - `tasks.md`
   - any relevant files under `specs/`

   Prefer the smallest set of files that gives full coverage, but do not skip a required artifact.

3. **Extract the plan contract**

   From the plan, note the items that must be preserved or explained:
   - objective and purpose
   - hard requirements and locked decisions
   - must-haves and success criteria
   - required files, outputs, and verification expectations
   - any explicit non-optional implementation constraints

4. **Compare the OpenSpec change against the plan**

   Check for:
   - missing required behavior from the plan
   - behavior added by the OpenSpec change that the plan does not justify
   - decisions that contradict the plan or silently weaken it
   - vague requirements, design choices, or tasks that leave important behavior unspecified
   - implementation sequencing gaps that could cause rework or incorrect application
   - verification gaps where the change is not testable against the plan

5. **Turn issues into findings, not vague commentary**

   For each real issue, provide:
   - what is wrong
   - where it appears, with file references when possible
   - why it matters
   - possible choices or fixes
   - your recommended choice

   If something looks different from the plan but is still acceptable, say why it is acceptable instead of forcing a finding.

6. **Prioritize the output like a real review**

   Order findings by severity:
   - blockers or contradictions first
   - then missing specification or risky choices
   - then smaller clarity improvements

7. **Keep the review scoped and practical**

   Focus on discrepancies with the original plan, bad choices, and missing detail that would affect implementation or correctness. Do not pad the review with style notes or speculative architecture unless they matter to the plan.

8. **If no findings exist, say so explicitly**

   State that the change appears aligned with the plan, then note any residual risks or assumptions that are still worth watching.

9. **Verify reviewed paths exist before finishing**

   Confirm that the plan path and OpenSpec change paths you referenced actually exist in the workspace.

**Output**

Return a concise review with:

- the plan reviewed
- the OpenSpec change reviewed
- findings listed first, ordered by severity
- for each finding: issue, fix options, and recommended choice
- a brief overall assessment after the findings

**Guardrails**

- Inspect the repository artifacts before making claims
- Prefer factual discrepancies over hypothetical concerns
- Do not invent plan requirements that are not actually present
- Do not rewrite the change unless the user asks; review first
- Keep recommendations concrete enough that the next edit is obvious
- If the plan is clearly wrong, call that out instead of treating it as untouchable
