import type { VocabularyDeclarationItem } from "@flanksource/clicky-ui/comments";

import { GIT_STATE_GROUPS, type GitStateExample, type GitStateGroupId, type GitTone } from "./_states";

export type GitObject =
  | "repository"
  | "branch"
  | "commit"
  | "worktree"
  | "pullRequest"
  | "merge"
  | "upstream"
  | "tag"
  | "tree"
  | "blob";
export type GitObjectItem = VocabularyDeclarationItem & {
  object: GitObject;
  provider: "git" | "github" | "azure_devops";
  value: string;
  detail: string;
};
export type GitDiffStatItem = VocabularyDeclarationItem & {
  presentation: "diffStat";
  additions: number;
  deletions: number;
  files?: number;
  detail: string;
};
export type GitStateItem = VocabularyDeclarationItem & {
  group: GitStateGroupId;
  state: string;
  tone: GitTone;
  example: GitStateExample;
};
export type GitVocabularyItem = GitObjectItem | GitDiffStatItem | GitStateItem;
export const isGitDiffStat = (item: GitVocabularyItem): item is GitDiffStatItem =>
  item.type === "git-diff-stat";
export const isGitState = (item: GitVocabularyItem): item is GitStateItem =>
  item.type.startsWith("git-state-");

const stateItems: GitStateItem[] = GIT_STATE_GROUPS.flatMap((group) =>
  Object.entries(group.states).map(([state, definition]) => ({
    type: `git-state-${group.id}`,
    id: `git-state-${group.id}/${state}`,
    label: `${group.title} · ${definition.label}`,
    description: `${definition.hint}. Glyph in the ${definition.tone} tone: the tone carries the state, the glyph its kind.`,
    group: group.id,
    state,
    tone: definition.tone,
    example: definition.example,
    references: [
      "src/vocabularies/git/index.tsx",
      "src/vocabularies/git/_states.ts",
      "src/vocabularies/git/_theme.ts",
    ],
  })),
);

const diffStats: GitDiffStatItem[] = [
  {
    type: "git-diff-stat",
    id: "git-diff-stat/lines",
    label: "Diff stat",
    description:
      "Line changes as +additions in green and -deletions in red, followed by a five-block proportion bar. Use it beside a commit, branch, pull request or file; hide the bar where space is tight.",
    presentation: "diffStat",
    additions: 24,
    deletions: 7,
    detail: "24 additions, 7 deletions",
    references: [
      "src/vocabularies/git/index.tsx",
      "src/vocabularies/git/_parts.tsx",
    ],
  },
  {
    type: "git-diff-stat",
    id: "git-diff-stat/files",
    label: "Diff stat with files",
    description:
      "A diff stat prefixed with its changed-file count, for change sets spanning several files such as a commit, branch comparison or pull request.",
    presentation: "diffStat",
    additions: 24,
    deletions: 7,
    files: 4,
    detail: "4 changed files, 24 additions, 7 deletions",
    references: [
      "src/vocabularies/git/index.tsx",
      "src/vocabularies/git/_parts.tsx",
    ],
  },
];

const objects: {
  object: GitObject;
  label: string;
  description: string;
  value: string;
  detail: string;
}[] = [
  {
    object: "branch",
    label: "Branch",
    description:
      "A named reference to a line of commits. Use the branch glyph beside its name.",
    value: "feat/cart-validation",
    detail: "3 commits ahead of main · Dana Ortiz",
  },
  {
    object: "commit",
    label: "Commit",
    description:
      "A recorded snapshot with parent history and author metadata. Show a short SHA beside the commit glyph.",
    value: "a7e6d5c",
    detail: "feat(cart): validate cart before checkout · Dana Ortiz",
  },
  {
    object: "worktree",
    label: "Worktree",
    description:
      "A checked-out working directory associated with a repository. Display its local path.",
    value: "~/src/widgets-cart",
    detail: "acme/widgets · feat/cart-validation",
  },
  {
    object: "pullRequest",
    label: "Pull request",
    description:
      "A hosting-service proposal to merge a source branch into a target branch. Use a provider variant when its host is known.",
    value: "#412 · Validate cart before checkout",
    detail: "feat/cart-validation → main · 4 files changed",
  },
  {
    object: "merge",
    label: "Merge",
    description:
      "Combining lines of history. Use the merge glyph beside the resulting change, keeping lifecycle colour separate from object identity.",
    value: "#398 · Bump Go to 1.25",
    detail: "chore/go-1.25 → main · squash merged",
  },
  {
    object: "upstream",
    label: "Remote tracking",
    description:
      "The remote-tracking reference used to compare a local branch with its upstream.",
    value: "origin/feat/cart-validation",
    detail: "Tracking feat/cart-validation · 2 commits to push",
  },
  {
    object: "repository",
    label: "Repository",
    description:
      "A Git object database and its references. Show the repository name beside the repository glyph.",
    value: "acme/widgets",
    detail: "Default branch main · origin",
  },
  {
    object: "tag",
    label: "Tag",
    description:
      "A named reference, usually identifying a release. An annotated tag is itself a Git object.",
    value: "v1.8.0",
    detail: "Release tag · a7e6d5c",
  },
  {
    object: "tree",
    label: "Tree",
    description:
      "A Git object describing directory entries that reference blobs and other trees.",
    value: "pkg/cart/",
    detail: "Directory snapshot · checkout.go · checkout_test.go",
  },
  {
    object: "blob",
    label: "Blob",
    description:
      "A Git object containing file content; its filename is stored in the containing tree.",
    value: "pkg/cart/checkout.go",
    detail: "File content at a7e6d5c",
  },
];

const providers = [
  {
    id: "github",
    type: "github-object",
    name: "GitHub",
    reference: "https://docs.github.com/en/repositories",
  },
  {
    id: "azure_devops",
    type: "ado-object",
    name: "Azure DevOps",
    reference: "https://learn.microsoft.com/en-us/azure/devops/repos/git/",
  },
] as const;

export const GIT_VOCABULARY: GitVocabularyItem[] = [
  ...objects.map((item) => ({
    ...item,
    type: "git-object",
    id: `git-object/${item.object}`,
    provider: "git" as const,
    references: [
      "src/vocabularies/git/index.tsx",
      "https://git-scm.com/docs/gitglossary",
    ],
  })),
  ...providers.flatMap((provider) =>
    objects
      .filter((item) =>
        ["repository", "branch", "commit", "pullRequest"].includes(item.object),
      )
      .map((item) => ({
        ...item,
        type: provider.type,
        id: `${provider.type}/${item.object}`,
        label: `${provider.name} · ${item.label}`,
        provider: provider.id,
        description: `${item.description} ${provider.name} variant: the object links to its native repository, branch, commit or pull-request page.`,
        references: [
          "src/vocabularies/git/index.tsx",
          "packages/ui/src/data/git/git-links.ts",
          provider.reference,
        ],
      })),
  ),
  ...diffStats,
  ...stateItems,
];
