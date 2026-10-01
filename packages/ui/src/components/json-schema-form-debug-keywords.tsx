import type { ReactNode } from "react";
import { LabelIcon } from "../data/Icon";
import { TONE_DOT_CLASS, isFieldTone } from "./json-schema-form-tone";
import { cn } from "../lib/utils";
import { groupKeywords, type KeywordGroup } from "./json-schema-form-debug-groups";
import { DebugGlyph } from "./json-schema-form-debug-glyph";
import { GROUP_GLYPH, KIND_GLYPH, keywordGlyph } from "./json-schema-form-debug-glyph-map";
import { ListenerList } from "./json-schema-form-debug-listeners";
import type { ArrayItemSpec, ChangeListener, JsonSchemaHelpBlock, JsonSchemaProperty, LookupDescriptor } from "./json-schema-form-types";

// The debug card's keyword list, one labelled group at a time (see
// groupKeywords), each keyword beside its palette glyph and rendered in its own
// vocabulary — listeners as condition/action cards, the x-enum-* maps as one
// option table, a lookup as the request it makes — instead of as raw JSON.

const GROUP_TITLE: Record<KeywordGroup, string> = {
  behaviour: "Behaviour",
  presentation: "Presentation",
  "opt-in": "Opt-in extensions",
  consumer: "Consumer extensions",
  schema: "Schema",
};
const GROUP_NOTE: Partial<Record<KeywordGroup, string>> = {
  "opt-in": "read only when the host passes the matching create*FormExtensions()",
  consumer: "not read by the form",
};

// Keywords that shape the tree rather than source the field; listed by name.
const STRUCTURE = new Set(["properties", "items", "allOf", "anyOf", "oneOf", "$defs", "patternProperties", "additionalProperties"]);
const ICON_KEYWORDS = new Set(["x-icon", "x-input-prefix-icon", "x-input-suffix-icon"]);
const ENUM_MAPS = ["x-enum-labels", "x-enum-icons", "x-enum-descriptions", "x-enum-tones"] as const;

