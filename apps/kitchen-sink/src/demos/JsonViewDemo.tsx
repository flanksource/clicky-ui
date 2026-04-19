import { JsonView } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const sample = {
  name: "scraper",
  enabled: true,
  retries: 3,
  tags: ["alpha", "beta"],
  owner: null,
  metadata: {
    created: "2026-01-01",
    stats: { runs: 42, failures: 2 },
  },
};

export function JsonViewDemo() {
  return (
    <DemoSection
      id="json-view"
      title="JsonView"
      description="Recursive collapsible JSON tree with type-aware coloring."
    >
      <div className="bg-background rounded-md border border-border p-density-3 max-h-96 overflow-auto">
        <JsonView data={sample} name="config" />
      </div>
    </DemoSection>
  );
}
