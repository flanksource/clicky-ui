import { useId, useMemo, useState, type ReactNode } from "react";
import { Button } from "../../../components/button";
import { JsonSchemaForm } from "../../../components/JsonSchemaForm";
import type { JsonSchemaObject } from "../../../components/json-schema-form-types";
import { UiAdd, UiGearSix, UiTrash } from "../../../icons";
import { cn } from "../../../lib/utils";
import { Modal } from "../../../overlay/Modal";
import { Icon } from "../../Icon";
import { DEFAULT_REASONING_EFFORTS } from "../../chat/effort-icons";
import {
  AttachmentButton,
  AttachmentList,
} from "../../chat/Attachment";
import {
  createAttachmentUploadAdapter,
  type AttachmentFilePart,
  type AttachmentLimits,
  type AttachmentUploadAdapter,
} from "../../chat/attachment-upload";
import type { ChatModel, ToolMeta } from "../../chat/types";
import type { FileUIPart } from "../../chat/types";
import { RuntimeBar } from "../RuntimeBar";
import {
  SPEC_RUNTIME_FAMILIES,
  type SpecRuntimeFamily,
  labelForBackend,
} from "../runtime-mode";
import { SpecRuntimeEditor } from "../SpecRuntimeEditor";
import type { SpecRuntimeCLIOptions } from "../SpecRuntimeEditor/CLIArgsSection";
import type {
  SpecRuntimeSecretSelectorConfig,
  SpecSectionId,
} from "../SpecRuntimeEditor/types";
import { withPrompt } from "../SpecRuntimeEditor/update";
import type { AISpecRuntimePermissionCatalog } from "../SpecRuntimeEditor.model";
import {
  runtimeRows,
  withRuntimeRows,
  type AIPromptRunValue,
} from "./model";

