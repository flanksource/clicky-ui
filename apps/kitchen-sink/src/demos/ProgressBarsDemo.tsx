import { ProgressBars, UiChip } from "@flanksource/clicky-ui";
import { DemoSection, DemoRow } from "./Section";

const ONE_CORE = 1000;
const GiB = 1024 ** 3;

export function ProgressBarsDemo() {
  return (
    <DemoSection
      id="progress-bars"
      title="ProgressBars"
      description="Quantised utilisation bars — one bar per unit of capacity, filled left to right. Purely presentational (plain usage/max numbers, no fetching); the timeseries-backed wrapper is TimeseriesCoreBars."
    >
      <DemoRow label="Cores">
        <ProgressBars
          title="4-core"
          icon={UiChip}
          usage={2.3 * ONE_CORE}
          max={4 * ONE_CORE}
        />
        <ProgressBars
          title="8-core"
          icon={UiChip}
          usage={7.6 * ONE_CORE}
          max={8 * ONE_CORE}
        />
        <ProgressBars
          title="Horizontal"
          icon={UiChip}
          orientation="horizontal"
          usage={2.3 * ONE_CORE}
          max={4 * ONE_CORE}
        />
      </DemoRow>

      <DemoRow label="Memory">
        <ProgressBars
          title="RSS"
          usage={2.5 * GiB}
          max={4 * GiB}
          unit={{ perBar: GiB, label: "GB", barLabel: "GB" }}
        />
      </DemoRow>

      <DemoRow label="Cells">
        <div className="grid w-[24rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm">
          <div className="border-b border-r border-border px-2 py-1.5">
            <ProgressBars
              variant="cell"
              title="CPU"
              icon={UiChip}
              usage={2.3 * ONE_CORE}
              max={4 * ONE_CORE}
            />
          </div>
          <div className="border-b border-border px-2 py-1.5">
            <ProgressBars
              variant="cell"
              showLabel={false}
              title="CPU"
              icon={UiChip}
              usage={2.3 * ONE_CORE}
              max={4 * ONE_CORE}
            />
          </div>
          <div className="border-r border-border px-2 py-1.5">
            <ProgressBars
              variant="cell"
              orientation="horizontal"
              title="Near limit"
              icon={UiChip}
              usage={7.6 * ONE_CORE}
              max={8 * ONE_CORE}
            />
          </div>
          <div className="px-2 py-1.5">
            <ProgressBars
              variant="cell"
              orientation="horizontal"
              showLabel={false}
              showValue={false}
              title="Near limit"
              icon={UiChip}
              usage={7.6 * ONE_CORE}
              max={8 * ONE_CORE}
            />
          </div>
        </div>
      </DemoRow>
    </DemoSection>
  );
}
