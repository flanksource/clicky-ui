import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { CodeDiff } from "../CodeDiff";
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

type HistoryCommit = GitCommitItem & {
  change: "added" | "modified" | "renamed";
  previousPath?: string;
  before: string;
  after: string;
};

const history: HistoryCommit[] = [
  {
    sha: "9f8e7d6c5b4a39281706f5e4d3c2b1a098765432",
    title: "Move AddRider under the Annuity plan",
    authorName: "Dana Reviewer",
    committedAt: "2026-10-12T09:30:00Z",
    change: "renamed",
    previousPath: "pr/Legacy/tr/AddRider",
    before: "<Transaction>\n  <Rider>Basic</Rider>\n</Transaction>",
    after: "<Transaction>\n  <Rider>Basic</Rider>\n</Transaction>",
  },
  {
    sha: "1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d",
    title: "Raise the rider age limit",
    body: "Underwriting asked for 75 instead of 70.",
    authorName: "Alex Author",
    committedAt: "2026-10-05T14:00:00Z",
    change: "modified",
    before: "<Transaction>\n  <MaxAge>70</MaxAge>\n</Transaction>",
    after: "<Transaction>\n  <MaxAge>75</MaxAge>\n</Transaction>",
  },
  {
    sha: "0f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6",
    title: "Add AddRider",
    authorName: "Alex Author",
    committedAt: "2026-09-28T08:15:00Z",
    change: "added",
    before: "",
    after: "<Transaction>\n  <MaxAge>70</MaxAge>\n</Transaction>",
  },
];

const CHANGE_TONE: Record<HistoryCommit["change"], string> = {
  added: "bg-emerald-500/15 text-emerald-700",
  modified: "bg-amber-500/15 text-amber-700",
  renamed: "bg-sky-500/15 text-sky-700",
};

function SelectableHistory() {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (commit: HistoryCommit) =>
    setSelected((current) =>
      current.includes(commit.sha)
        ? current.filter((sha) => sha !== commit.sha)
        : [...current, commit.sha].slice(-2),
    );
  return (
    <div className="max-w-3xl space-y-2">
      <p className="text-xs text-muted-foreground" data-testid="picked">
        Picked: {selected.map((sha) => sha.slice(0, 7)).join(" → ") || "none"}
      </p>
      <GitCommitList
        commits={history}
        groupByDate={false}
        selectedShas={selected}
        onToggleSelect={toggle}
        selectLabel={(commit) => `Pick ${commit.sha.slice(0, 7)} for comparison`}
        renderBadges={(commit) => (
          <span className={`rounded px-1.5 text-[10px] font-medium ${CHANGE_TONE[commit.change]}`}>
            {commit.change}
          </span>
        )}
        renderSubtitle={(commit) =>
          commit.previousPath ? (
            <div className="mt-1 font-mono text-[11px] text-muted-foreground">from {commit.previousPath}</div>
          ) : null
        }
        renderExpanded={(commit) =>
          commit.before === commit.after ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Content unchanged; only the path moved.</p>
          ) : (
            <div className="px-3 py-2">
              <CodeDiff original={commit.before} modified={commit.after} language="xml" />
            </div>
          )
        }
      />
    </div>
  );
}

export const SelectableWithBadgesAndCustomBody: Story = {
  render: () => <SelectableHistory />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("ticking two commits picks them without expanding either", async () => {
      await userEvent.click(canvas.getByRole("checkbox", { name: "Pick 1a2b3c4 for comparison" }));
      await userEvent.click(canvas.getByRole("checkbox", { name: "Pick 0f1e2d3 for comparison" }));
      await expect(canvas.getByTestId("picked")).toHaveTextContent("Picked: 1a2b3c4 → 0f1e2d3");
      await expect(canvas.queryAllByRole("button", { expanded: true })).toHaveLength(0);
    });
    await step("expanding a commit renders the host body instead of GitDiffPanel", async () => {
      await userEvent.click(canvas.getByText("Raise the rider age limit"));
      await waitFor(() =>
        expect(canvasElement.querySelectorAll('[data-diff-line="add"]').length).toBeGreaterThan(0),
      );
      await expect(canvas.getByText("renamed")).toBeInTheDocument();
      await expect(canvas.getByText("from pr/Legacy/tr/AddRider")).toBeInTheDocument();
    });
  },
};

type PickCommit = GitCommitItem & { merge?: boolean };

const picks: PickCommit[] = [
  { sha: "1111111111111111111111111111111111111111", title: "ValidateBillGroup: reject empty groups", authorName: "Thandi", committedAt: "2026-10-17T08:00:00Z", changedFiles: 1 },
  { sha: "2222222222222222222222222222222222222222", title: "Merge feature/dates", authorName: "bot", committedAt: "2026-10-17T09:00:00Z", merge: true },
  { sha: "3333333333333333333333333333333333333333", title: "GroupLifeCover: default start", authorName: "Sipho", committedAt: "2026-10-17T10:00:00Z", changedFiles: 1 },
];

function PickableWithBlocked() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className="max-w-3xl">
      <GitCommitList
        commits={picks}
        groupByDate={false}
        selectedShas={selected}
        onToggleSelect={(commit) =>
          setSelected((current) => current.includes(commit.sha) ? current.filter((sha) => sha !== commit.sha) : [...current, commit.sha])}
        selectBlockReason={(commit) => commit.merge ? "A merge commit cannot be cherry-picked; pick the commits it merges." : null}
      />
    </div>
  );
}

export const SelectableWithBlockedCommit: Story = {
  render: () => <PickableWithBlocked />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox", { name: "Select commit 2222222" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select commit 1111111" }));
    await expect(canvas.getByRole("checkbox", { name: "Select commit 1111111" })).toBeChecked();
  },
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
