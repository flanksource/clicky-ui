/**
 * Git state styles as plain data: label, tone, hint and a specimen example per
 * state. Kept free of package imports so the vocabulary declaration can be read
 * statically; `_theme.ts` pairs each state with its icon.
 */
export type GitTone = "success" | "warning" | "danger" | "info" | "neutral" | "merged" | "accent";

export type GitStateExample = {
  value: string;
  detail: string;
  reviewer?: { name: string; login: string };
  diff?: { adds: number; dels: number };
  divergence?: { ahead: number; behind: number; base: string };
  checkout?: "root" | "linked";
};

export type GitState = { label: string; tone: GitTone; hint: string; example: GitStateExample };

export type GitStateGroupId = "file-change" | "diff" | "branch" | "commit" | "worktree" | "pr" | "check" | "review";

export type GitStateGroup = { id: GitStateGroupId; title: string; description: string; states: Record<string, GitState> };

export const GIT_FILE_CHANGE_STATES = {
  added: { label: "Added", tone: "success", hint: "New file in the change", example: { value: "pkg/cart/checkout_test.go", detail: "Empty and invalid cart cases", diff: { adds: 13, dels: 0 } } },
  modified: { label: "Modified", tone: "warning", hint: "Existing file edited", example: { value: "pkg/cart/checkout.go", detail: "Validate before checkout", diff: { adds: 8, dels: 1 } } },
  deleted: { label: "Deleted", tone: "danger", hint: "File removed", example: { value: "pkg/cart/legacy.go", detail: "Removed legacy rounding", diff: { adds: 0, dels: 7 } } },
  renamed: { label: "Renamed", tone: "info", hint: "Moved, content kept", example: { value: "web/src/Cart.tsx", detail: "web/src/Basket.tsx → Cart.tsx", diff: { adds: 4, dels: 3 } } },
  copied: { label: "Copied", tone: "accent", hint: "Duplicated from another path", example: { value: "config/pricing.staging.xml", detail: "Copied from config/pricing.xml · staging prices" } },
  untracked: { label: "Untracked", tone: "neutral", hint: "Not yet known to git", example: { value: "pkg/cart/validate.go", detail: "13 lines · new validation helper, not yet staged" } },
  conflict: { label: "Conflict", tone: "danger", hint: "Needs a manual resolution", example: { value: "pkg/pricing/engine.go", detail: "main ↔ spike/new-pricing · cache type conflict" } },
  staged: { label: "Staged", tone: "success", hint: "Queued in the index for the next commit", example: { value: "pkg/cart/checkout_test.go", detail: "All added lines staged for the next commit", diff: { adds: 13, dels: 0 } } },
} satisfies Record<string, GitState>;

export const GIT_DIFF_STATES = {
  additions: { label: "Additions", tone: "success", hint: "Lines added", example: { value: "+13 · pkg/cart/checkout_test.go", detail: "New tests reject empty carts and invalid quantities" } },
  deletions: { label: "Deletions", tone: "danger", hint: "Lines removed", example: { value: "−7 · pkg/cart/legacy.go", detail: "Removed the obsolete price-rounding helper" } },
} satisfies Record<string, GitState>;

export const GIT_BRANCH_STATES = {
  ahead: { label: "Ahead", tone: "success", hint: "Commits not yet on the base", example: { value: "feat/cart-validation · ↑3", detail: "3 commits to land on main · 2 not yet pushed" } },
  behind: { label: "Behind", tone: "warning", hint: "Base commits missing from the branch", example: { value: "chore/go-1.25 · ↓2", detail: "2 commits on main since this branch was merged" } },
  diverged: { label: "Diverged", tone: "danger", hint: "Ahead and behind: rebase or merge before landing", example: { value: "fix/rounding · ↑1 ↓5", detail: "1 branch commit · 5 new commits on main" } },
  even: { label: "Even", tone: "neutral", hint: "Same commit as the base", example: { value: "main · e1f2a3b", detail: "0 ahead · 0 behind origin/main" } },
  unpublished: { label: "Unpublished", tone: "neutral", hint: "No upstream branch yet", example: { value: "spike/new-pricing", detail: "6 local commits · no remote tracking branch" } },
} satisfies Record<string, GitState>;

export const GIT_COMMIT_STATES = {
  local: { label: "Local", tone: "info", hint: "Not pushed to the upstream", example: { value: "4b1d0e2 · test(cart)", detail: "Cover empty and invalid carts · Dana Ortiz · not pushed" } },
  fixup: { label: "Fixup", tone: "warning", hint: "fixup! / squash! commit awaiting autosquash", example: { value: "9f3c2a1 · fixup! feat(cart)", detail: "Validate cart before checkout · +3 −1 · awaiting autosquash" } },
} satisfies Record<string, GitState>;

