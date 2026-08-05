import {
  lazy,
  Suspense,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { Button } from "../components/button";
import { JsonSchemaForm } from "../components/JsonSchemaForm";
import { Tabs } from "../layout/Tabs";
import type {
  JsonSchemaObject,
  PreExtension,
  PostExtension,
} from "../components/json-schema-form-types";
import { useOperationLookupFetcher } from "./operationLookupFetcher";
import {
  collectionPath,
  resolveActionPath,
  scalarValues,
} from "./schemaActionPath";
import type { ExecutionResponse, ResolvedOperation } from "./types";
import type { OperationsApiClient } from "./useOperations";
import type { MonacoValidationState } from "../monaco/types";

const LazyMonacoSchemaEditor = lazy(() =>
  import("../monaco/MonacoSchemaEditor").then((module) => ({
    default: module.MonacoSchemaEditor,
  })),
);
let schemaActionEditorSequence = 0;

// FormActionContext is handed to a footerActions renderer so a host app can add
// form-level actions (e.g. a connection "Test" button) that operate on the live
// form value.
export type FormActionContext = {
  value: Record<string, unknown>;
  action: ResolvedOperation;
  canSubmit: boolean;
};

// FormActionsRenderer renders extra action buttons in the form footer, left of
// the Save button. Returns null/undefined to add none.
export type FormActionsRenderer = (ctx: FormActionContext) => ReactNode;

export type SchemaActionFormSlots = {
  body: ReactNode;
  footer?: ReactNode;
};

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
  // Optional host layout. Dialog consumers use this to place footer controls in
  // the modal's pinned footer while standalone consumers retain the inline
  // layout below.
  renderLayout?: (slots: SchemaActionFormSlots) => ReactNode;
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
  renderLayout,
  fallback,
}: SchemaActionFormProps) {
  const method = action.method.toUpperCase();
  const canSchemaForm = Boolean(
    client.getSchema && client.submitForm && isMutation(method),
  );
  const schemaPath = collectionPath(action.path);

  const lookupFetcher = useOperationLookupFetcher(client);

  const schemaQuery = useQuery<JsonSchemaObject | null>({
    queryKey: ["entity-schema", schemaPath],
    // react-query forbids undefined query data; normalize "no schema" to null.
    queryFn: async () => (await client.getSchema!(schemaPath)) ?? null,
    enabled: canSchemaForm,
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  const [value, setValue] = useState<Record<string, unknown>>(
    initialValue ?? {},
  );
  const [view, setView] = useState<"form" | "yaml">("form");
  const [yamlText, setYamlText] = useState(() =>
    stringifyYaml(initialValue ?? {}),
  );
  const [yamlError, setYamlError] = useState("");
  const [yamlValidation, setYamlValidation] = useState<MonacoValidationState>({
    status: "valid",
    errors: [],
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Monaco keys models by path. A React useId can be reused after one dialog
  // unmounts and another occupies the same tree position, briefly exposing the
  // previous dialog's retained model during deferred StrictMode-safe cleanup.
  const [editorId] = useState(() => ++schemaActionEditorSequence);
  const editorPath = `file:///clicky-schema-action-${editorId}.yaml`;
  const canSubmit =
    !yamlError && (view !== "yaml" || yamlValidation.status === "valid");
  const handleValidationChange = useCallback((next: MonacoValidationState) => {
    setYamlValidation(next);
  }, []);

  function renderSlots(slots: SchemaActionFormSlots) {
    if (renderLayout) return renderLayout(slots);
    return (
      <div className="space-y-4">
        {slots.body}
        {slots.footer}
      </div>
    );
  }

  if (!canSchemaForm) return <>{renderSlots({ body: fallback })}</>;
  if (schemaQuery.isLoading) {
    return (
      <>
        {renderSlots({
          body: (
            <div className="text-sm text-muted-foreground">Loading form…</div>
          ),
        })}
      </>
    );
  }
  const schema = schemaQuery.data;
  if (!schema) return <>{renderSlots({ body: fallback })}</>;

  async function handleSubmit() {
    if (!client.submitForm) return;
    if (!canSubmit) {
      setError("Fix the YAML before saving.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const path = resolveActionPath(action.path, {
        ...scalarValues(value),
        ...lockedValues,
      });
      // Entity update operations do not always encode their identifier in the
      // path. Clicky can expose an entity-scoped PUT on the collection path and
      // use x-clicky.idParam to lock the row id in the action context. Keep
      // locked values out of the editable form, but include any values that
      // were not consumed by path placeholders in the request body.
      const pathParams = new Set(
        Array.from(action.path.matchAll(/\{([^{}]+)\}/g), (match) => match[1]),
      );
      const lockedBodyValues = Object.fromEntries(
        Object.entries(lockedValues ?? {}).filter(
          ([name]) => !pathParams.has(name),
        ),
      );
      const response = await client.submitForm(
        path,
        method,
        { ...value, ...lockedBodyValues },
        {
          Accept: "application/json+clicky",
        },
      );
      if (response.error) {
        setError(response.error);
        return;
      }
      onSuccess?.(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : String(err ?? "Unknown error"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeView(next: string) {
    if (next !== "form" && next !== "yaml") return;
    if (next === "form") {
      // Form mode uses the last successfully parsed object, so an invalid YAML
      // draft should not trap the user in the editor or keep form actions disabled.
      setYamlError("");
    }
    if (next === "yaml") {
      setYamlText(stringifyYaml(value));
      setYamlError("");
      setYamlValidation({ status: "loading", errors: [] });
    }
    setView(next);
  }

  function changeYaml(next: string) {
    setYamlText(next);
    setError("");
    try {
      const parsed = next.trim() ? parseYaml(next) : {};
      if (!isRecord(parsed))
        throw new Error("The YAML document must contain an object.");
      setValue(parsed);
      setYamlError("");
      setYamlValidation({ status: "loading", errors: [] });
    } catch (err) {
      setYamlError(err instanceof Error ? err.message : String(err));
    }
  }

  const body = (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { id: "form", label: "Form" },
          { id: "yaml", label: "YAML" },
        ]}
        value={view}
        onChange={changeView}
      />
      {view === "form" ? (
        <div role="tabpanel" aria-label="Form">
          <JsonSchemaForm
            schema={schema}
            value={value}
            onChange={setValue}
            {...(formPre ? { pre: formPre } : {})}
            {...(formPost ? { post: formPost } : {})}
            {...(lookupFetcher ? { lookupFetcher } : {})}
          />
        </div>
      ) : (
        <div role="tabpanel" aria-label="YAML" className="space-y-2">
          <Suspense
            fallback={
              <div className="h-80 rounded-md border border-input p-3 text-sm text-muted-foreground">
                Loading Monaco editor…
              </div>
            }
          >
            <LazyMonacoSchemaEditor
              language="yaml"
              value={yamlText}
              onChange={changeYaml}
              path={editorPath}
              schemaUri={`${editorPath}.schema.json`}
              schema={schema}
              onValidationChange={handleValidationChange}
            />
          </Suspense>
          <div className="text-xs text-muted-foreground">
            Returning through Form preserves values but discards YAML comments,
            anchors, ordering, and formatting.
          </div>
          {(yamlValidation.status === "invalid" ||
            yamlValidation.status === "unavailable") &&
            yamlValidation.errors.length > 0 && (
              <div className="text-sm text-destructive" role="alert">
                {yamlValidation.errors[0]}
              </div>
            )}
          {yamlValidation.status === "loading" && !yamlError && (
            <div className="text-xs text-muted-foreground">
              Validating YAML…
            </div>
          )}
          {yamlError && (
            <div className="text-sm text-destructive" role="alert">
              {yamlError}
            </div>
          )}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
  const footer = (
    <div className="flex items-center justify-end gap-2">
      {footerActions?.({ value, action, canSubmit })}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || !canSubmit}
      >
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </div>
  );
  return <>{renderSlots({ body, footer })}</>;
}

function isMutation(method: string): boolean {
  return method === "POST" || method === "PUT" || method === "PATCH";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
