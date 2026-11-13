import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// The subpath's contract: Monaco is reachable only through the lazily loaded
// code viewer. Evaluating either module here is a failure.
const loaded = vi.hoisted(() => [] as string[]);
vi.mock("monaco-editor", () => {
  loaded.push("monaco-editor");
  return {};
});
vi.mock("@monaco-editor/react", () => {
  loaded.push("@monaco-editor/react");
  return { loader: { config: () => undefined }, default: () => null };
});
vi.mock("../data/code-highlight", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/code-highlight")>()),
  highlightCode: vi.fn(async () => null),
  highlightToLines: vi.fn(async () => null),
}));

describe("@flanksource/clicky-ui/file-findings entry", () => {
  it("exposes the adapters without evaluating monaco-editor or @monaco-editor/react", async () => {
    const entry = await import("../file-findings");

    expect(entry.groupFindingsByFile([])).toEqual([]);
    expect(loaded).toEqual([]);
  });

  it("views a markdown file without evaluating monaco-editor or @monaco-editor/react", async () => {
    const { FileFindingsView } = await import("../file-findings");
    const file = { workDir: "/repo", file: "docs/guide.md" };

    render(
      <FileFindingsView
        findings={[
          { file: file.file, workDir: file.workDir, line: 3, severity: "warning", message: "Line too long", source: "mdl", kind: "lint" },
        ]}
        selected={{ kind: "file", ref: file }}
        onSelect={() => undefined}
        onLineChange={() => undefined}
        view="preview"
        onViewChange={() => undefined}
        problemFilters={{ severity: new Map(), type: new Map() }}
        onProblemFiltersChange={() => undefined}
        loadFile={() => Promise.resolve("# Guide\n\nA long line.\n")}
      />,
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Guide" })).toBeInTheDocument();
    expect(loaded).toEqual([]);
  });
});
