import { formatShort } from "../../lib/format";
import { ChartEmpty, ChartFrame, WithLegend } from "./chart-marks";
import { CHART_INK, chartColor } from "./chart-palette";
import {
  assertChartSize,
  assertFinite,
  clampLabelX,
  formatChartValue,
  formatChartX,
  labelStep,
  niceTicks,
  px,
  textWidth,
  X_AXIS_BAND,
  X_LABEL_INSET,
} from "./chart-scale";
import type { ChartSeries } from "./StackedBarChart";

export type TrendChartProps = {
  /** ISO dates or labels, drawn evenly spaced. */
  x: string[];
  /** `values[i]` is the series' value at `x[i]`. */
  series: ChartSeries[];
  width: number;
  height: number;
  variant?: "line" | "area";
  /** Defaults to on for two or more series. */
  legend?: boolean;
  /** Formats y ticks and hover values. Ticks default to SI-short (1.2K), hover values to grouped digits. */
  yFormat?: (n: number) => string;
  /** Formats x labels; ISO dates default to "Aug 16". */
  xFormat?: (x: string) => string;
  className?: string;
};

type Plot = { left: number; top: number; width: number; height: number; low: number; high: number; count: number };

const GAP = 6;
const PAD = 8;

function xAt(plot: Plot, index: number): number {
  return px(plot.count === 1 ? plot.left + plot.width / 2 : plot.left + (index / (plot.count - 1)) * plot.width);
}

function yAt(plot: Plot, value: number): number {
  return px(plot.top + ((plot.high - value) / (plot.high - plot.low)) * plot.height);
}

/** Series over evenly spaced x positions, on a y axis of nice ticks that includes 0. */
export function TrendChart({ x, series, width, height, variant = "line", legend, yFormat, xFormat = formatChartX, className }: TrendChartProps) {
  assertChartSize("TrendChart", width, height);
  series.forEach((entry) => {
    if (entry.values.length !== x.length) {
      throw new Error(`TrendChart: series "${entry.label}" has ${entry.values.length} values for ${x.length} x positions`);
    }
    entry.values.forEach((value, index) => assertFinite("TrendChart", `${entry.label}[${index}]`, value));
  });
  if (x.length === 0 || series.length === 0) return <ChartEmpty className={className} height={height} width={width} />;

  const tickFormat = yFormat ?? formatShort;
  const valueFormat = yFormat ?? formatChartValue;
  const all = series.flatMap((entry) => entry.values);
  const ticks = niceTicks(Math.min(0, ...all), Math.max(0, ...all));
  const left = Math.max(...ticks.map((tick) => textWidth(tickFormat(tick)))) + GAP;
  const plot: Plot = {
    left,
    top: PAD,
    width: width - left - PAD,
    height: height - PAD - X_AXIS_BAND,
    low: ticks[0]!,
    high: ticks[ticks.length - 1]!,
    count: x.length,
  };
  if (plot.width < 8 || plot.height < 8) throw new Error(`TrendChart: ${width}×${height} leaves no plot area after the axes`);
  const colors = series.map((entry, index) => entry.color ?? chartColor(index));
  const labels = x.map(xFormat);

  return (
    <WithLegend
      className={className}
      items={series.map((entry, index) => ({ label: entry.label, color: colors[index]! }))}
      show={legend ?? series.length > 1}
      width={width}
    >
      {(svgClassName) => (
        <ChartFrame className={svgClassName} height={height} label={`Trend of ${series.length} series over ${x.length} points`} width={width}>
          <Axes height={height} labels={labels} plot={plot} tickFormat={tickFormat} ticks={ticks} width={width} />
          {series.map((entry, index) => (
            <SeriesMark color={colors[index]!} key={`${index}-${entry.label}`} label={entry.label} plot={plot} values={entry.values} variant={variant} />
          ))}
          {labels.map((label, index) => (
            <HoverColumn
              index={index}
              key={`${index}-${label}`}
              plot={plot}
              title={`${label} — ${series.map((entry) => `${entry.label}: ${valueFormat(entry.values[index]!)}`).join(" · ")}`}
            />
          ))}
        </ChartFrame>
      )}
    </WithLegend>
  );
}

function Axes({
  plot,
  ticks,
  labels,
  tickFormat,
  width,
  height,
}: {
  plot: Plot;
  ticks: number[];
  labels: string[];
  tickFormat: (n: number) => string;
  width: number;
  height: number;
}) {
  const step = labelStep(labels, plot.count === 1 ? plot.width : plot.width / (plot.count - 1));
  return (
    <>
      {ticks.map((tick) => (
        <g key={tick}>
          <line stroke={CHART_INK.grid} x1={px(plot.left)} x2={px(plot.left + plot.width)} y1={yAt(plot, tick)} y2={yAt(plot, tick)} />
          <text data-role="y-tick" dominantBaseline="central" fill={CHART_INK.axis} textAnchor="end" x={px(plot.left - GAP)} y={yAt(plot, tick)}>
            {tickFormat(tick)}
          </text>
        </g>
      ))}
      {labels.map((label, index) =>
        index % step === 0 ? (
          <text data-role="x-label" fill={CHART_INK.axis} key={`${index}-${label}`} textAnchor="middle" x={clampLabelX(xAt(plot, index), label, width)} y={height - X_LABEL_INSET}>
            {label}
          </text>
        ) : null,
      )}
    </>
  );
}

function SeriesMark({
  label,
  values,
  color,
  plot,
  variant,
}: {
  label: string;
  values: number[];
  color: string;
  plot: Plot;
  variant: "line" | "area";
}) {
  const points = values.map((value, index) => `${xAt(plot, index)},${yAt(plot, value)}`);
  const zero = yAt(plot, 0);
  const lastX = xAt(plot, values.length - 1);
  const lastY = yAt(plot, values[values.length - 1]!);
  return (
    <g data-series={label}>
      {variant === "area" && (
        <path
          d={`M${xAt(plot, 0)},${zero} L${points.join(" L")} L${lastX},${zero} Z`}
          data-mark="area"
          fill={color}
          fillOpacity={0.12}
        />
      )}
      {values.length > 1 && (
        <polyline fill="none" points={points.join(" ")} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      )}
      <circle cx={lastX} cy={lastY} fill={color} r={4} stroke={CHART_INK.surface} strokeWidth={2} />
    </g>
  );
}

function HoverColumn({ plot, index, title }: { plot: Plot; index: number; title: string }) {
  const half = (plot.count === 1 ? plot.width : plot.width / (plot.count - 1)) / 2;
  const start = Math.max(plot.left, xAt(plot, index) - half);
  const end = Math.min(plot.left + plot.width, xAt(plot, index) + half);
  return (
    <g data-role="hover">
      <title>{title}</title>
      <rect fill="transparent" height={px(plot.height)} width={px(end - start)} x={px(start)} y={px(plot.top)} />
    </g>
  );
}
