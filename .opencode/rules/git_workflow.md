# Git Workflow Rule

Follow this order for every change:

## Commit

1) One commit per logical change — not one big dump
2) Use Conventional Commits: `type(scope): short description`
   (types: feat, fix, chore, refactor, docs, test, style, perf, ci, build)
3) Stage only the files for that change — never blind `git add -A` when unrelated changes exist

## Pull Request

1) Push the branch: `git push -u origin <branch-name>`
2) Create the PR: `gh pr create --base main --title "<conventional commit title>" --body "<what changed and why>"`
3) Base branch is `main` unless told otherwise

## Checks

1) Run `gh pr checks` after opening the PR
2) If any check fails: fix, commit granularly with a conventional commit, push, re-run checks

## Merge

1) Merge only when all checks pass: `gh pr merge --merge`
2) Never merge while checks are failing or pending
3) After merge: clean up the worktree if needed, but do NOT delete the local or remote branch — keep them for reference
