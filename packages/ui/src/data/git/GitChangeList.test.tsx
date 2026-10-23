import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  GitCommitList,
  GitDiffPanel,
  GitFileList,
  type GitCommitItem,
  type GitFileChangeItem,
} from "./GitChangeList";

// Stub the async highlighter so CodeDiff renders its plain-text fallback
// deterministically (each diff line's text stays a single node) without loading
// Shiki WASM. `languageFromPath` stays real.
vi.mock("../code-highlight", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../code-highlight")>()),
  highlightToLines: vi.fn(async () => null),
}));

const COMMITS: GitCommitItem[] = [
  {
    sha: "392799902c7fa82130fb4a43e6ea8734e11d1e98",
    title: "fix(deps): update pgx in test module",
    authorLogin: "adityathebe",
    committedAt: "2026-07-01T18:20:34Z",
    additions: 3,
    deletions: 3,
    changedFiles: 2,
  },
  {
    sha: "ad4a77ee2d0535f023bf1f1dfb1fa8b0da3c9c18",
    title: "docs: note pgx version",
    authorLogin: "moshe",
    committedAt: "2026-07-01T20:00:00Z",
  },
  {
    sha: "4ce8aa03c7a750a8aa83f80529b8512bafde70d9",
    title: "chore: follow-up",
    authorLogin: "moshe",
    committedAt: "2026-07-02T09:00:00Z",
  },
];

const FILES: GitFileChangeItem[] = [
  { path: "test/go.mod", status: "modified", additions: 1, deletions: 1 },
  { path: "test/go.sum", status: "modified", additions: 2, deletions: 2 },
];

describe("GitCommitList", () => {
  it("groups commits by committed date", () => {
    render(<GitCommitList commits={COMMITS} />);
    expect(screen.getByText(/Commits on Jul 1, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Commits on Jul 2, 2026/)).toBeInTheDocument();
  });

  it("loads a commit diff once when a row is expanded", async () => {
    const loadDiff = vi.fn().mockResolvedValue({
      diff: "diff --git a/test/go.mod b/test/go.mod\n@@ -1 +1 @@\n-github.com/jackc/pgx/v5 v5.7.4\n+github.com/jackc/pgx/v5 v5.7.5",
    });
    render(<GitCommitList commits={[COMMITS[0]!]} loadDiff={loadDiff} />);

    fireEvent.click(screen.getByText("fix(deps): update pgx in test module"));
    await screen.findByText(/github.com\/jackc\/pgx\/v5 v5.7.5/);
    fireEvent.click(screen.getByText("fix(deps): update pgx in test module"));
    fireEvent.click(screen.getByText("fix(deps): update pgx in test module"));

    await waitFor(() => expect(loadDiff).toHaveBeenCalledTimes(1));
  });
});

