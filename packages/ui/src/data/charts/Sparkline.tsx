import { ChartEmpty, ChartFrame } from "./chart-marks";
import { CHART_INK, chartColor } from "./chart-palette";
import { assertChartSize, assertFinite, formatChartValue, px } from "./chart-scale";

export type SparklineProps = {
  values: number[];
  width: number;
  height: number;
  /** Any CSS colour; defaults to the first categorical slot. */
  color?: string;
  className?: string;
};

/**
 * A trend line with no axes: "which way, and how bumpy", nothing else. One
 * marker on the latest point, ringed in the surface colour so it stays legible
 * where it lands on the line. The range is in the SVG title for hover.
 */
export function Sparkline({ values, width, height, color = chartColor(0), className }: SparklineProps) {
  assertChartSize("Sparkline", width, height);
  values.forEach((value, index) => assertFinite("Sparkline", `#${index}`, value));
  if (values.length === 0) return <ChartEmpty className={className} height={height} width={width} />;

  const radius = Math.min(4, Math.max(1.5, height / 8));
  const pad = radius + 1;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const at = (index: number): [number, number] => {
    const x = values.length === 1 ? width / 2 : pad + (index / (values.length - 1)) * (width - pad * 2);
    const y = max === min ? height / 2 : height - pad - ((values[index]! - min) / (max - min)) * (height - pad * 2);
    return [px(x), px(y)];
  };
  const points = values.map((_, index) => at(index));
  const [lastX, lastY] = points[points.length - 1]!;
  const summary = `${formatChartValue(values[0]!)} → ${formatChartValue(values[values.length - 1]!)} (min ${formatChartValue(min)}, max ${formatChartValue(max)})`;

  return (
    <ChartFrame className={className} height={height} label={summary} title={summary} width={width}>
      {points.length > 1 && (
        <polyline
          fill="none"
          points={points.map((point) => point.join(",")).join(" ")}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      )}
      <circle cx={lastX} cy={lastY} fill={color} r={px(radius)} stroke={CHART_INK.surface} strokeWidth={2} />
    </ChartFrame>
  );
}
