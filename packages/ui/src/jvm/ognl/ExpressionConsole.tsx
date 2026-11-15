import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "../../components/button";
import { InputField } from "../../components/InputField";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Select } from "../../components/select";
import { UiPlay, UiTrash, UiUpload } from "../../icons";
import { cn } from "../../lib/utils";
import { InlineError } from "../../rpc/InlineError";
import type { ExpressionLanguage, ExpressionPreset } from "../model/expressions";
import type { JvmClassLoader } from "../protocol/types";
import { readFileText } from "./read-file-text";

export type ExpressionLoaderChoice = {
  options: JvmClassLoader[];
  /** Selected loader hash; `""` evaluates in the agent's default loader. */
  value: string;
  onChange: (hash: string) => void;
};

export type ExpressionConsoleProps = {
  language: ExpressionLanguage;
  onLanguageChange: (language: ExpressionLanguage) => void;
  expression: string;
  onExpressionChange: (expression: string) => void;
  /** Every preset the host offers; the console shows those of the current language. */
  presets: ExpressionPreset[];
  /** Newest-first expressions of the current language, owned by the host. */
  history: string[];
  onHistoryChange: (history: string[]) => void;
  /** Evaluation is permitted (runtime, host and operator agree); the draft stays editable either way. */
  canRun: boolean;
  running: boolean;
  onRun: () => void;
  /** Evaluate in a chosen class loader. Omit to hide the picker. */
  loaders?: ExpressionLoaderChoice;
  /** Rendered beside Run, e.g. the mutation gate. */
  toolbar?: ReactNode;
  className?: string;
};

const LANGUAGE_OPTIONS = [
  { id: "ognl" as const, label: "OGNL" },
  { id: "groovy" as const, label: "Groovy" },
];

const TITLES: Record<ExpressionLanguage, string> = { ognl: "OGNL expression", groovy: "Groovy script" };

function ExpressionList({ language, presets, history, onSelect, onClearHistory }: { language: ExpressionLanguage; presets: ExpressionPreset[]; history: string[]; onSelect: (expression: string) => void; onClearHistory: () => void }) {
  const shown = presets.filter((preset) => preset.language === language);
  return (
    <div className="flex min-h-0 flex-col gap-4 overflow-auto">
      <section aria-label="Presets">
        <h3 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Presets</h3>
        {shown.length === 0 ? <p className="text-xs text-muted-foreground">No presets for {language === "ognl" ? "OGNL" : "Groovy"}.</p> : null}
        {shown.map((preset) => (
          <button key={`${preset.label}:${preset.expression}`} type="button" onClick={() => onSelect(preset.expression)} className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted">
            <span className="font-medium">{preset.label}</span>
            <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">{preset.expression}</span>
          </button>
        ))}
      </section>
      {history.length > 0 ? (
        <section aria-label="History">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">History</h3>
            <Button size="sm" variant="ghost" aria-label="Clear history" onClick={onClearHistory}>
              <UiTrash /> Clear
            </Button>
          </div>
          {history.map((entry) => (
            <button key={entry} type="button" title={entry} onClick={() => onSelect(entry)} className="block w-full truncate rounded px-2 py-1 text-left font-mono text-xs hover:bg-muted">
              {entry}
            </button>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function GroovyFileLoader({ onLoad }: { onLoad: (source: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<unknown>();
  return (
    <>
      <input
        ref={input}
        type="file"
        accept=".groovy,text/plain"
        aria-label="Load Groovy file"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          setError(undefined);
          void readFileText(file).then(onLoad, setError);
        }}
      />
      <Button size="sm" variant="outline" type="button" onClick={() => input.current?.click()}>
        <UiUpload /> Load file
      </Button>
      {error ? <InlineError title="Could not read the Groovy file" error={error} /> : null}
    </>
  );
}

/** Presets and history beside an OGNL or Groovy editor with language, class loader and Run. Everything is lifted; the host evaluates. */
export function ExpressionConsole({ language, onLanguageChange, expression, onExpressionChange, presets, history, onHistoryChange, canRun, running, onRun, loaders, toolbar, className }: ExpressionConsoleProps) {
  const runnable = canRun && !running && expression.trim() !== "";
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    if (runnable) onRun();
  };
  const selectableLoaders = loaders?.options.filter((loader) => !loader.virtual) ?? [];

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-3 md:flex-row", className)}>
      <div className="min-h-0 md:w-64 md:shrink-0">
        <ExpressionList language={language} presets={presets} history={history} onSelect={onExpressionChange} onClearHistory={() => onHistoryChange([])} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl size="sm" aria-label="Language" options={LANGUAGE_OPTIONS} value={language} onChange={onLanguageChange} />
          {loaders ? (
            <Select aria-label="Class loader" className="w-56" value={loaders.value} onChange={(event) => loaders.onChange(event.target.value)}>
              <option value="">Default loader</option>
              {selectableLoaders.map((loader) => (
                <option key={loader.hash} value={loader.hash}>
                  {loader.label}
                </option>
              ))}
            </Select>
          ) : null}
          {language === "groovy" ? <GroovyFileLoader onLoad={onExpressionChange} /> : null}
        </div>
        <InputField
          as="textarea"
          aria-label={TITLES[language]}
          spellCheck={false}
          rows={6}
          className="min-h-0 flex-1"
          inputClassName="h-full font-mono"
          value={expression}
          onChange={(value) => onExpressionChange(value)}
          onKeyDown={onKeyDown}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>{toolbar}</div>
          <Button type="button" loading={running} disabled={!runnable} title="Run (Ctrl+Enter)" onClick={onRun}>
            <UiPlay /> Run
          </Button>
        </div>
      </div>
    </div>
  );
}
