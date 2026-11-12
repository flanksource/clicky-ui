import type { LookupFetcher } from "../components/json-schema-form-runtime-types";
import { Modal, type ModalSize } from "../overlay/Modal";
import type { PromptSnapshot } from "../hooks/use-prompts";
import { PromptForm } from "./PromptForm";

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
  /** Resolves the options of the schema's `x-clicky-lookup` fields (e.g. a connection picker). */
  lookupFetcher?: LookupFetcher | undefined;
  /** Where the connections service is mounted; lets a `format: "connection"` field create the connection it is missing. */
  connectionApiBase?: string | undefined;
  /** The dialog width; a form of several fields needs more than a confirm box. */
  size?: ModalSize | undefined;
}

// PromptDialog is PromptForm inside a Modal: the prompt's title and description
// head the dialog, Submit/Cancel are pinned in its footer, and answering closes
// it. It is the human side of the same mechanism an AI model elicits through.
export function PromptDialog({ prompt, basePath, open, onClose, onResolved, lookupFetcher, connectionApiBase, size = "lg" }: PromptDialogProps) {
  return (
    <PromptForm
      prompt={prompt}
      basePath={basePath}
      lookupFetcher={lookupFetcher}
      connectionApiBase={connectionApiBase}
      onResolved={() => {
        onResolved?.();
        onClose();
      }}
      frame={({ form, actions }) => (
        <Modal open={open} size={size} onClose={onClose} title={prompt.title} subtitle={prompt.description} footer={actions}>
          {form}
        </Modal>
      )}
    />
  );
}
