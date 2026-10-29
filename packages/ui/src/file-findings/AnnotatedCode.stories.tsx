import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { MonacoProvider } from "../monaco/MonacoProvider";
import { AnnotatedCode, type AnnotatedCodeProps } from "./AnnotatedCode";
import type { FileFinding } from "./types";

const GUIDE = [
  "# Guide", // 1
  "", // 2
  "This paragraph is is written as one long line so that the line length rule and the repetition rule both have something to flag.", // 3
  "## Setup", // 4
  "", // 5
  "Run the installer.", // 6
].join("\n");

const FINDINGS: FileFinding[] = [
  {
    file: "docs/guide.md",
    line: 3,
    column: 16,
    endColumn: 21,
    severity: "error",
    message: "'is' is repeated",
    source: "vale",
    rule: "Vale.Repetition",
    kind: "lint",
  },
  {
    file: "docs/guide.md",
    line: 3,
    severity: "warning",
    message: "Line length exceeds 80 characters",
    source: "markdownlint",
    rule: "MD013",
    kind: "lint",
  },
  {
    file: "docs/guide.md",
    line: 4,
    severity: "info",
    message: "Headings should be surrounded by blank lines",
    source: "markdownlint",
    rule: "MD022",
    kind: "lint",
  },
];

// Vite bundles a worker named by `new Worker(new URL(...))`; the editor worker
// is enough here (no language services are used).
function getEditorWorker(): Worker {
  return new Worker(new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url), { type: "module" });
}

function Harness({ onChange, ...props }: Partial<AnnotatedCodeProps>) {
  const [source, setSource] = useState(GUIDE);
  return (
    <MonacoProvider getWorker={getEditorWorker}>
      <div className="h-[360px]">
        <AnnotatedCode
          path="docs/guide.md"
          source={source}
          findings={FINDINGS}
          {...props}
          {...(onChange
            ? {
                onChange: (next: string) => {
                  setSource(next);
                  onChange(next);
                },
              }
            : {})}
        />
      </div>
    </MonacoProvider>
  );
}

const meta = {
  title: "Git/AnnotatedCode",
  component: AnnotatedCode,
  tags: ["browser"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A source file in Monaco with its findings as squiggles, gutter dots and read-only threads in a rail. Read-only unless `onChange` is given; `inlineChips` adds each line's worst finding after its text. Needs a `MonacoProvider` above it.",
      },
    },
  },
  args: { path: "docs/guide.md", source: GUIDE, findings: FINDINGS },
} satisfies Meta<typeof AnnotatedCode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = { render: () => <Harness /> };

export const Editable: Story = {
  args: { onChange: fn() },
  render: (args) => <Harness onChange={args.onChange} />,
  play: async ({ args, canvasElement }) => {
    const lines = await waitFor(() => {
      const element = canvasElement.querySelector<HTMLElement>(".view-lines");
      if (!element) throw new Error("the editor has not rendered its lines yet");
      return element;
    });
    await waitFor(() => expect(canvasElement.querySelector(".squiggly-error")).not.toBeNull());

    await userEvent.click(lines);
    const input = canvasElement.querySelector<HTMLTextAreaElement>("textarea.inputarea");
    if (!input) throw new Error("the editor has no input area");
    input.focus();
    await userEvent.keyboard("x");

    await waitFor(() => expect(args.onChange).toHaveBeenCalled());
    await expect(canvasElement.querySelector(".squiggly-error")).not.toBeNull();
  },
};

export const InlineChips: Story = {
  render: () => <Harness inlineChips />,
  play: async ({ canvasElement }) => {
    // Monaco renders spaces in its view lines as no-break spaces.
    const text = () => (canvasElement.textContent ?? "").replace(/\u00a0/g, " ");
    await waitFor(() => expect(text()).toContain("Vale.Repetition · 'is' is repeated +1"));
    await expect(text()).toContain("MD022 · Headings should be surrounded by blank lines");
  },
};
