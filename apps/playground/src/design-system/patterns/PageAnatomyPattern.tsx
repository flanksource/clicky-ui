import { useState } from "react";
import {
  AppShell,
  Badge,
  Button,
  DensitySwitcher,
  IconButton,
  Panel,
  SearchInput,
  SegmentedControl,
  ThemeSwitcher,
  type AppShellNavSection,
} from "@flanksource/clicky-ui";
import {
  UiActivity,
  UiBell,
  UiCloud,
  UiDatabase,
  UiFilter,
  UiLayoutDashboard,
  UiRefresh,
  UiServer,
  UiShield,
} from "@flanksource/clicky-ui/icons";

// The anatomy demo is a real AppShell, not a drawing of one: every region below
// is the component's own slot, so a rule stated here is a rule the reader can
// verify by resizing the frame. Nav destinations are inert (`#`) — this shell is
// a specimen inside a page that owns the actual route.

const NAV_SECTIONS: AppShellNavSection[] = [
  {
    label: "Operate",
    items: [
      { key: "overview", label: "Overview", icon: UiLayoutDashboard, to: "#", active: true },
      { key: "resources", label: "Resources", icon: UiServer, to: "#", badge: <Badge clickToCopy={false} count={128} size="xxs" tone="neutral" variant="soft" /> },
      { key: "health", label: "Health", icon: UiActivity, to: "#" },
    ],
  },
  {
    label: "Sources",
    variant: "tree",
    groups: [
      {
        key: "clusters",
        label: "Clusters",
        icon: UiCloud,
        items: [
          { key: "prod", label: "production", to: "#" },
          { key: "staging", label: "staging", to: "#" },
        ],
      },
      {
        key: "databases",
        label: "Databases",
        icon: UiDatabase,
        defaultCollapsed: true,
        items: [{ key: "ledger", label: "ledger", to: "#" }],
      },
    ],
  },
];

const ROWS = [
  { name: "payments-api", scope: "platform / production", state: "Healthy" },
  { name: "policy-engine", scope: "compliance / production", state: "Degraded" },
  { name: "evidence-store", scope: "trust / production", state: "Healthy" },
  { name: "asset-indexer", scope: "inventory / staging", state: "Healthy" },
];

export function PageAnatomyPattern() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("production");
  const rows = ROWS.filter((row) => row.name.includes(query.toLowerCase()));

  return (
    <div className="h-[40rem] overflow-hidden rounded-xl border border-border shadow-sm">
      <AppShell
        brand={
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-6 place-items-center rounded bg-primary text-primary-foreground">F</span>
            Mission Control
          </span>
        }
        navSections={NAV_SECTIONS}
        sidebarFooter={
          <div data-practice="rail-footer" className="flex items-center justify-between gap-density-2 text-xs">
            <span className="truncate text-sidebar-foreground/70">v2.14.0</span>
            <ThemeSwitcher />
          </div>
        }
        search={<SearchInput value={query} onChange={setQuery} placeholder="Search resources…" />}
        nav={
          <nav data-practice="breadcrumbs" aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Configuration</span>
            <span aria-hidden>/</span>
            <span className="font-medium text-foreground">Resources</span>
          </nav>
        }
        actions={
          <div data-practice="actions" className="flex items-center gap-density-2">
            <DensitySwitcher />
            <IconButton icon={UiBell} label="Notifications" iconClassName="size-4" />
          </div>
        }
        toolbar={
          <div data-practice="toolbar" className="flex flex-wrap items-center gap-density-2">
            <SegmentedControl
              value={scope}
              onChange={setScope}
              aria-label="Environment"
              options={[
                { id: "production", label: "Production" },
                { id: "staging", label: "Staging" },
              ]}
            />
            <Button variant="outline" size="sm"><UiFilter className="size-4" />Owner: Platform</Button>
            <Button variant="ghost" size="sm"><UiShield className="size-4" />Only failing</Button>
            <span className="ml-auto text-xs text-muted-foreground">{rows.length} of {ROWS.length} resources</span>
          </div>
        }
        bodyHeader={
          <div data-practice="body-header">
            <h2 className="text-lg font-semibold text-foreground">Resources</h2>
          </div>
        }
        bodyActions={
          <div data-practice="body-actions" className="flex items-center gap-density-2">
            <Button variant="outline" size="sm"><UiRefresh className="size-4" />Refresh</Button>
            <Button size="sm">Add resource</Button>
          </div>
        }
      >
        <div data-practice="content" className="space-y-density-3 p-density-3">
          <Panel title="Collection" count={rows.length} padded={false}>
            <div className="divide-y divide-border">
              {rows.map((row) => (
                <div key={row.name} className="flex items-center justify-between gap-density-3 p-density-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.scope}</p>
                  </div>
                  {/* Colour alone cannot carry the state: the label names it for
                      screen readers and for anyone who cannot tell the two
                      circles apart. */}
                  <span className="flex items-center gap-density-2 text-xs text-muted-foreground">
                    <span
                      aria-hidden
                      className={row.state === "Degraded" ? "size-2 rounded-full bg-amber-500" : "size-2 rounded-full bg-emerald-500"}
                    />
                    {row.state}
                  </span>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="p-density-4 text-sm text-muted-foreground">No resources match this search.</p>
              )}
            </div>
          </Panel>
          <Panel title="Why this scrolls here" tone="info" padded>
            <p className="text-sm leading-6 text-muted-foreground">
              Only this region scrolls. The rail, top bar, toolbar and body header stay put, so filters and the primary
              action never scroll out of reach on a long collection.
            </p>
          </Panel>
        </div>
      </AppShell>
    </div>
  );
}
