import type { Meta, StoryObj } from "@storybook/react-vite";
import * as GeneratedIcons from "./icons";
import type { IconComponent } from "./icons";

type IconEntry = {
  name: string;
  component: IconComponent;
  group: string;
  consumerName: string;
  source: string;
};

const GROUP_LABELS: Record<string, string> = {
  "ui-controls": "UI controls",
  navigation: "Navigation",
  "layout-dashboard": "Layout & dashboard",
  "forms-editing": "Forms & editing",
  "health-status": "Health & status",
  "approval-review": "Approval & review",
  "security-auth": "Security & auth",
  severity: "Severity",
  insight: "Insight",
  "trees-lists-tables": "Trees, lists & tables",
  "data-analytics": "Data & analytics",
  "playbooks-workflows": "Playbooks & workflows",
  "runtime-process": "Runtime & process",
  "configs-metadata": "Configs & metadata",
  "uir-ast-code": "UIR / AST code",
  "uir-sql": "UIR / SQL",
  "files-code": "Files & code",
  "git-source-control": "Git & source control",
  "dev-tools": "Dev tools",
  "ai-ml": "AI & ML",
  infrastructure: "Infrastructure",
  "actions-tools": "Actions & tools",
  "people-orgs": "People & orgs",
  time: "Time",
  communication: "Communication",
  media: "Media",
};

function isIconComponent(value: unknown): value is IconComponent {
  return (
    typeof value === "function" &&
    "__source" in value &&
    "__group" in value &&
    "__consumerName" in value
  );
}

const ICONS: IconEntry[] = Object.entries(GeneratedIcons)
  .filter((entry): entry is [string, IconComponent] => isIconComponent(entry[1]))
  .map(([name, component]) => ({
    name,
    component,
    group: component.__group,
    consumerName: component.__consumerName,
    source: component.__source,
  }))
  .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

const GROUPS = Object.entries(
  ICONS.reduce<Record<string, IconEntry[]>>((acc, icon) => {
    (acc[icon.group] ??= []).push(icon);
    return acc;
  }, {}),
).sort(([a], [b]) => a.localeCompare(b));

type GeneratedIconsDemoProps = {
  group: string;
  query: string;
  size: number;
  showSource: boolean;
  showStats: boolean;
  filledOnly: boolean;
  showAliases: boolean;
};

