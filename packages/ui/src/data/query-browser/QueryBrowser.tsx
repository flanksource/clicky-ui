import { Compartment, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../components/button";
import { JsonSchemaForm } from "../../components/JsonSchemaForm";
import { cn } from "../../lib/utils";
import { SplitPane } from "../../layout/SplitPane";
import { Icon } from "../Icon";
import { UiDebug, UiPlay } from "../../icons";
import type { DataTablePagination } from "../DataTable";
import { inferColumns } from "../data-table-utils";
import type { DataTableFilterSelection } from "../data-table-filter-values";
import {
  serverColumnsToDataTableColumns,
  serverFiltersToFilterBar,
  type DataTableFilterLookup,
  type DataTableServerColumn,
} from "../data-table-server-filters";
import { ErrorDetails } from "../diagnostics/ErrorDetails";
import type { ErrorDiagnostics } from "../diagnostics/error-diagnostics";
import {
  queryBrowserEditorExtensions,
  queryBrowserLanguageExtension,
  readQueryBrowserHistory,
  rememberQueryBrowserQuery,
  type QueryBrowserHistoryEntry,
} from "./QueryBrowser.editor";
import { QueryBrowserDiagnosticsPanel } from "./QueryBrowserDiagnosticsPanel";
import { QueryBrowserResults } from "./QueryBrowserResults";
import {
  QueryBrowserExecutionError,
  type QueryBrowserDiagnostics,
  type QueryBrowserProps,
  type QueryBrowserRequest,
  type QueryBrowserResult,
} from "./QueryBrowser.types";

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
  const [error, setError] = useState<{
    message: string;
    query: string;
    diagnostics?: QueryBrowserDiagnostics;
    errorDetails?: ErrorDiagnostics;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const [debug, setDebug] = useState(false);
  const [entries, setEntries] = useState<QueryBrowserHistoryEntry[]>(() =>
    readQueryBrowserHistory(id),
  );
  const [filters, setFilters] = useState<DataTableFilterSelection>({});
  // What the displayed result came from. A filter re-runs *this*, never the
  // editor's current text — otherwise changing a pill would execute a
  // half-typed edit nobody asked to run.
  const lastRun = useRef<{
    query: string;
    options: Record<string, unknown>;
    filters?: DataTableFilterSelection;
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
          ...(request.filters ? { filters: request.filters } : {}),
          ...(next.columns ? { columns: next.columns } : {}),
        };
      } catch (err) {
        setError({
          message: err instanceof Error ? err.message : String(err),
          query: request.query,
          ...(err instanceof QueryBrowserExecutionError && err.diagnostics
            ? { diagnostics: err.diagnostics }
            : {}),
          ...(err instanceof QueryBrowserExecutionError && err.errorDetails
            ? { errorDetails: err.errorDetails }
            : {}),
        });
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
    setEntries(rememberQueryBrowserQuery(id, query));
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
      ...(debug ? { debug: true } : {}),
    });
  }, [currentQuery, debug, filters, id, options, pending, runRequest]);

  // A filter pill is not a draft the way query text is: it commits a discrete
  // value on selection, and the bar already debounces its free-text fields. So
  // a change re-runs the last executed query immediately rather than waiting
  // for Run, which is also how the profile catalog behaves.
  const rerunWithFilters = useCallback(
    async (selection: DataTableFilterSelection) => {
      const previous = lastRun.current;
      if (!previous) {
        throw new Error(
          "QueryBrowser: a filter changed before any query had run",
        );
      }
      await runRequest({
        ...previous,
        filters: selection,
        ...(result?.pagination
          ? { pagination: { limit: result.pagination.limit } }
          : {}),
        ...(debug ? { debug: true } : {}),
      });
    },
    [debug, result?.pagination, runRequest],
  );

  const rerunAt = useCallback(
    async (pagination: NonNullable<QueryBrowserRequest["pagination"]>) => {
      const previous = lastRun.current;
      if (!previous) {
        throw new Error(
          "QueryBrowser: pagination changed before any query had run",
        );
      }
      await runRequest({
        ...previous,
        pagination,
        ...(debug ? { debug: true } : {}),
      });
    },
    [debug, runRequest],
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
        extensions: queryBrowserEditorExtensions(
          () => executeRef.current(),
          (query) => onQueryChangeRef.current?.(query),
          languageConfig.current.of(
            queryBrowserLanguageExtension(language, completion),
          ),
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
        queryBrowserLanguageExtension(language, completion),
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
    setEntries(readQueryBrowserHistory(id));
    setResult(null);
    setError(null);
    setFilters({});
    setDebug(false);
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
        throw new Error(
          "QueryBrowser: a filter lookup ran before any query had",
        );
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
  const tablePagination = useMemo<DataTablePagination | undefined>(() => {
    const pagination = result?.pagination;
    if (!pagination) return undefined;
    const shared = {
      pageSize: pagination.limit,
      ...(pagination.total !== undefined ? { total: pagination.total } : {}),
      ...(pagination.totalRelation === "eq" ||
      pagination.totalRelation === "gte"
        ? { totalRelation: pagination.totalRelation }
        : {}),
      hasMore: pagination.hasMore,
      onPageSizeChange: (limit: number) => void rerunAt({ limit }),
    };
    if (pagination.mode === "cursor") {
      return {
        ...shared,
        page: 0,
        cursor: {
          ...(pagination.cursor ? { current: pagination.cursor } : {}),
          ...(pagination.nextCursor ? { next: pagination.nextCursor } : {}),
          onCursorChange: (cursor: string | undefined) =>
            void rerunAt({
              limit: pagination.limit,
              ...(cursor ? { cursor } : {}),
            }),
        },
      };
    }
    const page = Math.floor((pagination.offset ?? 0) / pagination.limit);
    return {
      ...shared,
      page,
      onPageChange: (nextPage: number) =>
        void rerunAt({
          limit: pagination.limit,
          offset: nextPage * pagination.limit,
        }),
    };
  }, [rerunAt, result?.pagination]);
  const defaultResults = (
    <QueryBrowserResults
      result={result}
      pending={pending}
      {...(title ? { title } : {})}
      queryLabel={queryLabel}
      columns={columns}
      filterConfig={filterConfig}
      serverFiltered={serverFiltered}
      {...(tablePagination ? { pagination: tablePagination } : {})}
    />
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
          variant={debug ? "secondary" : "outline"}
          aria-pressed={debug}
          onClick={() => setDebug((enabled) => !enabled)}
        >
          <Icon icon={UiDebug} className="size-4" />
          Debug
        </Button>
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
          <div className="space-y-3">
            <ErrorDetails
              diagnostics={{
                ...(error.errorDetails ?? {
                  message: error.message,
                  context: [],
                }),
                context: [
                  ...(error.errorDetails?.context ?? []),
                  ["Query", error.query],
                  ["Language", language],
                ],
              }}
            />
            {error.diagnostics && (
              <QueryBrowserDiagnosticsPanel diagnostics={error.diagnostics} />
            )}
          </div>
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
