import { BarMark, ChartEmpty, ChartFrame } from "./chart-marks";
import { CHART_INK, chartColor } from "./chart-palette";
import {
  assertChartSize,
  assertFinite,
  clampLabelX,
  foldTail,
  formatChartValue,
  labelStep,
  px,
  textWidth,
  truncateLabel,
  X_AXIS_BAND,
  X_LABEL_INSET,
} from "./chart-scale";

export type BarChartDatum = { label: string; value: number; color?: string };

export type BarChartProps = {
  data: BarChartDatum[];
  width: number;
  /** Horizontal charts derive it from the row count when omitted. */
  height?: number;
  orientation?: "horizontal" | "vertical";
  format?: (n: number) => string;
  /** Show at most this many bars; the tail is summed into one "Other" bar. */
  maxBars?: number;
  className?: string;
};

type Row = { label: string; value: number; fill: string; title: string };

const ROW_HEIGHT = 22;
const PAD = 4;
const GAP = 6;
const VERTICAL_HEIGHT = 160;

/** A single-series bar chart: one bar per row, value labelled directly. */
export function BarChart({ data, width, height, orientation = "horizontal", format = formatChartValue, maxBars, className }: BarChartProps) {
  assertChartSize("BarChart", width, height);
  data.forEach((datum) => {
    assertFinite("BarChart", datum.label, datum.value);
    if (datum.value < 0) throw new Error(`BarChart: negative value ${datum.value} for "${datum.label}"; bars start at 0`);
  });
  const rows: Row[] = foldTail(data, maxBars).map((row) =>
    "folded" in row
      ? { label: row.label, value: row.value, fill: CHART_INK.other, title: `Other (${row.folded} more): ${format(row.value)}` }
      : { label: row.label, value: row.value, fill: row.color ?? chartColor(0), title: `${row.label}: ${format(row.value)}` },
  );
  if (rows.length === 0) {
    return <ChartEmpty className={className} height={height ?? (orientation === "vertical" ? VERTICAL_HEIGHT : ROW_HEIGHT * 2)} width={width} />;
  }
  const props = { rows, width, format, className };
  return orientation === "vertical" ? (
    <VerticalBars {...props} height={height ?? VERTICAL_HEIGHT} />
  ) : (
    <HorizontalBars {...props} height={height ?? rows.length * ROW_HEIGHT + PAD * 2} />
  );
}

type LayoutProps = { rows: Row[]; width: number; height: number; format: (n: number) => string; className: string | undefined };

function HorizontalBars({ rows, width, height, format, className }: LayoutProps) {
  const rowHeight = (height - PAD * 2) / rows.length;
  const thickness = Math.min(14, rowHeight * 0.7);
  const labelWidth = Math.min(width * 0.35, Math.max(...rows.map((row) => textWidth(row.label)))) + GAP;
  const valueWidth = Math.max(...rows.map((row) => textWidth(format(row.value)))) + GAP;
  const plot = width - labelWidth - valueWidth;
  if (plot < 8) throw new Error(`BarChart: width ${width} leaves ${px(plot)}px for bars after labels and values`);
  const max = Math.max(...rows.map((row) => row.value)) || 1;

  return (
    <ChartFrame className={className} height={height} label={`Bar chart of ${rows.length} rows`} width={width}>
      <line stroke={CHART_INK.grid} x1={px(labelWidth)} x2={px(labelWidth)} y1={PAD} y2={px(height - PAD)} />
      {rows.map((row, index) => {
        const top = PAD + index * rowHeight;
        const middle = px(top + rowHeight / 2);
        const length = row.value > 0 ? Math.max(2, (row.value / max) * plot) : 0;
        return (
          <g data-label={row.label} key={`${index}-${row.label}`}>
            <title>{row.title}</title>
            <rect fill="transparent" height={px(rowHeight)} width={width} x={0} y={px(top)} />
            <text data-role="label" dominantBaseline="central" fill={CHART_INK.axis} textAnchor="end" x={px(labelWidth - GAP)} y={middle}>
              {truncateLabel(row.label, labelWidth - GAP)}
            </text>
            <BarMark base={labelWidth} cross={middle - thickness / 2} fill={row.fill} length={length} orientation="horizontal" rounded thickness={thickness} />
            <text data-role="value" dominantBaseline="central" fill={CHART_INK.text} x={px(labelWidth + length + GAP)} y={middle}>
              {format(row.value)}
            </text>
          </g>
        );
      })}
    </ChartFrame>
  );
}

function VerticalBars({ rows, width, height, format, className }: LayoutProps) {
  const top = 16;
  const baseline = height - X_AXIS_BAND;
  const plot = baseline - top;
  if (plot < 8) throw new Error(`BarChart: height ${height} leaves ${plot}px for bars after labels`);
  const slot = width / rows.length;
  const thickness = Math.max(1, Math.min(slot - 2, 64));
  const step = labelStep(rows.map((row) => row.label), slot);
  const max = Math.max(...rows.map((row) => row.value)) || 1;

  return (
    <ChartFrame className={className} height={height} label={`Bar chart of ${rows.length} bars`} width={width}>
      {[0.25, 0.5, 0.75].map((fraction) => (
        <line key={fraction} stroke={CHART_INK.grid} x1={0} x2={width} y1={px(baseline - plot * fraction)} y2={px(baseline - plot * fraction)} />
      ))}
      <line stroke={CHART_INK.grid} x1={0} x2={width} y1={baseline} y2={baseline} />
      {rows.map((row, index) => {
        const center = px(index * slot + slot / 2);
        const length = row.value > 0 ? Math.max(2, (row.value / max) * plot) : 0;
        const value = format(row.value);
        const label = truncateLabel(row.label, slot * step - GAP);
        return (
          <g data-label={row.label} key={`${index}-${row.label}`}>
            <title>{row.title}</title>
            <rect fill="transparent" height={height} width={px(slot)} x={px(index * slot)} y={0} />
            <BarMark base={baseline} cross={center - thickness / 2} fill={row.fill} length={length} orientation="vertical" rounded thickness={thickness} />
            {textWidth(value) <= slot && (
              <text data-role="value" fill={CHART_INK.text} textAnchor="middle" x={center} y={px(baseline - length - 4)}>
                {value}
              </text>
            )}
            {index % step === 0 && (
              <text data-role="label" fill={CHART_INK.axis} textAnchor="middle" x={clampLabelX(center, label, width)} y={height - X_LABEL_INSET}>
                {label}
              </text>
            )}
          </g>
        );
      })}
    </ChartFrame>
  );
}
