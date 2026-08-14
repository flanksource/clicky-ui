import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "../../data/Badge";
import { Button } from "../../components/button";
import { Icon } from "../../data/Icon";
import { Modal } from "../../overlay/Modal";
import { Tree } from "../../data/Tree";
import { cn } from "../../lib/utils";
import { createLazyJSONPathTree, type JSONPathNode } from "../../components/jsonPathTree";
import type {
  FieldControl,
  PostExtensionContext,
} from "../../components/json-schema-form-types";
import { UiArrowRight, UiCheck, UiCode2, UiSparkles, UiWarningTriangle } from "../../icons";
import { useJsonPathSample } from "../query/jsonPathSample";
import { celPathFor } from "./celPath";

import {
  bindingsFor,
  celExamplesFor,
  coverage,
  evaluateCel,
  explainCelError,
  isClean,
  nextBarren,
  unreachableKeys,
  type CelScope,
} from "./celExpression";

const SCOPE_LABEL: Record<CelScope, string> = {
  row: "Row",
  batch: "Batch",
  boundary: "Boundary",
};

function scopeOf(schema: Record<string, unknown>): CelScope {
  const declared = schema["x-clicky-cel-scope"];
  return declared === "batch" || declared === "boundary" ? declared : "row";
}

/**
 * The expression editor.
 *
 * Its subject is coverage, not syntax. An expression is written against the rows
 * on screen and the rows it reads nothing from are the ones the author has not
 * looked at — and because this engine folds a missing field into null instead of
 * throwing, a wrong expression comes back clean. So the strip of per-row
 * outcomes and the jump to the next barren row are the point; highlighting and
 * completion are what the input already had.
 */
export function CelEditorDialog(props: CelEditorProps) {
  return (
    <Modal open onClose={props.onClose} title={`Expression — ${props.title}`} size="xl">
      <CelEditorPanel {...props} />
    </Modal>
  );
}

type CelEditorProps = {
  value: string;
  scope: CelScope;
  rows: Record<string, unknown>[];
  title: string;
  onChange: (next: string) => void;
  onClose: () => void;
};

/**
 * The dialog's contents, separated from the Modal that carries them.
 *
 * The split exists so this can be rendered and asserted without a DOM: Modal
 * portals, and a portal renders to nothing server-side.
 */
