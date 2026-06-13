import type { StaticIconComponent } from "../Icon";

/** A piece of context the user has attached to a chat (a record, a selection,
 *  a document…). The `type` is an arbitrary caller-defined string; a
 *  {@link ContextTypeConfig} maps it to an icon/colour for display. `fields`
 *  are flat key/value details serialized into the prompt and rendered as a
 *  compact suffix on the badge. */
export interface ChatContextItem {
  id: string;
  type: string;
  label: string;
  fields?: Record<string, string>;
}

/** Per-type display style for context badges, keyed by `ChatContextItem.type`. */
export interface ContextTypeStyle {
  /** Iconify name or an imported icon component. */
  icon?: string | StaticIconComponent;
  /** Tailwind classes for the badge (text + background colour). */
  className?: string;
}

export type ContextTypeConfig = Record<string, ContextTypeStyle>;

/** Serializes attached context into a `Context:` block the backend can prepend
 *  to (or read alongside) the user's message. Mirrors the format parsed by
 *  {@link parseContextPrefix}: `[type] label (k: v, k: v)`. Returns "" when
 *  there is nothing attached. */
export function serializeContext(items: ChatContextItem[]): string {
  if (items.length === 0) return "";
  const lines = items.map((item) => {
    const entries = Object.entries(item.fields ?? {})
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return entries ? `[${item.type}] ${item.label} (${entries})` : `[${item.type}] ${item.label}`;
  });
  return `Context:\n${lines.join("\n")}\n\n`;
}

const CONTEXT_LINE_RE = /^\[([^\]]+)\]\s+(.+?)(?:\s+\((.+)\))?$/;

/** Splits a message produced with a {@link serializeContext} prefix back into
 *  its attached items and the bare question. When no prefix is present the
 *  whole text is returned as the question with no items. */
export function parseContextPrefix(text: string): { items: ChatContextItem[]; question: string } {
  if (!text.startsWith("Context:\n")) return { items: [], question: text };
  const blockEnd = text.indexOf("\n\n");
  if (blockEnd === -1) return { items: [], question: text };
  const block = text.slice("Context:\n".length, blockEnd);
  const question = text.slice(blockEnd + 2);
  const items: ChatContextItem[] = [];
  for (const line of block.split("\n")) {
    const m = line.match(CONTEXT_LINE_RE);
    if (!m) continue;
    const fields: Record<string, string> = {};
    if (m[3]) {
      for (const pair of m[3].split(/,\s*(?=[A-Za-z0-9_]+:)/)) {
        const idx = pair.indexOf(":");
        if (idx > 0) fields[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
      }
    }
    items.push({ id: `parsed-${items.length}`, type: m[1]!, label: m[2]!, fields });
  }
  return { items, question };
}

let nextId = 0;
/** A process-unique id for a newly attached context item. */
export function makeContextId(): string {
  return `ctx-${++nextId}-${Date.now()}`;
}
