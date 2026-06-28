import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ListMenu,
  ListMenuActionBar,
  ListMenuHeader,
  ListMenuItem,
  ListMenuSection,
} from "./ListMenu";
import { useListMenuSelection } from "./use-list-menu-selection";

const meta = {
  title: "Components/ListMenu",
  component: ListMenu,
  tags: ["autodocs"],
  args: {
    className: "w-[min(100%,28rem)] overflow-hidden rounded-md border border-border bg-background",
  },
  argTypes: {
    children: { control: false },
    className: {
      control: "text",
      description: "Classes applied to the outer divided menu container.",
      table: { category: "Layout" },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "List/sidebar menu primitives for grouped navigation or master-detail rows: divided groups, muted sticky headers, and left-border row state.",
      },
    },
  },
} satisfies Meta<typeof ListMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ListMenu {...args}>
      <ListMenuSection>
        <ListMenuHeader className="z-20">
          <span className="text-sm font-semibold text-foreground">flanksource</span>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">2</span>
        </ListMenuHeader>
        <ListMenuHeader className="top-9 z-10 pl-6">
          <span className="text-sm font-medium text-foreground">gavel</span>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">2</span>
        </ListMenuHeader>
        <ListMenuItem className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">#42</span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              Extract PR row layout into a shared ListMenu
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">feature/list-menu -&gt; main</div>
        </ListMenuItem>
        <ListMenuItem active className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">#41</span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              Selected row uses the primary left border
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">selected/detail row</div>
        </ListMenuItem>
      </ListMenuSection>
      <ListMenuSection>
        <ListMenuHeader>
          <span className="text-sm font-semibold text-foreground">Todos</span>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">1</span>
        </ListMenuHeader>
        <ListMenuItem selected className="flex items-stretch px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-foreground">Checked row state</div>
            <div className="mt-1 text-xs text-muted-foreground">multi-select rows use a softer state</div>
          </div>
        </ListMenuItem>
      </ListMenuSection>
    </ListMenu>
  ),
};

const MULTI_SELECT_ROWS = [
  { key: "42", title: "Extract PR row layout into a shared ListMenu", branch: "feature/list-menu" },
  { key: "41", title: "Selected row uses the primary left border", branch: "fix/active-row" },
  { key: "40", title: "Add checkbox + Shift+Click selection", branch: "feat/multi-select" },
  { key: "39", title: "Bulk action bar across selected rows", branch: "feat/action-bar" },
];

function MultiSelectDemo() {
  const selection = useListMenuSelection({
    keys: MULTI_SELECT_ROWS.map((row) => row.key),
  });

  return (
    <ListMenu
      selection={selection}
      className="w-[min(100%,28rem)] overflow-hidden rounded-md border border-border bg-background"
    >
      <ListMenuActionBar
        actions={[
          { label: "Merge", onClick: (keys) => window.alert(`Merge #${keys.join(", #")}`) },
          {
            label: "Close",
            variant: "destructive",
            onClick: (keys) => window.alert(`Close #${keys.join(", #")}`),
          },
        ]}
      />
      <ListMenuSection>
        <ListMenuHeader>
          <span className="text-sm font-semibold text-foreground">Pull requests</span>
          <button
            type="button"
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            onClick={() => (selection.allSelected ? selection.clear() : selection.selectAll())}
          >
            {selection.allSelected ? "Deselect all" : "Select all"}
          </button>
        </ListMenuHeader>
        {MULTI_SELECT_ROWS.map((row) => (
          <ListMenuItem key={row.key} itemKey={row.key} className="px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">#{row.key}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {row.title}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{row.branch} -&gt; main</div>
          </ListMenuItem>
        ))}
      </ListMenuSection>
    </ListMenu>
  );
}

export const MultiSelect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass the object from `useListMenuSelection` to `ListMenu` and give each `ListMenuItem` an `itemKey` to enable multi-select. Toggle rows with the checkbox, Shift+Click to range-select, and run bulk `ListMenuActionBar` actions across every selected key.",
      },
    },
  },
  render: () => <MultiSelectDemo />,
};

export const RowStates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`ListMenuItem` exposes distinct row states for active detail rows, selected multi-select rows, passive rows, and caller-provided accent colors.",
      },
    },
  },
  render: () => (
    <ListMenu className="w-[min(100%,28rem)] overflow-hidden rounded-md border border-border bg-background">
      <ListMenuSection>
        <ListMenuHeader>
          <span className="text-sm font-semibold text-foreground">Rows</span>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">5</span>
        </ListMenuHeader>
        <ListMenuItem className="px-3 py-2">
          <div className="truncate text-sm font-medium text-foreground">Default interactive row</div>
          <div className="mt-1 text-xs text-muted-foreground">Transparent left border with muted hover.</div>
        </ListMenuItem>
        <ListMenuItem active className="px-3 py-2">
          <div className="truncate text-sm font-medium text-foreground">Active detail row</div>
          <div className="mt-1 text-xs text-muted-foreground">Primary border and stronger selected background.</div>
        </ListMenuItem>
        <ListMenuItem selected className="px-3 py-2">
          <div className="truncate text-sm font-medium text-foreground">Selected checkbox row</div>
          <div className="mt-1 text-xs text-muted-foreground">Softer selected state for multi-select lists.</div>
        </ListMenuItem>
        <ListMenuItem accentClassName="border-amber-500" className="px-3 py-2">
          <div className="truncate text-sm font-medium text-foreground">Caller accent row</div>
          <div className="mt-1 text-xs text-muted-foreground">Domain-specific left border before selection.</div>
        </ListMenuItem>
        <ListMenuItem interactive={false} className="px-3 py-2">
          <div className="truncate text-sm font-medium text-foreground">Passive row</div>
          <div className="mt-1 text-xs text-muted-foreground">No pointer cursor or hover treatment.</div>
        </ListMenuItem>
      </ListMenuSection>
    </ListMenu>
  ),
};
