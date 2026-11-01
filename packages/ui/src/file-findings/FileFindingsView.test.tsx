import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Keep the Shiki dynamic imports out of jsdom (same approach as Markdown.test.tsx).
vi.mock("../data/code-highlight", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/code-highlight")>()),
  highlightCode: vi.fn(async () => null),
  highlightToLines: vi.fn(async () => null),
}));

import { FileFindingsView } from "./FileFindingsView";
import type { FileReviewView } from "./file-review/FileReview";
import { emptyProblemFilters, type ProblemFilters } from "./file-review/problem-filters";
import type { FileFinding, FileRef } from "./types";

const WORK_DIR = "/repo/gavel";
const GO_FILE = "pkg/server/handler.go";
const MD_FILE = "docs/guide.md";

function finding(file: string, line: number, severity: FileFinding["severity"], message: string): FileFinding {
  return { file, workDir: WORK_DIR, line, severity, message, source: "golangci-lint", rule: "rule", kind: "lint" };
}

const FINDINGS: FileFinding[] = [
  finding(GO_FILE, 3, "error", "Error return value is not checked"),
  finding(GO_FILE, 5, "warning", "Unused parameter"),
  finding(MD_FILE, 3, "warning", "Line too long"),
];

const FILES: Record<string, string> = {
  [GO_FILE]: ["package server", "", "func Handle() {", "\tcall()", "\t_ = x", "}"].join("\n"),
  [MD_FILE]: "# Guide\n\nA long line.\n",
};

function Harness({
  loadFile,
  initialFile = null,
  initialView = "preview",
  onViewChange,
  onSelectFile,
  onLineChange,
  getFindingActions,
}: {
  loadFile: (file: FileRef) => Promise<string>;
  initialFile?: FileRef | null;
  initialView?: FileReviewView;
  onViewChange?: (view: FileReviewView) => void;
  onSelectFile?: (file: FileRef) => void;
  onLineChange?: (line: number | undefined) => void;
  getFindingActions?: (finding: FileFinding) => import("../overlay/DropdownMenu").DropdownMenuItem[];
}) {
  const [file, setFile] = useState<FileRef | null>(initialFile);
  const [view, setView] = useState<FileReviewView>(initialView);
  const [line, setLine] = useState<number | undefined>(undefined);
  const [problemFilters, setProblemFilters] = useState<ProblemFilters>(emptyProblemFilters);
  return (
    <FileFindingsView
      findings={FINDINGS}
      selectedFile={file}
      onSelectFile={(next) => {
        onSelectFile?.(next);
        setFile(next);
      }}
      line={line}
      onLineChange={(next) => {
        onLineChange?.(next);
        setLine(next);
      }}
      view={view}
      onViewChange={(next) => {
        onViewChange?.(next);
        setView(next);
      }}
      problemFilters={problemFilters}
      onProblemFiltersChange={setProblemFilters}
      loadFile={loadFile}
      {...(getFindingActions ? { getFindingActions } : {})}
    />
  );
}

const readFile = (file: FileRef) => Promise.resolve(FILES[file.file]!);
const listedLines = (container: HTMLElement) => container.querySelectorAll("[data-source-line]").length;

