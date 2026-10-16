import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, within } from "storybook/test";
import {
  goProfileRecords,
  httpExchangeRows,
  processNodeRows,
  processSampleRows,
  sqlStatementRows,
  stackRecords,
  terminalEvents,
} from "./fixtures";
import { TraceView } from "./TraceView";

const meta: Meta<typeof TraceView> = {
  title: "Data/Traces/TraceView",
  component: TraceView,
  parameters: {
    docs: {
      description: {
        component:
          "Dispatches a trace kind's records to its viewer: `http` / `http_proxy` to a HAR panel, `pg_proxy` / `sql_statements` to a SQL table, `terminal` to a cast player, `process_tree` to a process tree, `goprof` to a Go profile view per process, `stacks` to a stack dump per checkpoint per process, and any other kind to a table over the row keys. A row missing the field its viewer needs throws, naming the kind and the row.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TraceView>;

const frame = (node: ReactNode) => <div className="h-[480px] rounded-md border border-border">{node}</div>;

export const Http: Story = { render: () => frame(<TraceView kind="http" rows={httpExchangeRows} />) };

export const HttpProxy: Story = { render: () => frame(<TraceView kind="http_proxy" rows={httpExchangeRows} />) };

export const PgProxy: Story = { render: () => frame(<TraceView kind="pg_proxy" rows={sqlStatementRows} />) };

export const SqlStatements: Story = { render: () => frame(<TraceView kind="sql_statements" rows={sqlStatementRows} />) };

export const Terminal: Story = {
  render: () => frame(<TraceView kind="terminal" rows={terminalEvents} />),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("exit 0")).toBeInTheDocument();
  },
};

export const ProcessTree: Story = {
  render: () => frame(<TraceView kind="process_tree" rows={processNodeRows} samples={processSampleRows} />),
};

export const GoProfile: Story = {
  render: () => frame(<TraceView kind="goprof" rows={goProfileRecords} />),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText("Total 2.3 s across 7 functions")).toBeInTheDocument();
  },
};

export const GoProfileSeveralProcesses: Story = {
  render: () =>
    frame(
      <TraceView
        kind="goprof"
        rows={[...goProfileRecords, ...goProfileRecords.map((record) => ({ ...record, key: "101:100", checkpointId: `${record.checkpointId}-child` }))]}
      />,
    ),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText("101:100")).toBeInTheDocument();
  },
};

export const Stacks: Story = {
  render: () => frame(<TraceView kind="stacks" rows={stackRecords} />),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText("g22")).toBeInTheDocument();
  },
};

export const UnknownKind: Story = {
  render: () =>
    frame(
      <TraceView
        kind="ticks"
        rows={[
          { tick: 1, at: "2026-10-01T09:00:00Z", label: "first" },
          { tick: 2, at: "2026-10-01T09:00:01Z", label: "second" },
        ]}
      />,
    ),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText("second")).toBeInTheDocument();
  },
};
