import { type ReactNode } from "react";
import {
  AppSidebar,
  AppLayout,
  RouterProvider,
  useMemoryRouter,
  useRouter,
  type AppNavSection,
  Icon,
  UiLayoutDashboard,
  UiFileText,
  UiLayers,
  UiUser,
  UiPackage,
  UiPlug,
  UiBraces,
  UiQuestion,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

// AppSidebar renders routed items as anchors supplied by the RouterAdapter — no
// renderLink/pathname props needed. This demo provides an in-memory adapter so
// clicking an item switches routes (and the active highlight) without touching
// the kitchen-sink URL. A real app would provide a react-router adapter instead.
const SECTIONS: AppNavSection[] = [
  {
    items: [{ key: "dashboard", title: "Dashboard", to: "/dashboard", icon: <Icon icon={UiLayoutDashboard} /> }],
  },
  {
    label: "Operations",
    items: [
      { key: "policies", title: "Policies", to: "/policies", icon: <Icon icon={UiFileText} />, badge: <Badge>24</Badge> },
      { key: "schemes", title: "Schemes", to: "/schemes", icon: <Icon icon={UiLayers} /> },
      { key: "clients", title: "Clients", to: "/clients", icon: <Icon icon={UiUser} /> },
    ],
  },
  {
    label: "Providers",
    groups: [
      {
        key: "integrations",
        label: "Integrations",
        icon: <Icon icon={UiPlug} />,
        items: [
          { key: "xero", title: "Xero", to: "/providers/xero", icon: <Icon icon={UiBraces} /> },
          { key: "stripe", title: "Stripe", to: "/providers/stripe", icon: <Icon icon={UiBraces} /> },
        ],
      },
      {
        key: "catalogs",
        label: "Catalogs",
        icon: <Icon icon={UiPackage} />,
        defaultCollapsed: true,
        items: [{ key: "products", title: "Products", to: "/catalogs/products", icon: <Icon icon={UiPackage} /> }],
      },
    ],
  },
  {
    label: "System",
    items: [
      { key: "docs", title: "Docs ↗", to: "https://github.com/flanksource/clicky-ui", icon: <Icon icon={UiQuestion} />, external: true },
    ],
  },
];

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
      {children}
    </span>
  );
}

function ExplorerBody() {
  const { pathname } = useRouter();
  return (
    <div className="p-density-4">
      <h1 className="text-lg font-semibold">{pathname.replace(/^\//, "") || "dashboard"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Active route from the adapter: <code className="rounded bg-muted px-1">{pathname}</code>. Each item is a real{" "}
        <code className="rounded bg-muted px-1">&lt;a href&gt;</code> rendered by the adapter — hover to see the URL in
        your browser's status bar.
      </p>
    </div>
  );
}

export function AppSidebarDemo() {
  const router = useMemoryRouter("/policies");
  return (
    <DemoSection
      id="app-sidebar"
      title="AppSidebar"
      description="Router-agnostic left nav rail. Items render as real <a href={to}> anchors supplied by a RouterAdapter (no renderLink/pathname props) — pass a react-router adapter in production, or the in-memory adapter shown here. External items open in a new tab; the active item tracks the adapter's pathname. Click the rail logo to collapse, and a section ▸/▾ to fold groups."
    >
      <div className="h-[560px] overflow-hidden rounded-lg border border-border">
        <RouterProvider adapter={router}>
          <AppLayout
            sidebar={
              <AppSidebar
                sections={SECTIONS}
                collapsedStorageKey="ks:appsidebar:collapsed"
                groupCollapsedStorageKey="ks:appsidebar:groups"
                header={
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-primary font-bold text-primary-foreground">
                      a
                    </span>
                    <span className="font-semibold">Acme</span>
                  </div>
                }
                footer={<span className="text-xs text-muted-foreground">v1.0.0</span>}
              />
            }
          >
            <ExplorerBody />
          </AppLayout>
        </RouterProvider>
      </div>
    </DemoSection>
  );
}
