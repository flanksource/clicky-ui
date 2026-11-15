import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { THREADS } from "../fixtures/threads";
import { parseStateSet, serializeStateSet, type ThreadSort } from "../model/threads";
import { ThreadTree, type ThreadTreeProps } from "./ThreadTree";

type Args = Pick<ThreadTreeProps, "cpuTimeEnabled" | "rowExtra"> & { initialSelected: number | null; initialStates: string };

function Demo({ initialSelected, initialStates, ...props }: Args) {
  const [selectedId, setSelectedId] = useState(initialSelected);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ThreadSort>("cpu");
  const [states, setStates] = useState(() => parseStateSet(initialStates));
  return (
    <div className="h-[560px] w-[420px] border border-border">
      <ThreadTree
        threads={THREADS}
        selectedId={selectedId}
        onSelect={setSelectedId}
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        states={states}
        onToggleState={(state) => {
          const next = new Set(states);
          if (!next.delete(state)) next.add(state);
          setStates(parseStateSet(serializeStateSet(next)));
        }}
        onClear={() => {
          setQuery("");
          setStates(new Set());
        }}
        {...props}
      />
    </div>
  );
}

const meta = {
  title: "JVM/ThreadTree",
  component: Demo,
  args: { cpuTimeEnabled: true, initialSelected: null, initialStates: "" },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grouped: Story = {};

export const BlockedOnly: Story = {
  args: { initialStates: "BLOCKED", initialSelected: 22 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /^BLOCKED/ })).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.queryByText("main")).toBeNull();
  },
};

export const SelectingFollowsTheLockOwner: Story = {
  args: { initialSelected: 22 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const waiter = canvasElement.querySelector<HTMLElement>('[data-thread-row="22"]');
    if (!waiter) throw new Error("thread 22 row not rendered");
    await userEvent.click(within(waiter).getByRole("button", { name: "http-nio-8080-exec-3" }));
    await expect(canvas.getByRole("treeitem", { selected: true })).toHaveTextContent("http-nio-8080-exec-3");
  },
};

export const HostRowContent: Story = {
  args: { rowExtra: (thread) => (thread.cpuPercent !== null && thread.cpuPercent > 10 ? <span>hot: {thread.cpuPercent}% over the sample</span> : null) },
};

export const CpuNotMeasured: Story = { args: { cpuTimeEnabled: false } };
