import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { CodeDiff } from "./CodeDiff";

const meta = {
  title: "Data/CodeDiff",
  component: CodeDiff,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Language-aware diff viewer. Computes an LCS line diff from `{ original, modified }` (or parses a `{ unified }` string), syntax-highlights each side with the shared Shiki engine, and renders git-style add/remove gutters that follow the app theme. Supports unified and split (side-by-side) layouts.",
      },
    },
  },
} satisfies Meta<typeof CodeDiff>;

export default meta;
type Story = StoryObj<typeof meta>;

const TS_BEFORE = `export function greet(name: string): string {
  return "Hello, " + name;
}`;

const TS_AFTER = `export function greet(name: string, excited = false): string {
  const suffix = excited ? "!" : ".";
  return \`Hello, \${name}\${suffix}\`;
}`;

export const TypeScript: Story = {
  args: {
    language: "typescript",
    original: TS_BEFORE,
    modified: TS_AFTER,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Structure renders synchronously; highlighting swaps in asynchronously.
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('[data-diff-line="add"]').length).toBeGreaterThan(0);
    });
    expect(canvasElement.querySelectorAll('[data-diff-line="remove"]').length).toBeGreaterThan(0);
    // The shell header carries the language label.
    expect(canvas.getByText("typescript")).toBeInTheDocument();
    // Syntax highlighting eventually colors the tokens.
    await waitFor(
      () => {
        expect(canvasElement.querySelectorAll("code span[style]").length).toBeGreaterThan(0);
      },
      { timeout: 5_000 },
    );
  },
};

export const Go: Story = {
  args: {
    language: "go",
    original: `package main

import "fmt"

func main() {
	fmt.Println("Hello")
}`,
    modified: `package main

import "fmt"

func main() {
	name := "world"
	fmt.Printf("Hello, %s\\n", name)
}`,
  },
};

export const Python: Story = {
  args: {
    language: "python",
    original: `def total(items):
    result = 0
    for item in items:
        result += item
    return result`,
    modified: `def total(items):
    return sum(items)`,
  },
};

export const Split: Story = {
  args: {
    language: "typescript",
    view: "split",
    original: TS_BEFORE,
    modified: TS_AFTER,
  },
};

export const DatabaseDefinitions: Story = {
  args: {
    language: "sql",
    view: "split",
    originalLabel: "acme_dev",
    modifiedLabel: "acme_qa",
    original: "CREATE PROCEDURE dbo.Calculate AS SELECT 1;",
    modified: "CREATE PROCEDURE dbo.Calculate AS SELECT 2;",
  },
  parameters: {
    docs: { description: { story: "Use originalLabel and modifiedLabel to name the compared sources. Split view aligns them over their respective columns; unified view identifies them with minus and plus markers. Labels are omitted in bare mode." } },
  },
};

export const FromUnifiedString: Story = {
  args: {
    language: "typescript",
    unified: `@@ -1,3 +1,4 @@
 export function greet(name: string): string {
-  return "Hello, " + name;
+  const suffix = ".";
+  return \`Hello, \${name}\${suffix}\`;
 }`,
  },
};

export const MultiFileUnified: Story = {
  args: {
    language: "typescript",
    unified: `diff --git a/src/greet.ts b/src/greet.ts
--- a/src/greet.ts
+++ b/src/greet.ts
@@ -1,2 +1,2 @@
 export function greet(name: string) {
-  return "Hi " + name;
+  return \`Hi \${name}\`;
 }
diff --git a/src/index.ts b/src/index.ts
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,2 +1,3 @@
 import { greet } from "./greet";
-console.log(greet("world"));
+const message = greet("world");
+console.log(message);`,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A diff that spans several files renders a path header before each file's hunks (parsed from the `diff --git`/`+++` headers).",
      },
    },
  },
};

export const Bare: Story = {
  args: {
    language: "go",
    bare: true,
    original: `x := 1`,
    modified: `x := 2`,
  },
};

