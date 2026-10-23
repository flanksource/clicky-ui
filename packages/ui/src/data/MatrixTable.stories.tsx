import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
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

const SIDES = [
  { name: "qa", accent: "#0ea5e9" },
  { name: "uat", accent: "#f59e0b" },
  { name: "prod", accent: "#e11d48" },
  { name: "main", accent: undefined },
];

const variant = (letter: string) => (
  <span className="inline-flex h-6 min-w-9 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-semibold ring-1 ring-inset ring-border">
    {letter}
  </span>
);

export const GroupedRowsAndColumnTints: Story = {
  args: {
    density: "compact",
    corner: "Entity",
    maxHeight: 360,
    headerClassName: "bg-muted/50",
    columns: SIDES.map((side) => ({
      header: side.name,
      title: `side ${side.name}`,
      ...(side.accent
        ? {
            headerStyle: { boxShadow: `inset 0 3px 0 ${side.accent}` },
            cellStyle: { backgroundColor: `color-mix(in srgb, ${side.accent} 6%, transparent)` },
          }
        : {}),
    })),
    rows: [
      { type: "group", key: "product:annuity", label: "Annuity" },
      { type: "group", key: "plan:annuity", label: "Annuity Plan", depth: 1 },
      { key: "add-rider", label: "AddRider", depth: 2, cells: ["A", "A", "B", "A"].map(variant) },
      { key: "withdrawal", label: "Withdrawal", depth: 2, cells: ["A", "A", "A", "A"].map(variant) },
      { type: "group", key: "product:life", label: "Group Life" },
      { type: "group", key: "plan:gl", label: "GL", depth: 1 },
      { key: "enroll", label: "GroupLifeEnrollment with a deliberately long label", depth: 2, cells: ["A", "B", "C", "A"].map(variant) },
    ],
  },
  play: async ({ canvasElement }) => {
    const groups = canvasElement.querySelectorAll("tr[data-matrix-group]");
    await expect(groups).toHaveLength(4);
    const product = groups[0]?.querySelector("th");
    await expect(product).toHaveAttribute("colspan", String(SIDES.length + 1));
    // A group band spans the full table width, not just the label column.
    const table = canvasElement.querySelector("table");
    await expect(product?.getBoundingClientRect().width).toBeCloseTo(
      table?.getBoundingClientRect().width ?? 0,
      0,
    );
  },
};

export const Empty: Story = {
  args: { rows: [], emptyMessage: "No deployments to compare" },
};
