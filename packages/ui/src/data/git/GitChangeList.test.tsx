import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GitCommitList, GitFileList, type GitCommitItem, type GitFileChangeItem } from "./GitChangeList";

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
