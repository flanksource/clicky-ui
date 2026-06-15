import type { Meta, StoryObj } from "@storybook/react-vite";
import { UiWarningCircle } from "../icons";
import { Panel } from "./Panel";

const meta: Meta<typeof Panel> = {
  title: "Layout/Panel",
  component: Panel,
  args: {
    title: "Checks",
    count: 6,
    tone: "default",
    padded: true,
    children: (
      <ul className="text-sm space-y-density-1">
        <li>build · passed</li>
        <li>lint · passed</li>
        <li>test · failed</li>
      </ul>
    ),
  },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["default", "danger", "warning", "success", "info"],
    },
    padded: { control: "boolean" },
    icon: { table: { disable: true } },
    actions: { table: { disable: true } },
    footer: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Non-collapsible carded surface with an optional header (title, icon, count pill, right-aligned actions) and optional footer. Use for content panels where Section's disclosure behaviour isn't wanted.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Panel>;

export const Default: Story = {};

export const WithActions: Story = {
  args: {
    icon: UiWarningCircle,
    tone: "danger",
    actions: (
      <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
        Copy
      </button>
    ),
    footer: <span className="text-xs text-muted-foreground">3 of 12 shown</span>,
  },
};

export const Headerless: Story = {
  args: {
    title: undefined,
    count: undefined,
    children: <p className="text-sm">A plain card with no header row.</p>,
  },
};

export const FlushRows: Story = {
  args: {
    title: "Files",
    count: 3,
    padded: false,
    children: (
      <div className="divide-y divide-border text-sm">
        {["handler.go", "service.go", "router.go"].map((f) => (
          <div key={f} className="px-density-3 py-density-2 font-mono">
            {f}
          </div>
        ))}
      </div>
    ),
  },
};
