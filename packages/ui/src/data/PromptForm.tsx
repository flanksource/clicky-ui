import { useState, type ReactNode } from "react";
import { Button } from "../components/button";
import { JsonSchemaForm } from "../components/JsonSchemaForm";
import type { LookupFetcher } from "../components/json-schema-form-runtime-types";
import { answerPrompt, type PromptSnapshot } from "../hooks/use-prompts";

export interface PromptFormProps {
  /** The pending prompt to answer. Its `schema` drives the rendered form. */
  prompt: PromptSnapshot;
  /** Base path the prompt API is mounted under, e.g. "/api/todos". */
  basePath: string;
  /** Called after the prompt is successfully answered or cancelled. */
  onResolved?: (() => void) | undefined;
  /** Resolves the options of the schema's `x-clicky-lookup` fields (e.g. a connection picker). */
  lookupFetcher?: LookupFetcher | undefined;
  /** Prefix for the form's field ids; give each copy of the same prompt on a page its own. Defaults to `prompt-<id>`. */
  idPrefix?: string | undefined;
  /**
   * Lays out the form and its Submit/Cancel actions. PromptDialog pins the
   * actions in its Modal footer; without a frame the prompt's title and
   * description head the form and the actions sit below it.
   */
  frame?: ((parts: { form: ReactNode; actions: ReactNode }) => ReactNode) | undefined;
}

// PromptForm renders a pending prompt's JSON Schema via the generic
// JsonSchemaForm and POSTs the answer back to the prompt manager: Submit sends
// the values, Cancel sends `{cancelled: true}`. PromptDialog is this form in a
// Modal; a host can also render it inline, beside what the prompt is about.
export function PromptForm({ prompt, basePath, onResolved, lookupFetcher, idPrefix, frame }: PromptFormProps) {
  const [value, setValue] = useState<Record<string, unknown>>(() => ({ ...prompt.value }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Handed another prompt, start over from its value; a refetched snapshot of the same prompt keeps the edits.
  const [answering, setAnswering] = useState(prompt.id);
  if (answering !== prompt.id) {
    setAnswering(prompt.id);
    setValue({ ...prompt.value });
    setBusy(false);
    setError(null);
  }

  const resolve = async (answer: { values?: Record<string, unknown>; cancelled?: boolean }) => {
    setBusy(true);
    setError(null);
    try {
      await answerPrompt(basePath, prompt.id, answer);
      onResolved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const form = (
    <JsonSchemaForm
      schema={prompt.schema}
      value={value}
      onChange={setValue}
      idPrefix={idPrefix ?? `prompt-${prompt.id}`}
      {...(lookupFetcher ? { lookupFetcher } : {})}
    />
  );
  const actions = (
    <div className="flex items-center justify-end gap-2">
      {error ? <span className="mr-auto text-sm text-destructive">{error}</span> : null}
      <Button variant="ghost" disabled={busy} onClick={() => void resolve({ cancelled: true })}>
        Cancel
      </Button>
      <Button disabled={busy} onClick={() => void resolve({ values: value })}>
        Submit
      </Button>
    </div>
  );

  if (frame) return <>{frame({ form, actions })}</>;
  return (
    <div className="min-w-0 space-y-density-2" data-prompt-form={prompt.id}>
      <div>
        <div className="text-sm font-medium">{prompt.title}</div>
        {prompt.description ? <div className="text-xs text-muted-foreground">{prompt.description}</div> : null}
      </div>
      {form}
      {actions}
    </div>
  );
}
