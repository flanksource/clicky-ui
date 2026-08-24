/**
 * Dashboards — composition, and the palette everything on one draws from.
 *
 * A dashboard is not a grid of charts. It is an argument with an order: one
 * headline that says whether to care, a supporting row that says where, and a
 * detail surface that says what to do. A dashboard whose tiles could be shuffled
 * without loss has no argument in it.
 *
 * This page also publishes the chart palette, because the palette is the reason
 * a dashboard reads as one system rather than six widgets. Its provenance and
 * the validator verdicts are in `dataviz-palette.ts`; the swatches below print
 * the same hexes that `dataviz-palette.css` paints, so a drift between the two
 * is visible here.
 */

import { Callout, SegmentedControl, cn } from "@flanksource/clicky-ui";
import { useState } from "react";

import { BarSeries, Legend, Sparkline, StackedBar } from "./dataviz-marks";
import {
  CATEGORICAL,
  DIVERGING,
  FORBIDDEN_ADJACENCIES,
  INCUMBENT,
  SEQUENTIAL,
  STATUS,
  SURFACES,
} from "./dataviz-palette";
import { PracticeGrid, type Practice } from "../practice/PracticeGrid";

import "./dataviz-palette.css";

const PRACTICES: Practice[] = [
  {
    title: "One headline, then support, then detail",
    body: "The top row answers “should I care”. The middle answers “where”. The table at the bottom answers “what do I do”. Reading order is the design.",
    tone: "rule",
  },
  {
    title: "Never a dual-axis chart",
    body: "Two y-scales on one plot let you imply any correlation you like by rescaling. Two measures of different magnitude become two charts, small multiples, or both indexed to a common base.",
    tone: "avoid",
  },
  {
    title: "Filters in one row, above everything they affect",
    body: "A control that narrows the whole board sits above the whole board. A control tucked into one card is read as scoping that card, and every number beside it becomes a lie.",
    tone: "do",
  },
  {
    title: "Colour follows the entity, never its rank",
    body: "Filtering from eight services to three must not repaint the survivors. Assign a hue to the thing, and keep it when the set changes — otherwise the board's colours mean nothing across a refresh.",
    tone: "rule",
  },
  {
    title: "Show staleness, not just data",
    body: "A dashboard that cannot say when it last succeeded is indistinguishable from one quietly serving an hour-old cache. Stamp the last refresh, and mark the board when a fetch fails.",
    tone: "do",
  },
  {
    title: "An 8th series is not a new hue",
    body: "The theme has seven slots and is never cycled. Past seven, fold the tail into “Other”, facet into small multiples, or change the question.",
    tone: "avoid",
  },
];

const TREND = [318, 344, 361, 402, 388, 421, 447, 468];
const BY_SERVICE = [
  { label: "s3", value: 214 },
  { label: "iam", value: 186 },
  { label: "ec2", value: 143 },
  { label: "rds", value: 97 },
  { label: "kms", value: 64 },
];
const MIX = [
  { label: "Critical", value: 27 },
  { label: "High", value: 143 },
  { label: "Medium", value: 327 },
  { label: "Low", value: 96 },
];

function Swatch({ hex, label, sub }: { hex: string; label: string; sub?: string }) {
  return (
    <div className="min-w-0 space-y-1">
      {/* Runtime hex, so it rides on an inline style rather than a dynamic
          arbitrary class the Tailwind scanner could never see. */}
      <div className="h-10 w-full rounded border border-border" style={{ backgroundColor: hex }} />
      <p className="truncate text-[10px] font-medium text-foreground">{label}</p>
      {sub && <p className="truncate font-mono text-[10px] uppercase text-muted-foreground">{sub}</p>}
    </div>
  );
}

