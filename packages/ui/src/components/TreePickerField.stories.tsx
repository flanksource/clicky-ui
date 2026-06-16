import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TreePickerField } from "./TreePickerField";

type Node = { id: string; name: string; kind: "folder" | "file"; children?: Node[] };

const ROOTS: Node[] = [
  {
    id: "src",
    name: "src",
    kind: "folder",
    children: [
      {
        id: "components",
        name: "components",
        kind: "folder",
        children: [
          { id: "button", name: "button.tsx", kind: "file" },
          { id: "select", name: "select.tsx", kind: "file" },
        ],
      },
      { id: "index", name: "index.ts", kind: "file" },
    ],
  },
  {
    id: "docs",
    name: "docs",
    kind: "folder",
    children: [{ id: "coverage", name: "COVERAGE.md", kind: "file" }],
  },
];

function TreePickerFieldExample() {
  const [selected, setSelected] = useState<Node | null>(null);
  return (
    <div className="w-72 space-y-3">
      <TreePickerField<Node>
        roots={ROOTS}
        getKey={(n) => n.id}
        getChildren={(n) => n.children}
        getSearchText={(n) => n.name}
        isSelectable={(n) => n.kind === "file"}
        label={selected?.name}
        placeholder="Select a file…"
        onSelect={setSelected}
        renderRow={({ node }) => (
          <span className={node.kind === "folder" ? "font-medium" : "text-muted-foreground"}>
            {node.name}
          </span>
        )}
      />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        selected={selected?.id ?? "none"}
      </div>
    </div>
  );
}

const meta = {
  title: "Components/TreePickerField",
  component: TreePickerField,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A form-field-styled trigger (matching `Combobox`'s closed input) that opens a portal-anchored dropdown holding a `Tree`. The panel escapes overflow-hidden/scroll ancestors via fixed positioning. Clicking a selectable node commits and closes; a non-selectable node only toggles expansion.",
      },
    },
  },
  render: () => <TreePickerFieldExample />,
} satisfies Meta<typeof TreePickerField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