function GeneratedIconsDemo({
  group,
  query,
  size,
  showSource,
  showStats,
  filledOnly,
  showAliases,
}: GeneratedIconsDemoProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredGroups = GROUPS.map(
    ([groupName, icons]) =>
      [
        groupName,
        icons.filter((icon) => {
          const matchesGroup = group === "all" || icon.group === group;
          const matchesFilled = !filledOnly || icon.name.endsWith("Filled");
          const matchesQuery =
            normalizedQuery.length === 0 ||
            icon.name.toLowerCase().includes(normalizedQuery) ||
            icon.consumerName.toLowerCase().includes(normalizedQuery) ||
            icon.source.toLowerCase().includes(normalizedQuery);
          return matchesGroup && matchesFilled && matchesQuery;
        }),
      ] as const,
  ).filter(([, icons]) => icons.length > 0);

  if (showAliases) {
    return <ChangeAliasesDemo size={size} />;
  }

  return (
    <div className="space-y-6">
      {showStats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="components" value={ICONS.length} />
          <StatCard label="groups" value={GROUPS.length} />
          <StatCard
            label="filled variants"
            value={ICONS.filter((icon) => icon.name.endsWith("Filled")).length}
          />
          <StatCard
            label="change aliases"
            value={Object.keys(GeneratedIcons.changeIconAliases).length}
          />
        </div>
      )}

      {filteredGroups.map(([groupName, icons]) => (
        <section key={groupName} className="space-y-2">
          <header className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold">{GROUP_LABELS[groupName] ?? groupName}</h2>
            <span className="text-xs text-muted-foreground">{icons.length}</span>
          </header>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {icons.map((icon) => (
              <IconCard key={icon.name} icon={icon} showSource={showSource} size={size} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const meta: Meta<typeof GeneratedIconsDemo> = {
  title: "Foundations/Generated Icons",
  component: GeneratedIconsDemo,
  args: {
    group: "all",
    query: "",
    size: 18,
    showSource: true,
    showStats: true,
    filledOnly: false,
    showAliases: false,
  },
  argTypes: {
    group: {
      control: "select",
      options: ["all", ...GROUPS.map(([groupName]) => groupName)],
      description: "Filter the gallery to a single semantic group, or `all`.",
      table: { category: "Filter" },
    },
    query: {
      control: "text",
      description:
        "Case-insensitive substring matched against the component name, consumer name, and source.",
      table: { category: "Filter" },
    },
    filledOnly: {
      control: "boolean",
      description: "Show only the `*Filled` solid variants.",
      table: { category: "Filter" },
    },
    size: {
      control: { type: "number", min: 12, max: 48, step: 1 },
      description: "Pixel size passed to each rendered icon.",
      table: { category: "Display" },
    },
    showSource: {
      control: "boolean",
      description: "Show the underlying Iconify source name under each icon.",
      table: { category: "Display" },
    },
    showStats: {
      control: "boolean",
      description: "Show the summary counts (components, groups, filled variants).",
      table: { category: "Display" },
    },
    showAliases: {
      control: "boolean",
      description:
        "Switch to the change-alias view pairing outline and filled icons by change type.",
      table: { category: "Display" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Generated React icon components exported from `@flanksource/clicky-ui/icons`.",
          "",
          "**What this is**",
          "- Every icon is a tree-shakeable React component (`UiCheck`, `UiActivity`, …) generated from `icon-selections.json` and grouped by purpose (health, navigation, infra, …).",
          "- Components carry metadata (`__group`, `__source`, `__consumerName`) used to build this searchable gallery.",
          "",
          "**Usage**",
          "```tsx",
          'import { UiCheck, UiActivity } from "@flanksource/clicky-ui/icons";',
          "",
          '<UiCheck size={18} className="text-emerald-600" title="healthy" />',
          "```",
          "- Prefer the imported component for built-in icons; pass runtime string names only for user-supplied data (handled by a registered fallback provider — see `Data/Icon`).",
          "- `*Filled` variants are solid; use the **Filled only** control to browse them. **Change aliases** pairs outline/filled icons by change type.",
          "",
          "Use the controls panel to filter by **group**, full-text **query**, and adjust **size**.",
        ].join("\n"),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof GeneratedIconsDemo>;

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-border bg-muted/30 p-3">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function IconCard({
  icon,
  showSource,
  size,
}: {
  icon: IconEntry;
  showSource: boolean;
  size: number;
}) {
  const Component = icon.component;

  return (
    <div className="flex min-w-0 items-center gap-2 rounded border border-border bg-background px-2 py-1.5">
      <Component size={size} className="shrink-0 text-foreground" title={icon.name} />
      <div className="min-w-0 leading-tight">
        <div className="truncate font-mono text-[11px] text-foreground">{icon.name}</div>
        {showSource && (
          <div className="truncate text-[10px] text-muted-foreground">{icon.source}</div>
        )}
      </div>
    </div>
  );
}

export const Gallery: Story = {
  args: {
    showAliases: false,
  },
};

function ChangeAliasesDemo({ size }: { size: number }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(GeneratedIcons.changeIconAliases).map(([name, entry]) => {
        const Outline = entry.outline;
        const Filled = entry.filled;

        return (
          <div
            key={name}
            className="flex min-w-0 items-center gap-3 rounded border border-border bg-background px-3 py-2"
          >
            <div className="flex items-center gap-1 text-foreground">
              <Outline size={size} title={`${name} outline`} />
              {Filled && <Filled size={size} title={`${name} filled`} />}
            </div>
            <code className="truncate text-xs text-muted-foreground">{name}</code>
          </div>
        );
      })}
    </div>
  );
}

export const ChangeAliases: Story = {
  args: {
    showAliases: true,
    showStats: false,
  },
};
