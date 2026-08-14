import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Combobox, Tabs } from "@flanksource/clicky-ui";
import { MonacoEditor } from "@flanksource/clicky-ui/monaco";
import type { Monaco } from "@flanksource/clicky-ui/monaco";
import * as monacoEditor from "monaco-editor";

import { mergeSpec, registerGomplateLanguages, spec as packagedSpec } from "../lang/index.ts";
import type { GomplateSpec, RegisteredLanguages } from "../lang/index.ts";
import { DEFAULT_API_BASE, fetchExamples, fetchSpec } from "./api.ts";
import type { EvalResponse, Example } from "./api.ts";
import { LANGUAGES, languageById } from "./languages.ts";
import type { PlaygroundLanguage } from "./languages.ts";
import { GraphPanel } from "./panels/GraphPanel.tsx";
import { ResultPanel } from "./panels/ResultPanel.tsx";
import { SpecPanel } from "./panels/SpecPanel.tsx";
import { TokensPanel } from "./panels/TokensPanel.tsx";
import { RunControls } from "./RunControls.tsx";
import { registerRunAction } from "./runAction.ts";
import { useEditorTheme } from "./useEditorTheme.ts";
import { useEvaluator } from "./useEvaluator.ts";
import { useParsedInput } from "./useParsedInput.ts";
import { VerticalSplit, rowsToPaneHeight } from "./VerticalSplit.tsx";

/** What the author is editing. Hosts persist this wherever suits them. */
export interface PlaygroundState {
  language: string;
  source: string;
  input: string;
}

export interface ExpressionPlaygroundProps {
  /**
   * Where the host mounted the playground API. Defaults to `/api`; a host
   * serving it behind a prefix passes that instead.
   */
  apiBase?: string;
  /** Languages offered. Defaults to everything gomplate evaluates. */
  languages?: PlaygroundLanguage[];
  /**
   * Samples to offer. Fetched from the server when omitted, so a host that
   * configured `Options.Examples` needs no prop at all.
   */
  examples?: Example[];
  /** Controlled state. Pair with `onChange`. */
  value?: PlaygroundState;
  onChange?: (state: PlaygroundState) => void;
  /** Starting state when uncontrolled. */
  defaultValue?: PlaygroundState;
  className?: string;
}

const SOURCE_MODEL_PATH = "inmemory://expressions/source";
const INPUT_MODEL_PATH = "inmemory://expressions/input.yaml";

const EMPTY_STATE: PlaygroundState = { language: "cel", source: "", input: "" };

/**
 * An editor for one expression, the document it runs against, and its result.
 *
 * Deliberately shell-less: it renders the editors and the output panels and
 * nothing around them, so a host frames it with its own navigation. gomplate's
 * playground wraps it in an AppShell with a language rail; an app embedding it
 * in a drawer wraps it in nothing at all.
 *
 * Highlighting, completion and hover come from the catalogue the *server*
 * reports, so a host's own functions are first-class here without this
 * component knowing anything about them.
 */
