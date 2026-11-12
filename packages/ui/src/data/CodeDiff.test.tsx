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

  // jsdom has no layout, so this pins the CSS contract the Storybook
  // `SplitLongLinesNarrow` play test measures in a real browser: each half is
  // an equal, shrinkable flex basis whose code wraps, so a long line can no
  // longer paint across the divider into the other side.
  it("wraps long lines inside their own column instead of overflowing into the other", async () => {
    const longLine = `<Field name="${"VeryLongAttributeValue".repeat(12)}"/>`;
    const { container } = render(
      <CodeDiff view="split" original={longLine} modified={`${longLine} `} />,
    );
    await waitFor(() => expect(container.querySelectorAll("[data-diff-line]")).toHaveLength(2));

    const cells = [...container.querySelectorAll<HTMLElement>("[data-diff-line]")];
    expect(cells.map((cell) => ["min-w-0", "flex-1", "basis-0"].every((c) => cell.classList.contains(c)))).toEqual([
      true,
      true,
    ]);
    const codes = cells.map((cell) => cell.querySelector("code")!);
    expect(codes.map((code) => [code.classList.contains("whitespace-pre-wrap"), code.classList.contains("[overflow-wrap:anywhere]"), code.classList.contains("whitespace-pre")])).toEqual([
      [true, true, false],
      [true, true, false],
    ]);
  });
});

