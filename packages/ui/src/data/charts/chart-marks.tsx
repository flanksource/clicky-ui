/**
 * The marks every static chart is drawn from, ported from the playground's
 * design-system specimens (`dataviz-marks.tsx`):
 *
 *   - 2px strokes; thinner disappears on a dense page, thicker reads as decoration.
 *   - Rounded data ends, square at the baseline. `rx` rounds all four corners,
 *     so the baseline end is squared off by overdrawing it — rounding both ends
 *     makes a bar look like it floats above its own axis.
 *   - Adjacent fills are separated by a 2px gap in the SURFACE colour, so they
 *     read as separated rather than outlined.
 *   - A recessive grid; one that competes with the data is drawn too dark.
 *
 * Everything is plain SVG with explicit geometry: no measurement, no effects,
 * no state, so `renderToStaticMarkup` produces the finished chart.
 */
import type { CSSProperties, ReactNode } from "react";
import { CHART_FONT_SIZE, CHART_INK } from "./chart-palette";
import { ChartLegend, type ChartLegendItem } from "./ChartLegend";
import { px } from "./chart-scale";

const FRAME_STYLE: CSSProperties = {
  display: "block",
  maxWidth: "100%",
  height: "auto",
  overflow: "visible",
  fontVariantNumeric: "tabular-nums",
};

export function ChartFrame({
  width,
  height,
  label,
  title,
  className,
  children,
}: {
  width: number;
  height: number;
  label: string;
  title?: string;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <svg
      aria-label={label}
      className={className}
      fontSize={CHART_FONT_SIZE}
      height={height}
      role="img"
      style={FRAME_STYLE}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title !== undefined && <title>{title}</title>}
      {children}
    </svg>
  );
}

/** An empty chart says so, at the size the chart would have had. */
export function ChartEmpty({ width, height, className }: { width: number; height: number; className?: string | undefined }) {
  return (
    <ChartFrame className={className} height={height} label="No data" width={width}>
      <rect
        fill="none"
        height={Math.max(0, height - 2)}
        rx={4}
        stroke={CHART_INK.grid}
        strokeDasharray="4 3"
        width={Math.max(0, width - 2)}
        x={1}
        y={1}
      />
      <text
        dominantBaseline="central"
        fill={CHART_INK.axis}
        fontSize={Math.min(CHART_FONT_SIZE, height * 0.6)}
        textAnchor="middle"
        x={width / 2}
        y={height / 2}
      >
        No data
      </text>
    </ChartFrame>
  );
}

/**
 * One bar. `base` is where the bar is anchored (x for horizontal, the baseline
 * y for vertical), `cross` the start of its thickness, and `length` grows away
 * from the base (rightward, or upward).
 */
export function BarMark({
  orientation,
  base,
  cross,
  length,
  thickness,
  fill,
  rounded,
}: {
  orientation: "horizontal" | "vertical";
  base: number;
  cross: number;
  length: number;
  thickness: number;
  fill: string;
  rounded: boolean;
}) {
  if (length <= 0) return null;
  const radius = rounded ? px(Math.min(4, thickness / 2)) : 0;
  const square = px(Math.min(radius, length));
  const horizontal = orientation === "horizontal";
  const body = horizontal
    ? { x: px(base), y: px(cross), width: px(length), height: px(thickness) }
    : { x: px(cross), y: px(base - length), width: px(thickness), height: px(length) };
  return (
    <>
      <rect data-mark="bar" fill={fill} rx={radius || undefined} {...body} />
      {square > 0 && (
        <rect
          fill={fill}
          {...(horizontal
            ? { x: body.x, y: body.y, width: square, height: body.height }
            : { x: body.x, y: px(base - square), width: body.width, height: square })}
        />
      )}
    </>
  );
}

/** Wraps a chart with its legend below it when `show` is set. */
export function WithLegend({
  show,
  items,
  width,
  className,
  children,
}: {
  show: boolean;
  items: ChartLegendItem[];
  width: number;
  className?: string | undefined;
  children: (svgClassName: string | undefined) => ReactNode;
}) {
  if (!show) return <>{children(className)}</>;
  return (
    <div className={className} style={{ width, maxWidth: "100%" }}>
      {children(undefined)}
      <ChartLegend items={items} style={{ marginTop: 6 }} />
    </div>
  );
}
