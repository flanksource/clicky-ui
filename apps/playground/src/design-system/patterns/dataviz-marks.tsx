/**
 * The marks a Flanksource chart is drawn from.
 *
 * Deliberately small and hand-drawn rather than library components:
 * clicky-ui's `TimeseriesPanel` calls `useQueries`, and the playground mounts no
 * `QueryClientProvider`, so rendering it here throws (`_recon/spark.tsx` hit the
 * same wall and says so). These specimens also have to *show* the mark rules,
 * which means the geometry has to be visible in the source.
 *
 * Every rule below is from the data-viz method, and each one is a decision that
 * a default chart library gets wrong:
 *
 *   - **2px strokes.** Thinner disappears on a dense dashboard; thicker reads as
 *     a design element rather than data.
 *   - **4px rounded data-ends, anchored to the baseline.** The *value* end is
 *     rounded; the baseline end is square, because rounding both makes a bar
 *     look like it floats above its own axis.
 *   - **A 2px gap in the SURFACE colour between adjacent fills.** Drawn in the
 *     surface, not a border colour, so segments read as separated rather than
 *     outlined.
 *   - **Recessive grid.** A grid that competes with the data is drawn too dark.
 *   - **A hover layer by default.** An SVG chart in a browser is interactive;
 *     shipping one without a tooltip throws away the axis labels you then have
 *     to crowd back in.
 *
 * Colour comes from `--chart-*` (see `dataviz-palette.css`), never from a
 * hardcoded hex, so a chart re-themes with the palette.
 */

import { cn } from "@flanksource/clicky-ui";
import { useId, useState } from "react";

import { CATEGORICAL } from "./dataviz-palette";

export type Point = { label: string; value: number };

function slotColor(slot: number): string {
  return `var(--chart-${CATEGORICAL[slot % CATEGORICAL.length]!.index})`;
}

/**
 * A trend line with no axes.
 *
 * A sparkline answers "which way, and how bumpy" and nothing else — so it
 * carries no gridlines, no ticks, and exactly one marker on the latest point.
 * The moment it needs a y-axis it has stopped being a sparkline and wants a
 * real chart.
 */
export function Sparkline({
  values,
  slot = 0,
  height = 40,
  className,
}: {
  values: readonly number[];
  slot?: number;
  height?: number;
  className?: string;
}) {
  if (values.length < 2) return null;
  const width = 120;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pad = 4;

  const at = (index: number) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - pad - ((values[index]! - min) / span) * (height - pad * 2);
    return [x, y] as const;
  };

  const points = values.map((_, index) => at(index).join(",")).join(" ");
  const [lastX, lastY] = at(values.length - 1);

  return (
    <svg
      aria-label={`Trend from ${values[0]} to ${values[values.length - 1]}`}
      className={className}
      height={height}
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
    >
      <polyline
        fill="none"
        points={points}
        stroke={slotColor(slot)}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      {/* The 2px surface ring is what keeps the marker legible where it lands on
          the line it terminates. */}
      <circle cx={lastX} cy={lastY} fill={slotColor(slot)} r={4} stroke="var(--background)" strokeWidth={2} />
    </svg>
  );
}

/**
 * A vertical bar series with a hover layer.
 *
 * The value end is rounded and the baseline end is square — `rx` on a `<rect>`
 * rounds all four corners, so the square baseline is restored by overdrawing
 * the bottom 4px. That is the whole trick, and it is why bars here sit on the
 * axis instead of hovering above it.
 */
export function BarSeries({
  points,
  slot = 0,
  height = 120,
  className,
}: {
  points: readonly Point[];
  slot?: number;
  height?: number;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const titleId = useId();
  const max = Math.max(...points.map((point) => point.value), 1);
  const gap = 2;
  const barWidth = 100 / points.length;

  return (
    <div className={cn("relative", className)}>
      <svg
        aria-labelledby={titleId}
        className="w-full"
        height={height}
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 100 ${height}`}
      >
        <title id={titleId}>Bar series over {points.length} buckets</title>
        {/* Recessive grid: three lines, surface-adjacent, never competing. */}
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            stroke="var(--chart-grid)"
            strokeWidth={1}
            x1={0}
            x2={100}
            y1={height * fraction}
            y2={height * fraction}
          />
        ))}
        {points.map((point, index) => {
          const barHeight = Math.max((point.value / max) * (height - 4), 2);
          const x = index * barWidth;
          return (
            <g
              key={point.label}
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(null)}
            >
              {/* Hit target spans the full column height, not just the bar —
                  a 3px-tall bar is otherwise unhoverable. */}
              <rect fill="transparent" height={height} width={barWidth} x={x} y={0} />
              <rect
                fill={slotColor(slot)}
                height={barHeight}
                opacity={hover === null || hover === index ? 1 : 0.45}
                rx={4}
                width={barWidth - gap}
                x={x + gap / 2}
                y={height - barHeight}
              />
              {/* Square off the baseline end. */}
              <rect
                fill={slotColor(slot)}
                height={Math.min(4, barHeight)}
                opacity={hover === null || hover === index ? 1 : 0.45}
                width={barWidth - gap}
                x={x + gap / 2}
                y={height - Math.min(4, barHeight)}
              />
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute -top-1 left-0 right-0 flex justify-center">
          <span className="rounded border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm">
            {points[hover]!.label} · <span className="font-mono tabular-nums">{points[hover]!.value}</span>
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * A single stacked bar — the shape a composition question wants.
 *
 * Segments are separated by a 2px gap in the surface colour. A stacked bar
 * without that gap reads as one continuous smear at small sizes, which is
 * exactly the size a stacked bar is usually rendered at.
 */
export function StackedBar({
  points,
  className,
}: {
  points: readonly Point[];
  className?: string;
}) {
  const total = points.reduce((sum, point) => sum + point.value, 0) || 1;
  return (
    <div className={cn("flex h-6 w-full gap-0.5 overflow-hidden rounded", className)}>
      {points.map((point, index) => (
        <div
          key={point.label}
          className="h-full first:rounded-l last:rounded-r"
          // Widths are runtime values, so they ride on an inline style — a
          // dynamic arbitrary Tailwind class would never be emitted.
          style={{ width: `${(point.value / total) * 100}%`, backgroundColor: slotColor(index) }}
          title={`${point.label}: ${point.value}`}
        />
      ))}
    </div>
  );
}

/**
 * The legend.
 *
 * Present whenever there are two or more series, because identity must never be
 * carried by colour alone. The swatch is a mark; the text wears text tokens
 * rather than the series colour — a legend written in its own hue is the most
 * common way a chart fails contrast.
 */
export function Legend({ points, className }: { points: readonly Point[]; className?: string }) {
  if (points.length < 2) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1", className)}>
      {points.map((point, index) => (
        <li key={point.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: slotColor(index) }}
          />
          {point.label}
        </li>
      ))}
    </ul>
  );
}
