import { applyEdits, modify } from "jsonc-parser";
import { isAlias, isCollection, isNode, isScalar, parseDocument, visit } from "yaml";

export function documentParts(source: string, path: string) {
  const markdown = /\.mdx?$/i.test(path);
  if (!markdown || !/^(?:\uFEFF)?---\r?\n/.test(source))
    return {
      markdown,
      prefix: "",
      data: markdown ? "" : source,
      suffix: markdown ? source : "",
    };
  const opening = /^(?:\uFEFF)?---\r?\n/.exec(source)![0];
  const closing = /^---\s*\r?$/m.exec(source.slice(opening.length));
  if (!closing) throw new Error("Unclosed Markdown frontmatter");
  const end = opening.length + closing.index;
  return {
    markdown,
    prefix: opening,
    data: source.slice(opening.length, end),
    suffix: source.slice(end),
  };
}

export function structuredDocument(source: string, path: string) {
  const parts = documentParts(source, path);
  const json = /\.json$/i.test(path);
  const doc = parseDocument(parts.data, {
    keepSourceTokens: true,
    uniqueKeys: true,
  });
  if (doc.errors.length)
    throw new Error(doc.errors.map((error) => error.message).join("\n"));
  const parsed: unknown = json ? JSON.parse(parts.data) : doc.toJS();
  // Markdown frontmatter is a mapping: absent or empty frontmatter is an empty one.
  const value = parts.markdown && parsed == null ? {} : parsed;
  assertAcyclic(value);
  return { parts, value, doc, json };
}

export function changeStructuredDocument(
  source: string,
  path: string,
  next: unknown,
): string {
  const { parts, value, doc, json } = structuredDocument(source, path);
  if (JSON.stringify(value) === JSON.stringify(next)) return source;
  const updates = documentChanges({ before: value, after: next, path: [] });
  let data: string;
  if (json) {
    data = parts.data;
    for (const update of updates)
      data = applyEdits(
        data,
        modify(data, update.path, update.after, {
          formattingOptions: { insertSpaces: true, tabSize: 2 },
        }),
      );
  } else {
    for (const update of updates) {
      detachEditedAlias(doc, update.path);
      if (update.after === undefined) doc.deleteIn(update.path);
      else doc.setIn(update.path, update.after);
    }
    data = doc.toString();
    if (source.includes("\r\n")) data = data.replace(/\r?\n/g, "\r\n");
  }
  if (parts.markdown && !parts.prefix) {
    // A first frontmatter edit opens the --- block the page did not have.
    const newline = source.includes("\r\n") ? "\r\n" : "\n";
    return `---${newline}${data}---${newline}${parts.suffix}`;
  }
  return parts.prefix + data + parts.suffix;
}

function assertAcyclic(value: unknown, ancestors = new Set<object>()): void {
  if (value === null || typeof value !== "object") return;
  if (ancestors.has(value))
    throw new Error("Cyclic YAML aliases cannot be edited in a form");
  ancestors.add(value);
  for (const child of Object.values(value)) assertAcyclic(child, ancestors);
  ancestors.delete(value);
}

function detachEditedAlias(
  doc: ReturnType<typeof parseDocument>,
  path: (string | number)[],
) {
  for (let length = 1; length <= path.length; length++) {
    const prefix = path.slice(0, length);
    const node = doc.getIn(prefix, true);
    if (!isAlias(node)) continue;
    const target = node.resolve(doc);
    if (!target) throw new Error(`Unresolved YAML alias: ${node.source}`);
    const copy = target.clone();
    if (!isNode(copy)) throw new Error(`Invalid YAML alias target: ${node.source}`);
    visit(copy, {
      Node: (_key, child) => {
        if (isScalar(child) || isCollection(child)) delete child.anchor;
      },
    });
    if (node.comment) copy.comment = node.comment;
    if (node.commentBefore) copy.commentBefore = node.commentBefore;
    doc.setIn(prefix, copy);
  }
}

type DocumentChange = {
  before: unknown;
  after: unknown;
  path: (string | number)[];
};
function documentChanges(change: DocumentChange): DocumentChange[] {
  if (JSON.stringify(change.before) === JSON.stringify(change.after)) return [];
  if (Array.isArray(change.before) && Array.isArray(change.after)) {
    const before: unknown[] = change.before,
      after: unknown[] = change.after;
    const indices = Array.from(
      { length: Math.max(before.length, after.length) },
      (_, index) => index,
    );
    if (after.length < before.length) indices.reverse();
    return indices.flatMap((index) =>
      documentChanges({
        before: before[index],
        after: after[index],
        path: [...change.path, index],
      }),
    );
  }
  const before = record(change.before),
    after = record(change.after);
  if (!before || !after) return [change];
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].flatMap(
    (key) =>
      documentChanges({
        before: before[key],
        after: after[key],
        path: [...change.path, key],
      }),
  );
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}
