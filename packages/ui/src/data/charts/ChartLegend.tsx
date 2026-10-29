import type { CSSProperties } from "react";
import { CHART_FONT_SIZE, CHART_INK } from "./chart-palette";

export type ChartLegendItem = { label: string; color: string };

export type ChartLegendProps = {
  items: ChartLegendItem[];
  className?: string;
  style?: CSSProperties;
};

// Inline styles rather than Tailwind classes: a static report may render
// without clicky-ui's stylesheet, and the legend must still lay out.
const LIST_STYLE: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "4px 16px",
  margin: 0,
  padding: 0,
  listStyle: "none",
  fontSize: CHART_FONT_SIZE + 1,
  lineHeight: 1.4,
  color: CHART_INK.axis,
};
const ITEM_STYLE: CSSProperties = { display: "flex", alignItems: "center", gap: 6 };
const SWATCH_STYLE: CSSProperties = { width: 10, height: 10, borderRadius: 2, flexShrink: 0 };

/**
 * The series key. The swatch carries the colour; the label stays in text ink,
 * because a legend written in its own hue is the most common way a chart fails
 * contrast.
 */
export function ChartLegend({ items, className, style }: ChartLegendProps) {
  if (items.length === 0) return null;
  return (
    <ul className={className} style={style ? { ...LIST_STYLE, ...style } : LIST_STYLE}>
      {items.map((item, index) => (
        <li key={`${index}-${item.label}`} style={ITEM_STYLE}>
          <span aria-hidden style={{ ...SWATCH_STYLE, backgroundColor: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
