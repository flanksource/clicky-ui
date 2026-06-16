import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommandOutput } from "./CommandOutput";
import { SAMPLE_LIST_RESPONSE } from "./rpc-story.fixtures";
import type { ExecutionResponse } from "./types";

const TEXT_RESPONSE: ExecutionResponse = {
  success: true,
  exit_code: 0,
  contentType: "text/plain",
  stdout: "rollout restarted: deployment/payments-api\n3 pods updated",
};

const ERROR_RESPONSE: ExecutionResponse = {
  success: false,
  exit_code: 1,
  contentType: "text/plain",
  stdout: "",
  stderr: "Error: forbidden — token lacks scope deployments:write",
};

const meta = {
  title: "Clicky-RPC/CommandOutput",
  component: CommandOutput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in.",
      },
    },
  },
  argTypes: { response: { control: false }, loading: { control: "boolean" } },
  args: { response: SAMPLE_LIST_RESPONSE },
} satisfies Meta<typeof CommandOutput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Table: Story = {
  render: (args) => (
    <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
  ),
};

export const Text: Story = {
  args: { response: TEXT_RESPONSE },
  render: (args) => (
    <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
  ),
};

export const ErrorOutput: Story = {
  args: { response: ERROR_RESPONSE },
  render: (args) => (
    <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
  ),
};

export const Loading: Story = {
  args: { response: null, loading: true, loadingMessage: "Running command…" },
  render: (args) => (
    <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
  ),
};
