import { useState } from "react";
import {
  AppShell,
  Button,
  Panel,
  Tabs,
  type AppShellNavSection,
  UiLayoutDashboard,
  UiFileText,
  UiLayers,
  UiUser,
  UiZap,
  UiPackage,
  UiBeaker,
  UiRefresh,
  UiActivity,
  UiUpload,
  UiDatabase,
  UiBug,
  UiListDashes,
  UiPulse,
  UiPlug,
  UiBraces,
  UiLock,
  UiUserCog,
  UiTerminal,
  UiQuestion,
  UiCog,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

// Mirrors a production app nav so the demo reads as a faithful application
// shell replica for side-by-side comparison.
const NAV = [
  { section: undefined, items: [{ key: "dashboard", label: "Dashboard", icon: UiLayoutDashboard }] },
  {
    section: "Operations",
    items: [
      { key: "policies", label: "Policies", icon: UiFileText },
      { key: "schemes", label: "Schemes", icon: UiLayers },
      { key: "clients", label: "Clients", icon: UiUser },
      { key: "activities", label: "Activities", icon: UiZap },
      { key: "products", label: "Products", icon: UiPackage },
      { key: "test-runner", label: "Test Runner", icon: UiBeaker },
    ],
  },
  {
    section: "Diagnostics",
    items: [
      { key: "cycle", label: "Cycle", icon: UiRefresh },
      { key: "activity-backlog", label: "Activity Backlog", icon: UiActivity },
      { key: "data-intake", label: "Data Intake", icon: UiUpload },
      { key: "sql-server", label: "SQL Server", icon: UiDatabase },
      { key: "arthas", label: "Arthas", icon: UiBug },
      { key: "tasks", label: "Tasks", icon: UiListDashes },
      { key: "traces", label: "Traces", icon: UiPulse },
      { key: "activity-trace", label: "Activity Trace", icon: UiActivity },
      { key: "activemq", label: "ActiveMQ", icon: UiPlug },
    ],
  },
  {
    section: "Admin",
    items: [
      { key: "transactions", label: "Transactions", icon: UiBraces },
      { key: "security-groups", label: "Security Groups", icon: UiLock },
      { key: "users", label: "Users", icon: UiUserCog },
    ],
  },
  {
    section: "System",
    items: [
      { key: "api-explorer", label: "API Explorer", icon: UiTerminal },
      { key: "docs", label: "Docs", icon: UiQuestion },
      { key: "settings", label: "Settings", icon: UiCog },
    ],
  },
];

const PLANS = Array.from({ length: 40 }, (_, i) => `Scheme-G${String(36031 + i * 137).padStart(7, "0")}`);

export function AppShellDemo() {
  const [active, setActive] = useState("policies");
  const [tab, setTab] = useState("overview");
  const [plan, setPlan] = useState(PLANS[0]);

  const navSections: AppShellNavSection[] = NAV.map((s) => ({
    ...(s.section ? { label: s.section } : {}),
    items: s.items.map((i) => ({
      key: i.key,
      label: i.label,
      icon: i.icon,
      active: i.key === active,
      onClick: () => setActive(i.key),
    })),
  }));

  return (
    <DemoSection
      id="app-shell"
      title="AppShell"
      description="Sidebar-first application shell: a full-height dark nav rail owns the brand + collapse toggle and renders grouped, icon'd nav sections; the top bar (search, actions) sits to its right; the body has a fixed bodyHeader + bodyActions row over a bodySidebar | body-main split. Toggle by the logo to collapse the rail."
    >
      <div className="h-[640px] overflow-hidden rounded-lg border border-border">
        <AppShell
          brand={
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary font-bold text-primary-foreground">
              m
            </span>
          }
          search={
            <input
              aria-label="search"
              placeholder="Search anything…"
              className="w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none"
            />
          }
          actions={
            <>
              <Button variant="ghost" size="sm">
                Docs
              </Button>
              <Button variant="outline" size="sm">
                LAB_DEMO_QA ▾
              </Button>
            </>
          }
          navSections={navSections}
          collapsedStorageKey="ks:appshell:collapsed"
          bodyHeader={
            <div>
              <div className="text-xs text-muted-foreground">
                Products › Risk Products › Group Life
              </div>
              <h1 className="mt-1 text-lg font-semibold">Group Life</h1>
              <div className="mt-density-2">
                <Tabs
                  tabs={[
                    { id: "overview", label: "Overview" },
                    { id: "transactions", label: "Transactions" },
                    { id: "eligibility", label: "Eligibility" },
                  ]}
                  value={tab}
                  onChange={setTab}
                />
              </div>
            </div>
          }
          bodyActions={
            <>
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button size="sm">Run</Button>
            </>
          }
          bodySidebar={
            <nav className="p-density-2 text-sm">
              <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Plans ({PLANS.length})
              </div>
              {PLANS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={
                    "block w-full truncate rounded px-2 py-1 text-left font-mono text-xs transition-colors " +
                    (p === plan
                      ? "bg-accent font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground")
                  }
                >
                  {p}
                </button>
              ))}
            </nav>
          }
          bodySplit={26}
        >
          <div className="p-density-4">
            <Panel title={plan} {...(tab === "overview" ? { count: 299 } : {})}>
              <p className="text-sm text-muted-foreground">
                Nav "{active}" · tab "{tab}" · plan "{plan}" — body-main scrolls independently of the
                body sidebar.
              </p>
            </Panel>
          </div>
        </AppShell>
      </div>
    </DemoSection>
  );
}
