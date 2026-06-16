import type { Meta, StoryObj } from "@storybook/react-vite";
import { MatrixTable } from "./MatrixTable";
import { StatusDot } from "./cells/StatusDot";

const COLUMNS = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-2"];

const cell = (state: "success" | "warning" | "error") => (
  <StatusDot status={state} size="md" />
);

const ROWS = [
  { key: "api", label: "payments-api", cells: [cell("success"), cell("success"), cell("warning"), cell("success")] },
  { key: "web", label: "storefront-web", cells: [cell("success"), cell("error"), cell("success"), cell("success")] },
  { key: "worker", label: "batch-worker", cells: [cell("warning"), cell("success"), cell("success"), cell("error")] },
];

const meta = {
  title: "Data/MatrixTable",
  component: MatrixTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Excel-style matrix with a frozen first column and sticky header row, so a service × region (or any 2-axis) grid scrolls under its headers. Cells, columns and the corner are arbitrary nodes. Optional `angledHeaders` rotates long column labels 45°.",
      },
    },
  },
  argTypes: {
    angledHeaders: { control: "boolean" },
    density: { control: "inline-radio", options: ["default", "compact"] },
    columns: { control: false },
    rows: { control: false },
  },
  args: {
    corner: "Service",
    columns: COLUMNS,
    rows: ROWS,
  },
} satisfies Meta<typeof MatrixTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AngledHeaders: Story = {
  args: { angledHeaders: true, headerHeight: 90 },
};

export const Empty: Story = {
  args: { rows: [], emptyMessage: "No deployments to compare" },
};
