import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

// Keep the Shiki dynamic imports out of jsdom (same approach as Markdown.test.tsx).
vi.mock("../../data/code-highlight", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../data/code-highlight")>()),
  highlightCode: vi.fn(async () => null),
  highlightToLines: vi.fn(async () => null),
}));
// Monaco does not run in jsdom; the stub stands in for the editor's source and change seam.
vi.mock("../AnnotatedCode", () => ({
  AnnotatedCode: ({ source, onChange }: { source: string; onChange?: (source: string) => void }) => (
    <textarea data-testid="editor" value={source} onChange={(event) => onChange?.(event.target.value)} />
  ),
}));

import type { Comment } from "../../comments/comment-types";
import type { FileFinding } from "../types";
import { FileReview, type FileReviewProps } from "./FileReview";
import { emptyProblemFilters, type ProblemFilters } from "./problem-filters";
import { quoteAnchor } from "./quote-anchor";
import { sourceAnchor } from "./source-anchor";
import type { BlameRange } from "./blame";
import { highlightToLines } from "../../data/code-highlight";

const PATH = "docs/release.md";
const SOURCE = [
  "# Release", // 1
  "", // 2
  "Tag the commit with the next version and push the tag.", // 3
  "", // 4
  "Watch the dashboard for an hour.", // 5
].join("\n");

const FINDINGS: FileFinding[] = [
  { file: PATH, line: 3, severity: "warning", rule: "MD013", message: "Line too long", source: "markdownlint", kind: "lint" },
  { file: PATH, line: 5, severity: "error", rule: "vale.Units", message: "Spell out hour", source: "vale", kind: "lint" },
];

const DASHBOARD_QUOTE = { path: ["Release"], prefix: "Watch the", quote: "dashboard", suffix: "for an" };
const COMMENT: Comment = {
  id: "c1",
  body: "Which dashboard?",
  status: "open",
  anchor: quoteAnchor(DASHBOARD_QUOTE),
  createdAt: "2026-10-24T09:00:00.000Z",
  author: { id: "dana", name: "Dana", kind: "user" },
};

/** FileReview with the Problems filters held in state, as a host's URL would. */
function WithProblemFilters(props: FileReviewProps) {
  const [problemFilters, setProblemFilters] = useState<ProblemFilters>(emptyProblemFilters);
  return <FileReview problemFilters={problemFilters} onProblemFiltersChange={setProblemFilters} {...props} />;
}

function renderReview(props: Partial<FileReviewProps> = {}) {
  const onViewChange = vi.fn();
  const view = render(<WithProblemFilters path={PATH} source={SOURCE} view="preview" onViewChange={onViewChange} {...props} />);
  return { ...view, onViewChange };
}

const problemLines = () => Array.from(document.querySelectorAll("[data-problem-line] [data-problem-ln]"), (row) => row.textContent);

const tabNames = () => screen.getAllByRole("tab").map((tab) => tab.textContent?.replace(/\d+$/, "").trim());

describe("FileReview", () => {
  it("offers only Preview and Source, and no thread counts, without findings or comments", () => {
    renderReview();
    expect({ tabs: tabNames(), counts: screen.queryByText(/open ·/) }).toEqual({ tabs: ["Preview", "Source"], counts: null });
  });

  it("adds a Problems tab listing every finding worst first, and opening one switches to the preview", () => {
    const { onViewChange } = renderReview({ findings: FINDINGS, view: "problems" });
    expect(tabNames()).toEqual(["Preview", "Source", "Problems"]);
    const rows = screen.getAllByRole("button", { expanded: false }).filter((row) => row.querySelector("[data-problem-ln]"));
    expect(rows.map((row) => row.querySelector("[data-problem-ln]")?.textContent)).toEqual(["5", "3"]);
    fireEvent.click(rows[1]!);
    expect(onViewChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button", { name: "Problem actions" })[1]!);
    fireEvent.click(screen.getByRole("menuitem", { name: "Open in preview" }));
    expect(onViewChange).toHaveBeenCalledWith("preview");
  });

  it("filters Problems by severity and issue type, each pill cycling include, exclude, clear", () => {
    const findings: FileFinding[] = [...FINDINGS, { ...FINDINGS[0]!, line: 1, rule: "MD041", message: "First line should be a heading" }];
    renderReview({ findings, view: "problems" });
    const pill = (name: RegExp) => within(screen.getByRole("menu", { name: "Problem view options" })).getByText(name);
    const all = problemLines();
    fireEvent.click(screen.getByRole("button", { name: /^View Options/ }));

    fireEvent.click(pill(/^Warnings/));
    const onlyWarnings = problemLines();
    fireEvent.click(pill(/^Warnings/));
    const noWarnings = problemLines();
    fireEvent.click(pill(/^Warnings/));
    fireEvent.click(pill(/^MD013/));
    fireEvent.click(pill(/^MD013/));
    const noMD013 = problemLines();
    fireEvent.click(pill(/^vale\.Units/));
    fireEvent.click(pill(/^vale\.Units/));
    fireEvent.click(pill(/^MD041/));
    fireEvent.click(pill(/^MD041/));
    const noneLeft = { lines: problemLines(), empty: screen.queryByText("No problems match the current filters.") !== null };
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect({ all, onlyWarnings, noWarnings, noMD013, noneLeft, cleared: problemLines() }).toEqual({
      all: ["5", "1", "3"],
      onlyWarnings: ["1", "3"],
      noWarnings: ["5"],
      noMD013: ["5", "1"],
      noneLeft: { lines: [], empty: true },
      cleared: ["5", "1", "3"],
    });
  });

  it("rejects the Problems view without its filters", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<FileReview path={PATH} source={SOURCE} view="problems" onViewChange={vi.fn()} findings={FINDINGS} />)).toThrow(/needs `problemFilters`/);
  });

  it("rejects the Problems view when no findings were given", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderReview({ view: "problems" })).toThrow(/needs `findings`/);
  });

  it("highlights a commented quote in read-only source and lists its thread under that line", async () => {
    const { container } = renderReview({ view: "source", comments: { items: [COMMENT], callbacks: {} } });
    await waitFor(() => expect(container.querySelector("mark[data-source-comment]")).not.toBeNull());
    const line = container.querySelector<HTMLElement>('[data-source-line="5"]')!;
    expect({
      highlighted: line.querySelector("mark")?.textContent,
      thread: within(line).getByRole("button", { name: /Which dashboard\?/ }).dataset.sourceThread,
    }).toEqual({ highlighted: "dashboard", thread: COMMENT.anchor });
  });

  it("edits the raw source in the editor when onSourceChange is given", async () => {
    const onSourceChange = vi.fn();
    const { container } = renderReview({ view: "source", findings: FINDINGS, onSourceChange });
    const editor = await screen.findByTestId("editor");
    fireEvent.change(editor, { target: { value: `${SOURCE}\n` } });
    expect({ listing: container.querySelector("[data-source-line]"), edited: onSourceChange.mock.calls[0]?.[0] }).toEqual({
      listing: null,
      edited: `${SOURCE}\n`,
    });
  });
});

