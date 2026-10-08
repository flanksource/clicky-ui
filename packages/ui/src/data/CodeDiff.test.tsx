import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodeDiff } from "./CodeDiff";

// Mock the Shiki wrapper so the dynamic `import("shiki")` never runs — the
// plain-text fallback path renders deterministically without WASM. One test
// overrides the resolved value to confirm tokens replace the fallback.
vi.mock("./code-highlight", () => ({
  highlightToLines: vi.fn(async () => null),
}));
import { highlightToLines } from "./code-highlight";
const mockHighlight = vi.mocked(highlightToLines);

beforeEach(() => {
  mockHighlight.mockReset();
  mockHighlight.mockResolvedValue(null);
});

function diffLineTypes(container: HTMLElement): string[] {
  return [...container.querySelectorAll("[data-diff-line]")].map(
    (el) => el.getAttribute("data-diff-line") ?? "",
  );
}

function diffLineText(container: HTMLElement): string[] {
  return [...container.querySelectorAll("[data-diff-line]")].map((el) => el.textContent ?? "");
}

// Each unified row's textContent concatenates old#, new#, marker, and code —
// so one array compares numbering, markers, and content together.
// The plain-text (null-token) fallback renders on first paint; awaiting the
// async highlight effect (mocked to resolve null) settles it and avoids `act`
// warnings without changing the asserted DOM.
describe("CodeDiff unified view", () => {
  it("renders context/remove/add rows with numbers, markers, and content", async () => {
    const { container } = render(
      <CodeDiff language="typescript" original={"a\nb"} modified={"a\nB"} />,
    );
    await waitFor(() => {
      expect(diffLineTypes(container)).toEqual(["context", "remove", "add"]);
    });
    expect(diffLineText(container)).toEqual(["11a", "2-b", "2+B"]);
  });

  it("tints removed rows rose and added rows emerald (theme-aware)", async () => {
    const { container } = render(
      <CodeDiff language="typescript" original={"a\nb"} modified={"a\nB"} />,
    );
    await waitFor(() => {
      expect(container.querySelectorAll("[data-diff-line]").length).toBe(3);
    });
    const rows = [...container.querySelectorAll("[data-diff-line]")];
    expect(rows[1]?.className).toContain("bg-rose-500/10");
    expect(rows[2]?.className).toContain("bg-emerald-500/10");
    expect(rows[0]?.className).not.toContain("bg-emerald-500/10");
  });

  it("parses a unified-diff string into the same rows as the computed diff", async () => {
    const unified = "@@ -1,2 +1,2 @@\n a\n-b\n+B\n";
    const { container } = render(<CodeDiff language="typescript" unified={unified} />);
    await waitFor(() => {
      expect(diffLineTypes(container)).toEqual(["context", "remove", "add"]);
    });
    expect(diffLineText(container)).toEqual(["11a", "2-b", "2+B"]);
  });
});

describe("CodeDiff split view", () => {
  it("aligns context on both sides and pairs a remove with its add", async () => {
    const { container } = render(
      <CodeDiff language="typescript" view="split" original={"a\nb"} modified={"a\nB"} />,
    );
    await waitFor(() => {
      expect(diffLineTypes(container)).toEqual(["context", "context", "remove", "add"]);
    });
    expect(diffLineText(container)).toEqual(["1a", "1a", "2-b", "2+B"]);
  });
});

describe("CodeDiff multi-file", () => {
  const MULTI = [
    "diff --git a/src/a.ts b/src/a.ts",
    "--- a/src/a.ts",
    "+++ b/src/a.ts",
    "@@ -1 +1 @@",
    "-const a = 1;",
    "+const a = 2;",
    "diff --git a/src/b.ts b/src/b.ts",
    "--- a/src/b.ts",
    "+++ b/src/b.ts",
    "@@ -5 +5 @@",
    "-const b = 1;",
    "+const b = 2;",
  ].join("\n");

  it("labels each file's hunks with its path", async () => {
    const { container } = render(<CodeDiff language="typescript" unified={MULTI} />);
    await waitFor(() => {
      expect(container.querySelectorAll("[data-diff-line]").length).toBe(4);
    });
    const paths = [...container.querySelectorAll("[data-diff-file]")].map((el) =>
      el.getAttribute("data-diff-file"),
    );
    expect(paths).toEqual(["src/a.ts", "src/b.ts"]);
  });

  it("omits the path header for a single-file diff", async () => {
    const single = [
      "diff --git a/src/a.ts b/src/a.ts",
      "--- a/src/a.ts",
      "+++ b/src/a.ts",
      "@@ -1 +1 @@",
      "-const a = 1;",
      "+const a = 2;",
    ].join("\n");
    const { container } = render(<CodeDiff language="typescript" unified={single} />);
    await waitFor(() => {
      expect(container.querySelectorAll("[data-diff-line]").length).toBe(2);
    });
    expect(container.querySelector("[data-diff-file]")).toBeNull();
  });
});

