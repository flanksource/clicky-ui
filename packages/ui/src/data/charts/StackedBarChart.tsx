import { BarMark, ChartEmpty, ChartFrame, WithLegend } from "./chart-marks";
import { CHART_INK, chartColor } from "./chart-palette";
import {
  assertChartSize,
  assertFinite,
  clampLabelX,
  formatChartValue,
  labelStep,
  niceTicks,
  px,
  textWidth,
  truncateLabel,
  X_AXIS_BAND,
  X_LABEL_INSET,
} from "./chart-scale";

export type ChartSeries = { label: string; values: number[]; color?: string };

export type StackedBarChartProps = {
  categories: string[];
  /** `values[i]` is the series' amount in `categories[i]`. */
  series: ChartSeries[];
  width: number;
  height: number;
  orientation?: "vertical" | "horizontal";
  /** Defaults to on for two or more series. */
  legend?: boolean;
  format?: (n: number) => string;
  className?: string;
};

type Stack = {
  category: string;
  total: number;
  segments: { label: string; value: number; fill: string }[];
};

const GAP = 6;

/** One stacked bar per category, a segment per series, totals in the titles. */
export function StackedBarChart({
  categories,
  series,
  width,
  height,
  orientation = "vertical",
  legend,
  format = formatChartValue,
  className,
}: StackedBarChartProps) {
  assertChartSize("StackedBarChart", width, height);
  series.forEach((entry) => {
    if (entry.values.length !== categories.length) {
      throw new Error(
        `StackedBarChart: series "${entry.label}" has ${entry.values.length} values for ${categories.length} categories`,
      );
    }
    entry.values.forEach((value, index) => {
      assertFinite("StackedBarChart", `${entry.label}[${index}]`, value);
      if (value < 0) throw new Error(`StackedBarChart: negative value ${value} in "${entry.label}"; stacks start at 0`);
    });
  });
  if (categories.length === 0 || series.length === 0) return <ChartEmpty className={className} height={height} width={width} />;

  const colors = series.map((entry, index) => entry.color ?? chartColor(index));
  const stacks: Stack[] = categories.map((category, index) => {
    const segments = series.map((entry, j) => ({ label: entry.label, value: entry.values[index]!, fill: colors[j]! }));
    return { category, total: segments.reduce((sum, segment) => sum + segment.value, 0), segments };
  });
  const Layout = orientation === "horizontal" ? HorizontalStacks : VerticalStacks;
  return (
    <WithLegend
      className={className}
      items={series.map((entry, index) => ({ label: entry.label, color: colors[index]! }))}
      show={legend ?? series.length > 1}
      width={width}
    >
      {(svgClassName) => <Layout className={svgClassName} format={format} height={height} stacks={stacks} width={width} />}
    </WithLegend>
  );
}

type LayoutProps = { stacks: Stack[]; width: number; height: number; format: (n: number) => string; className: string | undefined };

/** The segments of one stack, from the base outward, with surface-coloured gaps between them. */
function Segments({
  stack,
  orientation,
  base,
  cross,
  thickness,
  scale,
  format,
}: {
  stack: Stack;
  orientation: "horizontal" | "vertical";
  base: number;
  cross: number;
  thickness: number;
  scale: number;
  format: (n: number) => string;
}) {
  const direction = orientation === "vertical" ? -1 : 1;
  const outermost = stack.segments.findLastIndex((segment) => segment.value > 0);
  const offsets = stack.segments.map((_, index) =>
    stack.segments.slice(0, index).reduce((sum, segment) => sum + segment.value * scale, 0),
  );
  return (
    <>
      {stack.segments.map((segment, index) => {
        if (segment.value <= 0) return null;
        const start = base + direction * offsets[index]!;
        return (
          <SegmentMark
            boundary={start !== base}
            cross={cross}
            fill={segment.fill}
            key={`${index}-${segment.label}`}
            label={segment.label}
            length={segment.value * scale}
            orientation={orientation}
            rounded={index === outermost}
            start={start}
            thickness={thickness}
            title={`${stack.category} · ${segment.label}: ${format(segment.value)}`}
          />
        );
      })}
    </>
  );
}

function SegmentMark({
  label,
  title,
  orientation,
  start,
  cross,
  length,
  thickness,
  fill,
  rounded,
  boundary: hasBoundary,
}: {
  label: string;
  title: string;
  orientation: "horizontal" | "vertical";
  start: number;
  cross: number;
  length: number;
  thickness: number;
  fill: string;
  rounded: boolean;
  boundary: boolean;
}) {
  const boundary = px(start);
  return (
    <g data-series={label}>
      <title>{title}</title>
      <BarMark base={start} cross={cross} fill={fill} length={length} orientation={orientation} rounded={rounded} thickness={thickness} />
      {hasBoundary &&
        (orientation === "vertical" ? (
          <line stroke={CHART_INK.surface} strokeWidth={2} x1={px(cross)} x2={px(cross + thickness)} y1={boundary} y2={boundary} />
        ) : (
          <line stroke={CHART_INK.surface} strokeWidth={2} x1={boundary} x2={boundary} y1={px(cross)} y2={px(cross + thickness)} />
        ))}
    </g>
  );
}