export function CelEditorPanel({ value, scope, rows, onChange, onClose }: CelEditorProps) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(0);
  const [picked, setPicked] = useState<JSONPathNode | undefined>(undefined);
  const input = useRef<HTMLTextAreaElement>(null);

  // Written where the caret is rather than appended: an accessor pasted onto
  // the end of a half-written expression concatenates into nonsense, and the
  // useful gesture is completing `…filter(e, e.key == ` from the tree.
  const insert = (text: string) => {
    const element = input.current;
    setDraft((current) => {
      const start = element?.selectionStart ?? current.length;
      const end = element?.selectionEnd ?? current.length;
      return current.slice(0, start) + text + current.slice(end);
    });
    queueMicrotask(() => {
      element?.focus();
      const at = (element?.selectionStart ?? 0) + text.length;
      element?.setSelectionRange(at, at);
    });
  };

  // Evaluated server-side, debounced by react-query's key rather than a timer:
  // the rows are already in the browser, so a keystroke costs one small request
  // and no backend query.
  const { data, isFetching, error } = useQuery({
    queryKey: ["cel-expression", scope, draft, rows.length],
    enabled: draft.trim() !== "" && rows.length > 0,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => evaluateCel({ cel: draft, scope, rows }),
  });

  const results = data?.results ?? [];
  const found = useMemo(() => coverage(results), [results]);
  const focusedResult = results.find((result) => result.index === focused) ?? results[0];
  const jump = nextBarren(found, focused);
  const row = rows[focused];
  const bindings = bindingsFor(scope, row);
  const unreachable = unreachableKeys(row);

  // Rebuilt per focused row: the tree caches nodes by key, so without a prefix
  // that changes with the row, row 2 would show row 1's loaded branches.
  const tree = useMemo(
    () => createLazyJSONPathTree(row, { keyPrefix: `row${focused}:` }),
    [row, focused],
  );
  const pickedPath = picked ? celPathFor(picked) : undefined;

  return (
    <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="info" variant="soft" size="md">
            {SCOPE_LABEL[scope]} scope
          </Badge>
          <span className="text-xs text-muted-foreground">
            {rows.length === 0 ? "nothing sampled yet" : `${rows.length} sampled rows`}
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)]">
          <section className="space-y-2">
            <textarea
              ref={input}
              className="h-24 w-full resize-none rounded border border-border bg-background p-2 font-mono text-xs"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label="CEL expression"
            />

            {data?.error && (
              <p className="flex gap-1.5 rounded border border-amber-500/40 bg-amber-500/[0.06] px-2 py-1 text-[11px] text-amber-700 [[data-theme=dark]_&]:text-amber-300">
                <Icon icon={UiWarningTriangle} className="mt-0.5 shrink-0 text-[12px]" />
                {data.error}
              </p>
            )}
            {error instanceof Error && (
              <p className="rounded border border-destructive/40 bg-destructive/[0.06] px-2 py-1 text-[11px] text-destructive">
                {error.message}
              </p>
            )}

            <ResultStrip
              result={focusedResult}
              index={focused}
              pending={isFetching}
              draft={draft}
              onFix={setDraft}
            />

            {pickedPath && (
              <div className="space-y-1.5 rounded border border-border bg-muted/30 p-2">
                <div className="flex items-center gap-1.5">
                  <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-primary">
                    {pickedPath}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => insert(pickedPath)}>
                    Insert
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {celExamplesFor(pickedPath, picked?.value).map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      title={example.expression}
                      className="rounded-full border border-border px-2 py-0.5 text-[10px] hover:bg-muted"
                      onClick={() => setDraft(example.expression)}
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Tally ok={found.ok} empty={found.empty} failed={found.failed} />
              {jump !== undefined && (
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setFocused(jump)}>
                  <Icon icon={UiArrowRight} className="text-[12px]" />
                  Next empty row
                </Button>
              )}
              {found.types.length > 1 && (
                <Badge tone="warning" variant="soft" size="md">
                  returns {found.types.join(" | ")}
                </Badge>
              )}
            </div>

            <Coverage results={results} rowCount={rows.length} focused={focused} onFocus={setFocused} />
          </section>

          <section className="space-y-2 rounded-lg border border-border bg-muted/20 p-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold">In scope</h4>
              {rows.length > 0 && (
                <Badge tone="neutral" variant="soft" size="md">
                  row {focused + 1}
                </Badge>
              )}
            </div>
            {/* The names that are variables rather than data. Only these are
                bare: every row key is reached through the tree below, which
                spells the ones a bare name could not. */}
            <ul className="space-y-0.5">
              {bindings
                .filter((binding) => binding.value === undefined)
                .map((binding) => (
                  <li key={binding.name}>
                    <button
                      type="button"
                      className="flex w-full items-baseline gap-1.5 rounded px-1 py-0.5 text-left hover:bg-muted"
                      onClick={() => insert(binding.name)}
                    >
                      <code className="shrink-0 font-mono text-[11px] text-primary">{binding.name}</code>
                      <span className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground">
                        {binding.detail}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>

            {row && (
              // Tree sizes to its parent and has no height of its own, so the
              // box has to bound it or the panel grows with the document.
              <div className="flex h-72 min-h-0 flex-col overflow-hidden rounded border border-border bg-background">
                <Tree<JSONPathNode>
                  className="min-h-0 flex-1"
                  ariaLabel="Row values"
                  // Expand-all only walks children already loaded, so on a lazy
                  // tree it is a button that appears to do nothing. The filter
                  // box still appears on its own once the row is wide enough.
                  showControls={false}
                  roots={tree.roots}
                  getKey={(node) => node.key}
                  getChildren={tree.getChildren}
                  hasMoreChildren={tree.hasMoreChildren}
                  loadChildren={tree.loadChildren}
                  defaultOpen={(_, depth) => depth < 1}
                  selected={picked ?? null}
                  onSelect={setPicked}
                  // The default walker stringifies every field of a node, and
                  // `value` is the payload — a row with an embedded megabyte
                  // would be re-serialized on each keystroke.
                  getSearchText={(node) => `${node.key} ${node.summary}`}
                  renderRow={({ node }) => (
                    <span className="flex min-w-0 items-baseline gap-1.5" title={node.path}>
                      <code className="shrink-0 font-mono text-[11px] text-primary">
                        {node.path === "$" ? "row" : lastSegment(node.path)}
                      </code>
                      <span className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground">
                        {node.summary}
                      </span>
                    </span>
                  )}
                />
              </div>
            )}
            {scope !== "row" && unreachable.length > 0 && (
              <p className="border-t border-border/60 pt-1 text-[10px] text-muted-foreground">
                Reachable only through <code className="font-mono">row</code>, not as a bare name:{" "}
                {unreachable.map((key) => (
                  <code key={key} className="font-mono">
                    {key}{" "}
                  </code>
                ))}
              </p>
            )}
          </section>
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              onChange(draft);
              onClose();
            }}
          >
            <Icon icon={UiCheck} className="text-[12px]" />
            Apply
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {!isClean(found) && results.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {found.empty + found.failed} of {results.length} sampled rows produce nothing — applying anyway is a
              choice, not a mistake, but it should be one you make on purpose.
            </span>
          )}
      </footer>
    </div>
  );
}

function Tally({ ok, empty, failed }: { ok: number; empty: number; failed: number }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge tone="success" variant="soft" size="md">
        {ok} evaluated
      </Badge>
      {empty > 0 && (
        <Badge tone="warning" variant="soft" size="md">
          {empty} empty
        </Badge>
      )}
      {failed > 0 && (
        <Badge tone="danger" variant="soft" size="md" icon={UiWarningTriangle}>
          {failed} failed
        </Badge>
      )}
    </div>
  );
}

/**
 * One row's result, in one line.
 *
 * `String()` on a list of objects is a row of `[object Object]`, which is the
 * same non-answer the scope panel used to give — an expression that returns
 * structure has to show its structure to be judged at all.
 */
