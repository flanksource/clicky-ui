import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SplitPane } from "./SplitPane";
import { Tree } from "../data/Tree";
import { Icon } from "../data/Icon";
import { Modal } from "../overlay/Modal";
import { Button } from "../components/button";
import { UiClass, UiPass, UiError, UiPause } from "../icons";

const meta: Meta<typeof SplitPane> = {
  title: "Layout/SplitPane",
  component: SplitPane,
  args: {
    left: <div className="p-4">Left pane</div>,
    right: <div className="p-4">Right pane</div>,
    defaultSplit: 50,
    minLeft: 20,
    minRight: 20,
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Resizable horizontal split layout for explorer/detail views. Drag the separator to change the left pane percentage while respecting minimum pane widths.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SplitPane>;

// Distinct background + border treatments so the two panes (and the divider)
// read as separate regions while resizing.
const LEFT_TONE = "bg-muted/40";
const RIGHT_TONE = "bg-background";

const Panel = ({ label, tone }: { label: string; tone: string }) => (
  <div className={`h-[400px] p-density-4 ${tone}`}>
    <p className="text-sm font-medium">{label}</p>
    <p className="mt-2 text-xs text-muted-foreground">Drag the divider to resize.</p>
  </div>
);

export const Default: Story = {
  render: () => (
    <div className="h-[500px] border border-border">
      <SplitPane
        leftClass={`${LEFT_TONE} border-r-2 border-border`}
        rightClass={RIGHT_TONE}
        left={<Panel label="Left panel" tone={LEFT_TONE} />}
        right={<Panel label="Right panel" tone={RIGHT_TONE} />}
      />
    </div>
  ),
};

export const CustomSplit: Story = {
  render: () => (
    <div className="h-[500px] border border-border">
      <SplitPane
        defaultSplit={30}
        minLeft={15}
        minRight={25}
        leftClass={`${LEFT_TONE} border-r-2 border-border`}
        rightClass={RIGHT_TONE}
        left={<Panel label="30% left" tone={LEFT_TONE} />}
        right={<Panel label="70% right" tone={RIGHT_TONE} />}
      />
    </div>
  ),
};

// --- Deeply nested tree dataset ------------------------------------------

type ResourceNode = {
  id: string;
  name: string;
  kind: string;
  status: "healthy" | "degraded" | "unknown";
  /** Detail body length for the right pane. */
  detail: "long" | "short" | "empty";
  children?: ResourceNode[];
};

const KINDS = ["Cluster", "Namespace", "Deployment", "ReplicaSet", "Pod", "Container"];
const STATUSES: ResourceNode["status"][] = ["healthy", "degraded", "unknown"];

// Builds a wide + deep tree: each level fans out and recurses down to `depth`,
// producing hundreds of nodes so the left pane must scroll and the search /
// expand-all controls become useful.
function buildSubtree(
  prefix: string,
  depth: number,
  breadth: number,
  levelIndex: number,
): ResourceNode {
  const kind = KINDS[Math.min(levelIndex, KINDS.length - 1)];
  const status = STATUSES[(prefix.length + levelIndex) % STATUSES.length];
  const detail: ResourceNode["detail"] =
    levelIndex % 5 === 0 ? "empty" : levelIndex % 2 === 0 ? "short" : "long";
  const node: ResourceNode = {
    id: prefix,
    name: `${kind.toLowerCase()}-${prefix}`,
    kind,
    status,
    detail,
  };
  if (depth > 0) {
    node.children = Array.from({ length: breadth }, (_, i) =>
      buildSubtree(`${prefix}.${i}`, depth - 1, Math.max(2, breadth - 1), levelIndex + 1),
    );
  }
  return node;
}

const RESOURCE_TREE: ResourceNode[] = Array.from({ length: 4 }, (_, i) =>
  buildSubtree(`${i}`, 5, 4, 0),
);

const LONG_PARAGRAPHS = Array.from(
  { length: 12 },
  (_, i) =>
    `Section ${i + 1}: This detail block intentionally contains a long, wrapping explanation so the right pane overflows its viewport and must scroll independently of the tree on the left. It also includes a very-long-unbroken-token-${"x".repeat(80)} to exercise horizontal overflow handling within the detail pane.`,
);

const statusIcon = (status: ResourceNode["status"]) =>
  status === "healthy" ? UiPass : status === "degraded" ? UiError : UiPause;

const DetailPane = ({ resource }: { resource: ResourceNode | null }) => {
  if (!resource) {
    return (
      <div className="p-density-4 text-sm text-muted-foreground">
        Select a resource from the tree to see its details.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-density-4">
      <div className="sticky top-0 -mx-density-4 -mt-density-4 mb-density-4 border-b border-border bg-background px-density-4 py-density-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{resource.kind}</p>
        <h2 className="break-all text-base font-semibold">{resource.name}</h2>
      </div>

      {resource.detail === "empty" && (
        <p className="text-sm text-muted-foreground">This resource has no additional details.</p>
      )}

      {resource.detail === "short" && (
        <p className="text-sm">
          A short status note for <span className="font-medium">{resource.name}</span>. Everything
          looks healthy.
        </p>
      )}

      {resource.detail === "long" && (
        <div className="space-y-density-3 text-sm">
          {LONG_PARAGRAPHS.map((p, i) => (
            <p key={i} className="break-words">
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

const ResourceTree = ({
  selected,
  onSelect,
}: {
  selected: ResourceNode | null;
  onSelect: (resource: ResourceNode) => void;
}) => (
  <Tree<ResourceNode>
    roots={RESOURCE_TREE}
    getKey={(node) => node.id}
    getChildren={(node) => node.children}
    selected={selected}
    onSelect={onSelect}
    defaultOpen={(_, depth) => depth < 1}
    getSearchText={(node) => `${node.name} ${node.kind}`}
    renderRow={({ node }) => (
      <>
        <Icon icon={node.children?.length ? UiClass : statusIcon(node.status)} />
        <span className="truncate flex-1">{node.name}</span>
      </>
    )}
  />
);

/**
 * Deeply nested, scrollable explorer tree on the left paired with a detail pane
 * on the right whose content varies between long (overflowing), short, and
 * empty. The left pane uses a tinted background and a heavier right border so
 * the two regions stay visually distinct while dragging the divider.
 */
export const ExplorerWithVaryingDetail: Story = {
  render: () => {
    const [selected, setSelected] = useState<ResourceNode | null>(
      RESOURCE_TREE[0].children?.[0] ?? RESOURCE_TREE[0],
    );
    return (
      <div className="h-[500px] border border-border">
        <SplitPane
          defaultSplit={35}
          minLeft={20}
          minRight={30}
          leftClass={`${LEFT_TONE} border-r-2 border-border`}
          rightClass={RIGHT_TONE}
          left={<ResourceTree selected={selected} onSelect={setSelected} />}
          right={<DetailPane resource={selected} />}
        />
      </div>
    );
  },
};

/**
 * The same explorer/detail split hosted inside a Modal. The dialog body is a
 * fixed-height flex column so the SplitPane fills it and each pane scrolls
 * independently within the modal's bounds.
 */
export const InsideDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [selected, setSelected] = useState<ResourceNode | null>(
      RESOURCE_TREE[0].children?.[0] ?? RESOURCE_TREE[0],
    );
    return (
      <div className="p-density-4">
        <Button onClick={() => setOpen(true)}>Open explorer dialog</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Resource explorer"
          size="xl"
        >
          {/* Cancel the modal body's padding so the split fills it edge-to-edge. */}
          <div className="-mx-density-4 -my-density-3 h-[60vh]">
            <SplitPane
              defaultSplit={35}
              minLeft={20}
              minRight={30}
              leftClass={`${LEFT_TONE} border-r-2 border-border`}
              rightClass={RIGHT_TONE}
              left={<ResourceTree selected={selected} onSelect={setSelected} />}
              right={<DetailPane resource={selected} />}
            />
          </div>
        </Modal>
      </div>
    );
  },
};
