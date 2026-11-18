import type { StaticIconComponent } from "@flanksource/clicky-ui/data";
import {
  UiAdd,
  UiArrowDown,
  UiArrowUp,
  UiCheck,
  UiCircleX,
  UiClock,
  UiCloudUpload,
  UiCopy,
  UiEye,
  UiFile,
  UiFilePlus,
  UiFileCode,
  UiFolderGit,
  UiGitBranch,
  UiGitCommit,
  UiGitMerge,
  UiGitPr,
  UiLoader,
  UiLock,
  UiPencilSimpleLine,
  UiQuestion,
  UiRemove,
  UiStack,
  UiSteps,
  UiSwap,
  UiThumbsDown,
  UiThumbsUp,
  UiTimer,
  UiWarningTriangle,
} from "@flanksource/clicky-ui/icons";

import {
  GIT_BRANCH_STATES,
  GIT_CHECK_STATES,
  GIT_COMMIT_STATES,
  GIT_DIFF_STATES,
  GIT_FILE_CHANGE_STATES,
  GIT_PR_STATES,
  GIT_REVIEW_STATES,
  GIT_STATE_GROUPS,
  GIT_WORKTREE_STATES,
  type GitState,
  type GitStateGroupId,
  type GitTone,
} from "./_states";

export type { GitTone } from "./_states";

/**
 * The Git vocabulary's iconography and colour theme: each state from
 * `_states.ts` paired with a `Ui*` icon. Every git component reads from here, so
 * an added file, an ahead branch and a passing check mean the same thing on every
 * page.
 *
 * Tones reuse clicky-ui's Badge tone vocabulary (`success | warning | danger |
 * info | neutral`) plus two git-specific hues: `merged` (violet, GitHub's merged
 * purple) and `accent` (teal, derived content such as a copied file). Class
 * strings are written out in full because Tailwind only emits what it can read
 * literally; custom dark colours use `[[data-theme=dark]_&]:` because `dark:`
 * compiles to prefers-color-scheme in the shipped CSS.
 */

/** Text / glyph colour for a tone. */
export const GIT_TONE_TEXT: Record<GitTone, string> = {
  success: "text-emerald-600 [[data-theme=dark]_&]:text-emerald-400",
  warning: "text-amber-600 [[data-theme=dark]_&]:text-amber-400",
  danger: "text-rose-600 [[data-theme=dark]_&]:text-rose-400",
  info: "text-sky-600 [[data-theme=dark]_&]:text-sky-400",
  neutral: "text-muted-foreground",
  merged: "text-violet-600 [[data-theme=dark]_&]:text-violet-400",
  accent: "text-teal-600 [[data-theme=dark]_&]:text-teal-400",
};

/** Solid swatch for a tone, used by the legend and diff bars. */
export const GIT_TONE_SWATCH: Record<GitTone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  neutral: "bg-muted-foreground/40",
  merged: "bg-violet-500",
  accent: "bg-teal-500",
};

/** Soft pill for the tones clicky-ui's Badge has no variant for. */
export const GIT_TONE_PILL: Partial<Record<GitTone, string>> = {
  merged: "bg-violet-100 text-violet-800 [[data-theme=dark]_&]:bg-violet-500/20 [[data-theme=dark]_&]:text-violet-300",
  accent: "bg-teal-100 text-teal-800 [[data-theme=dark]_&]:bg-teal-500/20 [[data-theme=dark]_&]:text-teal-300",
};

export type GitToken = { label: string; icon: StaticIconComponent; tone: GitTone; hint: string };

const token = (label: string, icon: StaticIconComponent, tone: GitTone, hint: string): GitToken => ({ label, icon, tone, hint });

/** Pairs every state of a group with its icon; a missing or extra icon fails at type-check time. */
function tokens<K extends string>(states: Record<K, GitState>, icons: Record<K, StaticIconComponent>): Record<K, GitToken> {
  return Object.fromEntries(
    (Object.keys(states) as K[]).map((key) => [key, { label: states[key].label, tone: states[key].tone, hint: states[key].hint, icon: icons[key] }]),
  ) as Record<K, GitToken>;
}

