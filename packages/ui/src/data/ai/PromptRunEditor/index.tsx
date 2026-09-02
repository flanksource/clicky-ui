import { useMemo, useState, type ReactNode } from "react";
import { Button } from "../../../components/button";
import type { JsonSchemaObject } from "../../../components/json-schema-form-types";
import { UiAdd, UiGearSix, UiLayers, UiTrash } from "../../../icons";
import { cn } from "../../../lib/utils";
import { Modal } from "../../../overlay/Modal";
import { Icon } from "../../Icon";
import { DEFAULT_REASONING_EFFORTS } from "../../chat/effort-icons";
import { AttachmentButton, AttachmentList } from "../../chat/Attachment";
import {
  createAttachmentUploadAdapter,
  type AttachmentFilePart,
  type AttachmentLimits,
  type AttachmentUploadAdapter,
} from "../../chat/attachment-upload";
import type { ChatModel, ToolMeta } from "../../chat/types";
import type { FileUIPart } from "../../chat/types";
import { RuntimeBar } from "../../runtime/RuntimeBar";
import { runtimeModelForValue } from "../../runtime/RuntimeBar.model";
import {
  SPEC_RUNTIME_FAMILIES,
  type SpecRuntimeFamily,
  labelForMode,
} from "../../runtime/runtime-mode";
import { SpecRuntimeEditor } from "../SpecRuntimeEditor";
import type { SpecRuntimeSandboxCreateConfig } from "../SandboxCreateWizard.model";
import type { SpecRuntimeCLIOptions } from "../SpecRuntimeEditor/CLIArgsSection";
import type { SpecRuntimeSandboxCatalog } from "../SpecRuntimeEditor/types";
import type {
  SpecRuntimeSecretSelectorConfig,
  SpecSectionId,
} from "../SpecRuntimeEditor/types";
import { withPrompt } from "../SpecRuntimeEditor/update";
import type { AISpecRuntimePermissionCatalog } from "../SpecRuntimeEditor.model";
import type {
  ResolvedRuntimeProfile,
  ResolvedRuntimeSpec,
  RuntimePreset,
  RuntimeProfile,
  RuntimeProfileResolveRequest,
} from "../runtime-profile";
import { authoredRuntimeSpec } from "../../../lib/runtime-profile-model";
import { RuntimeProfilePicker } from "../runtime-profiles/RuntimeProfilePicker";
import {
  inheritedRuntime,
  profileForRef,
} from "../runtime-profiles/RuntimeProfilePicker.model";
import { useRuntimeProfilePicker } from "../runtime-profiles/use-runtime-profile-picker";
import { runtimeRows, withRuntimeRows, type AIPromptRunValue } from "./model";
import { VariablesField } from "./VariablesField";

export type PromptRunEditorProps = {
  value: AIPromptRunValue;
  onChange: (value: AIPromptRunValue) => void;
  models?: ChatModel[] | undefined;
  families?: SpecRuntimeFamily[] | undefined;
  tools?: ToolMeta[] | undefined;
  permissionCatalog?: AISpecRuntimePermissionCatalog | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  cliOptions?: SpecRuntimeCLIOptions | undefined;
  /** Sandbox adapter catalog; enables the spec editor's Sandbox section. */
  sandboxCatalog?: SpecRuntimeSandboxCatalog | undefined;
  /** Host-owned sandbox creation and credential-reference adapter. */
  sandboxCreate?: SpecRuntimeSandboxCreateConfig | undefined;
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

  /** Saved runtime profiles; enables the profile picker inside the spec modal. */
  profiles?: RuntimeProfile[] | undefined;
  /** Presets the profiles reference, for ordering and inherited model/mode. */
  presets?: RuntimePreset[] | undefined;
  onSaveProfile?:
    | ((profile: RuntimeProfile) => Promise<RuntimeProfile>)
    | undefined;
  onCreateProfile?:
    | ((profile: RuntimeProfile) => Promise<RuntimeProfile>)
    | undefined;
  onResolveProfile?:
    | ((
        request: RuntimeProfileResolveRequest,
      ) => Promise<ResolvedRuntimeProfile>)
    | undefined;
  /** The last render's resolved spec and layer trace. */
  resolution?: ResolvedRuntimeSpec | undefined;
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
  sandboxCatalog,
  sandboxCreate,
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
  profiles,
  presets = [],
  onSaveProfile,
  onCreateProfile,
  onResolveProfile,
  resolution,
}: PromptRunEditorProps) {
  const [specOpen, setSpecOpen] = useState(false);
  const spec = value.spec ?? {};
  const rows = runtimeRows(value);
  const selectedModel = runtimeModelForValue(models, spec);
  const picker = useRuntimeProfilePicker({
    value,
    onChange,
    profiles: profiles ?? [],
    presets,
    onSaveProfile,
    onCreateProfile,
    onResolveProfile,
  });
  const profileDraft =
    profiles !== undefined && picker.state.layer === "profile"
      ? picker.state.draft
      : undefined;
  const runRuntime = inheritedRuntime({
    draft: picker.state.draft,
    presets,
    resolution,
  });
  const presetRuntime = profileDraft
    ? authoredRuntimeSpec({ ...profileDraft, spec: {} }, presets)
    : {};
  const editorRuntime = profileDraft ? presetRuntime : runRuntime;
  const selectedProfile = profileForRef(value.runtimeProfile, profiles ?? []);
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
                    rows[0]?.mode ? { mode: rows[0].mode } : {},
                  ]),
                )
              }
            >
              <Icon icon={UiAdd} className="size-4" />
              Add runtime
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSpecOpen(true)}
            >
              <Icon icon={UiGearSix} className="size-4" />
              {editSpecLabel}
            </Button>
            {value.runtimeProfile && (
              <span
                data-testid="runtime-profile-chip"
                className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-300"
              >
                <Icon icon={UiLayers} className="size-3.5" />
                Profile · {selectedProfile?.name ?? value.runtimeProfile}
              </span>
            )}
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
          value={profileDraft ? profileDraft.spec : spec}
          onChange={(next) =>
            profileDraft
              ? picker.editDraft({ ...profileDraft, spec: next })
              : onChange({ ...value, spec: next })
          }
          models={models}
          families={families}
          tools={tools}
          effectiveModel={editorRuntime.model}
          effectiveMode={editorRuntime.mode}
          {...(permissionCatalog ? { permissionCatalog } : {})}
          {...(secretSelector ? { secretSelector } : {})}
          {...(cliOptions ? { cliOptions } : {})}
          {...(sandboxCatalog ? { sandboxCatalog } : {})}
          {...(sandboxCreate ? { sandboxCreate } : {})}
          {...(specSections ? { sections: specSections } : {})}
          {...(profiles !== undefined
            ? {
                beforeSections: (
                  <RuntimeProfilePicker
                    controller={picker}
                    profiles={profiles}
                    presets={presets}
                    resolution={resolution}
                    effectiveRuntime={runRuntime}
                  />
                ),
              }
            : {})}
          onSave={() => setSpecOpen(false)}
          onCancel={() => setSpecOpen(false)}
          saveLabel="Done"
          footerStatus={
            profileDraft
              ? `Editing profile «${profileDraft.name}»`
              : labelForMode(spec.mode, families)
          }
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