function VerticalStacks({ stacks, width, height, format, className }: LayoutProps) {
  const ticks = niceTicks(0, Math.max(...stacks.map((stack) => stack.total)));
  const top = ticks[ticks.length - 1]!;
  const axisWidth = Math.max(...ticks.map((tick) => textWidth(format(tick)))) + GAP;
  const plotTop = 6;
  const baseline = height - X_AXIS_BAND;
  const plotHeight = baseline - plotTop;
  if (plotHeight < 8) throw new Error(`StackedBarChart: height ${height} leaves ${plotHeight}px for stacks after labels`);
  const slot = (width - axisWidth) / stacks.length;
  const thickness = Math.max(1, Math.min(slot - 2, 64));
  const step = labelStep(stacks.map((stack) => stack.category), slot);
  const yOf = (value: number) => px(baseline - (value / top) * plotHeight);

  return (
    <ChartFrame className={className} height={height} label={`Stacked bar chart of ${stacks.length} categories`} width={width}>
      {ticks.map((tick) => (
        <g key={tick}>
          <line stroke={CHART_INK.grid} x1={px(axisWidth)} x2={width} y1={yOf(tick)} y2={yOf(tick)} />
          <text data-role="y-tick" dominantBaseline="central" fill={CHART_INK.axis} textAnchor="end" x={px(axisWidth - GAP)} y={yOf(tick)}>
            {format(tick)}
          </text>
        </g>
      ))}
      {stacks.map((stack, index) => {
        const center = axisWidth + index * slot + slot / 2;
        const label = truncateLabel(stack.category, slot * step - GAP);
        return (
          <g data-category={stack.category} key={`${index}-${stack.category}`}>
            <title>{`${stack.category}: total ${format(stack.total)}`}</title>
            <rect fill="transparent" height={plotHeight} width={px(slot)} x={px(axisWidth + index * slot)} y={plotTop} />
            <Segments base={baseline} cross={center - thickness / 2} format={format} orientation="vertical" scale={plotHeight / top} stack={stack} thickness={thickness} />
            {index % step === 0 && (
              <text data-role="x-label" fill={CHART_INK.axis} textAnchor="middle" x={clampLabelX(center, label, width)} y={height - X_LABEL_INSET}>
                {label}
              </text>
            )}
          </g>
        );
      })}
    </ChartFrame>
  );
}

function HorizontalStacks({ stacks, width, height, format, className }: LayoutProps) {
  const pad = 4;
  const rowHeight = (height - pad * 2) / stacks.length;
  const thickness = Math.min(16, rowHeight * 0.7);
  const labelWidth = Math.min(width * 0.3, Math.max(...stacks.map((stack) => textWidth(stack.category)))) + GAP;
  const totalWidth = Math.max(...stacks.map((stack) => textWidth(format(stack.total)))) + GAP;
  const plot = width - labelWidth - totalWidth;
  if (plot < 8) throw new Error(`StackedBarChart: width ${width} leaves ${px(plot)}px for stacks after labels and totals`);
  const scale = plot / (Math.max(...stacks.map((stack) => stack.total)) || 1);

  return (
    <ChartFrame className={className} height={height} label={`Stacked bar chart of ${stacks.length} categories`} width={width}>
      <line stroke={CHART_INK.grid} x1={px(labelWidth)} x2={px(labelWidth)} y1={pad} y2={px(height - pad)} />
      {stacks.map((stack, index) => {
        const middle = pad + index * rowHeight + rowHeight / 2;
        return (
          <g data-category={stack.category} key={`${index}-${stack.category}`}>
            <title>{`${stack.category}: total ${format(stack.total)}`}</title>
            <rect fill="transparent" height={px(rowHeight)} width={width} x={0} y={px(middle - rowHeight / 2)} />
            <text data-role="label" dominantBaseline="central" fill={CHART_INK.axis} textAnchor="end" x={px(labelWidth - GAP)} y={px(middle)}>
              {truncateLabel(stack.category, labelWidth - GAP)}
            </text>
            <Segments base={labelWidth} cross={middle - thickness / 2} format={format} orientation="horizontal" scale={scale} stack={stack} thickness={thickness} />
            <text data-role="value" dominantBaseline="central" fill={CHART_INK.text} x={px(labelWidth + stack.total * scale + GAP)} y={px(middle)}>
              {format(stack.total)}
            </text>
          </g>
        );
      })}
    </ChartFrame>
  );
}
