import { history, historyKeymap } from "@codemirror/commands";
import { autocompletion } from "@codemirror/autocomplete";
import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "../../components/button";
import { JsonSchemaForm } from "../../components/JsonSchemaForm";
import type { JsonSchemaObject } from "../../components/json-schema-form-types";
import { cn } from "../../lib/utils";
import { SplitPane } from "../../layout/SplitPane";
import { Icon } from "../Icon";
import { UiPlay } from "../../icons";
import { DataTable } from "../DataTable";
import { inferColumns } from "../data-table-utils";
import type { DataTableFilterSelection } from "../data-table-filter-values";
import {
  serverColumnsToDataTableColumns,
  serverFiltersToFilterBar,
  type DataTableFilterLookup,
  type DataTableFilterLookupRequest,
  type DataTableFilterLookupResult,
  type DataTableServerColumn,
} from "../data-table-server-filters";
import { ErrorDetails } from "../diagnostics/ErrorDetails";
import { Properties } from "../Properties";
import {
  dialectFor,
  openSearchJSONCompletionSource,
  sqlCompletionNamespace,
  type QueryBrowserCompletion,
} from "./QueryBrowser.completion";

export type QueryBrowserResult = {
  rows?: Record<string, unknown>[];
  /**
   * How the source describes the columns it returned, including which of them
   * it can narrow on. Present columns replace the ones inferred from the rows,
   * so a filterable result is described rather than guessed at.
   */
  columns?: DataTableServerColumn[];
  affectedRows?: number;
  durationMs?: number;
  message?: string;
  truncated?: boolean;
  /** Where a truncated read stopped, so the bound can be named rather than
   * merely hinted at with a trailing "+". */
  limit?: number;
  metadata?: Record<string, unknown>;
};

export type QueryBrowserRequest = {
  query: string;
  options: Record<string, unknown>;
  /** The filter pills the user picked, if the last result described any. */
  filters?: DataTableFilterSelection;
  /**
   * The columns the last result described, echoed back so a filter binds to
   * what the source offered rather than to whatever the narrowed result
   * describes. Sources that have a catalog of their own ignore it.
   */
  columns?: DataTableServerColumn[];
};

/**
 * A filter value type-ahead, carrying the context the source needs to scope its
 * suggestions: the last *executed* query and the rest of the selection, so a
 * value list only offers values that would still return rows.
 */
export type QueryBrowserFilterLookupRequest = DataTableFilterLookupRequest & {
  query: string;
  options: Record<string, unknown>;
  filters: DataTableFilterSelection;
  columns?: DataTableServerColumn[];
};

export type QueryBrowserFilterLookup = (
  request: QueryBrowserFilterLookupRequest,
) => Promise<DataTableFilterLookupResult>;

export type QueryBrowserResultContext = {
  result: QueryBrowserResult;
  defaultView: ReactNode;
};

export type QueryBrowserProps = {
  id: string;
  title?: string;
  language?: "sql" | "json" | "text";
  initialQuery?: string;
  queryLabel?: string;
  optionsSchema?: JsonSchemaObject;
  initialOptions?: Record<string, unknown>;
  completion?: QueryBrowserCompletion;
  onQueryChange?: (query: string) => void;
  onOptionsChange?: (options: Record<string, unknown>) => void;
  navigator?: ReactNode;
  execute: (request: QueryBrowserRequest) => Promise<QueryBrowserResult>;
  /**
   * Answers a filter's value type-ahead. Absent leaves every described filter
   * showing only the options the result carried.
   */
  lookupFilterValues?: QueryBrowserFilterLookup;
  renderResults?: (context: QueryBrowserResultContext) => ReactNode;
  className?: string;
};

type HistoryEntry = { query: string; at: number };

const MAX_HISTORY = 50;

function historyKey(id: string) {
  return `clicky-ui:query-browser:${id}:history`;
}

function readHistory(id: string): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(
      window.localStorage.getItem(historyKey(id)) ?? "[]",
    );
    return Array.isArray(value) ? value.slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