// The header's Unified/Split toggle switches layout in place. Split adds a
// second column, so its aligned context lines produce more diff-line cells.
export const ViewToggle: Story = {
  args: {
    language: "typescript",
    original: TS_BEFORE,
    modified: TS_AFTER,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelectorAll("[data-diff-line]").length).toBeGreaterThan(0);
    });
    const unifiedCells = canvasElement.querySelectorAll("[data-diff-line]").length;

    await userEvent.click(canvas.getByRole("radio", { name: /split/i }));
    await waitFor(() => {
      expect(canvasElement.querySelectorAll("[data-diff-line]").length).toBeGreaterThan(
        unifiedCells,
      );
    });

    await userEvent.click(canvas.getByRole("radio", { name: /unified/i }));
    await waitFor(() => {
      expect(canvasElement.querySelectorAll("[data-diff-line]").length).toBe(unifiedCells);
    });
  },
};

const COMMENT_WIDGET_CLASS = "rounded-md border border-border bg-muted/40 p-2 text-xs";

// `onLineAction` adds a hover "+" per numbered line; `lineWidgets` render
// comment threads as full-width rows under their line. Works in both views.
export const InlineComments: Story = {
  args: {
    language: "typescript",
    original: TS_BEFORE,
    modified: TS_AFTER,
    onLineAction: () => {},
    lineWidgets: [
      {
        key: "thread-1",
        side: "old",
        line: 2,
        node: <div className={COMMENT_WIDGET_CLASS}>Why drop the string concatenation here?</div>,
      },
      {
        key: "thread-2",
        side: "new",
        line: 2,
        node: <div className={COMMENT_WIDGET_CLASS}>Nit: extract the suffix into a constant.</div>,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelectorAll("[data-diff-widget]").length).toBe(2);
    });
    expect(canvas.getByText("Nit: extract the suffix into a constant.")).toBeInTheDocument();
    expect(canvasElement.querySelectorAll("[data-diff-line] button").length).toBeGreaterThan(0);
  },
};

export const InlineCommentsSplit: Story = {
  args: { ...InlineComments.args, view: "split" },
};

const XML_BEFORE = `<Transaction>
  <Field name="AddRiderEffectiveDateCalculationOverrideForLegacyPlansAndSchemes" type="DATE" default="SystemDate" required="true"/>
  <MaxAge>70</MaxAge>
</Transaction>`;

const XML_AFTER = `<Transaction>
  <Field name="AddRiderEffectiveDateCalculationOverrideForLegacyPlansAndSchemes" type="DATE" default="PolicyEffectiveDate" required="true"/>
  <MaxAge>75</MaxAge>
</Transaction>`;

// Split view in a narrow container: each half wraps its own long lines, so a
// line never paints across the divider into the other side.
export const SplitLongLinesNarrow: Story = {
  args: { language: "xml", view: "split", original: XML_BEFORE, modified: XML_AFTER },
  decorators: [(Story) => <div style={{ width: 420 }}><Story /></div>],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      expect(canvasElement.querySelectorAll("[data-diff-line]").length).toBeGreaterThan(0);
    });
    const rows = [...canvasElement.querySelectorAll("[data-diff-line]")]
      .map((cell) => cell.parentElement)
      .filter((row, index, all): row is HTMLElement => row !== null && all.indexOf(row) === index);
    for (const row of rows) {
      const [left, right] = [...row.querySelectorAll<HTMLElement>("[data-diff-line]")];
      if (!left || !right) throw new Error("split row without two cells");
      const leftCode = left.querySelector("code");
      if (!leftCode) throw new Error("split cell without code");
      expect(leftCode.getBoundingClientRect().right).toBeLessThanOrEqual(right.getBoundingClientRect().left + 0.5);
      expect(left.scrollWidth).toBeLessThanOrEqual(left.clientWidth);
      expect(right.scrollWidth).toBeLessThanOrEqual(right.clientWidth);
    }
  },
};
