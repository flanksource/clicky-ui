import { useState } from "react";
import { SegmentedControl, UiRobotAi } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

export function SegmentedControlDemo() {
  const [scope, setScope] = useState("all");
  const [size, setSize] = useState("md");
  const [range, setRange] = useState("day");

  return (
    <DemoSection
      id="segmented-control"
      title="SegmentedControl"
      description="Single-select toggle group (the Gavel Mine / All / Bots pattern). Arrow keys move the selection."
    >
      <DemoRow label="Scope">
        <SegmentedControl
          aria-label="Scope"
          value={scope}
          onChange={setScope}
          options={[
            { id: "me", label: "Mine" },
            { id: "all", label: "All" },
            { id: "bots", label: "Bots", icon: UiRobotAi },
          ]}
        />
        <span className="text-xs text-muted-foreground">value: {scope}</span>
      </DemoRow>

      <DemoRow label="Small">
        <SegmentedControl
          aria-label="Size"
          size="sm"
          value={size}
          onChange={setSize}
          options={[
            { id: "compact", label: "Compact" },
            { id: "md", label: "Comfortable" },
            { id: "spacious", label: "Spacious" },
          ]}
        />
      </DemoRow>

      <DemoRow label="Disabled item">
        <SegmentedControl
          aria-label="Range"
          value={range}
          onChange={setRange}
          options={[
            { id: "hour", label: "Hour" },
            { id: "day", label: "Day" },
            { id: "week", label: "Week", disabled: true },
          ]}
        />
      </DemoRow>
    </DemoSection>
  );
}
