import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/button";
import { cn } from "../lib/utils";
import type { ClickyCommandRuntime } from "../data/Clicky";
import { MethodBadge } from "../data/MethodBadge";
import { Modal } from "../overlay/Modal";
import { ExecutionResult } from "./ExecutionResult";
import { FilterForm } from "./FilterForm";
import {
  SchemaActionForm,
  type FormActionsRenderer,
  type SchemaActionFormSlots,
} from "./SchemaActionForm";
import { getOperationClickyMeta, surfaceActionLabel } from "./clickyMetadata";
import { packParameterValues } from "./formMetadata";
import type { ExecutionResponse, ResolvedOperation } from "./types";
import { type OperationsApiClient } from "./useOperations";
import type {
  PreExtension,
  PostExtension,
} from "../components/json-schema-form-types";

export type OperationActionBarProps = {
  // Operations rendered as buttons. The list page passes collection-scoped
  // actions, the detail page passes entity-scoped actions — this component
  // renders both identically (same labels, same location, same modal).
  actions: ResolvedOperation[];
  client: OperationsApiClient;
  // Path/filter values locked into the action form. The detail page locks the
  // row id; the list page locks the active list filters for a bulk action.
  getLockedValues?: (action: ResolvedOperation) => Record<string, string>;
  // Refetch the surrounding view (list/detail) once an action succeeds.
  onExecuted?: () => void | Promise<void>;
  // Pre-filled form value (the existing entity when editing).
  initialValue?: Record<string, unknown>;
  // Hide the locked values in the fallback parameter form (detail hides the id;
  // the list shows the locked filters for transparency).
  hideLockedInForm?: boolean;
  commandRuntime?: ClickyCommandRuntime;
  formPre?: PreExtension[];
  formPost?: PostExtension[];
  formActions?: FormActionsRenderer;
  // Optional labels keyed by x-clicky verb/actionName for this surface.
  actionLabels?: Record<string, string>;
  // Layout placement only — the bar's own styling stays consistent across pages.
  className?: string;
};

// OperationActionBar is the single render path for entity action buttons shared
// by the list (OperationCatalog) and detail (OperationEntityPage) pages: a row
// of buttons that each open the execution Modal (schema form, or parameter-form
// fallback) inline. Keeping it shared guarantees both surfaces present the same
// labels in the same location.
export function OperationActionBar({
  actions,
  client,
  getLockedValues,
  onExecuted,
  initialValue,
  hideLockedInForm = false,
  commandRuntime,
  formPre,
  formPost,
  formActions,
  actionLabels,
  className,
}: OperationActionBarProps) {
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState<ResolvedOperation | null>(null);
  const [actionResult, setActionResult] = useState<ExecutionResponse | null>(null);
  const [actionError, setActionError] = useState("");
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  const activeMeta = activeAction ? getOperationClickyMeta(activeAction) : undefined;
  const lockedValues = activeAction ? (getLockedValues?.(activeAction) ?? {}) : {};

  function openAction(op: ResolvedOperation) {
    setActiveAction(op);
    setActionResult(null);
    setActionError("");
  }

  function actionLabel(op: ResolvedOperation): string {
    const meta = getOperationClickyMeta(op);
    const key = meta?.actionName?.trim() || meta?.verb?.trim();
    return (key ? actionLabels?.[key] : undefined) ?? surfaceActionLabel(op);
  }

  async function refreshDiscovery() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["openapi-spec"] }),
      queryClient.invalidateQueries({ queryKey: ["logs-entity-names"] }),
    ]);
    await onExecuted?.();
  }

  async function executeAction(values: Record<string, string>) {
    if (!activeAction) return;
    setIsExecutingAction(true);
    setActionError("");

    try {
      const response = await client.executeCommand(
        activeAction.path,
        activeAction.method,
        packParameterValues(values, activeAction.operation.parameters ?? []),
        { Accept: "application/json+clicky" },
      );
      setActionResult(response);
      if (!response.error) await refreshDiscovery();
    } catch (err) {
      setActionResult(null);
      setActionError(err instanceof Error ? err.message : String(err ?? "Unknown error"));
    } finally {
      setIsExecutingAction(false);
    }
  }

  return (
    <>
      {actions.length > 0 && (
        <div className={cn("flex flex-wrap gap-2", className)}>
          {actions.map((op) => {
            const label = actionLabel(op);
            const summary = op.operation.summary || op.operation.description;
            const tooltip = summary && summary !== label ? `${label} — ${summary}` : label;
            return (
              <Button
                key={`${op.method}:${op.path}`}
                type="button"
                variant="outline"
                size="sm"
                title={tooltip}
                onClick={() => openAction(op)}
              >
                {label}
              </Button>
            );
          })}
        </div>
      )}

      {activeAction && (
        <SchemaActionForm
          client={client}
          action={activeAction}
          lockedValues={lockedValues}
          submitLabel={actionLabel(activeAction)}
          {...(initialValue ? { initialValue } : {})}
          {...(formPre ? { formPre } : {})}
          {...(formPost ? { formPost } : {})}
          {...(formActions ? { footerActions: formActions } : {})}
          renderLayout={(slots) => renderActionDialog(slots)}
          onSuccess={() => {
            setActiveAction(null);
            void refreshDiscovery();
          }}
          fallback={
            <FilterForm
              client={client}
              path={activeAction.path}
              method={activeAction.method}
              parameters={activeAction.operation.parameters ?? []}
              lockedValues={lockedValues}
              enableLookup={Boolean(activeMeta?.supportsLookup)}
              submitLabel="Execute request"
              submittingLabel="Executing…"
              isSubmitting={isExecutingAction}
              onSubmit={executeAction}
              {...(hideLockedInForm ? { hideLocked: true } : {})}
            />
          }
        />
      )}
    </>
  );

  function renderActionDialog({ body, footer }: SchemaActionFormSlots) {
    if (!activeAction) return null;
    return (
      <Modal
        open
        onClose={() => setActiveAction(null)}
        title={actionLabel(activeAction)}
        size="2xl"
        {...(footer ? { footer } : {})}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MethodBadge method={activeAction.method} />
            <code className="rounded-md bg-muted px-2 py-1 text-sm">
              {activeAction.path}
            </code>
          </div>
          {body}
          {actionError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {actionError}
            </div>
          ) : actionResult ? (
            <ExecutionResult
              response={actionResult}
              className="mt-0"
              {...(commandRuntime ? { commandRuntime } : {})}
            />
          ) : null}
        </div>
      </Modal>
    );
  }
}
