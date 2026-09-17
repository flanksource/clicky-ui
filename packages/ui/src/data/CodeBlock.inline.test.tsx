import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./CodeBlock";

vi.mock("./code-highlight", () => ({
  highlightCode: vi.fn(async () => null),
  highlightToLines: vi.fn(async () => null),
}));
import { highlightCode } from "./code-highlight";
const mockHighlightCode = vi.mocked(highlightCode);

// An inline (table-cell) code block shows one line, but a captured SQL
// statement can run to tens of thousands of characters. Highlighting all of it
// cost ~220 ms per 43k-char statement and ~7 s per 100-row page, for text the
// cell clips after a few hundred characters. The cell highlights a preview.
const HIGHLIGHT_PREVIEW_CHARS = 500;
const TITLE_PREVIEW_CHARS = 2000;

const clause = "SELECT a.ActivityGUID, a.StatusCode\n  FROM AsActivity a\n WHERE a.PolicyGUID = @P0\n";
const longSql = clause.repeat(400);
const collapse = (sql: string) => sql.replace(/\s+/g, " ").trim();

describe("CodeBlock inline", () => {
  beforeEach(() => mockHighlightCode.mockClear());

  it("highlights a short statement collapsed onto one line", async () => {
    render(<CodeBlock language="sql" source={clause} inline />);

    await waitFor(() => expect(mockHighlightCode).toHaveBeenCalledTimes(1));
    expect(mockHighlightCode.mock.calls[0]![0]).toBe(collapse(clause));
  });

  it("highlights only the leading preview of a long statement", async () => {
    render(<CodeBlock language="sql" source={longSql} inline />);

    await waitFor(() => expect(mockHighlightCode).toHaveBeenCalledTimes(1));
    expect(mockHighlightCode.mock.calls[0]![0]).toBe(
      collapse(longSql).slice(0, HIGHLIGHT_PREVIEW_CHARS),
    );
  });

  it("caps a long statement's title tooltip and marks the cut", () => {
    const { container } = render(<CodeBlock language="sql" source={longSql} inline />);

    expect(container.querySelector("code")?.getAttribute("title")).toBe(
      `${collapse(longSql).slice(0, TITLE_PREVIEW_CHARS)}…`,
    );
  });
});