describe("FileReview on a code file", () => {
  const GO_PATH = "pkg/retry/retry.go";
  const GO = ["package retry", "", "func Retry(n int) error {", "\treturn call(n)", "}"].join("\n");
  const GO_FINDING: FileFinding = { file: GO_PATH, line: 4, severity: "error", rule: "errcheck", message: "Wrap the error", source: "golangci", kind: "lint" };
  const BLAME: BlameRange[] = [
    { startLine: 1, lineCount: 2, commit: { sha: "a1b2c3d4e5", author: "Dana", date: "2024-01-01T00:00:00Z", summary: "Add retry" } },
    { startLine: 3, lineCount: 3, commit: { sha: "f6e5d4c3b2", author: "Lee", date: "2026-01-01T00:00:00Z", summary: "Take a count" } },
  ];

  function renderCode(props: Partial<FileReviewProps> = {}) {
    const onViewChange = vi.fn();
    const view = render(<WithProblemFilters path={GO_PATH} source={GO} view="source" onViewChange={onViewChange} {...props} />);
    return { ...view, onViewChange };
  }

  it("has no Preview tab and rejects the preview view", () => {
    renderCode({ findings: [GO_FINDING] });
    expect(tabNames()).toEqual(["Source", "Problems"]);
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderCode({ view: "preview" })).toThrow(/needs a markdown file, got pkg\/retry\/retry.go/);
  });

  it("opens a problem in the source listing", () => {
    const { onViewChange } = renderCode({ findings: [GO_FINDING], view: "problems" });
    fireEvent.click(screen.getByRole("button", { name: "Problem actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Open in source" }));
    expect(onViewChange).toHaveBeenCalledWith("source");
  });

  it("hides findings under the lines behind the Findings toggle and lists a line's when its mark is picked", () => {
    const { container } = renderCode({ findings: [GO_FINDING] });
    const listed = () => container.querySelectorAll(`[data-source-finding="${GO_FINDING.line}"]`).length;
    const shown = listed();

    fireEvent.click(screen.getByRole("button", { name: "Findings" }));
    const hidden = listed();
    fireEvent.click(screen.getByRole("button", { name: `1 finding on line ${GO_FINDING.line}` }));

    expect({ shown, hidden, picked: listed() }).toEqual({ shown: 1, hidden: 0, picked: 1 });
  });

  it("highlights a source-anchored comment on its characters", async () => {
    const comment: Comment = { ...COMMENT, body: "Retry forever?", anchor: sourceAnchor({ line: 4, prefix: "\treturn ", quote: "call(n)", suffix: "\n}" }) };
    const { container } = renderCode({ comments: { items: [comment], callbacks: {} } });
    await waitFor(() => expect(container.querySelector("mark[data-source-comment]")).not.toBeNull());
    const line = container.querySelector<HTMLElement>('[data-source-line="4"]')!;
    expect({ highlighted: line.querySelector("mark")?.textContent, thread: within(line).getByRole("button", { name: /Retry forever\?/ }).dataset.sourceThread }).toEqual({
      highlighted: "call(n)",
      thread: comment.anchor,
    });
  });

  it("colours the listing with the highlighter's tokens", async () => {
    vi.mocked(highlightToLines).mockResolvedValueOnce(GO.split("\n").map((text) => (text.startsWith("package") ? [{ content: "package", color: "#d73a49" }, { content: " retry" }] : [{ content: text }])));
    const { container } = renderCode();
    await waitFor(() => expect(container.querySelector('[data-source-text="1"] span[style]')).not.toBeNull());
    const keyword = container.querySelector<HTMLElement>('[data-source-text="1"] span[style]')!;
    expect({ text: keyword.textContent, color: keyword.style.color }).toEqual({ text: "package", color: "rgb(215, 58, 73)" });
  });

  it("toggles a blame gutter naming each range's commit on its first line, over the editor", async () => {
    const { container } = renderCode({ blame: BLAME, onSourceChange: vi.fn() });
    expect(await screen.findByTestId("editor")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Blame" }));
    const shas = [...container.querySelectorAll<HTMLElement>("[data-blame-sha]")].map((cell) => [cell.closest("li")?.dataset.sourceLine, cell.textContent?.slice(0, 7)]);
    expect({ editor: screen.queryByTestId("editor"), shas }).toEqual({ editor: null, shas: [["1", "a1b2c3d"], ["3", "f6e5d4c"]] });
  });
});
