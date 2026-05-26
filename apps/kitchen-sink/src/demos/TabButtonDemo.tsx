import { useState } from "react";
import { Gauge, TabButton } from "@flanksource/clicky-ui";
import BeakerIcon from "@iconify-react/codicon/beaker";
import ErrorIcon from "@iconify-react/codicon/error";
import GraphIcon from "@iconify-react/codicon/graph";
import PassIcon from "@iconify-react/codicon/pass";
import WarningIcon from "@iconify-react/codicon/warning";
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
          icon={BeakerIcon}
          count={120}
          countColor="bg-blue-500"
        />
        <TabButton
          active={active === "lint"}
          onClick={() => setActive("lint")}
          label="Lint"
          icon={WarningIcon}
          count={4}
          countColor="bg-yellow-500"
        />
        <TabButton
          active={active === "bench"}
          onClick={() => setActive("bench")}
          label="Benchmarks"
          icon={GraphIcon}
        />
      </DemoRow>
      <DemoRow label="Gauges">
        <Gauge
          icon={PassIcon}
          label="Passed"
          value={92}
          tone="success"
          subtitle="110 / 120 tests"
          meta="fresh"
        />
        <Gauge
          icon={ErrorIcon}
          label="Failed"
          value={3}
          tone="danger"
          subtitle="requires attention"
          meta="3m"
        />
        <Gauge
          icon={WarningIcon}
          label="Skipped"
          value={5}
          tone="warning"
          subtitle="intentionally skipped"
          meta="cached"
        />
        <Gauge
          icon={GraphIcon}
          label="Coverage"
          value={78}
          tone="info"
          subtitle="branches and statements"
          meta="live"
        />
      </DemoRow>
    </DemoSection>
  );
}
