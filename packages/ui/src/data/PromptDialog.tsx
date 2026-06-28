import { useState } from "react";
import { Button } from "../components/button";
import { JsonSchemaForm } from "../components/JsonSchemaForm";
import { Modal } from "../overlay/Modal";
import { answerPrompt, type PromptSnapshot } from "../hooks/use-prompts";

export interface PromptDialogProps {
  /** The pending prompt to answer. Its `schema` drives the rendered form. */
  prompt: PromptSnapshot;
  /** Base path the prompt API is mounted under, e.g. "/api/todos". */
  basePath: string;
  open: boolean;
  /** Closes the modal without answering (the prompt stays pending). */
  onClose: () => void;
  /** Called after the prompt is successfully answered or cancelled. */
  onResolved?: (() => void) | undefined;
}

// PromptDialog renders a pending prompt's JSON Schema via the generic
// JsonSchemaForm inside a Modal and POSTs the answer back to the prompt manager.
// It is the human side of the same mechanism an AI model elicits through.
export function PromptDialog({ prompt, basePath, open, onClose, onResolved }: PromptDialogProps) {
  const [value, setValue] = useState<Record<string, unknown>>(() => ({ ...prompt.value }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = async (answer: { values?: Record<string, unknown>; cancelled?: boolean }) => {
    setBusy(true);
    setError(null);
    try {
      await answerPrompt(basePath, prompt.id, answer);
      onResolved?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={prompt.title}
      subtitle={prompt.description}
      footer={
        <div className="flex items-center justify-end gap-2">
          {error ? <span className="mr-auto text-sm text-red-600">{error}</span> : null}
          <Button variant="ghost" disabled={busy} onClick={() => void resolve({ cancelled: true })}>
            Cancel
          </Button>
          <Button disabled={busy} onClick={() => void resolve({ values: value })}>
            Submit
          </Button>
        </div>
      }
    >
      <JsonSchemaForm schema={prompt.schema} value={value} onChange={setValue} idPrefix={`prompt-${prompt.id}`} />
    </Modal>
  );
}
