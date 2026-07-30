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
