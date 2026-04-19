import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Data/Badge",
  component: Badge,
};

export default meta;
type Story = StoryObj<typeof Badge>;

const TONES = ["neutral", "success", "danger", "warning", "info"] as const;
const VARIANTS = ["soft", "solid", "outline"] as const;

export const Matrix: Story = {
  render: () => (
    <div className="space-y-density-2">
      {VARIANTS.map((v) => (
        <div key={v} className="flex items-center gap-density-2">
          <span className="w-20 text-xs text-muted-foreground">{v}</span>
          {TONES.map((t) => (
            <Badge key={t} tone={t} variant={v}>
              {t}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const WithCount: Story = {
  args: { tone: "danger", variant: "solid", count: 12, children: "errors" },
};

export const WithIcon: Story = {
  args: { tone: "success", icon: "codicon:check", children: "passed" },
};
