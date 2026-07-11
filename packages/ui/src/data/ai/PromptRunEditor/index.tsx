import { useId, useState, type ReactNode } from "react";
import { Button } from "../../../components/button";
import { JsonSchemaForm } from "../../../components/JsonSchemaForm";
import type { JsonSchemaObject } from "../../../components/json-schema-form-types";
import { UiGearSix } from "../../../icons";
import { cn } from "../../../lib/utils";
import { Modal } from "../../../overlay/Modal";
import { Icon } from "../../Icon";
import { EffortSelector, ModelSelector } from "../../chat/ModelSelector";
import type { ChatModel, ToolMeta } from "../../chat/types";
import { RuntimeModePicker } from "../RuntimeModePicker";
import {
  SPEC_RUNTIME_FAMILIES,
  type SpecRuntimeFamily,
  familyById,
  labelForBackend,
  modelsForFamily,
  selectionForBackend,
} from "../runtime-mode";
import { SpecRuntimeEditor } from "../SpecRuntimeEditor";
import type { SpecRuntimeCLIOptions } from "../SpecRuntimeEditor/CLIArgsSection";
import { SpecField, SpecInput } from "../SpecRuntimeEditor/fields";
import type {
  SpecRuntimeSecretSelectorConfig,
  SpecSectionId,
} from "../SpecRuntimeEditor/types";
import { withOptionalRoot, withPrompt, withRoot } from "../SpecRuntimeEditor/update";
import type {
  AISpecRuntimePermissionCatalog,
  AISpecRuntimeValue,
} from "../SpecRuntimeEditor.model";

const REASONING_EFFORTS = ["low", "medium", "high", "xhigh"];

export type PromptRunEditorProps = {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  models?: ChatModel[] | undefined;
  families?: SpecRuntimeFamily[] | undefined;
  tools?: ToolMeta[] | undefined;
  permissionCatalog?: AISpecRuntimePermissionCatalog | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  cliOptions?: SpecRuntimeCLIOptions | undefined;
  reasoningEfforts?: string[] | undefined;

  /** Schema-driven variables form; omit to render a raw-JSON editor. */
  variablesSchema?: JsonSchemaObject | undefined;
  variables?: Record<string, unknown> | undefined;
  /** The variables block only renders when this is supplied. */
  onVariablesChange?: ((next: Record<string, unknown>) => void) | undefined;
  /** Fires false while raw-JSON variables fail to parse; always true with a schema. */
  onVariablesValidityChange?: ((valid: boolean) => void) | undefined;

  /** Host-supplied editor for the `prompt.user` override; defaults to a textarea. */
  promptEditor?: ReactNode | undefined;
  promptLabel?: string | undefined;
  promptPlaceholder?: string | undefined;

  /** Extra fields injected inside the Runtime block, below Model/Effort. */
  children?: ReactNode | undefined;
  header?: ReactNode | undefined;
  footer?: ReactNode | undefined;
  className?: string | undefined;

  editSpecLabel?: string | undefined;
  specModalTitle?: string | undefined;
  /** Restrict which SpecRuntimeEditor sections the "Edit spec" modal shows. */
  specSections?: readonly SpecSectionId[] | undefined;
};