describe("CodeDiff view toggle", () => {
  it("renders a Unified/Split toggle that switches the layout in place", async () => {
    const { container } = render(
      <CodeDiff language="typescript" original={"a\nb"} modified={"a\nB"} />,
    );
    await waitFor(() => {
      expect(diffLineTypes(container)).toEqual(["context", "remove", "add"]);
    });

    fireEvent.click(screen.getByRole("radio", { name: /split/i }));
    await waitFor(() => {
      expect(diffLineTypes(container)).toEqual(["context", "context", "remove", "add"]);
    });

    fireEvent.click(screen.getByRole("radio", { name: /unified/i }));
    await waitFor(() => {
      expect(diffLineTypes(container)).toEqual(["context", "remove", "add"]);
    });
  });

  it("seeds the toggle from the view prop and omits it in bare mode", () => {
    const split = render(
      <CodeDiff language="typescript" view="split" original={"a\nb"} modified={"a\nB"} />,
    );
    expect(screen.getByRole("radio", { name: /split/i })).toHaveAttribute("aria-checked", "true");
    split.unmount();

    const bare = render(
      <CodeDiff bare language="typescript" original={"a\nb"} modified={"a\nB"} />,
    );
    expect(bare.container.querySelector('[role="radio"]')).toBeNull();
    bare.unmount();
  });
});

describe("CodeDiff highlighting", () => {
  it("swaps plain text for highlighted tokens once the highlighter resolves", async () => {
    mockHighlight.mockResolvedValue([[{ content: "TOK", color: "#ff0000" }]]);
    const { container } = render(<CodeDiff language="typescript" original="a" modified="a" />);
    await waitFor(() => {
      expect(container.querySelector("code")?.textContent).toBe("TOK");
    });
    expect(container.querySelector("code span")?.getAttribute("style")).toContain("color");
  });

  it("hides line-number gutters when showLineNumbers is false", async () => {
    const { container } = render(
      <CodeDiff
        language="typescript"
        showLineNumbers={false}
        original={"a\nb"}
        modified={"a\nB"}
      />,
    );
    await waitFor(() => {
      expect(diffLineText(container)).toEqual(["a", "-b", "+B"]);
    });
  });
});