function rememberQuery(id: string, query: string): HistoryEntry[] {
  const entries = readHistory(id).filter((entry) => entry.query !== query);
  const next = [{ query, at: Date.now() }, ...entries].slice(0, MAX_HISTORY);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(historyKey(id), JSON.stringify(next));
  }
  return next;
}

function editorExtensions(
  execute: () => void,
  onQueryChange: (query: string) => void,
  languageExtension: Extension,
) {
  return [
    history(),
    keymap.of([
      {
        key: "Mod-Enter",
        run: () => {
          execute();
          return true;
        },
      },
      ...historyKeymap,
    ]),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) onQueryChange(update.state.doc.toString());
    }),
    EditorView.theme({
      "&": { height: "100%", fontSize: "13px", background: "transparent" },
      ".cm-scroller": {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      },
      ".cm-content": { padding: "12px 0" },
      ".cm-gutters": { background: "transparent", border: "none" },
      "&.cm-focused": { outline: "none" },
    }),
    languageExtension,
  ];
}

function languageExtension(
  language: QueryBrowserProps["language"],
  completion?: QueryBrowserCompletion,
): Extension {
  if (language === "sql") {
    if (completion?.kind !== "sql") return sql();
    return sql({
      dialect: dialectFor(completion.dialect),
      schema: sqlCompletionNamespace(completion.schemas),
      upperCaseKeywords: true,
      ...(completion.defaultSchema
        ? { defaultSchema: completion.defaultSchema }
        : {}),
    });
  }
  if (language === "json") {
    if (completion?.kind !== "json-fields") return json();
    return [
      json(),
      autocompletion({
        override: [openSearchJSONCompletionSource(completion.fields)],
      }),
    ];
  }
  return [];
}

