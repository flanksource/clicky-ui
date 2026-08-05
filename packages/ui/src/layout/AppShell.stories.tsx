import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, userEvent, within } from "storybook/test";
import { AppShell } from "./AppShell";
import { Tabs } from "./Tabs";
import { Panel } from "./Panel";
import { Button } from "../components/button";
import { Switch } from "../components/Switch";
import { Avatar } from "../data/Avatar";
import { RouterProvider } from "../rpc/RouterProvider";
import { useMemoryRouter, useRouter } from "../rpc/router";
import { OperationCatalog } from "../rpc/OperationCatalog";
import { FAKE_CLIENT, anchorLink } from "../rpc/rpc-story.fixtures";
import { CommandPalette } from "../overlay/CommandPalette";
import { CommandPaletteTrigger } from "../overlay/CommandPaletteTrigger";
import type { CommandGroup } from "../overlay/CommandPalette.model";
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

// A backend whose entities encode a hierarchy in their names (`jms.incoming`,
// `arthas.activity.process`) needs more than one level of nav. Two things here
// are worth studying: groups nest arbitrarily, and a group can carry its own
// `item` — so `jms`, which is BOTH a runnable entity and the parent of others,
// is one row that navigates on the label and expands on the caret.
export const NestedNavGroups: Story = {
  render: () => {
    const router = useMemoryRouter("/jms-incoming");
    return (
      <div className="h-[560px]">
        <RouterProvider adapter={router}>
          <NestedNavBody />
        </RouterProvider>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The folder-and-leaf row exposes both affordances, as siblings.
    const jms = canvas.getByRole("link", { name: "jms" });
    await expect(jms).toHaveAttribute("href", "/jms");
    const caret = canvas.getByRole("button", { name: /Collapse jms$/ });
    await expect(jms.contains(caret)).toBe(false);

    // Depth 3 renders, and collapsing the root takes the whole subtree with it
    // while leaving the root's own destination in place.
    await expect(canvas.getByRole("link", { name: "disbursements" })).toBeTruthy();
    await userEvent.click(caret);
    await expect(canvas.queryByRole("link", { name: "disbursements" })).toBeNull();
    await expect(canvas.getByRole("link", { name: "jms" })).toBeTruthy();
  },
};

function NestedNavBody() {
  const { pathname } = useRouter();
  const item = (key: string, label: string) => ({
    key,
    label,
    active: pathname === `/${key}`,
    to: `/${key}`,
  });
  return (
    <AppShell
      brand={
        <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold">
          q
        </span>
      }
      navSections={[
        {
          label: "Profiles",
          items: [{ ...item("http", "http"), icon: UiDatabase }],
          groups: [
            {
              key: "jms",
              label: "jms",
              item: item("jms", "jms"),
              items: [item("jms-all", "all"), item("jms-failed", "failed")],
              groups: [
                {
                  key: "jms/incoming",
                  label: "incoming",
                  item: item("jms-incoming", "incoming"),
                  items: [item("jms-incoming-disbursements", "disbursements")],
                },
              ],
            },
            {
              // A pure folder: no entity is named `logs`, so the heading is a
              // disclosure only and there is nothing to navigate to.
              key: "logs",
              label: "logs",
              items: [item("logs-api", "api"), item("logs-oipa", "oipa")],
            },
          ],
        },
      ]}
      collapsedStorageKey="sb-demo:nested-collapsed"
      groupCollapsedStorageKey="sb-demo:nested-groups"
    >
      <div className="p-density-4 text-sm">
        Active: {pathname} — the rail nests as deep as the backend declares.
      </div>
    </AppShell>
  );
}

// The full workbench: nav rail + ⌘K palette in the top bar + a body header with
// actions, over a table that pages REMOTELY through clicky-rpc. The layout
// contract worth studying here is that <main> must not scroll — only the
// table's row region does, so the sticky column header and the pagination
// footer both stay pinned.
export const RpcWorkbench: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "AppShell hosting an rpc-driven table. `contentClassName` turns the body into a non-scrolling flex column so OperationCatalog can bound its result pipeline; the DataTable's sticky header and server pagination footer stay fixed while rows scroll between them. Paging is genuinely remote: each page change re-executes the operation with a new `offset` against the synthetic OperationsApiClient, which slices its row set and reports `{total, limit, offset}` exactly as a real backend would via `X-Total-Count`.",
      },
    },
  },
  render: () => <RpcWorkbenchBody />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("the table pages remotely, keeping the header and footer pinned", async () => {
      await canvas.findByText(/Page 1 of/, undefined, { timeout: 5000 });

      const scroller = canvasElement.querySelector<HTMLElement>(
        '[data-slot="operation-catalog-results"] .overflow-auto',
      );
      await expect(scroller).not.toBeNull();

      if (scroller) {
        scroller.scrollTop = scroller.scrollHeight;
        // The column header is sticky inside the scroller, so it stays on
        // screen; <main> itself never scrolls because contentClassName makes it
        // overflow-hidden.
        const main = canvasElement.querySelector("main");
        await expect(main?.scrollTop ?? 0).toBe(0);
      }

      await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
      await expect(await canvas.findByText(/Page 2 of/)).toBeInTheDocument();
    });

    await step("⌘K opens the palette, filters, and runs a command", async () => {
      await userEvent.keyboard("{Meta>}k{/Meta}");
      const dialog = await body.findByRole("dialog", { name: "Command palette" });
      await expect(dialog).toBeInTheDocument();

      // Scope to the dialog: the table below has its own filter comboboxes.
      await userEvent.type(within(dialog).getByRole("combobox"), "orders");
      await userEvent.keyboard("{Enter}");

      await expect(
        body.queryByRole("dialog", { name: "Command palette" }),
      ).not.toBeInTheDocument();
      // Assert via the top-bar breadcrumb: the catalog renders its own "Orders"
      // heading too, so a bare text match would be ambiguous.
      const breadcrumb = canvas.getByRole("navigation", { name: "Breadcrumb" });
      await expect(within(breadcrumb).getByText("Orders")).toBeInTheDocument();
    });
  },
};

