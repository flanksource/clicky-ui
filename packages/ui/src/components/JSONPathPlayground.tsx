import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { JsonView } from "../data/JsonView";
import { Tree } from "../data/Tree";
import { UiInfo, UiWarningTriangle } from "../icons";
import { Modal } from "../overlay/Modal";
import { Button } from "./button";
import { InputField } from "./InputField";
import { createLazyJSONPathTree, type JSONPathNode } from "./jsonPathTree";

/** What evaluating an expression against one row reports back. */
export interface JSONPathEvalResult {
  matches: unknown[];
  count: number;
  /** Why the expression could not be evaluated — a parse error is an answer, not a failure. */
  error?: string;
  /** Backend field the expression addresses, when it addresses one rather than selecting a set. */
  filterField?: string;
}

export interface JSONPathEvalRequest {
  jsonpath: string;
  /** Column the path is rooted at, when it addresses a decoded JSON-encoded column. */
  source?: string;
  row: unknown;
}

export interface JSONPathPlaygroundProps {
  open: boolean;
  onClose: () => void;
  /** Sampled rows to browse. A row switcher appears once there is more than one. */
  rows: unknown[];
  /** The expression the field currently holds. */
  value: string;
  /** Commits the drafted expression, along with the column it must be rooted at. */
  onCommit: (path: string, context: { root?: string }) => void;
  /**
   * True when `onCommit` writes the root itself. It only changes what the
   * dialog says about a path that descends into an encoded column: that the
   * root will be recorded, rather than instructing the author to go and record
   * it. Consumers that drop the root leave this unset and keep the warning.
   */
  assignsRoot?: boolean;
  /**
   * The column the field's path is *already* rooted at — its saved `source`.
   *
   * Without it the dialog browses and evaluates from the row while the value it
   * was opened with is written against a decoded column, so a column that works
   * perfectly well reports no matches and an author is invited to fix it.
   */
  source?: string;
  /**
   * Evaluates the draft against the selected row. Without it the dialog is a
   * browser only — it shows the selected node's own value instead of a match
   * set, which is all an offline demo can honestly claim.
   */
  evaluate?: (request: JSONPathEvalRequest) => Promise<JSONPathEvalResult>;
  title?: string;
}

const EVALUATE_DEBOUNCE_MS = 250;

/**
 * The full-size counterpart to the inline JSONPath dropdown.
 *
 * The dropdown is a preview and caps its walk to stay instant; this browses the
 * row with no depth limit, every array element, and every property — and pairs
 * the tree with what the expression actually selects, evaluated by the backend
 * that will run it, so an author stops finding out at query time.
 */
