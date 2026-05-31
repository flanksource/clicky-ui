import { SignedDeltaBar } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const BENCHMARKS = [
  { label: "BenchParse", value: 14.2, significant: true },
  { label: "BenchEncode", value: -22.6, significant: true },
  { label: "BenchScan", value: 1.1, significant: false },
  { label: "BenchSort", value: -4.8, significant: true },
  { label: "BenchAlloc", value: 220, significant: true },
];

export function SignedDeltaBarDemo() {
  return (
    <DemoSection
      id="signed-delta-bar"
      title="SignedDeltaBar"
      description="Centered bidirectional bar for signed deltas. Grows right for positive, left for negative, clamped at ±max, mutes when not significant."
    >
      <div className="space-y-density-3">
        <div className="w-96 space-y-density-2">
          <p className="text-xs text-muted-foreground">
            Default semantics (positive = good / green)
          </p>
          <SignedDeltaBar value={12.4} />
          <SignedDeltaBar value={-8.1} />
          <SignedDeltaBar value={-3.2} significant={false} />
        </div>
        <div className="w-96 space-y-density-2">
          <p className="text-xs text-muted-foreground">
            Benchmark comparison (positive = regression / red)
          </p>
          {BENCHMARKS.map((row) => (
            <div key={row.label} className="flex items-center gap-density-3 text-xs">
              <span className="w-24 font-mono text-muted-foreground">{row.label}</span>
              <SignedDeltaBar value={row.value} positiveIsBad significant={row.significant} />
            </div>
          ))}
        </div>
      </div>
    </DemoSection>
  );
}
