import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogViewer } from "./LogViewer";

const meta: Meta<typeof LogViewer> = {
  title: "Data/LogViewer",
  component: LogViewer,
  args: {
    logs: "INFO service ready\\nWARN retry queue above threshold\\nINFO recovered",
    collapsedLines: 2,
    maxExpandedVh: 70,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Expandable log block for dense detail panels. It starts with a fixed number of lines and can expand up to a viewport-height cap. Workflow commands in the log are read: groups become collapsible sections, statuses become lines, and the latest description, status and progress sit below the log. Raw shows the text as it was printed.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LogViewer>;

const sample = Array.from({ length: 40 }, (_, i) => `[line ${i + 1}] processing item...`).join(
  "\n",
);

export const Default: Story = { args: { logs: sample } };

export const Short: Story = { args: { logs: "line 1\nline 2\nline 3" } };

export const Groups: Story = {
  args: {
    variant: "terminal",
    maxHeight: "none",
    logs: [
      "Run ./build.sh",
      "::group::Install dependencies",
      "resolved 214 packages",
      "::group::Native modules",
      "compiled sharp",
      "::endgroup::",
      "::endgroup::",
      "::group::Compile",
      "tsc --build",
      "built 38 files",
      "::endgroup::",
      "::group::Test",
      "running 12 suites…",
    ].join("\n"),
  },
};

/** A running procedure that reports only through workflow commands. */
export const StatusAndProgress: Story = {
  args: {
    variant: "terminal",
    maxHeight: "none",
    logs: [
      "::description::Purging 500 staged activities",
      "Warning: The join order has been enforced because a local join hint is used.",
      "::group::Cycle tables",
      "::status::Truncating AsCycle",
      "::status::Truncating AsCycle",
      "::progress::1/2",
      "::endgroup::",
      "::group::Table reload",
      "::status::AsFundValue: copying kept rows, truncating, reloading",
      "::progress::1/6",
      "::status::AsFundValue: reloaded 1204 rows",
      "::progress::2/6",
    ].join("\n"),
  },
};
