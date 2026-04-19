import { ProgressBar } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

export function ProgressBarDemo() {
  return (
    <DemoSection
      id="progress"
      title="ProgressBar"
      description="Segmented horizontal progress with per-segment colors, tooltips, and ARIA value."
    >
      <div className="space-y-density-3">
        <div>
          <p className="mb-density-1 text-xs text-muted-foreground">Test run (120 total)</p>
          <ProgressBar
            total={120}
            segments={[
              { count: 90, color: "bg-green-500", label: "passed" },
              { count: 12, color: "bg-red-500", label: "failed" },
              { count: 8, color: "bg-yellow-400", label: "skipped" },
              { count: 10, color: "bg-blue-400", label: "pending" },
            ]}
          />
        </div>
        <div>
          <p className="mb-density-1 text-xs text-muted-foreground">Pull requests (50 total)</p>
          <ProgressBar
            total={50}
            height="h-3"
            segments={[
              { count: 30, color: "bg-emerald-500", label: "merged" },
              { count: 14, color: "bg-sky-500", label: "open" },
              { count: 6, color: "bg-gray-400", label: "closed" },
            ]}
          />
        </div>
      </div>
    </DemoSection>
  );
}
