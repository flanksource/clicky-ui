// Clipboard payloads for the detail header's "Copy details" split button. The
// primary payload is a Markdown brief: a `# name` heading, `- **Label:** value`
// facts, then one fenced `## Title` section per piece of evidence. The generic
// sections here read only common `Test` fields; node adapters contribute the
// domain sections (a command, a CEL assertion, a recording) and extra menu items
// through `TestNodeAdapter.copy`. Pure — no React, no clipboard — so every
// payload is unit-testable as a string.

import type { StaticIconComponent } from "../Icon";
import type { Test } from "./types";
import { formatTestDuration, outcomeFor } from "./status";

/** One `- **label:** value` line under the brief's heading. */
export type BriefFact = { label: string; value: string };

/**
 * One `## title` block of the brief: fenced (tagged with `lang`) by default, or
 * inserted as-is when `markdown` — for lists and links that must stay live.
 */
export type BriefSection = { title: string; lang?: string; markdown?: boolean; body: string };

type CopyItemBase = { label: string; icon?: StaticIconComponent | string };

/** A copy menu item: the text it copies, or why there is nothing to copy. */
export type CopyItem = (CopyItemBase & { value: string }) | (CopyItemBase & { reason: string });

export type CopySections = {
  facts?: BriefFact[];
  brief?: BriefSection[];
  items?: CopyItem[];
};

/** Generic sections rendered after every adapter section, so evidence reads before raw output. */
const OUTPUT_TITLES = new Set(["stdout", "stderr"]);

function fact(label: string, value: string | undefined): BriefFact[] {
  return value ? [{ label, value }] : [];
}

function section(title: string, body: string | undefined, lang?: string): BriefSection[] {
  if (!body) return [];
  return [lang ? { title, lang, body } : { title, body }];
}

function nodeLocation(node: Test): string | undefined {
  if (!node.file) return undefined;
  return node.line ? `${node.file}:${node.line}` : node.file;
}

function errorBody(node: Test): string {
  const summary = node.failure_detail?.summary;
  const lines = [node.message, summary !== node.message ? summary : undefined];
  return lines.filter(Boolean).join("\n");
}

function expectationBody(node: Test): string {
  const failure = node.failure_detail;
  if (!failure) return "";
  return [
    failure.matcher && `matcher: ${failure.matcher}`,
    failure.expected && `expected: ${failure.expected}`,
    failure.actual && `actual: ${failure.actual}`,
    failure.location && `at: ${failure.location}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Sections every node gets, read from the common `Test` fields only. */
export function genericCopySections(node: Test): Required<CopySections> {
  const duration = node.duration ? formatTestDuration(node.duration) : undefined;
  return {
    facts: [
      ...fact("Result", outcomeFor(node) ?? undefined),
      ...fact("Tool", node.framework),
      ...fact("Location", nodeLocation(node)),
      ...fact("Duration", duration),
    ],
    brief: [
      ...section("Error", errorBody(node)),
      ...section("Expectation", expectationBody(node)),
      ...section("Stack", node.failure_detail?.stack),
      ...section("stdout", node.stdout),
      ...section("stderr", node.stderr),
    ],
    items: [],
  };
}

function uniqueBy<T>(values: T[], key: (value: T) => string): T[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const k = key(value);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Concatenates sections in order, keeping the first fact/section/item per label or title. */
export function mergeCopySections(parts: CopySections[]): Required<CopySections> {
  return {
    facts: uniqueBy(
      parts.flatMap((p) => p.facts ?? []),
      (f) => f.label,
    ),
    brief: uniqueBy(
      parts.flatMap((p) => p.brief ?? []),
      (s) => s.title,
    ),
    items: uniqueBy(
      parts.flatMap((p) => p.items ?? []),
      (i) => i.label,
    ),
  };
}

// A fence one backtick longer than any run in the body, so captured output that
// itself contains ``` cannot close the block early (CommonMark).
function fence(body: string): string {
  const longest = Math.max(0, ...(body.match(/`+/g) ?? []).map((run) => run.length));
  return "`".repeat(Math.max(3, longest + 1));
}

/** The Markdown brief: `# name`, the facts as bullets, then each non-empty section (fenced unless `markdown`). */
export function buildBrief(node: Test, sections: BriefSection[], facts: BriefFact[]): string {
  const lines = [`# ${node.name}`];
  if (facts.length > 0) lines.push("", ...facts.map((f) => `- **${f.label}:** ${f.value}`));
  for (const s of sections) {
    if (!s.body) continue;
    lines.push("", `## ${s.title}`, "");
    if (s.markdown) {
      lines.push(s.body);
      continue;
    }
    const marker = fence(s.body);
    lines.push(`${marker}${s.lang ?? ""}`, s.body, marker);
  }
  return lines.join("\n");
}

/**
 * The primary "Copy details" payload: generic facts and error/expectation
 * sections, then the adapters' sections, then the captured stdout/stderr.
 */
export function buildNodeBrief(node: Test, adapter: CopySections): string {
  const generic = genericCopySections(node);
  const merged = mergeCopySections([
    { facts: generic.facts, brief: generic.brief.filter((s) => !OUTPUT_TITLES.has(s.title)) },
    adapter,
    { brief: generic.brief.filter((s) => OUTPUT_TITLES.has(s.title)) },
  ]);
  return buildBrief(node, merged.brief, merged.facts);
}

/** "Copy as JSON": the node without its children subtree, 2-space indented. */
export function buildNodeJson(node: Test): string {
  const { children: _children, ...rest } = node;
  return JSON.stringify(rest, null, 2);
}
