import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Icon, type StaticIconComponent } from "../Icon";
import {
  AGENT_RUNTIME_ICONS,
  APPROVAL_ICONS,
  EFFORT_ICONS,
  PERMISSION_MODE_ICONS,
  WORKFLOW_PHASES,
  type AgentActionMeta,
} from "./agent-action-icons";
import { getSessionAction } from "./SessionViewer.model";
import { providerIcon } from "../chat/provider-icons";

// A visual catalog of the Flanksource "Agent Action Icons" set — the same maps
// the SessionViewer, session filter menu, effort picker, permission-mode picker
// and approval badges consume. Grouped like the source design.

type Cell = { key: string; icon: StaticIconComponent; label: string; token: string };

function metaCells(map: Record<string, AgentActionMeta>): Cell[] {
  return Object.entries(map).map(([key, meta]) => ({
    key,
    icon: meta.icon,
    label: meta.label,
    token: meta.tone,
  }));
}

const TOOL_SAMPLE = [
  "Read", "Write", "Edit", "MultiEdit", "Grep", "Glob", "Bash", "BashOutput",
  "KillShell", "Task", "Skill", "TodoWrite", "EnterPlanMode", "WebFetch",
  "WebSearch", "browser_navigate", "browser_click", "browser_type",
  "browser_snapshot", "browser_network_requests", "mcp__iconify__search_icons",
];

const VENDORS = [
  "openai", "anthropic", "claude", "gemini", "google", "deepseek", "mistral",
  "meta", "ollama", "perplexity", "huggingface",
];

function Grid({ cells }: { cells: Cell[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
      {cells.map((cell) => (
        <div
          key={cell.key}
          className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-foreground">
            <Icon icon={cell.icon} className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">{cell.label}</div>
            <div className="truncate font-mono text-xs text-muted-foreground">{cell.token}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, cells }: { title: string; cells: Cell[] }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <Grid cells={cells} />
    </section>
  );
}

function AgentActionIconsCatalog() {
  const tools: Cell[] = TOOL_SAMPLE.map((tool) => {
    const action = getSessionAction(tool);
    return { key: tool, icon: action.icon, label: action.label, token: tool };
  });
  const vendors: Cell[] = VENDORS.flatMap((provider) => {
    const icon = providerIcon(provider);
    return icon ? [{ key: provider, icon, label: provider, token: `logo-${provider}` }] : [];
  });
  return (
    <div className="max-w-5xl space-y-6 p-4">
      <Section title="Agent workflow" cells={metaCells(WORKFLOW_PHASES)} />
      <Section title="Effort levels" cells={metaCells(EFFORT_ICONS)} />
      <Section title="Permission modes" cells={metaCells(PERMISSION_MODE_ICONS)} />
      <Section title="Approval states" cells={metaCells(APPROVAL_ICONS)} />
      <Section title="Agent runtimes" cells={metaCells(AGENT_RUNTIME_ICONS)} />
      <Section title="Tool actions" cells={tools} />
      <Section title="Model & vendor logos" cells={vendors} />
    </div>
  );
}

const meta = {
  title: "AI/AgentActionIcons",
  component: AgentActionIconsCatalog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Catalog of the Flanksource "Agent Action Icons" set — workflow phases (plan → run → verify), effort levels, permission modes, approval states, agent runtimes, every tool call, and the model/vendor brand marks. These maps drive the SessionViewer transcript, the filter menu, the effort and permission-mode pickers and the approval badges.',
      },
    },
  },
} satisfies Meta<typeof AgentActionIconsCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Catalog: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Agent workflow")).toBeInTheDocument();
    await expect(canvas.getByText("Model & vendor logos")).toBeInTheDocument();
    // Every named provider resolves a brand mark.
    await expect(canvas.getByText("logo-anthropic")).toBeInTheDocument();
  },
};