describe("CodeDiff unified long lines", () => {
  it("keeps each unified row on one line so the whole diff scrolls horizontally", async () => {
    const { container } = render(<CodeDiff original={"a".repeat(300)} modified={"b".repeat(300)} />);
    await waitFor(() => expect(container.querySelectorAll("[data-diff-line]")).toHaveLength(2));
    const codes = [...container.querySelectorAll("[data-diff-line] code")];
    expect(codes.map((code) => code.classList.contains("whitespace-pre"))).toEqual([true, true]);
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
  it("keeps original and modified labels in order when switching views", async () => {
    const { container } = render(
      <CodeDiff original="SELECT 1" modified="SELECT 2" originalLabel="reference-db" modifiedLabel="target-db" view="split" />,
    );
    const labels = () => [...container.querySelectorAll("[data-diff-side]")].map((label) => [label.getAttribute("data-diff-side"), label.textContent]);
    expect(labels()).toEqual([["original", "reference-db"], ["modified", "target-db"]]);
    expect(container.querySelector('[data-diff-side="original"]')?.parentElement).toHaveClass("grid-cols-2");
    fireEvent.click(screen.getByRole("radio", { name: /unified/i }));
    expect(labels()).toEqual([["original", "− reference-db"], ["modified", "+ target-db"]]);
    await waitFor(() => expect(diffLineTypes(container)).toEqual(["remove", "add"]));
  });

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

    const added = container.querySelector('[data-diff-line="add"] button') as HTMLElement;
    fireEvent.click(added);
    expect(onLineAction).toHaveBeenLastCalledWith({ side: "new", line: 2, content: "B", element: added });

    const context = container.querySelector('[data-diff-line="context"] button') as HTMLElement;
    fireEvent.click(context);
    expect(onLineAction).toHaveBeenLastCalledWith({ side: "new", line: 1, content: "a", element: context });
  });

  it("calls onLineAction with side 'old' for deleted lines", async () => {
    const onLineAction = vi.fn();
    const { container } = render(
      <CodeDiff language="typescript" original={ORIGINAL} modified={MODIFIED} onLineAction={onLineAction} />,
    );
    await waitFor(() => expect(diffLineTypes(container)).toEqual(["context", "remove", "add"]));

    const removed = container.querySelector('[data-diff-line="remove"] button') as HTMLElement;
    fireEvent.click(removed);
    expect(onLineAction).toHaveBeenCalledTimes(1);
    expect(onLineAction).toHaveBeenCalledWith({ side: "old", line: 2, content: "b", element: removed });
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
      { side: "old", line: 1, content: "a", element: buttons[0] },
      { side: "new", line: 1, content: "a", element: buttons[1] },
      { side: "old", line: 2, content: "b", element: buttons[2] },
      { side: "new", line: 2, content: "B", element: buttons[3] },
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

describe("CodeDiff line selection", () => {
  // hunk 1: ctx a | -b -c | +B +C | ctx d ; hunk 2: ctx x | -y | +Y
  const UNIFIED = [
    "@@ -1,4 +1,4 @@",
    " a",
    "-b",
    "-c",
    "+B",
    "+C",
    " d",
    "@@ -10,2 +10,2 @@",
    " x",
    "-y",
    "+Y",
  ].join("\n");

  type Target = { side: "old" | "new"; line: number };
  const key = (t: Target) => `${t.side}:${t.line}`;
  const OLD_B: Target = { side: "old", line: 2 };
  const OLD_C: Target = { side: "old", line: 3 };
  const NEW_B: Target = { side: "new", line: 2 };
  const NEW_C: Target = { side: "new", line: 3 };
  const HUNK_ONE = [OLD_B, OLD_C, NEW_B, NEW_C];

  const label = (t: Target, selected: boolean) => `${selected ? "Unstage" : "Stage"} ${t.side} ${t.line}`;
  const hunkLabel = (n: number, selected: boolean) => `${selected ? "Unstage" : "Stage"} hunk ${n}`;

  async function renderSelection(options: {
    selected?: Target[];
    disabled?: boolean;
    view?: "unified" | "split";
    withLabels?: boolean;
  } = {}) {
    const onChange = vi.fn();
    const selected = new Set((options.selected ?? []).map(key));
    const utils = render(
      <CodeDiff
        bare
        view={options.view ?? "unified"}
        unified={UNIFIED}
        lineSelection={{
          isSelected: (t) => selected.has(key(t)),
          onChange,
          ...(options.disabled ? { disabled: true } : {}),
          ...(options.withLabels === false ? {} : { label, hunkLabel }),
        }}
      />,
    );
    await waitFor(() => expect(utils.container.querySelectorAll("[data-diff-line]").length).toBeGreaterThan(0));
    return { ...utils, onChange };
  }

  it("renders a box on every added and deleted line and none on context lines", async () => {
    const { container } = await renderSelection();
    const rows = [...container.querySelectorAll("[data-diff-line]")].map((row) => [
      row.getAttribute("data-diff-line"),
      row.querySelector('[role="checkbox"]')?.getAttribute("aria-label") ?? null,
    ]);
    expect(rows).toEqual([
      ["context", null],
      ["remove", "Stage old 2"],
      ["remove", "Stage old 3"],
      ["add", "Stage new 2"],
      ["add", "Stage new 3"],
      ["context", null],
      ["context", null],
      ["remove", "Stage old 11"],
      ["add", "Stage new 11"],
    ]);
  });

  it("renders no boxes when lineSelection is absent", async () => {
    const { container } = render(<CodeDiff bare unified={UNIFIED} />);
    await waitFor(() => expect(container.querySelectorAll("[data-diff-line]").length).toBe(9));
    expect(container.querySelectorAll('[role="checkbox"]')).toHaveLength(0);
  });

  it("toggles one line: selects an unselected line and deselects a selected one", async () => {
    const first = await renderSelection();
    fireEvent.click(screen.getByRole("checkbox", { name: "Stage new 2" }));
    expect(first.onChange.mock.calls).toEqual([[[NEW_B], true]]);
    first.unmount();

    const second = await renderSelection({ selected: [NEW_B] });
    expect(screen.getByRole("checkbox", { name: "Unstage new 2" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("checkbox", { name: "Unstage new 2" }));
    expect(second.onChange.mock.calls).toEqual([[[NEW_B], false]]);
  });

  it("shift-click applies the clicked line's new state to every changed line from the last click", async () => {
    const { onChange } = await renderSelection();
    fireEvent.click(screen.getByRole("checkbox", { name: "Stage old 2" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Stage new 3" }), { shiftKey: true });
    expect(onChange.mock.calls).toEqual([[[OLD_B], true], [HUNK_ONE, true]]);
  });

  it("shift-click ranges backwards and uses the deselect state when the clicked line is selected", async () => {
    const { onChange } = await renderSelection({ selected: [NEW_B, NEW_C] });
    fireEvent.click(screen.getByRole("checkbox", { name: "Unstage new 3" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Stage old 3" }), { shiftKey: true });
    expect(onChange.mock.calls).toEqual([[[NEW_C], false], [[OLD_C, NEW_B, NEW_C], true]]);
  });

  it("shift-click in a different hunk toggles only the clicked line", async () => {
    const { onChange } = await renderSelection();
    fireEvent.click(screen.getByRole("checkbox", { name: "Stage old 2" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Stage new 11" }), { shiftKey: true });
    expect(onChange.mock.calls).toEqual([[[OLD_B], true], [[{ side: "new", line: 11 }], true]]);
  });

  it("shift-click without a previous click toggles only the clicked line", async () => {
    const { onChange } = await renderSelection();
    fireEvent.click(screen.getByRole("checkbox", { name: "Stage new 3" }), { shiftKey: true });
    expect(onChange.mock.calls).toEqual([[[NEW_C], true]]);
  });

  it("hunk header box shows none, partial (mixed) and all", async () => {
    const states = async (selected: Target[]) => {
      const { unmount } = await renderSelection({ selected });
      const boxes = screen.getAllByRole("checkbox", { name: /hunk/ }).map((box) => box.getAttribute("aria-checked"));
      unmount();
      return boxes;
    };
    expect(await states([])).toEqual(["false", "false"]);
    expect(await states([OLD_B])).toEqual(["mixed", "false"]);
    expect(await states(HUNK_ONE)).toEqual(["true", "false"]);
    expect(await states([...HUNK_ONE, { side: "old", line: 11 }, { side: "new", line: 11 }])).toEqual(["true", "true"]);
  });

  it("hunk header box selects every changed line of its hunk unless all are already selected", async () => {
    const none = await renderSelection();
    fireEvent.click(screen.getByRole("checkbox", { name: "Stage hunk 1" }));
    expect(none.onChange.mock.calls).toEqual([[HUNK_ONE, true]]);
    none.unmount();

    const partial = await renderSelection({ selected: [OLD_B] });
    fireEvent.click(screen.getByRole("checkbox", { name: "Stage hunk 1" }));
    expect(partial.onChange.mock.calls).toEqual([[HUNK_ONE, true]]);
    partial.unmount();

    const all = await renderSelection({ selected: HUNK_ONE });
    fireEvent.click(screen.getByRole("checkbox", { name: "Unstage hunk 1" }));
    expect(all.onChange.mock.calls).toEqual([[HUNK_ONE, false]]);
  });

  it("falls back to domain-neutral default labels", async () => {
    await renderSelection({ withLabels: false });
    expect(screen.getByRole("checkbox", { name: "Select added line 2" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Select removed line 2" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Select hunk 2" })).toBeInTheDocument();
  });

  it("disables every box and never calls onChange when disabled", async () => {
    const { onChange } = await renderSelection({ disabled: true });
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes).toHaveLength(8);
    expect(boxes.every((box) => (box as HTMLButtonElement).disabled)).toBe(true);
    boxes.forEach((box) => fireEvent.click(box));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("boxes the old column's deleted lines and the new column's added lines in split view", async () => {
    const { container, onChange } = await renderSelection({ view: "split" });
    const cells = [...container.querySelectorAll("[data-diff-line]")].map((cell) => [
      cell.getAttribute("data-diff-line"),
      cell.querySelector('[role="checkbox"]')?.getAttribute("aria-label") ?? null,
    ]);
    expect(cells).toEqual([
      ["context", null], ["context", null],
      ["remove", "Stage old 2"], ["add", "Stage new 2"],
      ["remove", "Stage old 3"], ["add", "Stage new 3"],
      ["context", null], ["context", null],
      ["context", null], ["context", null],
      ["remove", "Stage old 11"], ["add", "Stage new 11"],
    ]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Stage old 2" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Stage new 3" }), { shiftKey: true });
    fireEvent.click(screen.getByRole("checkbox", { name: "Stage hunk 1" }));
    expect(onChange.mock.calls).toEqual([[[OLD_B], true], [HUNK_ONE, true], [HUNK_ONE, true]]);
  });

  it("marks selected rows and keeps the box column on a hunk header with no header text", async () => {
    const { container } = render(
      <CodeDiff
        bare
        original={"a\nb"}
        modified={"a\nB"}
        lineSelection={{ isSelected: (t) => t.side === "new", onChange: vi.fn(), hunkLabel }}
      />,
    );
    await waitFor(() => expect(container.querySelectorAll("[data-diff-line]")).toHaveLength(3));
    expect([...container.querySelectorAll("[data-diff-line]")].map((row) => row.hasAttribute("data-selected"))).toEqual([false, false, true]);
    expect(screen.getByRole("checkbox", { name: "Stage hunk 1" })).toHaveAttribute("aria-checked", "mixed");
  });
});
