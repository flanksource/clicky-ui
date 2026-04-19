import { useState } from "react";
import { Gauge, TabButton } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

export function TabButtonDemo() {
  const [active, setActive] = useState("tests");
  return (
    <DemoSection
      id="tab-gauge"
      title="TabButton + Gauge"
      description="Top-nav tab chips with count badges, plus a compact percentage gauge card."
    >
      <DemoRow label="Tabs">
        <TabButton
          active={active === "tests"}
          onClick={() => setActive("tests")}
          label="Tests"
          icon="codicon:beaker"
          count={120}
          countColor="bg-blue-500"
        />
        <TabButton
          active={active === "lint"}
          onClick={() => setActive("lint")}
          label="Lint"
          icon="codicon:warning"
          count={4}
          countColor="bg-yellow-500"
        />
        <TabButton
          active={active === "bench"}
          onClick={() => setActive("bench")}
          label="Benchmarks"
          icon="codicon:graph"
        />
      </DemoRow>
      <DemoRow label="Gauges">
        <Gauge label="Passed" value={92} tone="success" />
        <Gauge label="Failed" value={3} tone="danger" />
        <Gauge label="Skipped" value={5} tone="warning" />
        <Gauge label="Coverage" value={78} tone="info" />
      </DemoRow>
    </DemoSection>
  );
}
