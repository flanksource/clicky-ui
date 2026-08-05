// The collapsed one-line summary shown beside a tool name.

import { createElement, type ReactNode } from "react";
import type { ToolRenderAdapterContext } from "./adapter";
import { ToolArgs } from "./ToolArgs";
import { classifyToolValue } from "./shape";

const SCALAR_PREVIEW_LIMIT = 60;

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/** A short description of a normalized tool result: "12 rows", "3 fields", or a
 *  truncated scalar. Empty when there is nothing worth saying. */
export function summarizeToolValue(value: unknown): string {
  const classified = classifyToolValue(value);
  switch (classified.shape) {
    case "paged":
      return plural(classified.page.total ?? classified.items.length, "row");
    case "list":
      return plural(classified.items.length, classified.rows ? "row" : "item");
    case "record":
      return plural(Object.keys(classified.record).length, "field");
    case "counts":
      return plural(Object.keys(classified.record).length, "count");
    case "scalar": {
      const text = String(classified.value).replace(/\s+/g, " ").trim();
      return text.length > SCALAR_PREVIEW_LIMIT
        ? `${text.slice(0, SCALAR_PREVIEW_LIMIT)}…`
        : text;
    }
    case "empty":
      return "";
  }
}

/** Built-in collapsed summary: compact input arguments with muted keys. */
export function defaultToolSummary(ctx: ToolRenderAdapterContext): ReactNode {
  return createElement(ToolArgs, { input: ctx.input });
}