function PaletteSection() {
  return (
    <div className="space-y-density-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h4 className="text-sm font-semibold text-foreground">Categorical — identity</h4>
          <code className="text-[11px] text-muted-foreground">--chart-1 … --chart-7</code>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {CATEGORICAL.map((slot) => (
            <Swatch key={slot.index} hex={slot.hex} label={`${slot.index} · ${slot.hue}`} sub={slot.hex} />
          ))}
        </div>
        <div className="space-y-1 text-xs leading-5 text-muted-foreground">
          <p>
            Validated against both Flanksource surfaces ({SURFACES.light.hex} light,{" "}
            {SURFACES.dark.hex} dark): worst adjacent CVD ΔE 9.4, normal-vision 16.6, every slot ≥ 3:1 on
            both. One set of hexes serves both themes, which is only possible because these steps sit
            inside the light and dark lightness bands at once.
          </p>
          <p>
            <strong className="text-foreground">The order is load-bearing.</strong>{" "}
            {FORBIDDEN_ADJACENCIES.map((pair) => `${pair.a}+${pair.b} scores ΔE ${pair.deltaE} (${pair.verdict})`).join("; ")}.
            Both pairs are kept apart, and a test asserts it.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Sequential — magnitude</h4>
        <div className="grid grid-cols-8 gap-1">
          {SEQUENTIAL.map((hex, index) => (
            <Swatch key={hex} hex={hex} label={`${index + 1}`} />
          ))}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          One hue, light to dark. Never a rainbow — a multi-hue ramp makes the reader decode an order
          that lightness already gives them for free.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Diverging — polarity</h4>
        <div className="grid grid-cols-7 gap-1">
          {DIVERGING.map((hex, index) => (
            <Swatch key={hex} hex={hex} label={index === 3 ? "mid" : `${index + 1}`} />
          ))}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          Two hues around a neutral grey midpoint — rose and sky rather than red and green, because
          polarity is exactly the case where being unable to separate the poles is fatal.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Status — reserved</h4>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(STATUS).map(([level, entry]) => (
            <Swatch key={level} hex={entry.hex} label={level} sub={entry.token} />
          ))}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          These draw from the same ramps as the categorical theme, and that overlap is safe for exactly
          one reason: <strong className="text-foreground">a status mark always ships with an icon and a
          label, never colour alone.</strong> A red carrying a siren and the word &ldquo;critical&rdquo; is
          not confusable with a red that is simply series 3.
        </p>
      </div>

      <Callout title="These tokens are missing from clicky-ui today" variant="caution">
        <code>TimeseriesPanel.model.ts</code> already reads <code>var(--chart-1 … 4)</code> and nothing in
        the library defines them, so every chart silently falls back to{" "}
        <code>{INCUMBENT.join(", ")}</code> — a set that carries two sub-3:1 contrast warnings on white
        and sits at CVD ΔE 8.1, barely over the target. Defining the seven above in{" "}
        <code>packages/ui/src/styles/tokens.css</code> makes every existing clicky-ui chart correct by
        default, with no component change.
      </Callout>
    </div>
  );
}

const DENSITIES = [
  { id: "overview", label: "Overview" },
  { id: "detail", label: "Detail" },
] as const;

type DensityId = (typeof DENSITIES)[number]["id"];

function BoardSpecimen() {
  const [mode, setMode] = useState<DensityId>("overview");
  return (
    <div className="space-y-density-3 rounded-xl border border-border bg-card p-density-4">
      {/* Filters in ONE row, above everything they scope. */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-density-3">
        <SegmentedControl<DensityId>
          aria-label="Board density"
          onChange={setMode}
          options={DENSITIES.map(({ id, label }) => ({ id, label }))}
          size="sm"
          value={mode}
        />
        <span className="text-[11px] text-muted-foreground">
          Last refreshed 42s ago · prod + public · 6 accounts
        </span>
      </div>

      {/* 1. Headline — should I care? */}
      <div className="grid gap-density-3 sm:grid-cols-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Findings</p>
          <p className="text-2xl font-semibold tabular-nums text-foreground">468</p>
          <Sparkline slot={0} values={TREND} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Severity mix</p>
          <StackedBar points={MIX} />
          <Legend points={MIX} />
        </div>
      </div>

      {/* 2. Support — where? */}
      <div className="space-y-1 border-t border-border pt-density-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Concentration by service</p>
        <BarSeries height={100} points={BY_SERVICE} slot={0} />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          {BY_SERVICE.map((row) => (
            <span key={row.label}>{row.label}</span>
          ))}
        </div>
      </div>

      {/* 3. Detail — what do I do? Only when asked for. */}
      {mode === "detail" && (
        <div className="space-y-1 border-t border-border pt-density-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Queue</p>
          <table className="w-full text-xs">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="py-1 font-medium">Check</th>
                <th className="py-1 font-medium">Service</th>
                <th className="py-1 text-right font-medium">Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {BY_SERVICE.map((row) => (
                <tr key={row.label}>
                  <td className="py-1 text-foreground">{row.label}-public-access</td>
                  <td className="py-1 text-muted-foreground">{row.label}</td>
                  <td className="py-1 text-right tabular-nums text-foreground">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function DashboardsPattern({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-density-6", className)}>
      <section className="space-y-density-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">The chart palette</h3>
          <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
            Four jobs, four palettes. Colour is assigned by the job it does — identity, magnitude,
            polarity, state — and each has exactly one rule.
          </p>
        </div>
        <PaletteSection />
      </section>

      <section className="space-y-density-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Composition</h3>
          <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
            Headline, support, detail — in that reading order, with the controls that scope all three
            sitting above all three. Switch to Detail to see the drill-down appear beneath rather than
            replace what is above it.
          </p>
        </div>
        <BoardSpecimen />
      </section>

      <section className="space-y-density-3">
        <h3 className="text-sm font-semibold text-foreground">Rules</h3>
        <PracticeGrid practices={PRACTICES} />
      </section>
    </div>
  );
}