export function JSONPathPlayground({
  open,
  onClose,
  rows,
  value,
  onCommit,
  assignsRoot,
  source,
  evaluate,
  title = "JSONPath playground",
}: JSONPathPlaygroundProps) {
  const [draft, setDraft] = useState(value);
  const [rowIndex, setRowIndex] = useState(0);
  const [selected, setSelected] = useState<JSONPathNode | null>(null);
  const [result, setResult] = useState<JSONPathEvalResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  // Reopening starts from whatever the field holds now, not from the last
  // session's draft — the operator may have typed over it in between.
  useEffect(() => {
    if (open) {
      setDraft(value);
      setRowIndex((current) => (current < rows.length ? current : 0));
    }
  }, [open, value, rows.length]);

  const row = rows[rowIndex];
  // A column with a `source` has its paths written against that column decoded,
  // not against the row, so that is what the tree has to browse — otherwise the
  // paths it offers and the path the field holds are in two different languages.
  const browsed = useMemo(() => decodeSource(row, source), [row, source]);
  const tree = useMemo(
    () => createLazyJSONPathTree(browsed, { keyPrefix: `row${rowIndex}:${source ?? ""}:` }),
    [browsed, rowIndex, source],
  );

  // Reveal the branch the current expression addresses, so the dialog opens
  // showing the value rather than a collapsed root.
  useEffect(() => {
    if (!open) return;
    setSelected(tree.materializePath(draft) ?? null);
    // Only on (re)open and row change: re-running this per keystroke would yank
    // the tree around while the operator is typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tree]);

  // The root belongs to the selection, and hand-editing the expression keeps it:
  // an operator who descended into an encoded column and is now tuning the path
  // inside it still means that column. It is never silent — the banner below
  // names it — and selecting any node outside that subtree clears it. A column
  // that already declares a source starts there rather than at nothing.
  const root = selected?.root ?? source;
  // Only a root nobody has recorded yet is a warning: one the column already
  // declares, or one this dialog is about to write, is just context.
  const rootPending = root !== undefined && root !== source && !assignsRoot;

  const latestRequest = useRef(0);
  useEffect(() => {
    if (!open || !evaluate) return;
    const request = (latestRequest.current += 1);
    setEvaluating(true);
    const timer = setTimeout(() => {
      const payload: JSONPathEvalRequest = { jsonpath: draft, row };
      if (root !== undefined) payload.source = root;
      void evaluate(payload)
        .then((next) => {
          if (latestRequest.current === request) setResult(next);
        })
        .catch((error: unknown) => {
          if (latestRequest.current === request) {
            setResult({ matches: [], count: 0, error: String(error) });
          }
        })
        .finally(() => {
          if (latestRequest.current === request) setEvaluating(false);
        });
    }, EVALUATE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [open, evaluate, draft, row, root]);

  const commit = () => {
    onCommit(draft, root === undefined ? {} : { root });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="2xl"
      scrollBody={false}
      className="h-[80vh]"
      footer={(
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={commit} disabled={draft.trim() === ""}>Use path</Button>
        </div>
      )}
    >
      <div className="flex h-full min-h-0 flex-col gap-3">
        {rows.length > 1 && (
          <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            Sample row
            <select
              aria-label="Sample row"
              value={rowIndex}
              onChange={(event) => setRowIndex(Number(event.target.value))}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground"
            >
              {rows.map((_, index) => (
                <option key={index} value={index}>{index + 1} of {rows.length}</option>
              ))}
            </select>
            <span>Fields absent from the first row are only visible in the one that carries them.</span>
          </label>
        )}

        <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-md border border-border">
            <Tree<JSONPathNode>
              className="min-h-0 flex-1"
              ariaLabel="JSON paths"
              roots={tree.roots}
              getKey={(node) => node.key}
              getChildren={tree.getChildren}
              hasMoreChildren={tree.hasMoreChildren}
              loadChildren={tree.loadChildren}
              getSearchText={(node) => `${node.path} ${node.summary}`}
              defaultOpen={(_node, depth) => depth < 2}
              selected={selected}
              revealSelected
              onSelect={(node) => {
                if (node.kind === "more") return;
                setSelected(node);
                setDraft(node.path);
              }}
              renderRow={({ node }) => (
                <span className="flex min-w-0 flex-1 items-center gap-density-2 font-mono text-xs">
                  <span className={cn("shrink-0", node.kind === "more" ? "text-muted-foreground" : "text-primary")}>
                    {node.kind === "more" ? "…" : node.path}
                  </span>
                  <span className="truncate text-muted-foreground" title={node.summary}>{node.summary}</span>
                </span>
              )}
            />
          </div>

          <div className="flex min-h-0 flex-col gap-2">
            <InputField
              aria-label="JSONPath expression"
              value={draft}
              onChange={setDraft}
              inputClassName="font-mono text-xs"
              placeholder="$.messages[0].payload"
            />

            {root !== undefined && (
              <p
                className={cn(
                  "flex shrink-0 items-start gap-1.5 rounded-md border px-2 py-1.5 text-xs text-foreground",
                  rootPending
                    ? "border-amber-600/40 bg-amber-500/10"
                    : "border-border bg-muted/40",
                )}
              >
                <Icon
                  icon={rootPending ? UiWarningTriangle : UiInfo}
                  className={cn("mt-0.5 shrink-0", rootPending ? "text-amber-600" : "text-muted-foreground")}
                />
                <span>
                  This path is rooted inside <code className="font-mono">{root}</code>, a column holding JSON
                  as text.{" "}
                  {root === source ? (
                    <>
                      That is already the column's <code className="font-mono">Source</code>.
                    </>
                  ) : assignsRoot ? (
                    <>
                      Applying it sets the column's <code className="font-mono">Source</code> to{" "}
                      <code className="font-mono">{root}</code>.
                    </>
                  ) : (
                    <>
                      The column's <code className="font-mono">Source</code> must be set to{" "}
                      <code className="font-mono">{root}</code> for it to resolve.
                    </>
                  )}
                </span>
              </p>
            )}

            <ResultPane evaluating={evaluating} result={result} selected={selected} evaluated={Boolean(evaluate)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

/**
 * The value a `source` column's paths are written against: the column itself,
 * decoded when it carries JSON as text — which mirrors what the backend does
 * before it applies the path.
 */
function decodeSource(row: unknown, source: string | undefined): unknown {
  if (!source) return row;
  if (row === null || typeof row !== "object") return undefined;
  const value = (row as Record<string, unknown>)[source];
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function ResultPane({
  evaluating,
  result,
  selected,
  evaluated,
}: {
  evaluating: boolean;
  result: JSONPathEvalResult | null;
  selected: JSONPathNode | null;
  evaluated: boolean;
}) {
  if (!evaluated) {
    return (
      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-2 text-xs">
        {selected ? (
          <JsonView data={selected.value} defaultOpenDepth={1} />
        ) : (
          <p className="text-muted-foreground">Select a node to see its value.</p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {result?.error ? (
          <span className="font-mono text-destructive">{result.error}</span>
        ) : (
          <span className={cn(result && result.count === 0 && "text-muted-foreground")}>
            {evaluating && result === null
              ? "Evaluating…"
              : `${result?.count ?? 0} match${result?.count === 1 ? "" : "es"}`}
          </span>
        )}
        {result && !result.error && (
          <span className="text-muted-foreground">
            {result.filterField
              ? <>Filterable as <code className="font-mono text-foreground">{result.filterField}</code></>
              : "Selects a set — not filterable unless the column declares filter.field"}
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-2 text-xs">
        {result && !result.error && result.count > 0 ? (
          <JsonView data={result.count === 1 ? result.matches[0] : result.matches} defaultOpenDepth={1} />
        ) : (
          <p className="text-muted-foreground">
            {result?.error ? "Fix the expression to see what it selects." : "This path selects nothing in this row."}
          </p>
        )}
      </div>
    </>
  );
}
