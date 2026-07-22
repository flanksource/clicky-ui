import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { CommandPalette } from "./CommandPalette";
import { CommandPaletteTrigger } from "./CommandPaletteTrigger";
import type { CommandGroup } from "./CommandPalette.model";
import {
  UiBox,
  UiDatabase,
  UiGrid,
  UiHome,
  UiUsersThree,
} from "../icons";

const meta = {
  title: "Overlay/CommandPalette",
  component: CommandPalette,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A ⌘K command palette: a top-anchored overlay with a search field over a grouped, keyboard-navigable command list. Renders its own portal (Modal centres its panel and focuses the dialog rather than an input) but shares Modal's stacking primitives, so a palette opened over a modal sits above it and Escape dismisses one layer at a time. Domain-agnostic — the consumer supplies the groups.",
      },
    },
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

function demoGroups(onRun: (id: string) => void): CommandGroup[] {
  return [
    {
      id: "navigate",
      heading: "Navigate",
      items: [
        { id: "dashboard", label: "Dashboard", icon: UiGrid, onSelect: () => onRun("dashboard") },
        { id: "widgets", label: "Widgets", icon: UiBox, description: "Inventory", onSelect: () => onRun("widgets") },
        { id: "clients", label: "Clients", icon: UiUsersThree, onSelect: () => onRun("clients") },
      ],
    },
    {
      id: "actions",
      heading: "Actions",
      items: [
        { id: "new-widget", label: "New widget", icon: UiHome, shortcut: "⌘N", onSelect: () => onRun("new-widget") },
        { id: "import", label: "Import from CSV", icon: UiDatabase, keywords: ["upload", "bulk"], onSelect: () => onRun("import") },
        { id: "archive", label: "Archive selection", disabled: true },
      ],
    },
  ];
}

function Demo({ startOpen = false }: { startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const [ran, setRan] = useState<string | null>(null);

  return (
    <div className="flex h-[420px] flex-col gap-density-4 p-density-4">
      <div className="w-full max-w-md">
        <CommandPaletteTrigger onClick={() => setOpen(true)} open={open} />
      </div>
      <p className="text-sm text-muted-foreground">
        Press <kbd className="rounded border border-border bg-muted px-1">⌘K</kbd> anywhere, or click
        the field above.
      </p>
      <p className="text-sm" data-testid="last-command">
        Last command: {ran ?? "none"}
      </p>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={demoGroups(setRan)}
        footer="↑↓ navigate · ↵ run · esc close"
      />
    </div>
  );
}

export const Default: Story = {
  args: { groups: [] },
  render: () => <Demo />,
};

export const HotkeyOpens: Story = {
  args: { groups: [] },
  render: () => <Demo />,
  play: async ({ step }) => {
    // The palette portals to document.body, so scope queries there rather than
    // to the story canvas.
    const body = within(document.body);

    await step("⌘K opens the palette and focuses the input", async () => {
      await userEvent.keyboard("{Meta>}k{/Meta}");
      const dialog = await body.findByRole("dialog", { name: "Command palette" });
      await expect(dialog).toBeInTheDocument();
      await expect(body.getByRole("combobox")).toHaveFocus();
    });
  },
};

export const FilterAndRun: Story = {
  args: { groups: [] },
  render: () => <Demo startOpen />,
  play: async ({ canvasElement, step }) => {
    const body = within(document.body);
    const canvas = within(canvasElement);
    const input = await body.findByRole("combobox");

    await step("typing narrows the list and drops emptied groups", async () => {
      await userEvent.type(input, "import");
      const options = await body.findAllByRole("option");
      await expect(options).toHaveLength(1);
      await expect(body.queryByText("Navigate")).not.toBeInTheDocument();
    });

    await step("enter runs the top result and closes the palette", async () => {
      await userEvent.keyboard("{Enter}");
      await expect(canvas.getByTestId("last-command")).toHaveTextContent("import");
      await expect(body.queryByRole("dialog", { name: "Command palette" })).not.toBeInTheDocument();
    });
  },
};

export const ArrowsWrapAndSkipDisabled: Story = {
  args: { groups: [] },
  render: () => <Demo startOpen />,
  play: async ({ step }) => {
    const body = within(document.body);
    const input = await body.findByRole("combobox");
    const activeText = () => {
      const id = input.getAttribute("aria-activedescendant");
      return id ? (document.getElementById(id)?.textContent ?? "") : "";
    };

    await step("arrow up from the first row wraps past the disabled one", async () => {
      await expect(activeText()).toContain("Dashboard");
      await userEvent.keyboard("{ArrowUp}");
      // "Archive selection" is disabled, so the last selectable row is Import.
      await expect(activeText()).toContain("Import from CSV");
    });

    await step("escape closes without running a command", async () => {
      await userEvent.keyboard("{Escape}");
      await expect(body.queryByRole("dialog", { name: "Command palette" })).not.toBeInTheDocument();
    });
  },
};

export const TriggerOpensPalette: Story = {
  args: { groups: [] },
  render: () => <Demo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("clicking the trigger opens the palette", async () => {
      const trigger = canvas.getByRole("button", { name: /search/i });
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await userEvent.click(trigger);
      await expect(
        await body.findByRole("dialog", { name: "Command palette" }),
      ).toBeInTheDocument();
    });
  },
};

export const EmptyState: Story = {
  args: { groups: [] },
  render: () => <Demo startOpen />,
  play: async ({ step }) => {
    const body = within(document.body);

    await step("a query matching nothing shows the empty state", async () => {
      await userEvent.type(await body.findByRole("combobox"), "zzzzz");
      await expect(body.getByText("No results")).toBeInTheDocument();
      await expect(body.queryAllByRole("option")).toHaveLength(0);
    });
  },
};