describe("GitCommitList slots", () => {
  type HistoryCommit = GitCommitItem & { change: "added" | "renamed" };
  const HISTORY: HistoryCommit[] = [
    { ...COMMITS[0]!, change: "renamed" },
    { ...COMMITS[1]!, change: "added" },
  ];
  const [renamed, added] = HISTORY as [HistoryCommit, HistoryCommit];
  const shortOf = (commit: GitCommitItem) => commit.sha.slice(0, 7);

  it("renders no checkboxes without onToggleSelect", () => {
    render(<GitCommitList commits={HISTORY} groupByDate={false} />);
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("checks the commits named by selectedShas and reports toggles without expanding", () => {
    const onToggleSelect = vi.fn();
    const loadDiff = vi.fn().mockResolvedValue({ diff: "" });
    render(
      <GitCommitList
        commits={HISTORY}
        groupByDate={false}
        loadDiff={loadDiff}
        selectedShas={[added.sha]}
        onToggleSelect={onToggleSelect}
      />,
    );

    const boxes = screen.getAllByRole("checkbox");
    expect(boxes.map((box) => [box.getAttribute("aria-label"), (box as HTMLInputElement).checked])).toEqual([
      [`Select commit ${shortOf(renamed)}`, false],
      [`Select commit ${shortOf(added)}`, true],
    ]);
    expect(document.querySelector(`[data-commit="${added.sha}"]`)).toHaveAttribute("data-selected", "true");

    fireEvent.click(boxes[0]!);
    expect(onToggleSelect).toHaveBeenCalledExactlyOnceWith(renamed);
    expect(loadDiff).not.toHaveBeenCalled();
    expect(screen.getAllByRole("button", { expanded: false })).toHaveLength(HISTORY.length);
  });

  it("disables the checkbox of a commit selectBlockReason refuses, with the reason as its tooltip", () => {
    const reason = "A merge commit cannot be cherry-picked";
    render(
      <GitCommitList
        commits={HISTORY}
        groupByDate={false}
        onToggleSelect={() => {}}
        selectBlockReason={(commit) => (commit.change === "added" ? reason : null)}
      />,
    );

    const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(boxes.map((box) => [box.disabled, box.closest("[title]")?.getAttribute("title") ?? null])).toEqual([
      [false, null],
      [true, reason],
    ]);
  });

  it("names each checkbox with selectLabel when given", () => {
    render(
      <GitCommitList
        commits={[renamed]}
        groupByDate={false}
        onToggleSelect={() => {}}
        selectLabel={(commit) => `Pick ${commit.change} ${shortOf(commit)}`}
      />,
    );
    expect(screen.getByRole("checkbox", { name: `Pick renamed ${shortOf(renamed)}` })).toBeInTheDocument();
  });

  it("renders badges beside each title and a subtitle under it, typed by the commit item", () => {
    render(
      <GitCommitList
        commits={HISTORY}
        groupByDate={false}
        renderBadges={(commit) => <span data-testid="badge">{commit.change}</span>}
        renderSubtitle={(commit) => (commit.change === "renamed" ? <span>moved across plans</span> : null)}
      />,
    );
    expect(screen.getAllByTestId("badge").map((badge) => badge.textContent)).toEqual(["renamed", "added"]);
    expect(screen.getAllByText("moved across plans")).toHaveLength(1);
  });

  it("renders renderExpanded in place of the diff panel, only once a row is expanded", () => {
    const renderExpanded = vi.fn((commit: HistoryCommit) => <div>custom body {commit.change}</div>);
    render(<GitCommitList commits={[renamed]} groupByDate={false} renderExpanded={renderExpanded} />);
    expect(renderExpanded).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { expanded: false }));

    expect(screen.getByText("custom body renamed")).toBeInTheDocument();
    expect(screen.queryByText("No text diff available")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument();
  });
});

describe("GitFileList", () => {
  it("loads a file diff when a file row is expanded", async () => {
    const loadDiff = vi.fn().mockResolvedValue({
      diff: "@@ -1 +1 @@\n-github.com/jackc/pgx/v5 v5.7.4\n+github.com/jackc/pgx/v5 v5.7.5",
    });
    render(<GitFileList files={FILES} loadDiff={loadDiff} />);

    fireEvent.click(screen.getByText("go.mod"));

    expect(await screen.findByText(/v5.7.5/)).toBeInTheDocument();
    expect(loadDiff).toHaveBeenCalledWith(FILES[0]);
  });

  it("shows loader errors inline", async () => {
    const loadDiff = vi.fn().mockRejectedValue(new Error("patch unavailable"));
    render(<GitFileList files={[FILES[0]!]} loadDiff={loadDiff} />);

    fireEvent.click(screen.getByText("go.mod"));

    expect(await screen.findByText("patch unavailable")).toBeInTheDocument();
  });
});

describe("GitDiffPanel line annotations", () => {
  const payload = { diff: "@@ -1,2 +1,2 @@\n a\n-b\n+B\n", path: "x.txt" };

  it("forwards onLineAction and lineWidgets to the diff", async () => {
    const onLineAction = vi.fn();
    render(
      <GitDiffPanel
        payload={payload}
        onLineAction={onLineAction}
        lineWidgets={[{ key: "c1", side: "new", line: 2, node: <span>looks good</span> }]}
      />,
    );
    await waitFor(() => expect(screen.getByText("looks good")).toBeInTheDocument());
    const addRow = document.querySelector('[data-diff-line="add"]') as HTMLElement;
    expect(addRow.nextElementSibling?.getAttribute("data-diff-widget")).toBe("c1");
    fireEvent.click(addRow.querySelector("button") as HTMLElement);
    expect(onLineAction).toHaveBeenCalledWith({ side: "new", line: 2, content: "B" });
  });

  it("renders no gutter buttons without onLineAction", async () => {
    render(<GitDiffPanel payload={payload} />);
    await waitFor(() => expect(document.querySelector("[data-diff-line]")).not.toBeNull());
    expect(document.querySelectorAll("button")).toHaveLength(0);
  });
});
