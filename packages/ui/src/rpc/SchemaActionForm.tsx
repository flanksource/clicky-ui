import {
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { Button } from "../components/button";
import { SplitButton } from "../components/SplitButton";
import { JsonSchemaForm } from "../components/JsonSchemaForm";
import { Tabs } from "../layout/Tabs";
import Ajv from "ajv/dist/2020";
import { applySchemaDefaults } from "../components/json-schema-form-defaults";
import { rehydrateRefs } from "../components/json-schema-form-refs";
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
  dirty?: boolean;
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
  const validate = useMemo(
    () =>
      schemaQuery.data
        ? new Ajv({
            strict: false,
            allErrors: true,
            verbose: true,
            validateFormats: false,
          }).compile(schemaQuery.data)
        : undefined,
    [schemaQuery.data],
  );
  // A property marked x-clicky-submit-target (e.g. a connection's storage layer)
  // says where the entity is saved rather than what it is, so it is chosen from
  // the save split button instead of being edited as a form field.
  const target = schemaQuery.data
    ? submitTarget(schemaQuery.data, value)
    : undefined;
  const targetName = target?.name;
  const formSchema = useMemo(
    () =>
      schemaQuery.data && targetName
        ? withoutProperty(schemaQuery.data, targetName)
        : schemaQuery.data,
    [schemaQuery.data, targetName],
  );
  const validForm =
    validate?.(target ? { ...value, [target.name]: target.current } : value) ??
    true;
  const formErrors = (validate?.errors ?? [])
    .filter((e) => e.keyword !== "if")
    .map((e) => ({
      instancePath:
        e.keyword === "required"
          ? `${e.instancePath}/${e.params.missingProperty}`
          : e.instancePath,
      message:
        e.keyword === "required"
          ? "Required"
          : ((e.keyword === "not"
              ? (e.schema as { description?: string }).description
              : undefined) ??
            e.message ??
            "Invalid value"),
    }));
  const baseline = useMemo(
    () =>
      schemaQuery.data
        ? applySchemaDefaults(
            rehydrateRefs(schemaQuery.data),
            initialValue ?? {},
          )
        : (initialValue ?? {}),
    [schemaQuery.data, initialValue],
  );
  const dirty =
    JSON.stringify(value) !== JSON.stringify(baseline) ||
    (view === "yaml" && yamlText !== stringifyYaml(value));
  const canSubmit =
    validForm &&
    !yamlError &&
    (view !== "yaml" || yamlValidation.status === "valid");
  const handleValidationChange = useCallback((next: MonacoValidationState) => {
    setYamlValidation(next);
  }, []);

  function renderSlots(slots: SchemaActionFormSlots) {
    if (renderLayout) return renderLayout({ ...slots, dirty });
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

  async function handleSubmit(overrides: Record<string, unknown> = {}) {
    if (!client.submitForm) return;
    const submitted = {
      ...value,
      ...(target ? { [target.name]: target.current } : {}),
      ...overrides,
    };
    if (!canSubmit) {
      setError("Fix the YAML before saving.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const path = resolveActionPath(action.path, {
        ...scalarValues(submitted),
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
        { ...submitted, ...lockedBodyValues },
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
            schema={formSchema ?? schema}
            value={value}
            onChange={setValue}
            errors={formErrors}
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
      {target ? (
        <SplitButton
          label={
            isSubmitting
              ? "Saving…"
              : `${submitLabel} to ${target.label(target.current)}`
          }
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !canSubmit}
          title="Choose where to save"
          items={target.choices
            .filter((choice) => choice !== target.current)
            .map((choice) => ({
              label: `${submitLabel} to ${target.label(choice)}`,
              onSelect: () => {
                setValue((draft) => ({ ...draft, [target.name]: choice }));
                void handleSubmit({ [target.name]: choice });
              },
            }))}
        />
      ) : (
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      )}
    </div>
  );
  return <>{renderSlots({ body, footer })}</>;
}

type SubmitTarget = {
  name: string;
  choices: string[];
  current: string;
  label: (choice: string) => string;
};

function submitTarget(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
): SubmitTarget | undefined {
  const marked = Object.entries(schema.properties ?? {}).filter(
    ([, property]) => isRecord(property) && property["x-clicky-submit-target"] === true,
  );
  if (marked.length === 0) return undefined;
  if (marked.length > 1) {
    throw new Error(
      `schema marks ${marked.map(([name]) => name).join(", ")} as x-clicky-submit-target; only one property may choose where a form saves`,
    );
  }
  const [name, property] = marked[0] as [string, Record<string, unknown>];
  const choices = Array.isArray(property.enum) ? property.enum.map(String) : [];
  if (choices.length === 0) {
    throw new Error(`x-clicky-submit-target property ${name} must declare an enum of choices`);
  }
  const labels = isRecord(property["x-enum-labels"]) ? property["x-enum-labels"] : {};
  const chosen = value[name] ?? property.default ?? choices[0];
  return {
    name,
    choices,
    current: String(chosen),
    label: (choice) => String(labels[choice] ?? choice),
  };
}

function withoutProperty(schema: JsonSchemaObject, name: string): JsonSchemaObject {
  const { [name]: _removed, ...properties } = schema.properties ?? {};
  return {
    ...schema,
    properties,
    ...(Array.isArray(schema.required)
      ? { required: schema.required.filter((field) => field !== name) }
      : {}),
  };
}

function isMutation(method: string): boolean {
  return method === "POST" || method === "PUT" || method === "PATCH";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
