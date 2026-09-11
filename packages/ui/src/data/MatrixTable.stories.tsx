import type { Meta, StoryObj } from "@storybook/react-vite";
import { MatrixTable } from "./MatrixTable";
import { StatusDot } from "./cells/StatusDot";

const COLUMNS = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-2"];
const PERMISSION_COLUMNS = [
  "read",
  "write",
  "execute",
  "jvm-instrument",
  "environment-read",
  "database-query",
  "generated-config",
];

const cell = (state: "success" | "warning" | "error") => (
  <StatusDot status={state} size="md" />
);

const ROWS = [
  { key: "api", label: "payments-api", cells: [cell("success"), cell("success"), cell("warning"), cell("success")] },
  { key: "web", label: "storefront-web", cells: [cell("success"), cell("error"), cell("success"), cell("success")] },
  { key: "worker", label: "batch-worker", cells: [cell("warning"), cell("success"), cell("success"), cell("error")] },
];
const PERMISSION_ROWS = Array.from({ length: 18 }, (_, rowIndex) => ({
  key: `product-${rowIndex + 1}`,
  label: `Product ${String(rowIndex + 1).padStart(2, "0")}`,
  cells: PERMISSION_COLUMNS.map((_, columnIndex) =>
    cell(
      (rowIndex + columnIndex) % 7 === 0
        ? "error"
        : (rowIndex + columnIndex) % 5 === 0
          ? "warning"
          : "success",
    ),
  ),
}));

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

export const AngledHeadersWithBackground: Story = {
  args: {
    angledHeaders: true,
    columns: PERMISSION_COLUMNS,
    rows: PERMISSION_ROWS,
    corner: "Scope",
    headerClassName: "bg-background",
    maxHeight: 420,
  },
};

export const Empty: Story = {
  args: { rows: [], emptyMessage: "No deployments to compare" },
};
