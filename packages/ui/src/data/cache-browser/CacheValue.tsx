import { CodeBlock } from "../CodeBlock";
import { KeyValueList } from "../KeyValueList";
import type { CacheKeyDetail } from "./types";

/**
 * Default type-aware value rendering: JSON-looking strings get the JSON tree,
 * other strings a plain code block, hashes a key/value list, lists/sets an
 * indexed list and zsets a member/score list. Hosts override per key family
 * via CacheNodeAdapter.renderDetail.
 */
export function CacheValue({ detail }: { detail: CacheKeyDetail }) {
  return (
    <div className="flex min-w-0 flex-col gap-density-2">
      {detail.truncated && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-density-3 py-density-2 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
          Showing a truncated value — the full {valueNoun(detail.type)} has {detail.length}{" "}
          {unitNoun(detail.type)}.
        </div>
      )}
      <CacheValueBody detail={detail} />
    </div>
  );
}

function CacheValueBody({ detail }: { detail: CacheKeyDetail }) {
  switch (detail.type) {
    case "string":
      return <CodeBlock language={looksLikeJson(detail.value ?? "") ? "json" : "text"} source={detail.value ?? ""} />;
    case "hash":
      return (
        <KeyValueList
          items={Object.entries(detail.fields ?? {}).map(([field, value]) => ({
            key: field,
            label: field,
            value: <ValueCell value={value} />,
          }))}
          emptyMessage="Empty hash"
        />
      );
    case "list":
    case "set":
      return (
        <KeyValueList
          items={(detail.items ?? []).map((item, i) => ({
            key: `${i}`,
            label: detail.type === "list" ? `#${i}` : "•",
            value: <ValueCell value={item} />,
          }))}
          emptyMessage={detail.type === "list" ? "Empty list" : "Empty set"}
        />
      );
    case "zset":
      return (
        <KeyValueList
          items={(detail.members ?? []).map((m, i) => ({
            key: `${i}`,
            label: String(m.score),
            value: <ValueCell value={m.member} />,
          }))}
          emptyMessage="Empty sorted set"
        />
      );
    default:
      return (
        <div className="text-sm text-muted-foreground">
          Values of type <code>{detail.type}</code> are not rendered ({detail.length} entries).
        </div>
      );
  }
}

/** Renders one collection entry, expanding embedded JSON. */
function ValueCell({ value }: { value: string }) {
  if (looksLikeJson(value)) return <CodeBlock language="json" source={value} />;
  return <span className="break-all font-mono text-xs">{value}</span>;
}

function looksLikeJson(value: string): boolean {
  const trimmed = value.trim();
  return (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  );
}

function valueNoun(type: string): string {
  return type === "string" ? "value" : type;
}

function unitNoun(type: string): string {
  return type === "string" ? "bytes" : "entries";
}