export const GIT_WORKTREE_STATES = {
  clean: { label: "Clean", tone: "success", hint: "No local changes", example: { value: "~/src/widgets · main", detail: "e1f2a3b · no staged, unstaged or untracked files", divergence: { ahead: 0, behind: 0, base: "origin/main" }, checkout: "root" } },
  dirty: { label: "Dirty", tone: "warning", hint: "Uncommitted changes", example: { checkout: "linked", value: "~/src/widgets-cart · feat/cart-validation", detail: "2 staged · 3 unstaged · 1 partially staged · 1 untracked", diff: { adds: 57, dels: 12 }, divergence: { ahead: 3, behind: 0, base: "main" } } },
  conflict: { label: "Conflicted", tone: "danger", hint: "Unmerged paths", example: { checkout: "linked", value: "~/src/widgets-pricing · spike/new-pricing", detail: "2 unmerged paths · engine.go and Price.tsx", diff: { adds: 18, dels: 7 }, divergence: { ahead: 6, behind: 12, base: "main" } } },
  detached: { label: "Detached", tone: "warning", hint: "HEAD is on a commit, not a branch", example: { checkout: "linked", value: "~/src/widgets-bisect", detail: "HEAD at c0ffee1 · investigating a checkout regression · clean diff · branch divergence unavailable (detached HEAD)" } },
  locked: { label: "Locked", tone: "neutral", hint: "Protected from pruning", example: { checkout: "linked", value: "~/src/widgets-bisect", detail: "Locked while bisecting · protected from pruning · clean diff · branch divergence unavailable (detached HEAD)" } },
  missing: { label: "Missing", tone: "danger", hint: "Directory is gone; prune the entry", example: { checkout: "linked", value: "/Volumes/scratch/widgets-old", detail: "Directory removed · diff and branch divergence unavailable · can be pruned" } },
  stale: { label: "Stale", tone: "danger", hint: "Status could not be read", example: { checkout: "linked", value: "~/src/widgets-docs", detail: "git status failed: index.lock exists · diff and branch divergence unavailable" } },
  operation: { label: "In progress", tone: "warning", hint: "A rebase, merge or cherry-pick is stopped", example: { checkout: "linked", value: "spike/new-pricing · rebase 3/6", detail: "Replaying 5e5e5e5 onto main · resolve 2 files to continue", diff: { adds: 18, dels: 7 }, divergence: { ahead: 6, behind: 12, base: "main" } } },
} satisfies Record<string, GitState>;

export const GIT_PR_STATES = {
  draft: { label: "Draft", tone: "neutral", hint: "Not ready for review", example: { value: "#409 · Round half-even", detail: "fix/rounding → main · draft by dortiz" } },
  open: { label: "Open", tone: "success", hint: "Awaiting review or merge", example: { value: "#412 · Validate cart before checkout", detail: "feat/cart-validation → main · awaiting review" } },
  merged: { label: "Merged", tone: "merged", hint: "Landed on the base branch", example: { value: "#398 · Bump Go to 1.25", detail: "chore/go-1.25 → main · squash merged" } },
  closed: { label: "Closed", tone: "danger", hint: "Closed without merging", example: { value: "#377 · New pricing engine", detail: "Closed without merging · superseded by a new approach" } },
  conflicting: { label: "Conflicts", tone: "danger", hint: "Cannot merge cleanly", example: { value: "#412 · Validate cart before checkout", detail: "pkg/cart/checkout.go conflicts with main" } },
  blocked: { label: "Blocked", tone: "warning", hint: "Merge readiness reason", example: { value: "#412 · 1 required review missing", detail: "11 checks passed · 1 running · merge blocked" } },
} satisfies Record<string, GitState>;

export const GIT_CHECK_STATES = {
  passed: { label: "Passed", tone: "success", hint: "All checks green", example: { value: "Go tests · 1m 42s", detail: "238 tests passed · ubuntu-latest · a7e6d5c" } },
  failed: { label: "Failed", tone: "danger", hint: "At least one check failed", example: { value: "Web lint · 18s", detail: "web/src/Cart.tsx:24 · unused variable cartTotal" } },
  timedOut: { label: "Timed out", tone: "danger", hint: "A check exceeded its time limit; counts as failing", example: { value: "Checkout end-to-end · 10m", detail: "Exceeded the job time limit · runner cancelled" } },
  running: { label: "Running", tone: "warning", hint: "Checks in flight", example: { value: "Integration tests · 2m 14s elapsed", detail: "PostgreSQL 16 · 42 of 68 tests completed" } },
  pending: { label: "Pending", tone: "neutral", hint: "Queued or waiting", example: { value: "Build container · queued", detail: "Waiting for integration tests before building a7e6d5c" } },
} satisfies Record<string, GitState>;

export const GIT_REVIEW_STATES = {
  approved: { label: "Approved", tone: "success", hint: "Reviewers signed off", example: { value: "Sam Lee approved #412", detail: "slee · “Empty-cart handling looks good.”", reviewer: { name: "Sam Lee", login: "slee" } } },
  changesRequested: { label: "Changes requested", tone: "danger", hint: "A reviewer asked for changes", example: { value: "Mina Khan requested changes", detail: "mkhan · pkg/cart/checkout_test.go:22 · add invalid quantity cases", reviewer: { name: "Mina Khan", login: "mkhan" } } },
  reviewRequired: { label: "Review required", tone: "neutral", hint: "Waiting for a reviewer", example: { value: "#412 · Waiting for Sam Lee", detail: "slee requested by dortiz · 1 approval required", reviewer: { name: "Sam Lee", login: "slee" } } },
} satisfies Record<string, GitState>;

export const GIT_STATE_GROUPS: GitStateGroup[] = [
  { id: "file-change", title: "File changes", description: "Status of a path in a diff or working tree.", states: GIT_FILE_CHANGE_STATES },
  { id: "diff", title: "Diff stat", description: "GitHub style: +N green, -N red, and a five-block green / red / grey bar.", states: GIT_DIFF_STATES },
  { id: "branch", title: "Branch divergence", description: "Position relative to the base branch and remote.", states: GIT_BRANCH_STATES },
  { id: "commit", title: "Commit state", description: "Badges on a commit row.", states: GIT_COMMIT_STATES },
  { id: "worktree", title: "Worktree state", description: "Health of a checkout. ROOT marks the repository's main working tree; LINKED marks one added with git worktree add.", states: GIT_WORKTREE_STATES },
  { id: "pr", title: "Pull request state", description: "Lifecycle and mergeability.", states: GIT_PR_STATES },
  { id: "check", title: "Checks", description: "CI status.", states: GIT_CHECK_STATES },
  { id: "review", title: "Review", description: "Reviewer decision.", states: GIT_REVIEW_STATES },
];
