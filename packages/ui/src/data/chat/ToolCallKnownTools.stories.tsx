import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ToolCall } from "./ToolCall";
import type { DynamicToolUIPart } from "./types";

const COLLAPSED_EDIT = {
  type: "dynamic-tool",
  toolName: "Edit",
  toolCallId: "call-edit-collapsed",
  state: "output-available",
  input: {
    file_path: "src/config.ts",
    old_string: "export const enabled = false;",
    new_string: "export const enabled = true;",
  },
  output: "Updated src/config.ts",
} satisfies DynamicToolUIPart;

const KNOWN_TOOL_PARTS: DynamicToolUIPart[] = [
  {
    type: "dynamic-tool",
    toolName: "Bash",
    toolCallId: "call-shell",
    state: "output-available",
    input: { command: "pnpm test", timeout: 120_000 },
    output: "3 tests passed\nexit 0",
  },
  {
    type: "dynamic-tool",
    toolName: "Read",
    toolCallId: "call-read",
    state: "output-available",
    input: { file_path: "src/config.ts" },
    output: "export const enabled = true;",
  },
  COLLAPSED_EDIT,
  {
    type: "dynamic-tool",
    toolName: "update_plan",
    toolCallId: "call-plan",
    state: "output-available",
    input: {
      explanation: "Implementation plan",
      plan: [
        { step: "Trace the renderer", status: "completed" },
        { step: "Add known tools", status: "in_progress" },
      ],
    },
    output: "Plan updated",
  },
  {
    type: "dynamic-tool",
    toolName: "AskUserQuestion",
    toolCallId: "call-question",
    state: "output-available",
    input: {
      questions: [
        {
          header: "Scope",
          question: "Which environment?",
          options: [
            { label: "Local", description: "Use local fixtures" },
            { label: "Staging" },
          ],
        },
      ],
    },
    output: "Local",
  },
];

const meta = {
  title: "Chat/ToolCall/Known Tools",
  component: ToolCall,
  args: { part: COLLAPSED_EDIT },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ToolCall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CollapsedArguments: Story = {
  render: (args) => (
    <div className="max-w-3xl">
      <ToolCall {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const args = within(canvasElement).getByTestId("tool-call-args");
    await expect(args).toHaveTextContent("file_path: src/config.ts");
    await expect(args).toHaveTextContent(
      "old_string: export const enabled = false;",
    );
  },
};

export const StandardRenderers: Story = {
  render: () => (
    <div className="max-w-4xl space-y-4">
      {KNOWN_TOOL_PARTS.map((part) => (
        <ToolCall key={part.toolCallId} defaultOpen part={part} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="tool-render-shell-input"]'),
    ).not.toBeNull();
    await expect(
      canvasElement.querySelector('[data-slot="tool-render-file-read"]'),
    ).not.toBeNull();
    await expect(
      canvasElement.querySelector('[data-slot="tool-render-file-edit"]'),
    ).not.toBeNull();
    await expect(
      canvasElement.querySelector('[data-slot="tool-render-plan"]'),
    ).not.toBeNull();
    await expect(
      canvasElement.querySelector('[data-slot="tool-render-question"]'),
    ).not.toBeNull();
  },
};