// jsdom does no layout and gives Range no client rects; measured highlights are simply empty.
beforeAll(() => {
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect = () => new DOMRect();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FileFindingsView", () => {
  it("lists the files with findings, with per-severity counts, and asks to open a clicked file", async () => {
    const onSelectFile = vi.fn();
    render(<Harness loadFile={readFile} onSelectFile={onSelectFile} />);

    // Single-child folders are folded into their file's row.
    const row = await screen.findByText("pkg/server/handler.go");
    expect(screen.getByText("docs/guide.md")).toBeInTheDocument();
    expect(screen.getAllByTitle("1 error")).toHaveLength(1);
    expect(screen.getAllByTitle("1 warning")).toHaveLength(2);
    expect(screen.getByText("Select a file to see its findings in context.")).toBeInTheDocument();

    fireEvent.click(row);

    expect(onSelectFile).toHaveBeenCalledWith({ workDir: WORK_DIR, file: GO_FILE });
  });

  it("loads a code file and lists its source with each finding under its line, even when the view is preview", async () => {
    let finishLoading!: (text: string) => void;
    const loadFile = vi.fn(() => new Promise<string>((resolve) => (finishLoading = resolve)));
    const { container } = render(<Harness loadFile={loadFile} initialFile={{ workDir: WORK_DIR, file: GO_FILE }} />);

    expect(await screen.findByText(`Loading ${GO_FILE}`)).toBeInTheDocument();
    finishLoading(FILES[GO_FILE]!);
    await waitFor(() => expect(listedLines(container)).toBe(6));

    const messages = (line: number) => within(container.querySelector<HTMLElement>(`[data-source-line="${line}"]`)!).queryAllByRole("button").map((b) => b.textContent);
    expect({
      loaded: loadFile.mock.calls[0],
      tabs: screen.getAllByRole("tab").map((tab) => tab.textContent?.replace(/\d+$/, "")),
      line3: messages(3),
      line5: messages(5),
    }).toEqual({
      loaded: [{ workDir: WORK_DIR, file: GO_FILE }],
      tabs: ["Source", "Problems"],
      line3: ["Error return value is not checkedgolangci-lint rule"],
      line5: ["Unused parametergolangci-lint rule"],
    });
  });

  it("reports the line of a picked finding and shows the host's actions beside it", async () => {
    const onLineChange = vi.fn();
    const { container } = render(
      <Harness
        loadFile={readFile}
        initialFile={{ workDir: WORK_DIR, file: GO_FILE }}
        onLineChange={onLineChange}
        getFindingActions={(f) => [{ label: `Ignore ${f.rule}`, onSelect: vi.fn() }]}
      />,
    );
    await waitFor(() => expect(listedLines(container)).toBe(6));

    const row = container.querySelector<HTMLElement>('[data-source-line="5"] [data-source-finding]')!;
    fireEvent.click(within(row).getByRole("button", { name: /Unused parameter/ }));

    fireEvent.click(within(row).getByRole("button", { name: "Problem actions" }));
    expect({ line: onLineChange.mock.calls.at(-1), action: screen.getByRole("menuitem", { name: "Ignore rule" }).textContent }).toEqual({
      line: [5],
      action: "Ignore rule",
    });
  });

  it("shows the whole load error, not a summary of it", async () => {
    const loadFile = () => Promise.reject(new Error("GET /api/file: 404 file not found: pkg/server/handler.go"));
    render(<Harness loadFile={loadFile} initialFile={{ workDir: WORK_DIR, file: GO_FILE }} />);

    const alert = await screen.findByRole("alert");

    expect(alert).toHaveTextContent("Could not load pkg/server/handler.go");
    expect(alert).toHaveTextContent("GET /api/file: 404 file not found: pkg/server/handler.go");
  });

  it("renders a markdown file with its findings and switches to the source listing on request", async () => {
    const onViewChange = vi.fn();
    const { container } = render(
      <Harness loadFile={readFile} initialFile={{ workDir: WORK_DIR, file: MD_FILE }} onViewChange={onViewChange} />,
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Guide" })).toBeVisible();
    expect(await screen.findByText(/Line too long/)).toBeInTheDocument();
    expect(listedLines(container)).toBe(0);

    fireEvent.click(screen.getByRole("tab", { name: "Source" }));

    expect(onViewChange).toHaveBeenCalledWith("source");
    await waitFor(() => expect(container.querySelector('[data-source-line="3"]')).toHaveTextContent("A long line."));
  });

  it("says so when the open file has no findings in this run", async () => {
    render(<Harness loadFile={readFile} initialFile={{ workDir: WORK_DIR, file: "gone/away.go" }} />);

    expect(await screen.findByText("gone/away.go has no findings in this run.")).toBeInTheDocument();
  });

  it("does not reload the open file when the host passes a new loadFile each render", async () => {
    const loads = vi.fn(readFile);
    function Unstable() {
      const [, force] = useState(0);
      return (
        <>
          <button type="button" onClick={() => force((n) => n + 1)}>
            rerender
          </button>
          <Harness loadFile={(file) => loads(file)} initialFile={{ workDir: WORK_DIR, file: GO_FILE }} />
        </>
      );
    }
    const { container } = render(<Unstable />);
    await waitFor(() => expect(listedLines(container)).toBe(6));

    fireEvent.click(screen.getByRole("button", { name: "rerender" }));

    expect(loads).toHaveBeenCalledTimes(1);
  });
});
