import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  FilterPill,
  FilterPillGroup,
  FilterSeparator,
  type FilterMode,
} from "./FilterPill";

const meta: Meta<typeof FilterPill> = {
  title: "Data/FilterPill",
  component: FilterPill,
  args: {
    label: "env=prod",
    mode: "include",
    count: 3,
    togglePosition: "left",
  },
  argTypes: {
    mode: {
      control: "inline-radio",
      options: ["neutral", "active", "include", "exclude"],
      description:
        "Visual/semantic state. `active`/`neutral` are the binary states; `include`/`exclude` are the tri-state toggle states.",
      table: { category: "State", defaultValue: { summary: "neutral" } },
    },
    label: { control: "text", table: { category: "Content" } },
    count: {
      control: "number",
      description: "Optional count badge rendered before the label.",
      table: { category: "Content" },
    },
    badge: {
      control: "text",
      description:
        "Tailwind class for the count badge background, e.g. `bg-red-500`.",
      table: { category: "Content" },
    },
    togglePosition: {
      control: "inline-radio",
      options: ["left", "right"],
      description: "Places the tri-state toggle before or after the label.",
      table: { category: "Tri-state", defaultValue: { summary: "left" } },
    },
    title: { control: "text", table: { category: "Content" } },
    icon: { control: false, table: { category: "Content" } },
    onClick: { control: false, table: { category: "Events" } },
    onModeChange: { control: false, table: { category: "Events" } },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Compact filter-state chip used by DataTable and FilterBar filters.",
          "",
          "**Two modes of operation**",
          "- **Binary** — pass `onClick` and toggle `mode` between `active` and `neutral`. Renders as a single button with a leading dot.",
          "- **Tri-state** — pass `onModeChange` to render an include/exclude toggle. Clicking the label cycles neutral → include → exclude → neutral; clicking a toggle side sets that state directly.",
          "",
          "**Usage**",
          "```tsx",
          "// binary",
          '<FilterPill label="Failed" count={3} badge="bg-red-500"',
          '  mode={active ? "active" : "neutral"} onClick={toggle} />',
          "",
          "// tri-state",
          '<FilterPill label="jest" mode={mode} onModeChange={setMode} />',
          "```",
          "",
          "Wrap pills in `<FilterPillGroup>` and separate clusters with `<FilterSeparator />`.",
        ].join("\n"),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FilterPill>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Drive a single binary pill from the controls panel. The tri-state toggle requires `onModeChange` — see the **TriState** story for that interaction.",
      },
    },
  },
  render: (args) => (
    <FilterPillGroup>
      <FilterPill {...args} />
    </FilterPillGroup>
  ),
};

export const Binary: Story = {
  render: () => {
    const [active, setActive] = useState<Record<string, boolean>>({
      failed: true,
    });
    return (
      <FilterPillGroup>
        {[
          { key: "failed", label: "Failed", count: 3, badge: "bg-red-500" },
          { key: "passed", label: "Passed", count: 42, badge: "bg-green-500" },
          {
            key: "skipped",
            label: "Skipped",
            count: 5,
            badge: "bg-yellow-400",
          },
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