// DebugKeywords renders a property's keywords, one labelled group at a time.
// `value` is the field's current value: listeners are evaluated against it.
export function DebugKeywords({ prop, value }: { prop: JsonSchemaProperty; value?: unknown }) {
  return (
    <>
      {groupKeywords(prop).map(({ group, entries }) => {
        const enumMaps = entries.filter(([keyword]) => (ENUM_MAPS as readonly string[]).includes(keyword));
        const rest = entries.filter(([keyword]) => !(ENUM_MAPS as readonly string[]).includes(keyword));
        return (
          <section key={group} role="group" aria-label={GROUP_TITLE[group]} className="space-y-0.5 border-t border-border pt-1.5">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <DebugGlyph glyph={GROUP_GLYPH[group]} />
              {GROUP_TITLE[group]}
              {GROUP_NOTE[group] && <span className="font-normal normal-case tracking-normal">· {GROUP_NOTE[group]}</span>}
            </div>
            {enumMaps.length > 0 && <EnumOptionTable prop={prop} />}
            <ul className="space-y-0.5 font-mono text-[11px]">
              {rest.map(([keyword, raw]) => (
                <li key={keyword} className="flex gap-1">
                  <DebugGlyph glyph={keywordGlyph(keyword, raw)} className="mt-px" />
                  <div className="min-w-0 flex-1 break-words">
                    <span className="text-muted-foreground">{keyword}</span> {describeKeyword(keyword, raw, value)}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

function describeKeyword(keyword: string, raw: unknown, value: unknown): ReactNode {
  if (keyword === "x-on-change" || keyword === "x-on-load") {
    return Array.isArray(raw) ? <ListenerList listeners={raw as ChangeListener[]} subject={value} /> : <Json value={raw} />;
  }
  if (keyword === "x-clicky-lookup") return <LookupSummary descriptor={raw as LookupDescriptor} />;
  if (keyword === "x-item") return <ItemSpecSummary spec={raw as ArrayItemSpec} />;
  if (keyword === "x-help") return <HelpSummary help={raw as JsonSchemaHelpBlock} />;
  if (ICON_KEYWORDS.has(keyword) && typeof raw === "string") {
    return (
      <span className="inline-flex items-center gap-1">
        <LabelIcon icon={raw} className="size-3.5" />
        {raw}
      </span>
    );
  }
  if (STRUCTURE.has(keyword)) {
    if (Array.isArray(raw)) return `[${raw.length}]`;
    if (typeof raw === "object" && raw !== null) return `{${Object.keys(raw).join(", ")}}`;
  }
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && raw.every((item) => typeof item === "string")) return raw.join(", ");
  return <Json value={raw} />;
}

function Json({ value }: { value: unknown }) {
  if (typeof value !== "object" || value === null) return <span>{JSON.stringify(value)}</span>;
  return <pre className="mt-0.5 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted/60 p-1">{JSON.stringify(value, null, 2)}</pre>;
}

function LookupSummary({ descriptor }: { descriptor: LookupDescriptor }) {
  const { scope, hierarchy } = descriptor;
  const parts = [
    `filter ${descriptor.filter}`,
    descriptor.searchParam && `search ${descriptor.searchParam}`,
    descriptor.multi && "multi-select",
    scope && `scope ${scope.param} ← ${scope.from}${scope.map ? ` via ${JSON.stringify(scope.map)}` : ""}`,
    hierarchy && `tree split on ${JSON.stringify(hierarchy.delimiters)}`,
  ].filter(Boolean);
  return (
    <span>
      GET {descriptor.url} {parts.join(" · ")}
    </span>
  );
}

function ItemSpecSummary({ spec }: { spec: ArrayItemSpec }) {
  const summary = spec.summary?.map((part) => (typeof part === "string" ? part : (part.pattern ?? "{}").replace("{}", part.property)));
  const parts = [
    spec.title && `title ${spec.title.join(" | ")}${spec.fallback ? ` (else ${spec.fallback})` : ""}`,
    summary && `summary ${summary.join(" · ")}`,
    spec.glyph && `glyph ${spec.glyph}`,
    spec.badge && `badge ${spec.badge}`,
    spec.flag && `flag ${spec.flag}`,
    spec.actions && `actions ${spec.actions.length > 0 ? spec.actions.join(", ") : "none"}`,
    spec.noun && `noun ${spec.noun}${spec.nounPlural ? `/${spec.nounPlural}` : ""}`,
    spec.empty && `empty "${spec.empty}"`,
  ].filter(Boolean);
  return <span>{parts.join(" · ")}</span>;
}

function HelpSummary({ help }: { help: JsonSchemaHelpBlock }) {
  const origin = [help.source, help.section].filter(Boolean).join(" › ");
  return (
    <span>
      {origin && <span className="text-muted-foreground">[{origin}] </span>}
      <span className="font-sans">{help.body}</span>
    </span>
  );
}

// EnumOptionTable joins the x-enum-* maps by value: one row per enum value,
// then any map key the enum does not list (a typo, or a stale value).
function EnumOptionTable({ prop }: { prop: JsonSchemaProperty }) {
  const labels = prop["x-enum-labels"] ?? {};
  const icons = prop["x-enum-icons"] ?? {};
  const descriptions = prop["x-enum-descriptions"] ?? {};
  const tones = prop["x-enum-tones"] ?? {};
  const enumValues = (prop.enum ?? []).map(String);
  const mapped = [...new Set([labels, icons, descriptions, tones].flatMap((map) => Object.keys(map)))];
  const values = [...enumValues, ...mapped.filter((value) => !enumValues.includes(value))];
  const checkEnum = prop.enum !== undefined;
  const hasIcons = Object.keys(icons).length > 0;
  return (
    <div className="flex gap-1 font-mono text-[11px]">
      <DebugGlyph glyph={KIND_GLYPH.enum} className="mt-px" />
      <div className="min-w-0 flex-1">
        <div className="text-muted-foreground">x-enum-*</div>
        <table className="w-full">
          <thead className="text-left text-[10px] text-muted-foreground">
            <tr>
              <th className="pr-2 font-normal">value</th>
              <th className="pr-2 font-normal">label</th>
              <th className="pr-2 font-normal">description</th>
              <th className="font-normal">tone</th>
            </tr>
          </thead>
          <tbody>
            {values.map((value) => {
              const tone = tones[value];
              return (
                <tr key={value} className="align-top">
                  <td className="pr-2">
                    <span className="inline-flex items-center gap-1">
                      {hasIcons && <LabelIcon icon={icons[value]} className="size-3.5" />}
                      {value}
                      {checkEnum && !enumValues.includes(value) && <span className="text-amber-700 dark:text-amber-300"> ⚠ not in enum</span>}
                    </span>
                  </td>
                  <td className="pr-2">{labels[value] ?? ""}</td>
                  <td className="pr-2 font-sans">{descriptions[value] ?? ""}</td>
                  <td>
                    {tone && (
                      <span className="inline-flex items-center gap-1">
                        <span className={cn("size-2 rounded-full", isFieldTone(tone) ? TONE_DOT_CLASS[tone] : "outline outline-1 outline-rose-500")} />
                        {tone}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
