import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { AnnotatedMarkdown } from "./AnnotatedMarkdown";
import type { FileFinding } from "./types";

const GUIDE = [
  "# Guide", // 1
  "", // 2
  "This paragraph is intentionally written as one very long line so that the line length rule has something to flag.", // 3
  "", // 4
  "## Setup", // 5
  "", // 6
  "Install the CLI and run it once.", // 7
  "", // 8
  "- first step", // 9
  "- second step", // 10
].join("\n");

function finding(line: number, severity: FileFinding["severity"], rule: string, message: string): FileFinding {
  return { file: "docs/guide.md", line, severity, rule, message, source: "markdownlint", kind: "lint" };
}

const FINDINGS = [
  finding(3, "warning", "MD013", "Line length exceeds 80 characters"),
  finding(3, "info", "write-good", "\"intentionally\" weakens the sentence"),
  finding(10, "error", "MD032", "Lists should be surrounded by blank lines"),
];

const meta = {
  title: "Git/AnnotatedMarkdown",
  component: AnnotatedMarkdown,
  parameters: {
    docs: {
      description: {
        component:
          "A markdown file rendered with its lint findings. By default each finding is a read-only thread in a side panel, anchored to the block holding its line. With `rail={false}` the findings sit in a gutter marker beside each block instead, for hosts that already show a comment rail.",
      },
    },
  },
  args: { path: "docs/guide.md", source: GUIDE, findings: FINDINGS },
} satisfies Meta<typeof AnnotatedMarkdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRail: Story = {
  render: (args) => (
    <div className="h-[420px]">
      <AnnotatedMarkdown {...args} />
    </div>
  ),
};

function GutterHarness(args: Story["args"] & { onLineChange?: (line: number) => void }) {
  const [line, setLine] = useState<number | undefined>(undefined);
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Selected line: {line ?? "none"}</p>
      <AnnotatedMarkdown
        path="docs/guide.md"
        source={GUIDE}
        findings={FINDINGS}
        rail={false}
        line={line}
        onLineChange={(next) => {
          setLine(next);
          args?.onLineChange?.(next);
        }}
      />
    </div>
  );
}

export const GutterWithoutRail: Story = {
  // Selecting a line scrolls its block into view, which jsdom does not implement.
  tags: ["browser"],
  args: { onLineChange: fn() },
  render: (args) => <GutterHarness {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "2 findings on line 3" }));
    await expect(args.onLineChange).toHaveBeenCalledWith(3);
    await expect(canvas.queryByTestId("comment-side-panel")).toBeNull();
  },
};
