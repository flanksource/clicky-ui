import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MBEAN_NAMES } from "../fixtures/mbeans";
import { MBeanBrowser } from "./MBeanBrowser";

function Demo({ initialFilter, initialSelected }: { initialFilter: string; initialSelected: string }) {
  const [filter, setFilter] = useState(initialFilter);
  const [selected, setSelected] = useState(initialSelected);
  return (
    <div className="h-[480px] w-80 border border-border p-2">
      <MBeanBrowser names={MBEAN_NAMES} filter={filter} onFilterChange={setFilter} selected={selected} onSelect={setSelected} />
    </div>
  );
}

const meta = {
  title: "JVM/MBeanBrowser",
  component: Demo,
  args: { initialFilter: "", initialSelected: "" },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {};
export const Filtered: Story = { args: { initialFilter: "Catalina" } };
export const RevealSelection: Story = { args: { initialSelected: "java.lang:name=G1 Young Generation,type=GarbageCollector" } };
