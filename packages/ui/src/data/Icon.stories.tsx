import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "./Icon";
import { SIZE_TOKENS } from "../lib/size";

const meta: Meta<typeof Icon> = {
  title: "Data/Icon",
  component: Icon,
  parameters: {
    docs: {
      description: {
        component:
          'Thin wrapper over the `iconify-icon` web component. Add `<script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"></script>` to your host HTML, or install `iconify-icon` as a runtime dep.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Check: Story = {
  args: { name: "codicon:check", className: "text-green-600 text-xl" },
};
export const Error: Story = { args: { name: "codicon:error", className: "text-red-600 text-xl" } };
export const Spinner: Story = {
  args: { name: "svg-spinners:ring-resize", className: "text-blue-500 text-2xl" },
};

export const Badge: Story = {
  args: { name: "codicon:check", style: "badge", tone: "emerald", size: "lg", title: "approved" },
};

export const BadgeSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {SIZE_TOKENS.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon name="codicon:check" style="badge" tone="emerald" size={size} title="approved" />
          <span className="font-mono text-[10px] text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const BadgeTones: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Icon name="codicon:check" style="badge" tone="emerald" size="lg" title="approved" />
      <Icon name="mdi:hourglass-sand" style="badge" tone="amber" size="lg" title="pending" />
      <Icon name="codicon:close" style="badge" tone="rose" size="lg" title="rejected" />
      <Icon name="codicon:info" style="badge" tone="sky" size="lg" title="info" />
      <Icon name="codicon:star" style="badge" tone="violet" size="lg" title="starred" />
      <Icon name="codicon:circle-outline" style="badge" tone="slate" size="lg" title="draft" />
      <Icon name="codicon:question" style="badge" tone="neutral" size="lg" title="unknown" />
    </div>
  ),
};
