import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import type { GaugeTone } from "./Gauge";

export interface GaugeMarker {
  label: string;
  value: number;
  id?: string;
  /** Ranges outline zero to value; pointers mark observations and ceilings. */
  shape?: "pointer" | "range";
  tone?: GaugeTone;
}
export interface MultiGaugeBarProps {
  label: string;
  icon?: ReactNode;
  average?: number;
  averageId?: string;
  /** Configured ceiling in the same units. Observations above it remain visible. */
  max?: number;
  markers?: readonly GaugeMarker[];
  formatValue?: (value: number) => string;
  /** Shared unit shown beside the scale, e.g. cores or GiB. */
  unit?: string;
  /** Compact inline presentation for table cells, with marker values in the tooltip. */
  variant?: "default" | "cell";
  /** `sm` draws a thin 8px track without the inline usage text; values stay in the summary. */
  size?: "md" | "sm";
  className?: string;
}

const markerTone: Record<GaugeTone, string> = {
  neutral: "text-muted-foreground",
  success: "text-[var(--clicky-success)]",
  warning: "text-[var(--clicky-warning)]",
  danger: "text-[var(--clicky-error)]",
  info: "text-[var(--clicky-info)]",
};

export function MultiGaugeBar({
  label,
  icon,
  average,
  averageId,
  max,
  markers = [],
  formatValue = String,
  unit,
  variant = "default",
  size = "md",
  className,
}: MultiGaugeBarProps) {
  const values = [
    ...markers.map((marker) => marker.value),
    ...(average === undefined ? [] : [average]),
    ...(max === undefined ? [] : [max]),
  ];
  if (values.some((value) => !Number.isFinite(value) || value < 0))
    throw new Error("Gauge observations must be finite and non-negative");
  const ceiling = Math.max(0, ...values);
  const position = (value: number) =>
    ceiling === 0 ? 0 : (value / ceiling) * 100;
  const placed: { position: number; lane: number }[] = [];
  const layout = markers.map((marker) => {
    const x = position(marker.value);
    let lane = 0;
    while (
      marker.shape !== "range" &&
      placed.some(
        (item) => item.lane === lane && Math.abs(item.position - x) < 5,
      )
    )
      lane++;
    if (marker.shape !== "range") placed.push({ position: x, lane });
    return { ...marker, position: x, lane };
  });
  const lanes = Math.max(0, ...placed.map((item) => item.lane));
  const usageLabel =
    average === undefined ? "Not collected" : formatValue(average);
  const summary = `${label}${unit ? ` (${unit})` : ""}. ${average === undefined ? "Average not collected" : `Average ${formatValue(average)}`}. ${markers.map((marker) => `${marker.label} ${formatValue(marker.value)}`).join(". ")}. Scale 0 to ${formatValue(ceiling)}`;
  return (
    <div
      className={cn(
        "min-w-0 w-full text-sm tabular-nums",
        variant === "default" && "rounded-xl border border-border bg-card p-4",
        className,
      )}
      role="img"
      aria-label={summary}
      title={variant === "cell" ? summary : undefined}
    >
      {variant === "default" && (
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          {icon}
          {label}
        </div>
      )}
      <div
        className={cn(
          "flex items-start gap-3",
          variant === "default" ? "mt-3" : "py-1",
        )}
      >
        <div
          className="relative mx-1 min-w-0 flex-1"
          style={{ paddingTop: `${8 + lanes * 8}px` }}
        >
          <div
            data-gauge-track=""
            className={cn(
              "relative overflow-hidden bg-muted",
              size === "sm" ? "h-2 rounded-sm" : "h-6 rounded-md",
            )}
          >
            {size === "md" && (
              <span
                id={averageId}
                data-gauge-usage=""
                className="relative block truncate px-2 text-xs font-medium leading-6 text-foreground"
              >
                {usageLabel}
              </span>
            )}
            <div
              data-gauge-fill=""
              {...(size === "sm" && averageId ? { id: averageId } : {})}
              className={cn(
                "absolute inset-y-0 left-0 overflow-hidden bg-[var(--clicky-success-500)]",
                size === "sm" ? "rounded-sm" : "rounded-md",
              )}
              style={{
                width: `${average === undefined ? 0 : position(average)}%`,
              }}
            >
              {size === "md" && (
                <span
                  aria-hidden="true"
                  className="block whitespace-nowrap px-2 text-xs font-medium leading-6 text-white"
                >
                  {usageLabel}
                </span>
              )}
            </div>
          </div>
          {[...layout]
            .sort((a, b) => b.lane - a.lane)
            .map((marker, index) => (
              <span
                key={index}
                data-gauge-marker={marker.label}
                data-gauge-shape={marker.shape ?? "pointer"}
                id={marker.id}
                title={`${marker.label}: ${formatValue(marker.value)}`}
                className={cn(
                  "absolute",
                  markerTone[marker.tone ?? "neutral"],
                  marker.shape === "range"
                    ? cn(
                        "border-dashed border-current",
                        size === "sm"
                          ? "h-2 rounded-sm border"
                          : "h-6 rounded-md border-2",
                      )
                    : "w-2.5 -translate-x-1/2",
                )}
                style={
                  marker.shape === "range"
                    ? {
                        left: "0%",
                        width: `${marker.position}%`,
                        top: `${8 + lanes * 8}px`,
                      }
                    : {
                        left: `${marker.position}%`,
                        top: `${(lanes - marker.lane) * 8}px`,
                        height: "8px",
                      }
                }
              >
                {marker.shape !== "range" && (
                  <svg
                    className="h-2 w-2.5 fill-current"
                    viewBox="0 0 10 8"
                    aria-hidden="true"
                  >
                    <path d="M0 0H10L5 8Z" />
                  </svg>
                )}
              </span>
            ))}
          {variant === "default" && (
            <div className="relative mt-3 h-5 text-xs text-muted-foreground">
              {(ceiling === 0 ? [0] : [0, 1, 2, 3]).map((tick) => (
                <span
                  key={tick}
                  data-gauge-tick=""
                  className="absolute -translate-x-1/2"
                  style={{ left: `${tick * 25}%` }}
                >
                  {formatValue((ceiling / 4) * tick)}
                </span>
              ))}
            </div>
          )}
        </div>
        <span
          data-gauge-max=""
          className={cn(
            "shrink-0 text-xs text-muted-foreground",
            size === "sm" ? "leading-[8px]" : "leading-6",
          )}
          style={{ paddingTop: `${8 + lanes * 8}px` }}
        >
          {formatValue(ceiling)}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      {variant === "default" && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {average === undefined ? (
            <span>Avg not collected</span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-3 w-1 rounded-full bg-[var(--clicky-success-500)]"
                aria-hidden="true"
              />
              <span>Avg</span>{" "}
              <span className="font-medium text-foreground">
                {formatValue(average)}
              </span>
            </span>
          )}
          {markers.map((marker, index) => (
            <span key={index} className="inline-flex items-center gap-1.5">
              <svg
                className={cn(
                  "h-2 w-2.5 fill-current",
                  markerTone[marker.tone ?? "neutral"],
                )}
                viewBox="0 0 10 8"
                aria-hidden="true"
              >
                <path d="M0 0H10L5 8Z" />
              </svg>
              <span>{marker.label}</span>{" "}
              <span className="font-medium text-foreground">
                {formatValue(marker.value)}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
