import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { driftNote } from "./anchoring/drift";
import { DriftList, type DriftItem } from "./DriftList";

const meta = {
  title: "Comments/DriftList",
  component: DriftList,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof DriftList>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS: DriftItem[] = [
  { ids: ["t1"], anchor: "r:outdated", label: "Lines 7–8", drift: { state: "outdated", note: driftNote("outdated", "lines") } },
  { ids: ["t2"], anchor: "r:ambiguous", label: "Line 10", drift: { state: "ambiguous", note: driftNote("ambiguous", "lines") } },
  { ids: ["t3"], anchor: "e:orphaned", label: "Pay button", drift: { state: "orphaned", note: driftNote("orphaned", "element") } },
  { ids: ["t4"], anchor: "e:moved", label: "Order total", drift: { state: "moved", note: driftNote("moved", "element") } },
];

/** Patch threads that are outdated or ambiguous, with element threads that are orphaned or moved, in one list. */
export const AllStates: Story = {
  args: { items: ITEMS },
};

function Retargeting() {
  const [log, setLog] = useState<string[]>([]);
  return (
    <div className="space-y-3">
      <DriftList
        items={ITEMS}
        retarget={{
          // A host would start its element picker or wait for a text selection here.
          pickAnchor: async (anchor) => ({ anchor: `${anchor}→new` }),
          onRetarget: (id, anchor) => setLog((current) => [...current, `onRetarget(${id}, ${anchor})`]),
        }}
      />
      <ul className="text-xs text-muted-foreground">
        {log.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

/** Re-anchor starts a pick, then calls onRetarget(id, anchor); it is rendered only when the host can retarget. */
export const WithReanchor: Story = {
  args: { items: ITEMS },
  render: () => <Retargeting />,
};

/** A surface that cannot re-pick an item (no source selection to make) leaves Re-anchor off it. */
export const NotReanchorable: Story = {
  args: {
    items: [{ ...ITEMS[0]!, drift: { ...ITEMS[0]!.drift, reanchor: false } }, ITEMS[2]!],
    retarget: { pickAnchor: async () => null, onRetarget: () => undefined },
  },
};
