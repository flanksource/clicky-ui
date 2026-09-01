// AppShell hosting an rpc-driven table that pages remotely, plus a ⌘K command
// palette in the top bar. The kitchen-sink proves the portal, the global
// hotkey, and the bounded scroll container all behave in a complete React app.

import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OperationCatalog, RouterProvider, useMemoryRouter } from "@flanksource/clicky-ui/rpc";
import type {
  ExecutionResponse,
  OpenAPISpec,
  OperationsApiClient,
  RenderLinkArgs,
} from "@flanksource/clicky-ui/rpc";
import {
  AppShell,
  Button,
  CommandPalette,
  CommandPaletteTrigger,
  UiBox,
  UiDatabase,
  UiGrid,
  UiHome,
} from "@flanksource/clicky-ui";
import type { CommandGroup } from "@flanksource/clicky-ui";

const PAGE_SIZE = 25;
const ROW_COUNT = 140;

const SPEC: OpenAPISpec = {
  openapi: "3.0.0",
  info: { title: "Acme Platform", version: "1.0.0" },
  "x-clicky": {
    surfaces: [
      { key: "widgets", entity: "widget", title: "Widgets", description: "Remote-paged widgets." },
    ],
  },
  paths: {
    "/api/v1/widgets": {
      get: {
        operationId: "widget_list",
        summary: "List widgets",
        tags: ["widget"],
        parameters: [
          { name: "q", in: "query", schema: { type: "string" }, description: "Search query", "x-clicky": { role: "search" } },
          // A pagination footer only appears when BOTH roles are declared.
          { name: "limit", in: "query", schema: { type: "integer", default: PAGE_SIZE }, description: "Page size", "x-clicky": { role: "limit" } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 }, description: "Row offset", "x-clicky": { role: "offset" } },
        ],
        responses: { "200": { description: "OK" } },
        "x-clicky": { surface: "widgets", verb: "list", scope: "collection" },
      },
    },
  },
};

const NAMES = ["Hex bolt", "Flange gasket", "Thrust washer", "Dowel pin", "Spring clip", "Cap screw"];
const STATES = ["active", "low", "archived"];

function text(value: string) {
  return { kind: "text" as const, text: value, plain: value };
}

const ROWS = Array.from({ length: ROW_COUNT }, (_, index) => {
  const n = index + 1;
  return {
    cells: {
      name: text(`${NAMES[index % NAMES.length]} ${String(n).padStart(3, "0")}`),
      kind: text(index % 2 === 0 ? "small" : "big"),
      status: text(STATES[index % STATES.length] ?? "active"),
      stock: text(String(((n * 37) % 900) + 12)),
    },
  };
});

const COLUMNS = [
  { name: "name", label: "Name", sortable: true, grow: true },
  { name: "kind", label: "Kind", shrink: true },
  { name: "status", label: "Status", kind: "status" as const, sortable: true, shrink: true },
  { name: "stock", label: "Stock", align: "right" as const, sortable: true, shrink: true },
];

function intParam(raw: string | string[] | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  if (Array.isArray(raw)) {
    throw new Error("pagination parameter must be a scalar value");
  }
  if (raw.trim() === "") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

const FAKE_CLIENT: OperationsApiClient = {
  async getOpenAPISpec(): Promise<OpenAPISpec> {
    return SPEC;
  },
  async executeCommand(path, method, params): Promise<ExecutionResponse> {
    if (method === "get" && path === "/api/v1/widgets") {
      const limit = Math.max(intParam(params?.limit, PAGE_SIZE), 1);
      const offset = Math.min(Math.max(intParam(params?.offset, 0), 0), ROW_COUNT - 1);
      return {
        success: true,
        exit_code: 0,
        contentType: "application/json",
        stdout: JSON.stringify({
          version: 1,
          node: { kind: "table", autoFilter: true, columns: COLUMNS, rows: ROWS.slice(offset, offset + limit) },
        }),
        // What a real backend reports via X-Total-Count / X-Page-Limit / X-Page-Offset.
        pagination: { total: ROW_COUNT, limit, offset },
      };
    }
    return {
      success: true,
      exit_code: 0,
      contentType: "text/plain",
      stdout: `Pretending to ${method.toUpperCase()} ${path}`,
    };
  },
};

function anchorLink({ to, className, children, title }: RenderLinkArgs) {
  return (
    <a href={to} className={className} title={title}>
      {children}
    </a>
  );
}

export function AppShellRpcWorkbenchDemo() {
  const router = useMemoryRouter("/widgets");
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const commandGroups: CommandGroup[] = [
    {
      id: "navigate",
      heading: "Navigate",
      items: [
        { id: "widgets", label: "Widgets", icon: UiBox, onSelect: () => setNote("Navigated to Widgets") },
        { id: "services", label: "Services", icon: UiDatabase, onSelect: () => setNote("Navigated to Services") },
      ],
    },
    {
      id: "actions",
      heading: "Actions",
      items: [
        { id: "docs", label: "Open documentation", icon: UiHome, shortcut: "⌘D", onSelect: () => setNote("Opened docs") },
        { id: "archive", label: "Archive selection", disabled: true },
      ],
    },
  ];

  return (
    // Self-bounded: the kitchen-sink wraps each demo in a padded div with no
    // height, so without this the table would grow unbounded and scroll the
    // page instead of its own row region.
    <div className="h-[640px] overflow-hidden rounded-md border border-border">
      <QueryClientProvider client={queryClient}>
        <RouterProvider adapter={router}>
          <AppShell
            brand={
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary font-bold text-primary-foreground">
                a
              </span>
            }
            navSections={[
              {
                label: "Inventory",
                items: [
                  { key: "widgets", label: "Widgets", icon: UiBox, active: true, to: "/widgets" },
                  { key: "orders", label: "Orders", icon: UiGrid, to: "/orders" },
                ],
              },
            ]}
            nav={
              <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">Catalog</span>
                <span className="text-muted-foreground/60">›</span>
                <span className="font-medium text-foreground">Widgets</span>
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
              <Button variant="outline" size="sm">
                acme-prod ▾
              </Button>
            }
            // Consumer-owned: OperationCatalog renders no header of its own.
            bodyHeader={
              <div>
                <h1 className="text-lg font-semibold">Widgets</h1>
                {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
              </div>
            }
            bodyActions={
              <>
                <Button variant="outline" size="sm">
                  Export
                </Button>
                <Button size="sm">New widget</Button>
              </>
            }
            // Stop <main> scrolling so the table's row region owns the scroll and
            // the sticky header + pagination footer stay pinned.
            contentClassName="flex min-h-0 flex-col overflow-hidden p-density-4"
          >
            <OperationCatalog
              definition={{ key: "widgets", title: "Widgets", description: "Remote-paged widgets." }}
              entities={["widget"]}
              surfaceKey="widgets"
              client={FAKE_CLIENT}
              renderLink={anchorLink}
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
