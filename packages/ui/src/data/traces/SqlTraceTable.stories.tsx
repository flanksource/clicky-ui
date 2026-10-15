import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { sqlStatementRows } from "./fixtures";
import { SqlTraceTable } from "./SqlTraceTable";

const meta: Meta<typeof SqlTraceTable> = {
  title: "Data/Traces/SqlTraceTable",
  component: SqlTraceTable,
  parameters: {
    docs: {
      description: {
        component:
          "`pg_proxy` / `sql_statements` records as a DataTable: time, op, tables, highlighted SQL, duration, rows and error. Statements sharing a `repeatKey` collapse into one row with a count badge and their total duration; the switch shows each execution instead. Expanding a row shows the full statement and its arguments.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SqlTraceTable>;

export const GroupedRepeats: Story = {
  render: () => (
    <div className="h-[420px] rounded-md border border-border">
      <SqlTraceTable rows={sqlStatementRows} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText("×3")).toBeInTheDocument();
  },
};

export const EveryExecution: Story = {
  render: () => (
    <div className="h-[420px] rounded-md border border-border">
      <SqlTraceTable rows={sqlStatementRows} groupRepeated={false} />
    </div>
  ),
};

export const Empty: Story = {
  render: () => <SqlTraceTable rows={[]} />,
};
