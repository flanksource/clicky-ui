import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FilterPill, FilterPillGroup, FilterSeparator, type FilterMode } from "./FilterPill";

const meta: Meta<typeof FilterPill> = {
  title: "Data/FilterPill",
  component: FilterPill,
};

export default meta;
type Story = StoryObj<typeof FilterPill>;

export const Binary: Story = {
  render: () => {
    const [active, setActive] = useState<Record<string, boolean>>({ failed: true });
    return (
      <FilterPillGroup>
        {[
          { key: "failed", label: "Failed", count: 3, badge: "bg-red-500" },
          { key: "passed", label: "Passed", count: 42, badge: "bg-green-500" },
          { key: "skipped", label: "Skipped", count: 5, badge: "bg-yellow-400" },
        ].map((f) => (
          <FilterPill
            key={f.key}
            label={f.label}
            count={f.count}
            badge={f.badge}
            mode={active[f.key] ? "active" : "neutral"}
            onClick={() => setActive((a) => ({ ...a, [f.key]: !a[f.key] }))}
          />
        ))}
      </FilterPillGroup>
    );
  },
};

export const TriState: Story = {
  render: () => {
    const [modes, setModes] = useState<Record<string, FilterMode>>({});
    return (
      <FilterPillGroup>
        {["jest", "ginkgo", "pytest"].map((fw) => (
          <FilterPill
            key={fw}
            label={fw}
            mode={modes[fw] ?? "neutral"}
            onModeChange={(next) => setModes((s) => ({ ...s, [fw]: next }))}
          />
        ))}
        <FilterSeparator />
        {["linter", "vet"].map((l) => (
          <FilterPill
            key={l}
            label={l}
            mode={modes[l] ?? "neutral"}
            onModeChange={(next) => setModes((s) => ({ ...s, [l]: next }))}
          />
        ))}
      </FilterPillGroup>
    );
  },
};
