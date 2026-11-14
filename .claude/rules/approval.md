# Approval Before Git Operations Rule

After you finish updating code, you MUST ask the user for explicit approval before performing any git write operation.

1) Do not run `git commit`, `git push`, `gh pr create`, or `gh pr merge` without the user's approval
2) Present a summary of the changes and the planned commit/PR, then wait for the user to respond
3) Proceed only after the user explicitly approves (e.g. "yes", "approve", "execute")
4) If the user requests changes, update the code and ask for approval again
5) This does not apply to `git worktree add` — setting up a worktree is part of normal task preparation