describe("CodeDiff line actions and widgets", () => {
  const ORIGINAL = "a\nb";
  const MODIFIED = "a\nB";

  function layout(container: HTMLElement): string[] {
    return [...container.querySelectorAll("[data-diff-line],[data-diff-widget]")].map((el) =>
      el.hasAttribute("data-diff-widget")
        ? `widget:${el.getAttribute("data-diff-widget")}`
        : (el.getAttribute("data-diff-line") ?? ""),
    );
  }

  it("calls onLineAction with side 'new' for added and context lines", async () => {
    const onLineAction = vi.fn();
    const { container } = render(
      <CodeDiff language="typescript" original={ORIGINAL} modified={MODIFIED} onLineAction={onLineAction} />,
    );
    await waitFor(() => expect(diffLineTypes(container)).toEqual(["context", "remove", "add"]));

    fireEvent.click(container.querySelector('[data-diff-line="add"] button') as HTMLElement);
    expect(onLineAction).toHaveBeenLastCalledWith({ side: "new", line: 2, content: "B" });

    fireEvent.click(container.querySelector('[data-diff-line="context"] button') as HTMLElement);
    expect(onLineAction).toHaveBeenLastCalledWith({ side: "new", line: 1, content: "a" });
  });

  it("calls onLineAction with side 'old' for deleted lines", async () => {
    const onLineAction = vi.fn();
    const { container } = render(
      <CodeDiff language="typescript" original={ORIGINAL} modified={MODIFIED} onLineAction={onLineAction} />,
    );
    await waitFor(() => expect(diffLineTypes(container)).toEqual(["context", "remove", "add"]));

    fireEvent.click(container.querySelector('[data-diff-line="remove"] button') as HTMLElement);
    expect(onLineAction).toHaveBeenCalledTimes(1);
    expect(onLineAction).toHaveBeenCalledWith({ side: "old", line: 2, content: "b" });
  });

  it("labels each gutter button 'Comment on line N' and keeps it keyboard-focusable", async () => {
    const { container } = render(
      <CodeDiff language="typescript" original={ORIGINAL} modified={MODIFIED} onLineAction={vi.fn()} />,
    );
    await waitFor(() => expect(diffLineTypes(container)).toEqual(["context", "remove", "add"]));
    const labels = [...container.querySelectorAll("[data-diff-line] button")].map((b) => b.getAttribute("aria-label"));
    expect(labels).toEqual(["Comment on line 1", "Comment on line 2", "Comment on line 2"]);
    expect(container.querySelector("[data-diff-line] button")?.getAttribute("tabindex")).toBeNull();
  });

  it("uses old for the left column and new for the right column in split view", async () => {
    const onLineAction = vi.fn();
    const { container } = render(
      <CodeDiff
        language="typescript"
        view="split"
        original={ORIGINAL}
        modified={MODIFIED}
        onLineAction={onLineAction}
      />,
    );
    await waitFor(() =>
      expect(diffLineTypes(container)).toEqual(["context", "context", "remove", "add"]),
    );
    const buttons = [...container.querySelectorAll("[data-diff-line] button")];
    expect(buttons).toHaveLength(4);
    buttons.forEach((button) => fireEvent.click(button));
    expect(onLineAction.mock.calls.map(([target]) => target)).toEqual([
      { side: "old", line: 1, content: "a" },
      { side: "new", line: 1, content: "a" },
      { side: "old", line: 2, content: "b" },
      { side: "new", line: 2, content: "B" },
    ]);
  });

  it("renders no buttons when onLineAction is absent", async () => {
    for (const view of ["unified", "split"] as const) {
      const { container, unmount } = render(
        <CodeDiff language="typescript" view={view} bare original={ORIGINAL} modified={MODIFIED} />,
      );
      await waitFor(() => expect(container.querySelectorAll("[data-diff-line]").length).toBeGreaterThan(0));
      expect(container.querySelectorAll("button")).toHaveLength(0);
      unmount();
    }
  });

  it("renders unified widgets directly under their matching row, in array order", async () => {
    const { container } = render(
      <CodeDiff
        language="typescript"
        original={ORIGINAL}
        modified={MODIFIED}
        lineWidgets={[
          { key: "n2", side: "new", line: 2, node: <span>new two</span> },
          { key: "o2", side: "old", line: 2, node: <span>old two</span> },
          { key: "n1", side: "new", line: 1, node: <span>new one</span> },
          { key: "n2b", side: "new", line: 2, node: <span>new two again</span> },
          { key: "miss", side: "old", line: 9, node: <span>nowhere</span> },
        ]}
      />,
    );
    await waitFor(() => expect(layout(container).length).toBeGreaterThan(3));
    expect(layout(container)).toEqual([
      "context",
      "widget:n1",
      "remove",
      "widget:o2",
      "add",
      "widget:n2",
      "widget:n2b",
    ]);
    expect(screen.queryByText("nowhere")).toBeNull();
  });

  it("renders split widgets as a full-width row under the matching pair", async () => {
    const { container } = render(
      <CodeDiff
        language="typescript"
        view="split"
        original={ORIGINAL}
        modified={MODIFIED}
        lineWidgets={[
          { key: "o1", side: "old", line: 1, node: <span>on context</span> },
          { key: "n2", side: "new", line: 2, node: <span>on add</span> },
        ]}
      />,
    );
    await waitFor(() => expect(layout(container).length).toBeGreaterThan(4));
    expect(layout(container)).toEqual([
      "context",
      "context",
      "widget:o1",
      "remove",
      "add",
      "widget:n2",
    ]);
    const widget = container.querySelector('[data-diff-widget="n2"]') as HTMLElement;
    expect(widget.parentElement).toBe(container.querySelector('[data-diff-line="add"]')?.parentElement?.parentElement);
  });
});