// The inline "prompt + variables + runtime" composer shared by captain's prompt
// workbench and gavel's todo run dialog. It edits one AISpecRuntimeValue live
// (runtime knobs + the prompt.user override) and takes variables as separate
// props; the "Edit spec" button expands the same value into the full editor.
// Hosts should mount it with a `key` per prompt/todo so internal draft state
// (raw-JSON text, modal open) resets on selection change.
export function PromptRunEditor({
  value,
  onChange,
  models = [],
  families = SPEC_RUNTIME_FAMILIES,
  tools = [],
  permissionCatalog,
  secretSelector,
  cliOptions,
  reasoningEfforts = REASONING_EFFORTS,
  variablesSchema,
  variables,
  onVariablesChange,
  onVariablesValidityChange,
  promptEditor,
  promptLabel = "User prompt",
  promptPlaceholder = "Override the rendered user prompt",
  children,
  header,
  footer,
  className,
  editSpecLabel = "Edit spec",
  specModalTitle = "Runtime spec",
  specSections,
}: PromptRunEditorProps) {
  const [specOpen, setSpecOpen] = useState(false);
  const selection = selectionForBackend(families, value.backend);
  const family = familyById(families, selection.family);
  const familyModels = modelsForFamily(models, family, value.backend);
  const selectedModel = models.find((m) => m.id === value.model);
  // Hide effort for a model that does not reason; default to showing it when the
  // selection is unknown (a family alias or a not-yet-loaded catalog).
  const showEffort = !selectedModel || selectedModel.reasoning;

  return (
    <div className={cn("grid gap-density-4", className)}>
      {header}

      <Block title="Runtime">
        <RuntimeModePicker value={value} onChange={onChange} families={families} models={models} />
        <div className="grid gap-density-2 sm:grid-cols-2">
          <SpecField label="Model">
            <div className="flex min-w-0 items-center gap-density-2">
              {familyModels.length > 0 ? (
                <ModelSelector
                  models={familyModels}
                  value={value.model}
                  onChange={(model) => onChange(withRoot(value, { model }))}
                  size="md"
                  className="w-full"
                />
              ) : (
                <SpecInput
                  value={value.model}
                  onChange={(model) => onChange(withRoot(value, { model }))}
                  placeholder="frontmatter/default"
                  mono
                />
              )}
              {value.model && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onChange(withOptionalRoot(value, "model", undefined))}
                >
                  Default
                </Button>
              )}
            </div>
          </SpecField>
          {showEffort && (
            <SpecField label="Effort">
              <EffortSelector
                efforts={reasoningEfforts}
                value={value.effort ?? ""}
                onChange={(effort) => onChange(withRoot(value, { effort }))}
                size="md"
                className="w-full"
              />
            </SpecField>
          )}
        </div>
        {children}
        <div>
          <Button size="sm" variant="outline" onClick={() => setSpecOpen(true)}>
            <Icon icon={UiGearSix} className="size-4" />
            {editSpecLabel}
          </Button>
        </div>
      </Block>

      {onVariablesChange && (
        <Block title="Variables">
          <VariablesField
            {...(variablesSchema ? { schema: variablesSchema } : {})}
            value={variables ?? {}}
            onChange={onVariablesChange}
            {...(onVariablesValidityChange ? { onValidityChange: onVariablesValidityChange } : {})}
          />
        </Block>
      )}

      <Block title={promptLabel}>
        {promptEditor ?? (
          <textarea
            value={value.prompt?.user ?? ""}
            onChange={(event) => onChange(withPrompt(value, { user: event.target.value }))}
            spellCheck={false}
            placeholder={promptPlaceholder}
            aria-label={promptLabel}
            className="min-h-[7rem] w-full resize-y rounded-md border border-border bg-background px-density-2 py-density-1 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        )}
      </Block>

      {footer}

      <Modal
        open={specOpen}
        onClose={() => setSpecOpen(false)}
        title={specModalTitle}
        size="full"
        closeOnEsc
        className="h-[95vh]"
      >
        <SpecRuntimeEditor
          value={value}
          onChange={onChange}
          models={models}
          families={families}
          tools={tools}
          {...(permissionCatalog ? { permissionCatalog } : {})}
          {...(secretSelector ? { secretSelector } : {})}
          {...(cliOptions ? { cliOptions } : {})}
          {...(specSections ? { sections: specSections } : {})}
          onSave={() => setSpecOpen(false)}
          onCancel={() => setSpecOpen(false)}
          saveLabel="Done"
          footerStatus={labelForBackend(value.backend, families)}
        />
      </Modal>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-density-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {children}
    </section>
  );
}

// Variables are edited via the prompt's declared schema when present, otherwise
// as a raw JSON object; the raw text is held locally and only committed to the
// host when it parses to an object.
function VariablesField({
  schema,
  value,
  onChange,
  onValidityChange,
}: {
  schema?: JsonSchemaObject | undefined;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  onValidityChange?: ((valid: boolean) => void) | undefined;
}) {
  const idPrefix = useId();
  const [rawText, setRawText] = useState(() => stringifyVariables(value));
  const [rawError, setRawError] = useState<string | null>(null);

  if (schema) {
    return (
      <JsonSchemaForm
        idPrefix={`prompt-vars-${idPrefix}`}
        schema={schema}
        value={value}
        onChange={(next) => onChange(next as Record<string, unknown>)}
        size="sm"
      />
    );
  }

  const commit = (text: string) => {
    setRawText(text);
    if (!text.trim()) {
      setRawError(null);
      onValidityChange?.(true);
      onChange({});
      return;
    }
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        setRawError(null);
        onValidityChange?.(true);
        onChange(parsed as Record<string, unknown>);
      } else {
        setRawError("Expected a JSON object");
        onValidityChange?.(false);
      }
    } catch (error) {
      setRawError(error instanceof Error ? error.message : "Invalid JSON");
      onValidityChange?.(false);
    }
  };

  return (
    <div className="space-y-1">
      <textarea
        value={rawText}
        onChange={(event) => commit(event.target.value)}
        spellCheck={false}
        placeholder="{}"
        aria-label="Variables JSON"
        className="h-28 w-full resize-y rounded-md border border-border bg-background px-density-2 py-density-1 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
      />
      {rawError && <div className="text-xs text-destructive">{rawError}</div>}
    </div>
  );
}

function stringifyVariables(value: Record<string, unknown>) {
  if (!value || Object.keys(value).length === 0) return "{}";
  return JSON.stringify(value, null, 2);
}
