import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fireEvent, within } from "storybook/test";
import { AppShell, type AppShellNavSection } from "./AppShell";
import type { AppShellNavDropTarget } from "./AppShell.nav.drag";
import { RouterProvider } from "../rpc/RouterProvider";
import { useMemoryRouter } from "../rpc/router";
import { UiFileCode, UiFolder } from "../icons";

const meta = {
  title: "Layout/AppShell Nav Drag",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A nav section with `drag` lets the rail be rearranged in place: drag a row onto a folder row to move it there, or onto the section heading to move it to the root. The section owns what a move means — AppShell only reports which row was dropped on which. Folder rows and the section root highlight as you cross them; a drop the consumer refuses (`canDrop`) never lands, and never falls through to the row behind it.",
      },
    },
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof AppShell>;

const INITIAL = [
  "welcome",
  "guides/install",
  "guides/theming",
  "drafts/rail-redesign",
];

/** Folder of a slug, "" at the root — the same shape a page tree carries. */
function folderOf(slug: string): string {
  return slug.split("/").slice(0, -1).join("/");
}

function moved(slug: string, target: AppShellNavDropTarget): string {
  const folder = target.kind === "section" ? "" : target.key;
  const filename = slug.split("/").at(-1) ?? slug;
  return folder ? `${folder}/${filename}` : filename;
}

function DraggableNavBody() {
  const [slugs, setSlugs] = useState(INITIAL);
  const [log, setLog] = useState("Drag a page onto a folder.");

  const item = (slug: string) => ({
    key: slug,
    label: slug.split("/").at(-1) ?? slug,
    to: `/${slug}`,
    icon: UiFileCode,
  });

  const section: AppShellNavSection = {
    label: "Pages",
    variant: "tree",
    drag: {
      // Only pages move here; a folder move would be a multi-file rename.
      canDrag: (source) => source.kind === "item",
      canDrop: (source, target) =>
        target.kind !== "item" &&
        target.key !== source.key &&
        moved(source.key, target) !== source.key,
      onDrop: (source, target) => {
        const next = moved(source.key, target);
        setSlugs((current) =>
          current.map((slug) => (slug === source.key ? next : slug)),
        );
        setLog(`${source.key} → ${next}`);
      },
    },
    items: slugs.filter((slug) => folderOf(slug) === "").map(item),
    groups: [...new Set(slugs.map(folderOf))]
      .filter((folder) => folder !== "")
      .map((folder) => ({
        key: folder,
        label: folder,
        icon: UiFolder,
        items: slugs.filter((slug) => folderOf(slug) === folder).map(item),
      })),
  };

  return (
    <AppShell
      brand={<span className="font-semibold">Docs</span>}
      navSections={[section]}
    >
      <p className="p-density-4 text-sm text-muted-foreground">{log}</p>
    </AppShell>
  );
}

export const DragPagesBetweenFolders: Story = {
  render: () => {
    const router = useMemoryRouter("/welcome");
    return (
      <div className="h-[420px]">
        <RouterProvider adapter={router}>
          <DraggableNavBody />
        </RouterProvider>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = (name: string) =>
      canvas
        .getByRole("link", { name })
        .closest("[data-nav-row]") as HTMLElement;

    // `userEvent` cannot express a native HTML5 drag, so the play test drives
    // the same DragEvents the browser would, with a real DataTransfer.
    const transfer = new DataTransfer();
    const drafts = canvas.getByText("drafts").closest("[data-nav-row]");
    if (!(drafts instanceof HTMLElement)) throw new Error("no drafts folder");

    await fireEvent.dragStart(row("welcome"), { dataTransfer: transfer });
    await fireEvent.dragOver(drafts, { dataTransfer: transfer });
    await expect(drafts).toHaveAttribute("data-nav-drop", "over");

    await fireEvent.drop(drafts, { dataTransfer: transfer });
    await expect(canvas.getByText("welcome → drafts/welcome")).toBeTruthy();
    await expect(drafts).not.toHaveAttribute("data-nav-drop");
  },
};
