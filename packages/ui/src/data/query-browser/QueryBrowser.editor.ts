import { autocompletion } from "@codemirror/autocomplete";
import { history, historyKeymap } from "@codemirror/commands";
import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import type { Extension } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import {
  dialectFor,
  openSearchJSONCompletionSource,
  sqlCompletionNamespace,
  type QueryBrowserCompletion,
} from "./QueryBrowser.completion";

export type QueryBrowserLanguage = "sql" | "json" | "text";
export type QueryBrowserHistoryEntry = { query: string; at: number };

const MAX_HISTORY = 50;

function historyKey(id: string) {
  return `clicky-ui:query-browser:${id}:history`;
}

export function readQueryBrowserHistory(
  id: string,
): QueryBrowserHistoryEntry[] {
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

export function rememberQueryBrowserQuery(
  id: string,
  query: string,
): QueryBrowserHistoryEntry[] {
  const entries = readQueryBrowserHistory(id).filter(
    (entry) => entry.query !== query,
  );
  const next = [{ query, at: Date.now() }, ...entries].slice(0, MAX_HISTORY);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(historyKey(id), JSON.stringify(next));
  }
  return next;
}

export function queryBrowserEditorExtensions(
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

export function queryBrowserLanguageExtension(
  language: QueryBrowserLanguage,
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
