import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { AppShellNavGroup, AppShellNavItem, AppShellNavSection } from "./AppShell";
import { NavigationTree } from "./NavigationTree";
import { RouterProvider } from "../rpc/RouterProvider";
import { useMemoryRouter } from "../rpc/router";
import { UiFolder } from "../icons";

const meta = {
  title: "Layout/NavigationTree",
  component: NavigationTree,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The AppShell navigation tree without the shell. Groups with `loadChildren` fetch when first opened, `version` re-fetches a single open group, `reloadOnOpen: false` keeps loaded children across collapse, and the active item's ancestors are revealed without being saved into the user's collapse state.",
      },
    },
  },
} satisfies Meta<typeof NavigationTree>;

export default meta;
type Story = StoryObj<typeof meta>;

const LOAD_DELAY_MS = 150;

function page(slug: string, activeSlug: string): AppShellNavItem {
  return { key: slug, label: slug.split("/").at(-1) ?? slug, to: `/${slug}`, active: slug === activeSlug };
}

// A folder on the active path carries its children inline, as a backend that
// reveals the active item does, so the tree can open it without a fetch.
function lazyFolder(path: string, slugs: string[], activeSlug: string, extra: Partial<AppShellNavGroup> = {}): AppShellNavGroup {
  return {
    key: path,
    label: path.split("/").at(-1) ?? path,
    icon: UiFolder,
    defaultCollapsed: true,
    items: slugs.includes(activeSlug) ? slugs.map((slug) => page(slug, activeSlug)) : [],
    loadChildren: () => new Promise((resolve) => setTimeout(() => resolve({ items: slugs.map((slug) => page(slug, activeSlug)) }), LOAD_DELAY_MS)),
    ...extra,
  };
}

function explorerSection(activeSlug: string): AppShellNavSection {
  return {
    label: "Explorer",
    variant: "tree",
    reloadOnOpen: false,
    groups: [
      { key: "guides", label: "guides", icon: UiFolder, defaultCollapsed: true, items: [page("guides/install", activeSlug), page("guides/theming", activeSlug)] },
      lazyFolder("reference", ["reference/api", "reference/cli"], activeSlug),
      {
        key: "repo", label: "repo", icon: UiFolder, defaultCollapsed: true, items: [],
        groups: [lazyFolder("repo/docs", ["repo/docs/architecture", "repo/docs/runbook"], activeSlug)],
      },
    ],
    items: [page("welcome", activeSlug)],
  };
}

function ExplorerBody({ activeSlug }: { activeSlug: string }) {
  const router = useMemoryRouter(`/${activeSlug}`);
  const [storageKey] = useState(() => `story:navigation-tree:${crypto.randomUUID()}`);
  return (
    <div className="h-[420px] w-72 overflow-y-auto bg-sidebar text-sidebar-foreground">
      <RouterProvider adapter={router}>
        <NavigationTree section={explorerSection(activeSlug)} storageKey={storageKey} />
      </RouterProvider>
    </div>
  );
}

export const LazyNavigationTree: Story = {
  args: { section: explorerSection("welcome") },
  render: () => <ExplorerBody activeSlug="welcome" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("link", { name: "api" })).toBeNull();
    await userEvent.click(within(canvas.getByRole("treeitem", { name: "reference" })).getByRole("button", { name: "Expand" }));
    expect(await canvas.findByRole("link", { name: "api" })).toBeInTheDocument();
    expect(canvas.getByRole("link", { name: "cli" })).toBeInTheDocument();
  },
};

export const ActiveDeepItem: Story = {
  args: { section: explorerSection("repo/docs/runbook") },
  render: () => <ExplorerBody activeSlug="repo/docs/runbook" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const active = await canvas.findByRole("link", { name: "runbook" });
    expect(active.closest("[role=treeitem]")).toHaveAttribute("aria-selected", "true");
  },
};
