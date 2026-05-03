# Commit changes to git

## Process

1. Review the code
2. Deslop the code
3. Run `git diff` to retrieve only changes from the **current conversation/session** (not the entire branch, and not all working tree changes)
   - If the user explicitly asks to “commit all changes”, then include the full working tree diff instead.
   - Always default to ONLY YOUR CHANGES
4. Generate a 40-80 chars long commit message
5. Commit the messages and changes
6. Push the changes

## If there are other WIP/unimplemented changes

If your working tree includes changes you have **not** implemented/verified yet (or changes unrelated to the current conversation), do **not** accidentally include them in the commit.

1. Ask the user first whether they want you to temporarily set those changes aside (and confirm whether it’s OK to override local modifications briefly).
2. If they agree, temporarily remove/park the unrelated changes, commit only the intended conversation/session changes, then restore/re-add the parked changes exactly as they were.

## Review

Skim the **full diff** (same scope as step 3 — session changes, not mystery hunks). Goal: catch real defects before commit; leave style noise to Deslop.

1. **Correctness** — Logic matches intent; no inverted conditions, wrong defaults, or stale state.
2. **Edge cases** — Empty collections, missing props/keys, null/undefined, first/last items, async race obvious on inspection.
3. **Contracts** — Types and public props/APIs line up with callers; errors and returns are intentional, not accidentally swallowed.
4. **Side effects** — Mutations, storage, URL/history, globals: only where the feature needs them and consistent with nearby code.
5. **Trust & safety (if relevant)** — User/URL/storage input not trusted without validation; no obvious injection or unsafe HTML unless already the pattern here.

Only flag **real** problems. Do not duplicate Deslop (comments, `any` hacks, odd try/catch) here unless they hide a bug.

**If you find bugs**, stop and report them to the user in a markdown table **before** committing:

| Severity                | Where       | Problem  | Suggested fix |
| ----------------------- | ----------- | -------- | ------------- |
| critical / medium / low | `path:line` | One line | One line      |

- **critical** — Wrong data, security, or definite breakage.
- **medium** — Likely bug or regression for some users.
- **low** — Risky or unverified; user should decide.

If there are no issues: one line, e.g. `Review: clean`, then continue to Deslop.

## Deslop:

Check the diff against main, and remove all AI generated slop introduced in this branch.

This includes:

- Extra comments that a human wouldn't add or is inconsistent with the rest of the file
- Extra defensive checks or try/catch blocks that are abnormal for that area of the codebase (especially if called by trusted / validated codepaths)
- Casts to any to get around type issues
- Any other style that is inconsistent with the file

Report at the end with only a 1-3 sentence summary of what you changed

## Commit message rules:

- If the changes are really complex (i.e. structure changes, large scale refactoring) you can make them longer but use bullet points to structure the message
- Do not include redundant info (i.e. exports, renamings, etc.)
- Prefix with either `refactor:`, `feat:`, `fix:`, `docs:`, or `chore:` depending on the changes
