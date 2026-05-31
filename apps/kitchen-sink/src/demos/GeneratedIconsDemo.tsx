import * as GeneratedIcons from "@flanksource/clicky-ui/icons";
import type { IconComponent } from "@flanksource/clicky-ui/icons";
import { DemoSection } from "./Section";

type IconEntry = {
  name: string;
  component: IconComponent;
  group: string;
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
    source: component.__source,
  }))
  .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

const GROUPS = Object.entries(
  ICONS.reduce<Record<string, IconEntry[]>>((acc, icon) => {
    (acc[icon.group] ??= []).push(icon);
    return acc;
  }, {}),
).sort(([a], [b]) => a.localeCompare(b));

function IconTile({ icon }: { icon: IconEntry }) {
  const Component = icon.component;

  return (
    <div className="flex min-w-0 items-center gap-2 rounded border border-border bg-background px-density-2 py-1.5">
      <Component size={18} className="shrink-0 text-foreground" title={icon.name} />
      <div className="min-w-0 leading-tight">
        <div className="truncate font-mono text-[11px] text-foreground">{icon.name}</div>
        <div className="truncate text-[10px] text-muted-foreground">{icon.source}</div>
      </div>
    </div>
  );
}

export function GeneratedIconsDemo() {
  return (
    <DemoSection id="generated-icons" title="Generated Icons">
      <div className="grid gap-density-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border border-border bg-muted/30 p-density-3">
          <div className="text-2xl font-semibold">{ICONS.length}</div>
          <div className="text-xs text-muted-foreground">components</div>
        </div>
        <div className="rounded border border-border bg-muted/30 p-density-3">
          <div className="text-2xl font-semibold">{GROUPS.length}</div>
          <div className="text-xs text-muted-foreground">groups</div>
        </div>
        <div className="rounded border border-border bg-muted/30 p-density-3">
          <div className="text-2xl font-semibold">
            {ICONS.filter((icon) => icon.name.endsWith("Filled")).length}
          </div>
          <div className="text-xs text-muted-foreground">filled variants</div>
        </div>
        <div className="rounded border border-border bg-muted/30 p-density-3">
          <div className="text-2xl font-semibold">
            {Object.keys(GeneratedIcons.changeIconAliases).length}
          </div>
          <div className="text-xs text-muted-foreground">change aliases</div>
        </div>
      </div>

      <div className="space-y-density-4">
        {GROUPS.map(([group, icons]) => (
          <section key={group} className="space-y-density-2">
            <header className="flex items-baseline justify-between gap-density-3">
              <h3 className="text-sm font-semibold">{GROUP_LABELS[group] ?? group}</h3>
              <span className="text-xs text-muted-foreground">{icons.length}</span>
            </header>
            <div className="grid gap-density-2 sm:grid-cols-2 xl:grid-cols-3">
              {icons.map((icon) => (
                <IconTile key={icon.name} icon={icon} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </DemoSection>
  );
}