function RpcWorkbenchBody() {
  const router = useMemoryRouter("/widgets");
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [surface, setSurface] = useState("widgets");
  const [debug, setDebug] = useState(false);
  // Portal target the catalog renders its action cluster into. A callback ref
  // via state (not useRef) ensures attaching the node mounts the portal.
  const [actionsHost, setActionsHost] = useState<HTMLElement | null>(null);

  const navSections = [
    {
      label: "Inventory",
      items: [
        { key: "widgets", label: "Widgets", icon: UiBox },
        { key: "orders", label: "Orders", icon: UiGrid },
      ],
    },
    {
      label: "Platform",
      items: [
        { key: "services", label: "Services", icon: UiDatabase },
        { key: "clients", label: "Clients", icon: UiUsersThree },
      ],
    },
  ].map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      active: item.key === surface,
      to: `/${item.key}`,
    })),
  }));

  const commandGroups: CommandGroup[] = [
    {
      id: "navigate",
      heading: "Navigate",
      items: [
        { id: "widgets", label: "Widgets", icon: UiBox, onSelect: () => setSurface("widgets") },
        { id: "orders", label: "Orders", icon: UiGrid, onSelect: () => setSurface("orders") },
        { id: "services", label: "Services", icon: UiDatabase, onSelect: () => setSurface("services") },
      ],
    },
    {
      id: "actions",
      heading: "Actions",
      items: [
        { id: "docs", label: "Open documentation", icon: UiHome, shortcut: "⌘D" },
        { id: "archive", label: "Archive selection", disabled: true },
      ],
    },
  ];

  const title = surface.charAt(0).toUpperCase() + surface.slice(1);

  return (
    // Fills the viewport: the fullscreen decorator supplies a definite h-dvh box.
    <div className="h-full">
      <QueryClientProvider client={queryClient}>
        <RouterProvider adapter={router}>
          <AppShell
            brand={
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary font-bold text-primary-foreground">
                a
              </span>
            }
            navSections={navSections}
            // Breadcrumbs live in the top bar, ahead of the search slot.
            nav={
              <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">Catalog</span>
                <span className="text-muted-foreground/60">›</span>
                <span className="font-medium text-foreground">{title}</span>
              </nav>
            }
            search={
              <CommandPaletteTrigger
                onClick={() => setPaletteOpen(true)}
                open={paletteOpen}
                label="Search commands…"
              />
            }
            actions={
              <>
                <Switch
                  checked={debug}
                  onChange={setDebug}
                  label={<span className="text-xs text-muted-foreground">Debug</span>}
                  aria-label="Outline AppShell slots"
                />
                <Button variant="outline" size="sm">
                  acme-prod ▾
                </Button>
                <Avatar alt="Ada Lovelace" size="sm" title="Ada Lovelace" />
              </>
            }
            debugSlots={debug}
            // Consumer-owned: OperationCatalog renders no header of its own.
            bodyHeader={
              <div className="min-w-0">
                <h1 className="text-lg font-semibold">{title}</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Remote-paged {surface}.
                </p>
              </div>
            }
            bodyActions={
              <>
                <Button variant="outline" size="sm">
                  Export
                </Button>
                {/* …and its collection actions (Create) in here. */}
                <div ref={setActionsHost} className="flex items-center" />
              </>
            }
            // Stop <main> from scrolling so the table owns the scroll instead.
            contentClassName="flex min-h-0 flex-col overflow-hidden p-density-4"
          >
            <OperationCatalog
              key={surface}
              definition={{ key: surface, title, description: `Remote-paged ${surface}.` }}
              entities={[surface.replace(/s$/, "")]}
              surfaceKey={surface}
              client={FAKE_CLIENT}
              renderLink={anchorLink}
              actionsContainer={actionsHost}
            />
          </AppShell>
          <CommandPalette
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            groups={commandGroups}
            footer="↑↓ navigate · ↵ run · esc close"
          />
        </RouterProvider>
      </QueryClientProvider>
    </div>
  );
}
