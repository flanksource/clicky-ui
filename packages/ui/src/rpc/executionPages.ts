import type { ClickyDocument, ClickyNode, ClickyRow } from "../data/Clicky";
import { parseClickyData } from "../data/clicky-parse";
import type { ExecutionResponse } from "./types";

/**
 * mergeExecutionPages stacks a cursor walk into the one document the default
 * result surface renders.
 *
 * The walk arrives unmerged because a page is a rendered document, not a row
 * array, and what stacking two of them means depends on what they contain. For
 * the clicky result surface the answer is knowable: the payload is a table, and
 * appending its rows in walk order is what "one continuous list" means. Every
 * other part of the document is the first page's, because the columns, the
 * headings and the shape are facts about the query rather than about the page.
 *
 * Callers hand over the whole walk on every render, so a single-page walk is
 * returned by identity — the common case must not churn the document and force
 * the table to rebuild rows nobody changed.
 */
export function mergeExecutionPages(
  pages: readonly ExecutionResponse[],
): ExecutionResponse | null {
  const first = pages[0];
  const last = pages[pages.length - 1];
  if (!first || !last) return null;
  if (pages.length === 1) return first;

  const documents = pages.map(documentOf);
  const base = documents[0];
  // A walk whose pages are not tables has nothing to accumulate into — a
  // detail document, say, served one at a time. The newest one is the whole of
  // what there is to show.
  if (!base || !findFirstTable(base.node)) return last;

  const rows: ClickyRow[] = [];
  for (const [index, document] of documents.entries()) {
    const table = document ? findFirstTable(document.node) : undefined;
    if (!table) {
      // Loudly, because the alternative is deleting rows the reader has
      // already scrolled past and calling it a shorter list.
      throw new Error(
        `Cursor walk page ${index + 1} of ${pages.length} carries no table to append to the run`,
      );
    }
    rows.push(...(table.rows ?? []));
  }

  const merged: ClickyDocument = {
    version: 1,
    node: mapFirstTable(base.node, (table) => ({ ...table, rows })).node,
  };

  return {
    ...last,
    // The paging facts are the newest page's — how many rows exist and whether
    // more follow are answers about now — but a download re-requests
    // `requestUrl`, and the walk's identity is the request that named the query
    // without naming a position inside it.
    ...(first.requestUrl !== undefined ? { requestUrl: first.requestUrl } : {}),
    parsed: merged,
    stdout: JSON.stringify(merged),
    ...(last.output !== undefined ? { output: JSON.stringify(merged) } : {}),
  };
}

// The executor puts the decoded document on `parsed` and its bytes on
// `stdout`; CommandOutput reads them in that order, so this does too or a
// merged page could disagree with the one the renderer would have shown.
function documentOf(response: ExecutionResponse): ClickyDocument | undefined {
  const payload = response.parsed ?? response.stdout ?? response.output ?? "";
  if (typeof payload !== "string" && typeof payload !== "object") return undefined;
  const parsed = parseClickyData(payload as Parameters<typeof parseClickyData>[0]);
  return parsed.ok ? parsed.document : undefined;
}

function findFirstTable(node: ClickyNode): ClickyNode | undefined {
  let found: ClickyNode | undefined;
  mapFirstTable(node, (table) => {
    found = table;
    return table;
  });
  return found;
}

/**
 * Rebuilds `node` with its first table — depth-first, in document order —
 * replaced by `fn`'s result. One traversal serves both finding a table and
 * rewriting it, so the page a walk reads rows out of is by construction the
 * page it writes them back into.
 */
function mapFirstTable(
  node: ClickyNode,
  fn: (table: ClickyNode) => ClickyNode,
): { node: ClickyNode; found: boolean } {
  if (node.kind === "table") return { node: fn(node), found: true };

  const children = mapFirstIn(node.children, fn);
  if (children) return { node: { ...node, children }, found: true };

  const items = mapFirstIn(node.items, fn);
  if (items) return { node: { ...node, items }, found: true };

  if (node.fields) {
    const values = mapFirstIn(
      node.fields.map((field) => field.value),
      fn,
    );
    if (values) {
      return {
        node: {
          ...node,
          fields: node.fields.map((field, index) => ({
            ...field,
            value: values[index] ?? field.value,
          })),
        },
        found: true,
      };
    }
  }

  if (node.content) {
    const content = mapFirstTable(node.content, fn);
    if (content.found) return { node: { ...node, content: content.node }, found: true };
  }

  return { node, found: false };
}

/** The rewritten list, or undefined when none of `nodes` held a table. */
function mapFirstIn(
  nodes: ClickyNode[] | undefined,
  fn: (table: ClickyNode) => ClickyNode,
): ClickyNode[] | undefined {
  if (!nodes) return undefined;
  for (const [index, child] of nodes.entries()) {
    const mapped = mapFirstTable(child, fn);
    if (!mapped.found) continue;
    const next = [...nodes];
    next[index] = mapped.node;
    return next;
  }
  return undefined;
}