function preview(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** The trailing key or index of a path, which is what a tree row is named by. */
function lastSegment(path: string): string {
  const match = /\.([^.[\]]+)$|\[([^[\]]+)\]$/.exec(path);
  return match?.[1] ?? match?.[2]?.replace(/^"|"$/g, "") ?? path;
}

function ResultStrip({
  result,
  index,
  pending,
  draft,
  onFix,
}: {
  result: { value?: unknown; type?: string; error?: string } | undefined;
  index: number;
  pending: boolean;
  draft: string;
  onFix: (next: string) => void;
}) {
  if (result?.error) {
    // The engine reports in the vocabulary of the Go library underneath it and
    // interpolates the whole offending value, so what it says is translated
    // and what it quotes is trimmed.
    const failure = explainCelError(result.error, draft);
    return (
      <div className="space-y-1 rounded border border-destructive/40 bg-destructive/[0.06] p-2">
        <div className="text-[11px] font-medium text-destructive">row {index + 1} — evaluation failed</div>
        <p className="text-[11px] text-destructive">{failure.message}</p>
        {failure.fix && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onFix(failure.fix!)}>
            <Icon icon={UiSparkles} className="text-[12px]" />
            Fix it
          </Button>
        )}
        <code
          className="block break-all font-mono text-[10px] text-muted-foreground"
          title={result.error}
        >
          {failure.raw}
        </code>
      </div>
    );
  }
  return (
    <div className="flex items-baseline gap-2 rounded border border-border bg-muted/40 p-2">
      <span className="text-[11px] font-medium">row {index + 1}</span>
      <Icon icon={UiArrowRight} className="text-[11px] text-muted-foreground" />
      <code
        className={cn(
          "min-w-0 flex-1 truncate font-mono text-[11px]",
          result?.value === null || result?.value === undefined ? "text-muted-foreground" : "",
        )}
      >
        {pending ? "…" : preview(result?.value)}
      </code>
      {result?.type && <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">{result.type}</span>}
    </div>
  );
}

/** Every sampled row as one cell, coloured by what the expression made of it. */
function Coverage({
  results,
  rowCount,
  focused,
  onFocus,
}: {
  results: { index: number; value?: unknown; error?: string }[];
  rowCount: number;
  focused: number;
  onFocus: (index: number) => void;
}) {
  if (rowCount === 0) return null;
  const byIndex = new Map(results.map((result) => [result.index, result]));

  return (
    <div className="space-y-1">
      <span className="text-[11px] text-muted-foreground">Sample coverage</span>
      <div className="flex flex-wrap gap-0.5">
        {Array.from({ length: rowCount }, (_, index) => {
          const result = byIndex.get(index);
          const failed = Boolean(result?.error);
          const empty = !failed && (result?.value === null || result?.value === undefined);
          return (
            <button
              key={index}
              type="button"
              aria-label={`Row ${index + 1}`}
              onClick={() => onFocus(index)}
              className={cn(
                "h-5 w-5 rounded-sm border text-[9px] tabular-nums",
                failed
                  ? "border-destructive/50 bg-destructive/20 text-destructive"
                  : empty
                    ? "border-border bg-muted text-muted-foreground"
                    : "border-green-600/40 bg-green-500/20 text-green-800 [[data-theme=dark]_&]:text-green-300",
                index === focused && "ring-2 ring-primary ring-offset-1",
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The button that opens the editor for an expression already on screen.
 *
 * Separate from the input it sits beside, because the two surfaces that own a
 * CEL string disagree about the input: a schema-rendered field is one line, and
 * the column editor gives it a textarea. What they agree on is that testing it
 * is a click away from wherever it is typed.
 */
export function CelTestButton({
  value,
  scope,
  rows,
  title,
  disabled,
  onChange,
}: {
  value: string;
  scope: CelScope;
  rows: unknown[];
  title: string;
  disabled?: boolean;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 gap-1"
        onClick={() => setOpen(true)}
        {...(disabled === undefined ? {} : { disabled })}
      >
        <Icon icon={UiCode2} className="text-[12px]" />
        Test
      </Button>
      {open && (
        <CelEditorDialog
          value={value}
          scope={scope}
          rows={rows.filter(isRecord)}
          title={title}
          onChange={onChange}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/** The schema-rendered field: the current expression, with the editor a click away. */
export function CelField({ field, ctx }: { field: FieldControl; ctx?: PostExtensionContext }) {
  const rows = useJsonPathSample(ctx?.rootValue);
  const value = (field.value as string) ?? "";

  return (
    <div className="flex items-center gap-1.5">
      <input
        className="w-full rounded border border-border bg-card px-2 py-1 font-mono text-xs"
        value={value}
        onChange={(event) => field.onChange(event.target.value)}
        aria-label="CEL expression"
        {...(field.readOnly === undefined ? {} : { disabled: field.readOnly })}
      />
      <CelTestButton
        value={value}
        scope={scopeOf(field.schema)}
        rows={rows}
        title={String(field.schema.title ?? "CEL")}
        disabled={field.readOnly === true}
        onChange={(next) => field.onChange(next)}
      />
    </div>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
