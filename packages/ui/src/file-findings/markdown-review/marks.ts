import { UiError, UiInfo, UiWarningTriangle } from "../../icons";
import type { FileFinding } from "../types";

export type Severity = "error" | "warning" | "info";
export const SEVERITY_RANK: Record<Severity, number> = { error: 3, warning: 2, info: 1 };

/** Each lint severity's rail icon, its tone and the stroke of its squiggle underline. */
export const SEVERITY_MARK: Record<Severity, { icon: typeof UiError; tone: string; stroke: string; tint: string }> = {
  error: { icon: UiError, tone: "text-red-500", stroke: "#ef4444", tint: "bg-red-500/10" },
  warning: { icon: UiWarningTriangle, tone: "text-amber-500", stroke: "#f59e0b", tint: "bg-amber-500/10" },
  info: { icon: UiInfo, tone: "text-sky-500", stroke: "#0ea5e9", tint: "bg-sky-500/10" },
};

export function severityOf(status: string | undefined): Severity {
  if (status === "error" || status === "warning" || status === "info") return status;
  throw new Error(`lint finding has severity ${JSON.stringify(status)}, expected error, warning or info`);
}

export const squiggle = (stroke: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3' viewBox='0 0 6 3'%3E%3Cpath d='M0 2.5 1.5 0.5 3 2.5 4.5 0.5 6 2.5' fill='none' stroke='${encodeURIComponent(stroke)}' stroke-width='1'/%3E%3C/svg%3E")`;

/** Inline style drawing a severity's squiggle under a run of text. */
export const squiggleUnder = (stroke: string) => ({
  backgroundImage: squiggle(stroke),
  backgroundRepeat: "repeat-x",
  backgroundPosition: "bottom",
  backgroundSize: "6px 3px",
  paddingBottom: 2,
});

export const bySeverityThenLine = (a: FileFinding, b: FileFinding) =>
  SEVERITY_RANK[severityOf(b.severity)] - SEVERITY_RANK[severityOf(a.severity)] || a.line - b.line;
