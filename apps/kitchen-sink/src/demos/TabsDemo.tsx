import { useState } from "react";
import {
  Tabs,
  UiBeaker as BeakerIcon,
  UiGraph as GraphIcon,
  UiWarningCircle as WarnIcon,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const items = [
  { id: "overview", label: "Overview" },
  { id: "checks", label: "Checks", icon: BeakerIcon, count: 6 },
  { id: "bench", label: "Bench", icon: GraphIcon },
  { id: "issues", label: "Issues", icon: WarnIcon, count: 2, countColor: "bg-rose-500" },
];

export function TabsDemo() {
  const [underline, setUnderline] = useState("overview");
  const [pill, setPill] = useState("overview");
  return (
    <DemoSection
      id="tabs"
      title="Tabs"
      description="Controlled tab strip built on TabButton. Defaults to the underline variant (the row carries a bottom border and the active tab's underline overlaps it). Render the matching panel yourself from the value."
    >
      <div className="space-y-density-2">
        <div className="text-xs text-muted-foreground">Underline (default)</div>
        <Tabs tabs={items} value={underline} onChange={setUnderline} />
        <div className="p-density-3 text-sm text-muted-foreground">Active: {underline}</div>
      </div>

      <div className="space-y-density-2 border-t border-border pt-density-3">
        <div className="text-xs text-muted-foreground">Pill</div>
        <Tabs tabs={items} value={pill} onChange={setPill} variant="pill" />
        <div className="p-density-3 text-sm text-muted-foreground">Active: {pill}</div>
      </div>
    </DemoSection>
  );
}
