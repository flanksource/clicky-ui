import type { ReactNode } from "react";
import { Modal } from "../overlay/Modal";
import type { SharedOperationsApiClient } from "../rpc/apiClient";
import {
  SchemaActionForm,
  type FormActionsRenderer,
  type SchemaActionFormSlots,
} from "../rpc/SchemaActionForm";
import type { ExecutionResponse, ResolvedOperation } from "../rpc/types";
import { CONNECTION_ERROR_BOX } from "./connectionFormSupport";
import type { ConnectionFormExtensions } from "./connectionsPageModel";

export type ConnectionFormDialogProps = {
  apiBase: string;
  client: SharedOperationsApiClient;
  action: ResolvedOperation;
  lockedValues?: Record<string, string>;
  initialValue?: Record<string, unknown>;
  /** A node, or a function of the live form so the title can carry controls over its value. */
  title: ReactNode | ((form: SchemaActionFormSlots) => ReactNode);
  submitLabel: string;
  extensions: Required<ConnectionFormExtensions>;
  footerActions: FormActionsRenderer;
  notice?: ReactNode;
  /** Property keys the form omits, e.g. `["type"]` once the caller fixed the type. */
  hiddenKeys?: string[];
  /** Why the current value must not be saved (shown under the form, Save disabled), or undefined. */
  submitBlocker?: (value: Record<string, unknown>) => string | undefined;
  onClose: () => void;
  /** Called with the service's answer to the save, e.g. the created connection. */
  onSaved: (response: ExecutionResponse) => void;
};

/**
 * The connection schema form in a Modal: a create (POST) or edit (PUT) over
 * `action`, with Save pinned in the footer beside the host's `footerActions`.
 * Needs a react-query QueryClientProvider (SchemaActionForm reads the schema).
 */
export function ConnectionFormDialog({
  apiBase,
  client,
  action,
  lockedValues,
  initialValue,
  title,
  submitLabel,
  extensions,
  footerActions,
  notice,
  hiddenKeys,
  submitBlocker,
  onClose,
  onSaved,
}: ConnectionFormDialogProps) {
  return (
    <SchemaActionForm
      client={client}
      action={action}
      submitLabel={submitLabel}
      formPre={extensions.pre}
      formPost={extensions.post}
      footerActions={footerActions}
      {...(lockedValues ? { lockedValues } : {})}
      {...(initialValue ? { initialValue } : {})}
      {...(hiddenKeys ? { hiddenKeys } : {})}
      {...(submitBlocker ? { submitBlocker } : {})}
      onSuccess={onSaved}
      renderLayout={(slots) => (
        <Modal
          open
          onClose={onClose}
          confirmClose={slots.dirty === true}
          title={typeof title === "function" ? title(slots) : title}
          size="2xl"
          footer={slots.footer}
        >
          <div className="space-y-4">
            {slots.body}
            {notice}
          </div>
        </Modal>
      )}
      fallback={
        <div className={CONNECTION_ERROR_BOX}>
          {`GET ${apiBase}/connection served no connection JSON Schema (Accept: application/schema+json).`}
        </div>
      }
    />
  );
}