/** The nouns of git. Other groups borrow these icons so a concept keeps one glyph everywhere. */
export const GIT_CONCEPT = {
  branch: token("Branch", UiGitBranch, "neutral", "A named line of commits"),
  commit: token("Commit", UiGitCommit, "neutral", "One recorded change"),
  worktree: token("Worktree", UiFolderGit, "neutral", "A checked-out working directory"),
  pullRequest: token("Pull request", UiGitPr, "neutral", "A proposal to land a branch"),
  merge: token("Merge", UiGitMerge, "neutral", "Landing one line of history on another"),
  upstream: token("Remote tracking", UiCloudUpload, "neutral", "The remote ref a branch publishes to"),
} satisfies Record<string, GitToken>;

export const GIT_FILE_CHANGE = tokens(GIT_FILE_CHANGE_STATES, {
  added: UiFilePlus,
  modified: UiFile,
  deleted: UiRemove,
  renamed: UiFileCode,
  copied: UiCopy,
  untracked: UiQuestion,
  conflict: UiWarningTriangle,
  staged: UiCheck,
});

export const GIT_DIFF = tokens(GIT_DIFF_STATES, { additions: UiAdd, deletions: UiRemove });

export const GIT_BRANCH_STATE = tokens(GIT_BRANCH_STATES, {
  ahead: UiArrowUp,
  behind: UiArrowDown,
  diverged: UiSwap,
  even: UiCheck,
  unpublished: GIT_CONCEPT.upstream.icon,
});

export const GIT_COMMIT_STATE = tokens(GIT_COMMIT_STATES, { local: GIT_CONCEPT.upstream.icon, fixup: UiStack });

export const GIT_WORKTREE_STATE = tokens(GIT_WORKTREE_STATES, {
  clean: UiCheck,
  dirty: UiPencilSimpleLine,
  conflict: GIT_FILE_CHANGE.conflict.icon,
  detached: UiGitCommit,
  locked: UiLock,
  missing: UiCircleX,
  stale: UiWarningTriangle,
  operation: UiSteps,
});

export const GIT_PR_STATE = tokens(GIT_PR_STATES, {
  draft: GIT_CONCEPT.pullRequest.icon,
  open: GIT_CONCEPT.pullRequest.icon,
  merged: GIT_CONCEPT.merge.icon,
  closed: UiCircleX,
  conflicting: GIT_FILE_CHANGE.conflict.icon,
  blocked: UiWarningTriangle,
});

export const GIT_CHECK_STATE = tokens(GIT_CHECK_STATES, {
  passed: UiCheck,
  failed: UiCircleX,
  timedOut: UiTimer,
  running: UiLoader,
  pending: UiClock,
});

export const GIT_REVIEW_STATE = tokens(GIT_REVIEW_STATES, {
  approved: UiThumbsUp,
  changesRequested: UiThumbsDown,
  reviewRequired: UiEye,
});

const GROUP_TOKENS: Record<GitStateGroupId, Record<string, GitToken>> = {
  "file-change": GIT_FILE_CHANGE,
  diff: GIT_DIFF,
  branch: GIT_BRANCH_STATE,
  commit: GIT_COMMIT_STATE,
  worktree: GIT_WORKTREE_STATE,
  pr: GIT_PR_STATE,
  check: GIT_CHECK_STATE,
  review: GIT_REVIEW_STATE,
};

/** The themed token for one state, failing loudly on an unknown group or key. */
export function gitStateToken(group: GitStateGroupId, key: string): GitToken {
  const found = GROUP_TOKENS[group][key];
  if (!found) throw new Error(`Unknown Git state token: ${group}.${key}`);
  return found;
}

export const GIT_THEME_GROUPS = GIT_STATE_GROUPS.map((group) => ({ ...group, tokens: GROUP_TOKENS[group.id] }));

/** GitHub's five-block diff bar: filled blocks proportional to additions / deletions (each non-zero side gets one), the rest grey. */
export function diffBlocks({ adds, dels }: { adds: number; dels: number }): GitTone[] {
  const total = adds + dels;
  const filled = Math.min(5, total);
  let addBlocks = total ? Math.round((adds / total) * filled) : 0;
  if (adds && addBlocks === 0) addBlocks = 1;
  if (dels && addBlocks === filled) addBlocks = filled - 1;
  return Array.from({ length: 5 }, (_, i) => (i < addBlocks ? "success" : i < filled ? "danger" : "neutral"));
}
