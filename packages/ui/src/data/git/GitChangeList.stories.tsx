import type { Meta, StoryObj } from "@storybook/react-vite";
import { GitChangedFilesSummary, GitCommitList, GitFileList, type GitCommitItem, type GitFileChangeItem } from "./GitChangeList";

const commits: GitCommitItem[] = [
  {
    sha: "392799902c7fa82130fb4a43e6ea8734e11d1e98",
    title: "fix(deps): update pgx in test module",
    authorLogin: "adityathebe",
    committedAt: "2026-07-01T18:20:34Z",
    additions: 3,
    deletions: 3,
    changedFiles: 2,
    href: "https://github.com/flanksource/postgres/commit/392799902c7fa82130fb4a43e6ea8734e11d1e98",
  },
  {
    sha: "4ce8aa03c7a750a8aa83f80529b8512bafde70d9",
    title: "chore: update lockfile",
    authorLogin: "moshe",
    committedAt: "2026-07-02T09:00:00Z",
    additions: 12,
    deletions: 4,
    changedFiles: 1,
  },
];

const files: GitFileChangeItem[] = [
  { path: "test/go.mod", status: "modified", additions: 1, deletions: 1 },
  { path: "test/go.sum", status: "modified", additions: 2, deletions: 2 },
  { path: "docs/dependencies.md", status: "added", additions: 18, deletions: 0 },
];

const meta: Meta = {
  title: "Data/GitChangeList",
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj;

export const Commits: Story = {
  render: () => (
    <div className="max-w-3xl">
      <GitCommitList
        commits={commits}
        loadDiff={async commit => ({
          commit: commit.sha,
          diff: `diff --git a/test/go.mod b/test/go.mod\n@@ -1 +1 @@\n-github.com/jackc/pgx/v5 v5.7.4\n+github.com/jackc/pgx/v5 v5.7.5`,
        })}
      />
    </div>
  ),
};

export const Files: Story = {
  render: () => (
    <div className="max-w-3xl space-y-2">
      <GitChangedFilesSummary files={files.length} additions={21} deletions={3} />
      <GitFileList
        files={files}
        loadDiff={async file => ({
          path: file.path,
          diff: `diff --git a/${file.path} b/${file.path}\n@@ -1 +1 @@\n-old dependency\n+new dependency`,
        })}
      />
    </div>
  ),
};
