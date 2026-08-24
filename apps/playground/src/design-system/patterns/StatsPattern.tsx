/**
 * Stats — when a number is the answer, and when it is not.
 *
 * The first question a stat tile has to survive is whether it should be a chart
 * instead. A single current value with no comparison is a stat tile; the moment
 * the question is "compared to what", the tile needs a delta, a sparkline, or to
 * become a chart outright. Most dashboards get this backwards and ship a grid of
 * context-free big numbers.
 *
 * Everything here uses clicky-ui's own components — `Gauge`, `RadialGauge`,
 * `ProgressBar`, `SignedDeltaBar`, `StackedStatusBar`, and the Grafana-style
 * formatters in `lib/format.ts` — rather than redrawing them. The one thing
 * added is the sparkline, which the library cannot supply without a query
 * client.
 */

import {
  Gauge,
  ProgressBar,
  RadialGauge,
  SignedDeltaBar,
  StackedStatusBar,
  formatBytes,
  formatDuration,
  formatShort,
  segment,
} from "@flanksource/clicky-ui";
import type { ReactNode } from "react";

import { Sparkline } from "./dataviz-marks";
import { PracticeGrid, type Practice } from "../practice/PracticeGrid";

import "./dataviz-palette.css";

const PRACTICES: Practice[] = [
  {
    title: "A bare number needs a comparison",
    body: "“1,284 findings” is trivia. “1,284, up 12% on last run” is a fact someone can act on. Ship a delta, a sparkline, or a target — or admit the tile is decoration.",
    tone: "rule",
  },
  {
    title: "Label the unit, not just the number",
    body: "Route the value through formatShort / formatBytes / formatDuration so 1284 renders as 1.3K and 94371840 as 90 MiB. A raw integer forces the reader to count digits.",
    tone: "do",
  },
  {
    title: "Never colour a number by its rank",
    body: "Tone follows what the value MEANS — a threshold crossed, a budget spent. Colouring the biggest tile red because it is biggest teaches the reader that red means large.",
    tone: "avoid",
  },
  {
    title: "Green is an observation, not an absence",
    body: "A tile reading zero because nothing was measured is not healthy. Show “no data” in muted ink and reserve the success tone for something you actually watched succeed.",
    tone: "rule",
  },
];

const TREND = [42, 38, 45, 51, 47, 63, 58, 71, 68, 82];

function Tile({
  label,
  value,
  meta,
  children,
}: {
  label: string;
  value: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <article className="space-y-1.5 rounded-xl border border-border bg-card p-density-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
      {children}
    </article>
  );
}

export function StatsPattern() {
  return (
    <div className="space-y-density-6">
      <section className="space-y-density-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">The four tiles</h3>
          <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
            A hero number, a number with a trend, a number against a target, and a composition. Between
            them they answer every question a stat tile can answer; anything else is a chart.
          </p>
        </div>
        <div className="grid gap-density-3 sm:grid-cols-2 xl:grid-cols-4">
          <Tile
            label="Findings"
            meta="Across 6 accounts · latest run"
            value={formatShort(1284)}
          />
          <Tile label="Open criticals" meta="vs. previous run" value={27}>
            <div className="pt-1">
              <SignedDeltaBar
                format={(value) => `${value > 0 ? "+" : ""}${value.toFixed(0)}`}
                max={20}
                positiveIsBad
                value={6}
              />
            </div>
          </Tile>
          <Tile label="Scan duration" meta="p95 over 10 runs" value={formatDuration(184_000)}>
            <Sparkline className="pt-1" slot={0} values={TREND} />
          </Tile>
          <Tile label="Evidence stored" meta="72% of 128 MiB budget" value={formatBytes(94_371_840)}>
            <div className="pt-2">
              <ProgressBar
                segments={[
                  { count: 72, label: "used", color: "var(--chart-1)" },
                  { count: 28, label: "free", color: "var(--muted)" },
                ]}
                total={100}
              />
            </div>
          </Tile>
        </div>
      </section>

      <section className="space-y-density-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Gauges — a value against its bounds</h3>
          <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
            A gauge is the right shape only when the maximum is meaningful. Percent of a quota, yes;
            &ldquo;findings out of 2000&rdquo;, no &mdash; there is no such ceiling, and drawing one invents a
            budget nobody set.
          </p>
        </div>
        <div className="grid gap-density-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-density-4">
            <Gauge label="Coverage" max={100} suffix="%" tone="success" value={86} />
          </div>
          <div className="rounded-xl border border-border bg-card p-density-4">
            <Gauge label="Quota" max={100} suffix="%" tone="warning" value={72} />
          </div>
          <div className="rounded-xl border border-border bg-card p-density-4">
            <Gauge label="Error budget" max={100} suffix="%" tone="danger" value={94} />
          </div>
          <div className="grid place-items-center rounded-xl border border-border bg-card p-density-4">
            <RadialGauge label="Pass rate" max={100} value={68} />
          </div>
        </div>
      </section>

      <section className="space-y-density-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Composition</h3>
          <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
            One bar, segments in the status palette, each carrying a count and a label. Status colour is
            reserved &mdash; it never doubles as a categorical series &mdash; and it always ships with the word
            beside it, so the bar is readable without colour at all.
          </p>
        </div>
        <div className="space-y-density-3 rounded-xl border border-border bg-card p-density-4">
          <StackedStatusBar
            segments={[
              segment("critical", "Critical", 27, "bg-red-600"),
              segment("high", "High", 143, "bg-orange-500"),
              segment("medium", "Medium", 327, "bg-amber-500"),
              segment("low", "Low", 96, "bg-sky-500"),
              segment("info", "Info", 11, "bg-neutral-400"),
            ]}
          />
        </div>
      </section>

      <section className="space-y-density-3">
        <h3 className="text-sm font-semibold text-foreground">Rules</h3>
        <PracticeGrid practices={PRACTICES} />
      </section>
    </div>
  );
}
