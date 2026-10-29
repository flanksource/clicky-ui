import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Keep the Shiki dynamic imports out of jsdom (same approach as Markdown.test.tsx).
vi.mock("../../data/code-highlight", () => ({
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
import { MarkdownReview, type MarkdownReviewProps } from "./MarkdownReview";
import { quoteAnchor } from "./quote-anchor";

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

function renderReview(props: Partial<MarkdownReviewProps> = {}) {
  const onViewChange = vi.fn();
  const view = render(<MarkdownReview path={PATH} source={SOURCE} view="preview" onViewChange={onViewChange} {...props} />);
  return { ...view, onViewChange };
}

const tabNames = () => screen.getAllByRole("tab").map((tab) => tab.textContent?.replace(/\d+$/, "").trim());

describe("MarkdownReview", () => {
  it("offers only Preview and Source, and no thread counts, without findings or comments", () => {
    renderReview();
    expect({ tabs: tabNames(), counts: screen.queryByText(/open ·/) }).toEqual({ tabs: ["Preview", "Source"], counts: null });
  });

  it("adds a Problems tab listing every finding worst first, and opening one switches to the preview", () => {
    const { onViewChange } = renderReview({ findings: FINDINGS, view: "problems" });
    expect(tabNames()).toEqual(["Preview", "Source", "Problems"]);
    const rows = screen.getAllByTitle("Open in preview");
    expect(rows.map((row) => row.querySelector("[data-problem-ln]")?.textContent)).toEqual(["5", "3"]);
    fireEvent.click(rows[1]!);
    expect(onViewChange).toHaveBeenCalledWith("preview");
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