export function ExpressionPlayground({
  apiBase = DEFAULT_API_BASE,
  languages: offered = LANGUAGES,
  examples,
  value,
  onChange,
  defaultValue,
  className,
}: ExpressionPlaygroundProps) {
  const [uncontrolled, setUncontrolled] = useState<PlaygroundState>(
    () => defaultValue ?? { ...EMPTY_STATE, language: offered[0]?.id ?? "cel" },
  );
  const state = value ?? uncontrolled;

  const update = useCallback(
    (patch: Partial<PlaygroundState>) => {
      const next = { ...state, ...patch };
      if (!value) setUncontrolled(next);
      onChange?.(next);
    },
    [state, value, onChange],
  );

  const language = useMemo(
    () => languageById(state.language, offered),
    [state.language, offered],
  );
  const [outputTab, setOutputTab] = useState("result");

  const evaluator = useEvaluator(apiBase, {
    language: language.evalLanguage,
    source: state.source,
    input: state.input,
  });

  // Completion reads the document through a ref: languages are registered once,
  // before the first editor mounts, while the input keeps being edited after.
  const parsedInput = useParsedInput(state.input);
  const environmentRef = useRef<unknown>(undefined);
  environmentRef.current = parsedInput.value;

  const [served, setServed] = useState<GomplateSpec>();
  const servedRef = useRef<GomplateSpec>(undefined);
  servedRef.current = served;
  const activeSpec = useMemo(() => mergeSpec(packagedSpec, served), [served]);

  const [fetched, setFetched] = useState<Example[]>();
  const available = examples ?? fetched ?? [];
  const forLanguage = available.filter(
    (example) => example.language === language.evalLanguage,
  );

  // Registration must happen before the first model is created, or Monaco
  // resolves the language id to plaintext and never revisits it. Which of the
  // two lands first is a race -- Monaco loads slowly, the fetch returns fast --
  // so both paths apply the catalogue.
  const registered = useRef<RegisteredLanguages | null>(null);
  const registerLanguages = useCallback((monaco: Monaco) => {
    const current = servedRef.current;
    registered.current = registerGomplateLanguages(monaco, {
      environment: () => environmentRef.current,
      ...(current ? { spec: current } : {}),
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchSpec(apiBase, controller.signal).then((next) => {
      if (!controller.signal.aborted) setServed(next);
    });
    return () => controller.abort();
  }, [apiBase]);

  useEffect(() => {
    if (served) registered.current?.setSpec(served);
  }, [served]);

  useEffect(() => {
    if (examples) return;
    const controller = new AbortController();
    void fetchExamples(apiBase, controller.signal).then((next) => {
      if (!controller.signal.aborted && next) setFetched(next);
    });
    return () => controller.abort();
  }, [apiBase, examples]);

  useMarkers(evaluator.response);
  const applyTheme = useEditorTheme();

  useEffect(() => {
    if (outputTab === "spec" && !language.catalogue) setOutputTab("result");
  }, [language.catalogue, outputTab]);

  // The Monaco action is registered once per editor, so it has to reach the
  // current `run` through a ref rather than capturing it.
  const runRef = useRef(evaluator.run);
  runRef.current = evaluator.run;
  const sourceEditor = useRef<Parameters<typeof registerRunAction>[0] | null>(null);
  const onEditorMount = useCallback(
    (editor: Parameters<typeof registerRunAction>[0], monaco: Monaco) => {
      applyTheme();
      registerRunAction(editor, monaco, () => runRef.current());
      if (editor.getModel()?.uri.toString() === SOURCE_MODEL_PATH) sourceEditor.current = editor;
    },
    [applyTheme],
  );

  /** Writes a path from the object graph where the author last left the caret. */
  const insertExpression = useCallback((expression: string) => {
    const editor = sourceEditor.current;
    const selection = editor?.getSelection();
    if (!editor || !selection) return;
    editor.executeEdits("object-graph", [
      { range: selection, text: expression, forceMoveMarkers: true },
    ]);
    editor.focus();
  }, []);

  const catalogue = language.catalogue ? activeSpec[language.catalogue].functions : [];

  return (
    <div className={`flex h-full min-h-0 ${className ?? ""}`}>
      <div className="flex min-h-0 w-1/2 flex-col border-r border-border">
        <VerticalSplit
          storageKey="expressions:editor-split"
          defaultTopHeight={rowsToPaneHeight(language.editorRows)}
          top={
            <EditorPane
              label="Expression"
              actions={<RunControls evaluator={evaluator} />}
              hint={
                forLanguage.length > 0 ? (
                  <Combobox
                    options={forLanguage.map((example) => ({
                      value: example.name,
                      label: example.name,
                    }))}
                    value=""
                    allowCustomValue={false}
                    placeholder="Load an example…"
                    ariaLabel="Load an example"
                    className="w-56"
                    onChange={(name) => {
                      const example = forLanguage.find((candidate) => candidate.name === name);
                      if (example) update({ source: example.source, input: example.input });
                    }}
                  />
                ) : undefined
              }
            >
              <MonacoEditor
                value={state.source}
                onChange={(source) => update({ source: source ?? "" })}
                language={language.editorLanguage}
                path={SOURCE_MODEL_PATH}
                height="100%"
                beforeMount={registerLanguages}
                onMount={onEditorMount}
              />
            </EditorPane>
          }
          bottom={
            <EditorPane
              label="Input"
              hint={
                <span
                  className={`truncate text-[11px] ${
                    parsedInput.error ? "text-destructive" : "text-muted-foreground/70"
                  }`}
                  title={parsedInput.error ?? undefined}
                >
                  {parsedInput.error ?? "YAML or JSON"}
                </span>
              }
            >
              <MonacoEditor
                value={state.input}
                onChange={(input) => update({ input: input ?? "" })}
                language="yaml"
                path={INPUT_MODEL_PATH}
                height="100%"
                onMount={onEditorMount}
              />
            </EditorPane>
          }
        />
      </div>

      <div className="flex min-h-0 w-1/2 flex-col">
        <div className="border-b border-border px-4">
          <Tabs
            tabs={[
              { id: "result", label: "Result" },
              { id: "graph", label: "Object graph" },
              { id: "tokens", label: "Tokens" },
              ...(language.catalogue
                ? [{ id: "spec", label: "Functions", count: catalogue.length }]
                : []),
            ]}
            value={outputTab}
            onChange={setOutputTab}
          />
        </div>

        <div className="min-h-0 flex-1">
          {outputTab === "result" ? (
            <ResultPanel
              response={evaluator.response}
              pending={evaluator.pending}
              stale={evaluator.stale}
              onRun={evaluator.run}
            />
          ) : null}
          {outputTab === "graph" ? (
            <GraphPanel
              document={parsedInput.value}
              languageId={language.editorLanguage}
              onInsert={insertExpression}
            />
          ) : null}
          {outputTab === "tokens" ? (
            <TokensPanel source={state.source} languageId={language.editorLanguage} />
          ) : null}
          {outputTab === "spec" && language.catalogue ? (
            <SpecPanel flavour={language.catalogue} spec={activeSpec} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EditorPane({
  label,
  hint,
  actions,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex h-[33px] shrink-0 items-center justify-between gap-2 px-4 py-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </h2>
          {hint}
        </div>
        {actions}
      </header>
      <div className="min-h-0 flex-1 [&_[data-slot=monaco-editor]]:h-full [&_[data-slot=monaco-editor]]:rounded-none [&_[data-slot=monaco-editor]]:border-0 [&_[data-slot=monaco-editor]]:border-t">
        {children}
      </div>
    </section>
  );
}

/**
 * Mirrors a compile error onto the editor as a marker, so the position the
 * server reported is visible where the mistake is rather than only in the
 * result panel.
 */
function useMarkers(response: EvalResponse | null) {
  useEffect(() => {
    const model = monacoEditor.editor
      .getModels()
      .find((candidate) => candidate.uri.toString() === SOURCE_MODEL_PATH);
    if (!model) return;

    const error = response?.error;
    if (!error?.line) {
      monacoEditor.editor.setModelMarkers(model, "expressions", []);
      return;
    }

    const column = error.column ?? 1;
    monacoEditor.editor.setModelMarkers(model, "expressions", [
      {
        severity: monacoEditor.MarkerSeverity.Error,
        message: error.message,
        startLineNumber: error.line,
        startColumn: column,
        endLineNumber: error.line,
        endColumn: column + 1,
      },
    ]);
  }, [response]);
}
