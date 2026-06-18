import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AppShell } from "./AppShell";
import { Tabs } from "./Tabs";
import { Panel } from "./Panel";
import { Button } from "../components/button";
import { RouterProvider } from "../rpc/RouterProvider";
import { useMemoryRouter, useRouter } from "../rpc/router";
import { UiGrid, UiBox, UiUsersThree, UiHome, UiDatabase } from "../icons";

const meta: Meta<typeof AppShell> = {
  title: "Layout/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Top-bar application shell: a sticky header with brand, nav, a centered search slot and a right-aligned actions cluster, plus an optional toolbar row. The content area fills the remaining height and scrolls independently. Counterpart to the sidebar-oriented AppLayout.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {
  render: () => {
    const [tab, setTab] = useState("prs");
    return (
      <div className="h-[480px]">
        <AppShell
          brand={
            <>
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold">
                g
              </span>
              <span className="font-bold tracking-tight">gavel</span>
            </>
          }
          nav={
            <Tabs
              tabs={[
                { id: "prs", label: "Pull requests" },
                { id: "activity", label: "Activity" },
              ]}
              value={tab}
              onChange={setTab}
            />
          }
          search={
            <input
              aria-label="search"
              placeholder="Search…"
              className="w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none"
            />
          }
          actions={
            <>
              <Button variant="ghost" size="sm">
                Light/Dark
              </Button>
              <Button size="sm">New</Button>
            </>
          }
          toolbar={
            <>
              <span className="text-sm text-muted-foreground">
                Filters go here
              </span>
              <div className="flex-1" />
              <Button variant="outline" size="sm">
                Export
              </Button>
            </>
          }
        >
          <div className="h-full overflow-y-auto p-density-4">
            <Panel title="Content" count={2}>
              <p className="text-sm">The routed content area scrolls here.</p>
            </Panel>
          </div>
        </AppShell>
      </div>
    );
  },
};

export const NoToolbar: Story = {
  render: () => (
    <div className="h-[320px]">
      <AppShell
        brand={<span className="font-bold">gavel</span>}
        actions={<Button size="sm">Action</Button>}
      >
        <div className="p-density-4 text-sm text-muted-foreground">
          No toolbar row.
        </div>
      </AppShell>
    </div>
  ),
};

export const CompactMobileActions: Story = {
  render: () => (
    <div className="h-[420px]">
      <AppShell
        brand={<span className="font-bold">gavel</span>}
        navSections={[
          { items: [{ key: "runs", label: "Runs", icon: UiGrid, to: "/runs" }] },
        ]}
        actions={
          <>
            <Button size="sm">Run capture</Button>
            <Button variant="outline" size="sm">
              Edit target
            </Button>
            <Button variant="outline" size="sm">
              Workspace with a long name
            </Button>
          </>
        }
        mobileActions={
          <>
            <Button size="sm">Run</Button>
            <Button variant="outline" size="sm">
              More
            </Button>
          </>
        }
      >
        <div className="p-density-4 text-sm text-muted-foreground">
          Resize this story to a phone width: the mobile header keeps the primary
          action compact while desktop still renders the full action cluster.
        </div>
      </AppShell>
    </div>
  ),
};

// Mission-Control style: collapsible nav rail, a centered search,
// right-side icon buttons + an org/settings picker, and a body with a fixed
// header + actions row over a bodySidebar | body-main split.
export const WithSidebar: Story = {
  render: () => {
    const router = useMemoryRouter("/policies");
    return (
      <div className="h-[560px]">
        <RouterProvider adapter={router}>
          <WithSidebarBody />
        </RouterProvider>
      </div>
    );
  },
};

function WithSidebarBody() {
  const { pathname } = useRouter();
  const active = pathname.replace(/^\//, "");
  const navSections = [
    {
      label: "Operations",
      items: [
        { key: "dashboard", label: "Dashboard", icon: UiGrid },
        { key: "policies", label: "Policies", icon: UiBox },
        { key: "clients", label: "Clients", icon: UiUsersThree },
      ].map((i) => ({ ...i, active: i.key === active, to: `/${i.key}` })),
    },
    {
      label: "System",
      items: [
        { key: "docs", label: "Docs", icon: UiHome },
        { key: "settings", label: "Settings", icon: UiDatabase },
      ].map((i) => ({ ...i, active: i.key === active, to: `/${i.key}` })),
    },
  ];
  return (
    <AppShell
      brand={
        <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold">
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
      collapsedStorageKey="sb-demo:collapsed"
      bodyHeader={
        <div>
          <div className="text-xs text-muted-foreground">
            Products › Risk Products › Group Life
          </div>
          <h1 className="mt-1 text-lg font-semibold">Group Life</h1>
          <div className="mt-2 flex gap-density-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Overview</span>
            <span>Transactions</span>
            <span>Eligibility</span>
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
            Plans (299)
          </div>
          {Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              className="truncate rounded px-2 py-1 hover:bg-accent hover:text-foreground"
            >
              Scheme-G{String(36031 + i).padStart(7, "0")}
            </div>
          ))}
        </nav>
      }
    >
      <div className="p-density-4 text-sm">
        Active: {active} — body-main scrolls here.
      </div>
    </AppShell>
  );
}