export type PromptRunEditorProps = {
  value: AIPromptRunValue;
  onChange: (value: AIPromptRunValue) => void;
  models?: ChatModel[] | undefined;
  families?: SpecRuntimeFamily[] | undefined;
  tools?: ToolMeta[] | undefined;
  permissionCatalog?: AISpecRuntimePermissionCatalog | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  cliOptions?: SpecRuntimeCLIOptions | undefined;
  reasoningEfforts?: string[] | undefined;

  /** Schema-driven variables form; omit to render a raw-JSON editor. */
  variablesSchema?: JsonSchemaObject | undefined;
  /** Fires false while raw-JSON variables fail to parse; always true with a schema. */
  onVariablesValidityChange?: ((valid: boolean) => void) | undefined;

  /** Host-supplied editor for the `prompt.user` override; defaults to a textarea. */
  promptEditor?: ReactNode | undefined;
  promptLabel?: string | undefined;
  promptPlaceholder?: string | undefined;
  enableAttachments?: boolean | undefined;
  attachmentUpload?: AttachmentUploadAdapter | undefined;
  attachmentLimits?: AttachmentLimits | undefined;

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
// workbench and gavel's todo run dialog. It edits Captain's complete prompt-run
// request without making hosts project that contract into editor-specific state.
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
  reasoningEfforts = DEFAULT_REASONING_EFFORTS,
  variablesSchema,
  onVariablesValidityChange,
  promptEditor,
  promptLabel = "User prompt",
  promptPlaceholder = "Override the rendered user prompt",
  enableAttachments = false,
  attachmentUpload,
  attachmentLimits,
  children,
  header,
  footer,
  className,
  editSpecLabel = "Edit spec",
  specModalTitle = "Runtime spec",
  specSections,
}: PromptRunEditorProps) {
  const [specOpen, setSpecOpen] = useState(false);
  const spec = value.spec ?? {};
  const rows = runtimeRows(value);
  const selectedModel = models.find(
    (model) => model.id === spec.id || model.id === spec.model,
  );
  const resolvedAttachmentUpload = useMemo(
    () => attachmentUpload ?? createAttachmentUploadAdapter(),
    [attachmentUpload],
  );
  const attachmentFiles: FileUIPart[] = (spec.prompt?.attachments ?? []).map(
    (attachment) => ({
      type: "file",
      url: attachment.id
        ? `/api/attachments/${attachment.id}`
        : (attachment.url ?? ""),
      mediaType: attachment.mediaType ?? "application/octet-stream",
      ...(attachment.id ? { attachmentId: attachment.id } : {}),
      ...(attachment.size != null ? { size: attachment.size } : {}),
      ...(attachment.filename ? { filename: attachment.filename } : {}),
      ...(!attachment.filename && attachment.path
        ? { filename: attachment.path }
        : {}),
    }),
  ) as FileUIPart[];

  return (
    <div className={cn("grid gap-density-4", className)}>
      {header}

      <Block title="Runtime">
        <div className="grid gap-density-2">
          {rows.map((runtime, index) => (
            <div
              key={index}
              role="group"
              aria-label={`Runtime ${index + 1}`}
              className="flex min-w-0 items-center gap-density-2"
            >
              <RuntimeBar
                value={runtime}
                onChange={(next) =>
                  onChange(
                    withRuntimeRows(
                      value,
                      rows.map((item, itemIndex) =>
                        itemIndex === index ? next : item,
                      ),
                    ),
                  )
                }
                models={models}
                families={families}
                reasoningEfforts={reasoningEfforts}
                ariaLabel={`Runtime ${index + 1} controls`}
              />
              {rows.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Remove runtime ${index + 1}`}
                  onClick={() =>
                    onChange(
                      withRuntimeRows(
                        value,
                        rows.filter((_, itemIndex) => itemIndex !== index),
                      ),
                    )
                  }
                >
                  <Icon icon={UiTrash} className="size-4" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-density-2">
            <Button
              size="sm"
              variant="outline"
              aria-label="Add runtime"
              onClick={() =>
                onChange(
                  withRuntimeRows(value, [
                    ...rows,
                    rows[0]?.backend ? { backend: rows[0].backend } : {},
                  ]),
                )
              }
            >
              <Icon icon={UiAdd} className="size-4" />
              Add runtime
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSpecOpen(true)}>
              <Icon icon={UiGearSix} className="size-4" />
              {editSpecLabel}
            </Button>
          </div>
        </div>
        {children}
      </Block>

      <Block title="Variables">
        <VariablesField
          {...(variablesSchema ? { schema: variablesSchema } : {})}
          value={value.variables ?? {}}
          onChange={(variables) => onChange({ ...value, variables })}
          {...(onVariablesValidityChange
            ? { onValidityChange: onVariablesValidityChange }
            : {})}
        />
      </Block>

      <Block title={promptLabel}>
        {promptEditor ?? (
          <textarea
            value={spec.prompt?.user ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                spec: withPrompt(spec, { user: event.target.value }),
              })
            }
            spellCheck={false}
            placeholder={promptPlaceholder}
            aria-label={promptLabel}
            className="min-h-[7rem] w-full resize-y rounded-md border border-border bg-background px-density-2 py-density-1 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        )}
        {enableAttachments && (
          <div className="space-y-density-2">
            <AttachmentList
              files={attachmentFiles}
              onRemove={(index) =>
                onChange({
                  ...value,
                  spec: withPrompt(spec, {
                    attachments: (spec.prompt?.attachments ?? []).filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  }),
                })
              }
            />
            <AttachmentButton
              files={attachmentFiles}
              upload={resolvedAttachmentUpload}
              onAdd={(parts) =>
                onChange({
                  ...value,
                  spec: withPrompt(spec, {
                    attachments: [
                      ...(spec.prompt?.attachments ?? []),
                      ...parts.map((part) => {
                        const uploaded = part as AttachmentFilePart;
                        return {
                          id: uploaded.attachmentId,
                          mediaType: uploaded.mediaType,
                          size: uploaded.size,
                          ...(uploaded.filename
                            ? { filename: uploaded.filename }
                            : {}),
                        };
                      }),
                    ],
                  }),
                })
              }
              {...(selectedModel?.inputMediaTypes
                ? { acceptedMediaTypes: selectedModel.inputMediaTypes }
                : {})}
              {...(attachmentLimits ? { limits: attachmentLimits } : {})}
            />
          </div>
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
          value={spec}
          onChange={(next) => onChange({ ...value, spec: next })}
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
          footerStatus={labelForBackend(spec.backend, families)}
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
