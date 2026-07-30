import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { EntityCell } from "./EntityCell";
import { Badge } from "../Badge";
import {
  UiBank,
  UiChartOfAccounts,
  UiCloudUpload,
  UiLedger,
  UiReceipt,
} from "../../icons";

const meta = {
  title: "Data/Cells/EntityCell",
  component: EntityCell,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A two-line table cell for an entity: tinted icon chip, title, muted subtitle. The chip tint reuses the shared `BadgeTone` palette so an entity keeps the same colour wherever it appears — list column, inline reference, or detail header.",
      },
    },
  },
  argTypes: {
    iconTone: {
      control: "inline-radio",
      options: ["neutral", "success", "danger", "warning", "info"],
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  args: {
    title: "Post ITR14 tax position · FY2025",
    subtitle: "Provisional tax journal · 77f98029…8144",
    icon: UiLedger,
    iconTone: "info",
    size: "md",
  },
} satisfies Meta<typeof EntityCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-3">
      <EntityCell
        icon={UiLedger}
        iconTone="info"
        title="Post ITR14 tax position"
        subtitle="Provisional tax journal"
      />
      <EntityCell
        icon={UiReceipt}
        iconTone="success"
        title="Sales invoice INV-2039"
        subtitle="Kalahari Freight CC · net 30"
      />
      <EntityCell
        icon={UiBank}
        iconTone="warning"
        title="Remap bank feed 090"
        subtitle="3 external accounts"
      />
      <EntityCell
        icon={UiChartOfAccounts}
        iconTone="danger"
        title="New account 452 · Paid acquisition"
        subtitle="Chart of accounts · expense"
      />
      <EntityCell
        icon={UiCloudUpload}
        iconTone="neutral"
        title="Push 12 close journals to Xero"
        subtitle="Upstream write · manual journals"
      />
    </div>
  ),
};

export const LinkedWithTrailing: Story = {
  args: {
    href: "#approval",
    trailing: <Badge tone="warning">Needs review</Badge>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("link", { name: /ITR14 tax position/ }),
    ).toHaveAttribute("href", "#approval");
    await expect(canvas.getByText("Needs review")).toBeVisible();
  },
};
