import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/button";
import { JsonSchemaForm } from "../components/JsonSchemaForm";
import { resolveLookupScope } from "../components/form-lookup-context";
import type {
  JsonSchemaObject,
  LookupFetcher,
  PreExtension,
  PostExtension,
} from "../components/json-schema-form-types";
import { lookupOptionsToFieldOptions } from "./formMetadata";
import { collectionPath, resolveActionPath, scalarValues } from "./schemaActionPath";
import type { ExecutionResponse, ResolvedOperation } from "./types";
import type { OperationsApiClient } from "./useOperations";

// FormActionContext is handed to a footerActions renderer so a host app can add
// form-level actions (e.g. a connection "Test" button) that operate on the live
// form value.
export type FormActionContext = {
  value: Record<string, unknown>;
  action: ResolvedOperation;
};

// FormActionsRenderer renders extra action buttons in the form footer, left of
// the Save button. Returns null/undefined to add none.
export type FormActionsRenderer = (ctx: FormActionContext) => ReactNode;

export type SchemaActionFormProps = {
  client: OperationsApiClient;
  // The create (POST) or update (PUT) operation this form submits to.
  action: ResolvedOperation;
  // Values used to resolve path parameters (e.g. { id } when editing a row).
  lockedValues?: Record<string, string>;
  // Pre-filled form value (the existing entity when editing).
  initialValue?: Record<string, unknown>;
  submitLabel?: string;
  onSuccess?: (response: ExecutionResponse) => void;
  // Custom JsonSchemaForm field extensions (e.g. a SecretKeySelector widget keyed
  // on an `x-clicky-component` hint). Forwarded verbatim to the rendered form.
  formPre?: PreExtension[];
  formPost?: PostExtension[];
  // Optional extra footer actions (e.g. a connection "Test" split-button) that
  // operate on the current form value, rendered left of the Save button.
  footerActions?: FormActionsRenderer;
  // Rendered when the resource exposes no JSON Schema (or schema forms are not
  // applicable to this action) — the existing parameter form.
  fallback: ReactNode;
};

// SchemaActionForm renders a JSON-Schema-driven create/edit form for resources
// that expose a schema via content negotiation (connections, profiles). It falls
// back to the parameter form for everything else. Submission sends the full
// nested form value as JSON (client.submitForm), so nested objects/arrays survive.
export function SchemaActionForm({
  client,
  action,
  lockedValues,
  initialValue,
  submitLabel = "Save",
  onSuccess,
  formPre,
  formPost,
  footerActions,
  fallback,
}: SchemaActionFormProps) {
  const method = action.method.toUpperCase();
  const canSchemaForm = Boolean(client.getSchema && client.submitForm && isMutation(method));
  const schemaPath = collectionPath(action.path);

  // Resolve `x-clicky-lookup` fields against the live form value: fetch the
  // referenced entity's lookup options (server-side search) and scope them by a
  // sibling field. Undefined when the client has no lookup endpoint (the field
  // then degrades to a free-text combobox).
  const lookupFetcher: LookupFetcher | undefined = useMemo(() => {
    const lookup = client.lookupFilterOptions;
    if (!lookup) return undefined;
    return async ({ descriptor, query, rootValue }) => {
      const extra = resolveLookupScope(descriptor, rootValue);
      const filter = await lookup.call(
        client,
        descriptor.url,
        "GET",
        descriptor.filter,
        query,
        extra,
      );
      return lookupOptionsToFieldOptions(filter).map((o) => ({ value: o.value, label: o.label }));
    };
  }, [client]);

  const schemaQuery = useQuery<JsonSchemaObject | null>({
    queryKey: ["entity-schema", schemaPath],
    // react-query forbids undefined query data; normalize "no schema" to null.
    queryFn: async () => (await client.getSchema!(schemaPath)) ?? null,
    enabled: canSchemaForm,
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  const [value, setValue] = useState<Record<string, unknown>>(initialValue ?? {});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!canSchemaForm) return <>{fallback}</>;
  if (schemaQuery.isLoading) {
    return <div className="text-sm text-muted-foreground">Loading form…</div>;
  }
  const schema = schemaQuery.data;
  if (!schema) return <>{fallback}</>;

  async function handleSubmit() {
    if (!client.submitForm) return;
    setIsSubmitting(true);
    setError("");
    try {
      const path = resolveActionPath(action.path, { ...scalarValues(value), ...lockedValues });
      const response = await client.submitForm(path, method, value, {
        Accept: "application/json+clicky",
      });
      if (response.error) {
        setError(response.error);
        return;
      }
      onSuccess?.(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err ?? "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <JsonSchemaForm
        schema={schema}
        value={value}
        onChange={setValue}
        {...(formPre ? { pre: formPre } : {})}
        {...(formPost ? { post: formPost } : {})}
        {...(lookupFetcher ? { lookupFetcher } : {})}
      />
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex items-center justify-end gap-2">
        {footerActions?.({ value, action })}
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}

function isMutation(method: string): boolean {
  return method === "POST" || method === "PUT" || method === "PATCH";
}