export function QueryBrowser({
  id,
  title,
  language = "text",
  initialQuery = "",
  queryLabel = "Query",
  optionsSchema,
  initialOptions,
  completion,
  onQueryChange,
  onOptionsChange,
  navigator,
  execute,
  lookupFilterValues,
  renderResults,
  className,
}: QueryBrowserProps) {
  const editorHost = useRef<HTMLDivElement | null>(null);
  const editor = useRef<EditorView | null>(null);
  const languageConfig = useRef(new Compartment());
  const executeRef = useRef<() => void>(() => undefined);
  const onQueryChangeRef = useRef(onQueryChange);
  const [options, setOptions] = useState<Record<string, unknown>>(
    initialOptions ?? {},
  );
  const [result, setResult] = useState<QueryBrowserResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>(() => readHistory(id));
  const [filters, setFilters] = useState<DataTableFilterSelection>({});
  // What the displayed result came from. A filter re-runs *this*, never the
  // editor's current text — otherwise changing a pill would execute a
  // half-typed edit nobody asked to run.
  const lastRun = useRef<{
    query: string;
    options: Record<string, unknown>;
    columns?: DataTableServerColumn[];
  } | null>(null);
  const executedFilters = useRef<DataTableFilterSelection>({});

  // Every run goes through here so the record a filter re-runs from is refreshed
  // in one place: the query, its options, and the columns the source described,
  // which are what a subsequent selection binds to.
  const runRequest = useCallback(
    async (request: QueryBrowserRequest) => {
      setPending(true);
      setError(null);
      const started = performance.now();
      try {
        const next = await execute(request);
        setResult({
          ...next,
          durationMs: next.durationMs ?? performance.now() - started,
        });
        lastRun.current = {
          query: request.query,
          options: request.options,
          ...(next.columns ? { columns: next.columns } : {}),
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setPending(false);
      }
    },
    [execute],
  );

  const currentQuery = useCallback(() => {
    const view = editor.current;
    if (!view) return initialQuery;
    const selection = view.state.selection.main;
    if (!selection.empty)
      return view.state.sliceDoc(selection.from, selection.to);
    return view.state.doc.toString();
  }, [initialQuery]);

  const run = useCallback(async () => {
    const query = currentQuery().trim();
    if (!query || pending) return;
    setEntries(rememberQuery(id, query));
    // A different statement is a different result set, so neither its filters
    // nor the columns they bind to survive: both name columns the new query may
    // not return.
    const repeat = lastRun.current?.query === query ? lastRun.current : null;
    const carried = repeat ? filters : {};
    if (carried !== filters) setFilters(carried);
    lastRun.current = { query, options };
    executedFilters.current = carried;
    await runRequest({
      query,
      options,
      ...(Object.keys(carried).length > 0 ? { filters: carried } : {}),
      ...(repeat?.columns ? { columns: repeat.columns } : {}),
    });
  }, [currentQuery, filters, id, options, pending, runRequest]);

  // A filter pill is not a draft the way query text is: it commits a discrete
  // value on selection, and the bar already debounces its free-text fields. So
  // a change re-runs the last executed query immediately rather than waiting
  // for Run, which is also how the profile catalog behaves.
  const rerunWithFilters = useCallback(
    async (selection: DataTableFilterSelection) => {
      const previous = lastRun.current;
      if (!previous) {
        throw new Error("QueryBrowser: a filter changed before any query had run");
      }
      await runRequest({ ...previous, filters: selection });
    },
    [runRequest],
  );

  useEffect(() => {
    if (!lastRun.current) return;
    if (filters === executedFilters.current) return;
    executedFilters.current = filters;
    void rerunWithFilters(filters);
  }, [filters, rerunWithFilters]);

  executeRef.current = () => void run();
  onQueryChangeRef.current = onQueryChange;

  useEffect(() => {
    if (!editorHost.current) return;
    const view = new EditorView({
      parent: editorHost.current,
      state: EditorState.create({
        doc: initialQuery,
        extensions: editorExtensions(
          () => executeRef.current(),
          (query) => onQueryChangeRef.current?.(query),
          languageConfig.current.of(languageExtension(language, completion)),
        ),
      }),
    });
    editor.current = view;
    return () => {
      editor.current = null;
      view.destroy();
    };
  }, [id, language]);

  useEffect(() => {
    const view = editor.current;
    if (!view) return;
    view.dispatch({
      effects: languageConfig.current.reconfigure(
        languageExtension(language, completion),
      ),
    });
  }, [completion, language]);

  useEffect(() => {
    const view = editor.current;
    if (!view || view.state.doc.toString() === initialQuery) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: initialQuery },
    });
  }, [initialQuery]);

  useEffect(() => {
    setOptions(initialOptions ?? {});
  }, [initialOptions]);

  const updateOptions = useCallback(
    (next: Record<string, unknown>) => {
      setOptions(next);
      onOptionsChange?.(next);
    },
    [onOptionsChange],
  );

  useEffect(() => {
    setEntries(readHistory(id));
    setResult(null);
    setError(null);
    setFilters({});
    lastRun.current = null;
    executedFilters.current = {};
  }, [id]);

  const rows = result?.rows ?? [];
  const described = result?.columns ?? [];
  const columns = useMemo(
    () =>
      described.length > 0
        ? serverColumnsToDataTableColumns<Record<string, unknown>>(described)
        : inferColumns(rows, { literalKeys: true }),
    [described, rows],
  );
  const lookupValues = useMemo<DataTableFilterLookup | undefined>(() => {
    if (!lookupFilterValues) return undefined;
    return (request) => {
      const previous = lastRun.current;
      if (!previous) {
        throw new Error("QueryBrowser: a filter lookup ran before any query had");
      }
      return lookupFilterValues({ ...request, ...previous, filters });
    };
  }, [filters, lookupFilterValues]);
  const filterConfig = useMemo(
    () =>
      serverFiltersToFilterBar(
        described,
        filters,
        setFilters,
        lookupValues ? { lookupValues } : {},
      ),
    [described, filters, lookupValues],
  );
  const serverFiltered =
    filterConfig.filters.length > 0 || filterConfig.timeRange !== undefined;
  const defaultResults = result ? (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>
          {rows.length.toLocaleString()} rows{result.truncated ? "+" : ""}
        </span>
        {/* A "+" says there is more without saying the console stopped, which
            reads as a small table rather than a bounded read. Naming the bound
            is what makes the difference visible. */}
        {result.truncated && (
          <span className="text-amber-600 [[data-theme=dark]_&]:text-amber-400">
            stopped at the console's {(result.limit ?? rows.length).toLocaleString()}-row bound;
            narrow the query to see the rest
          </span>
        )}
        {result.affectedRows !== undefined && (
          <span>{result.affectedRows.toLocaleString()} affected</span>
        )}
        {result.durationMs !== undefined && (
          <span>{Math.round(result.durationMs)} ms</span>
        )}
        {result.message && <span>{result.message}</span>}
      </div>
      {/* A described result keeps its table at zero rows: a filter that
          excluded everything must not unmount the bar that would undo it. */}
      {rows.length > 0 || described.length > 0 ? (
        <DataTable
          data={rows}
          columns={columns}
          loading={pending}
          autoFilter={false}
          {...(serverFiltered
            ? {
                manualFilter: true,
                externalFilters: filterConfig.filters,
                ...(filterConfig.timeRange ? { externalTimeRange: filterConfig.timeRange } : {}),
              }
            : { showGlobalFilter: true })}
          showFullscreenControl
          fullscreenTitle={title ?? queryLabel}
          detailStyle="dialog"
          detailDialogTitle="Row details"
          renderExpandedRow={(row) => (
            <Properties
              items={Object.entries(row).map(([key, value]) => ({
                key,
                value,
              }))}
              renderLabel={(key) => key}
              density="compact"
            />
          )}
          className="min-h-0 flex-1"
        />
      ) : (
        <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
          {result.message ?? "Statement completed with no rows."}
        </div>
      )}
    </div>
  ) : (
    <div className="grid min-h-40 place-items-center text-sm text-muted-foreground">
      Run a query to see results.
    </div>
  );

  const workspace = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
        <div className="min-w-0 flex-1">
          {title && <h2 className="truncate text-sm font-semibold">{title}</h2>}
          <p className="text-xs text-muted-foreground">{queryLabel}</p>
        </div>
        {entries.length > 0 && (
          <select
            aria-label="Query history"
            defaultValue=""
            onChange={(event) => {
              const query = event.target.value;
              const view = editor.current;
              if (!view || !query) return;
              view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: query },
              });
              event.target.value = "";
            }}
            className="h-8 max-w-52 rounded-md border bg-background px-2 text-xs"
          >
            <option value="">History</option>
            {entries.map((entry) => (
              <option key={`${entry.at}:${entry.query}`} value={entry.query}>
                {entry.query.replace(/\s+/g, " ").slice(0, 80)}
              </option>
            ))}
          </select>
        )}
        <Button
          size="sm"
          onClick={() => void run()}
          loading={pending}
          loadingLabel={pending ? "Running" : undefined}
        >
          <Icon icon={UiPlay} className="size-4" />
          Run
        </Button>
      </div>
      {optionsSchema &&
        Object.keys(optionsSchema.properties ?? {}).length > 0 && (
          <div className="border-b px-3 py-2">
            <JsonSchemaForm
              schema={optionsSchema}
              value={options}
              onChange={updateOptions}
              size="sm"
              inline
              showPreferencesMenu={false}
              persistPreferences={false}
            />
          </div>
        )}
      <div ref={editorHost} className="h-[34%] min-h-44 border-b" />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto p-3">
        {error ? (
          <ErrorDetails
            diagnostics={{
              message: error,
              context: [
                ["Query", currentQuery()],
                ["Language", language],
              ],
            }}
          />
        ) : result && renderResults ? (
          renderResults({ result, defaultView: defaultResults })
        ) : (
          defaultResults
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("h-[calc(100vh-15rem)] min-h-[32rem]", className)}>
      {navigator ? (
        <SplitPane defaultSplit={28} left={navigator} right={workspace} />
      ) : (
        workspace
      )}
    </div>
  );
}
