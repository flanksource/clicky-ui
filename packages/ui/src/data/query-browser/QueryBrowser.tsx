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
import { ErrorDetails } from "../diagnostics/ErrorDetails";
import { Properties } from "../Properties";
import {
  dialectFor,
  openSearchJSONCompletionSource,
  sqlCompletionNamespace,
  type QueryBrowserCompletion,
} from "./QueryBrowser.completion";

export type QueryBrowserColumn = {
  name: string;
  databaseType?: string;
};

export type QueryBrowserResult = {
  rows?: Record<string, unknown>[];
  columns?: QueryBrowserColumn[];
  affectedRows?: number;
  durationMs?: number;
  message?: string;
  truncated?: boolean;
  metadata?: Record<string, unknown>;
};

export type QueryBrowserRequest = {
  query: string;
  options: Record<string, unknown>;
};

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
    setPending(true);
    setError(null);
    setEntries(rememberQuery(id, query));
    const started = performance.now();
    try {
      const next = await execute({ query, options });
      setResult({
        ...next,
        durationMs: next.durationMs ?? performance.now() - started,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }, [currentQuery, execute, id, options, pending]);

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
  }, [id]);

  const rows = result?.rows ?? [];
  const columns = useMemo(
    () => inferColumns(rows, { literalKeys: true }),
    [rows],
  );
  const defaultResults = result ? (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>
          {rows.length.toLocaleString()} rows{result.truncated ? "+" : ""}
        </span>
        {result.affectedRows !== undefined && (
          <span>{result.affectedRows.toLocaleString()} affected</span>
        )}
        {result.durationMs !== undefined && (
          <span>{Math.round(result.durationMs)} ms</span>
        )}
        {result.message && <span>{result.message}</span>}
      </div>
      {rows.length > 0 ? (
        <DataTable
          data={rows}
          columns={columns}
          autoFilter={false}
          showGlobalFilter
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
