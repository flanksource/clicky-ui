import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "./Icon";
import {
  UiCheck,
  UiCircleOutline,
  UiError,
  UiInfo,
  UiQuestion,
  UiStarFilled,
  UiHourglass,
  UiClose,
  UiLoader,
} from "@flanksource/icons/ui";
import { SIZE_TOKENS } from "../lib/size";

const meta: Meta<typeof Icon> = {
  title: "Data/Icon",
  component: Icon,
  parameters: {
    docs: {
      description: {
        component:
          "Renders statically imported icon components for built-in icons. Runtime string names are for user-supplied data handled by a registered fallback provider. Use `style=\"badge\"` when the icon needs its own circular chip.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Check: Story = {
  args: { icon: UiCheck, className: "text-green-600 text-xl" },
};
export const Error: Story = {
  args: { icon: UiError, className: "text-red-600 text-xl" },
};
export const Spinner: Story = {
  args: { icon: UiLoader, className: "text-blue-500 text-2xl" },
};

export const Badge: Story = {
  args: {
    icon: UiCheck,
    style: "badge",
    tone: "emerald",
    size: "lg",
    title: "approved",
  },
};

export const BadgeSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {SIZE_TOKENS.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon
            icon={UiCheck}
            style="badge"
            tone="emerald"
            size={size}
            title="approved"
          />
          <span className="font-mono text-[10px] text-muted-foreground">
            {size}
          </span>
        </div>
      ))}
    </div>
  ),
};

const RUNTIME_ICON_NAMES = [
  "codicon:check",
  "codicon:error",
  "codicon:warning",
  "codicon:info",
  "codicon:beaker",
  "codicon:rocket",
  "svg-spinners:ring-resize",
];

export const RuntimeNames: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "User-supplied runtime icon names resolved by the registered fallback provider. With no provider registered (as in Storybook) each name renders the documented dashed placeholder.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-density-2">
      {RUNTIME_ICON_NAMES.map((name) => (
        <div key={name} className="flex items-center gap-density-2 text-sm">
          <Icon name={name} className="text-xl" title={name} />
          <code className="text-xs text-muted-foreground">{name}</code>
        </div>
      ))}
    </div>
  ),
};

export const BadgeTones: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Icon
        icon={UiCheck}
        style="badge"
        tone="emerald"
        size="lg"
        title="approved"
      />
      <Icon
        icon={UiHourglass}
        style="badge"
        tone="amber"
        size="lg"
        title="pending"
      />
      <Icon
        icon={UiClose}
        style="badge"
        tone="rose"
        size="lg"
        title="rejected"
      />
      <Icon icon={UiInfo} style="badge" tone="sky" size="lg" title="info" />
      <Icon
        icon={UiStarFilled}
        style="badge"
        tone="violet"
        size="lg"
        title="starred"
      />
      <Icon
        icon={UiCircleOutline}
        style="badge"
        tone="slate"
        size="lg"
        title="draft"
      />
      <Icon
        icon={UiQuestion}
        style="badge"
        tone="neutral"
        size="lg"
        title="unknown"
      />
    </div>
  ),
};
