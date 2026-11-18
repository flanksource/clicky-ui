import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { MonacoProvider } from "../../monaco/MonacoProvider";
import { classSourceFixture } from "../fixtures/classes";
import { DecompiledSourceView, type DecompiledSourceViewProps } from "./DecompiledSourceView";

const CLASS = "com.example.orders.OrderService";
const FIXTURE = classSourceFixture(CLASS, "6d06d69c");

// Vite bundles a worker named by `new Worker(new URL(...))`; the editor worker is enough here.
function getEditorWorker(): Worker {
  return new Worker(new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url), { type: "module" });
}

function Demo(props: DecompiledSourceViewProps) {
  const [draft, setDraft] = useState(props.draft ?? FIXTURE.source);
  const [line, setLine] = useState(-1);
  return (
    <MonacoProvider getWorker={getEditorWorker}>
      <div className="h-[420px] w-[720px] border border-border">
        <DecompiledSourceView {...props} draft={draft} onDraftChange={setDraft} highlightRow={props.mode === "read" && line >= 0 ? line : props.highlightRow} onSelectRow={setLine} />
      </div>
    </MonacoProvider>
  );
}

const meta = {
  title: "JVM/DecompiledSourceView",
  component: Demo,
  args: {
    qualifiedName: CLASS,
    source: FIXTURE.source,
    sourceLineNumbers: FIXTURE.sourceLineNumbers,
    mode: "read",
    focusRange: null,
    highlightRow: -1,
    markers: [],
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reading: Story = {
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll("[data-row]");
    await expect(rows).toHaveLength(FIXTURE.source.split("\n").length);
    await expect(canvasElement.querySelector('[data-row="15"] [data-gutter]')).toHaveTextContent("18");
  },
};

export const ClickingARowHighlightsIt: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(canvasElement.querySelector('[data-row="16"]')!);
    await expect(canvasElement.querySelector('[data-row="16"]')).toHaveAttribute("data-highlighted", "true");
  },
};

export const FoldedToMethod: Story = {
  args: { focusRange: { startLine: 14, endLine: 19 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll("[data-row]")).toHaveLength(6);
    await userEvent.click(canvas.getByRole("button", { name: "Show whole class" }));
    await expect(canvasElement.querySelectorAll("[data-row]")).toHaveLength(FIXTURE.source.split("\n").length);
  },
};

export const HighlightedLine: Story = { args: { highlightRow: 16 } };

export const NoLineMarkers: Story = { args: { sourceLineNumbers: FIXTURE.source.split("\n").map(() => 0) } };

export const DecompilerWarning: Story = { args: { warning: "CFR could not recover some control flow; the source may not compile as is." } };

// Monaco needs real layout and a worker, so the editing stories run in the browser project.
export const Editing: Story = {
  tags: ["browser"],
  args: { mode: "edit", draft: FIXTURE.source },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector(".view-lines")).not.toBeNull(), { timeout: 10_000 });
    await expect(within(canvasElement).getByText(/redefinition may change method bodies only/i)).toBeInTheDocument();
  },
};

export const EditingWithCompilerErrors: Story = {
  tags: ["browser"],
  args: {
    mode: "edit",
    draft: FIXTURE.source.replace("return total;", 'return "TODO compile error";'),
    markers: [{ line: 18, column: 16, message: "incompatible types: java.lang.String cannot be converted to double", severity: "error" }],
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector(".squiggly-error")).not.toBeNull(), { timeout: 10_000 });
  },
};
