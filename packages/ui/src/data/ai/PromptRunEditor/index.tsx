import { useState, type ReactNode } from "react";
import type { JsonSchemaObject } from "../../../components/json-schema-form-types";
import { SegmentedControl } from "../../../components/SegmentedControl";
import type { FixtureFenceSchemas } from "../../FixtureEditor/types";
import { UiGearSix } from "../../../icons";
import { cn } from "../../../lib/utils";
import { Modal } from "../../../overlay/Modal";
import { DEFAULT_REASONING_EFFORTS } from "../../chat/effort-icons";
import type {
  AttachmentLimits,
  AttachmentUploadAdapter,
} from "../../chat/attachment-upload";
import type { ChatModel, ToolMeta } from "../../chat/types";
import type {
  RuntimeBarAction,
  RuntimeBarActionsProps,
} from "../../runtime/RuntimeBarActions";
import {
  SPEC_RUNTIME_FAMILIES,
  type SpecRuntimeFamily,
  labelForMode,
} from "../../runtime/runtime-mode";
import {
  SpecRuntimeEditor,
  type SpecRuntimeEditorProps,
} from "../SpecRuntimeEditor";
import type { SpecRuntimeSandboxCreateConfig } from "../SandboxCreateWizard.model";
import type { SpecRuntimeCLIOptions } from "../SpecRuntimeEditor/CLIArgsSection";
import type {
  SpecRuntimeHostField,
  SpecRuntimeSandboxCatalog,
  SpecRuntimeSecretSelectorConfig,
  SpecRuntimeTab,
  SpecSectionId,
} from "../SpecRuntimeEditor/types";
import type { AISpecRuntimePermissionCatalog } from "../SpecRuntimeEditor.model";
import type {
  ResolvedRuntimeProfile,
  ResolvedRuntimeSpec,
  RuntimePreset,
  RuntimeProfile,
  RuntimeProfileResolveRequest,
} from "../runtime-profile";
import { authoredRuntimeSpec } from "../../../lib/runtime-profile-model";
import { OrderedPresetSelect } from "../runtime-profiles/OrderedPresetSelect";
import {
  modelModeOf,
  withModelMode,
  withRecentRuntime,
  type AIPromptRunValue,
  type AISpecRuntimeModel,
  type PromptRunModelMode,
} from "./model";
import { Block, PromptBlocks } from "./PromptBlocks";
import { RecentRuntimes } from "./RecentRuntimes";
import { permissionField, presetsField } from "./runtimeActions";
import { RuntimeRows } from "./RuntimeRows";

export type PromptRunEditorProps = {
  value: AIPromptRunValue;
  onChange: (value: AIPromptRunValue) => void;
  models?: ChatModel[] | undefined;
  families?: SpecRuntimeFamily[] | undefined;
  tools?: ToolMeta[] | undefined;
  permissionCatalog?: AISpecRuntimePermissionCatalog | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  cliOptions?: SpecRuntimeCLIOptions | undefined;
  /** Runner schemas keyed by fixture kind or fence info, used by the verification editor. */
  fixtureSchemas?: FixtureFenceSchemas | undefined;
  /** Sandbox adapter catalog; enables the spec editor's Sandbox section. */
  sandboxCatalog?: SpecRuntimeSandboxCatalog | undefined;
  /** Host-owned sandbox creation and credential-reference adapter. */
  sandboxCreate?: SpecRuntimeSandboxCreateConfig | undefined;
  reasoningEfforts?: string[] | undefined;
  /**
   * Runtimes the operator ran recently, newest first, listed under the runtime
   * bar (see `recordRecentRuntimes`). A chip replaces the single runtime or adds
   * a multi-model row.
   */
  recentRuntimes?: readonly AISpecRuntimeModel[] | undefined;

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

  /** Extra fields injected inside the Runtime block, below the runtime rows. */
  children?: ReactNode | undefined;
  header?: ReactNode | undefined;
  footer?: ReactNode | undefined;
  className?: string | undefined;

  /** Label of the runtime bar's ⋮ entry that opens the full spec modal. */
  advancedLabel?: string | undefined;
  specModalTitle?: string | undefined;
  /** Restrict which SpecRuntimeEditor sections the "Advanced" modal shows. */
  specSections?: readonly SpecSectionId[] | undefined;
  /**
   * Replaces the "Advanced" modal with inline tabs of spec sections (see
   * `SPEC_RUNTIME_TABS`), led by a tab holding Variables and the prompt.
   */
  specTabs?: readonly SpecRuntimeTab[] | undefined;

  /** @deprecated Profiles are no longer exposed by the prompt editor. */
  profiles?: RuntimeProfile[] | undefined;
  /** Available presets for direct ordered run selection. */
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

const MODEL_MODES: { id: PromptRunModelMode; label: string }[] = [
  { id: "single", label: "Single model" },
  { id: "multi", label: "Multi-model" },
];

// The single-model bar owns the run's timeout and max cost; the model tab only
// repeats limits that no bar shows.
const HOST_FIELDS: Record<PromptRunModelMode, SpecRuntimeHostField[]> = {
  single: ["runtime", "budget.timeout", "budget.cost"],
  multi: ["runtime"],
};

// The inline "prompt + variables + runtime" composer shared by captain's prompt
// workbench and gavel's todo run dialog. It edits Captain's complete prompt-run
// request without making hosts project that contract into editor-specific state.
// Hosts should mount it with a `key` per prompt/todo so internal draft state
// (raw-JSON text, modal open, active tab) resets on selection change.
export function PromptRunEditor({
  value,
  onChange,
  models = [],
  families = SPEC_RUNTIME_FAMILIES,
  tools = [],
  permissionCatalog,
  secretSelector,
  cliOptions,
  fixtureSchemas,
  sandboxCatalog,
  sandboxCreate,
  reasoningEfforts = DEFAULT_REASONING_EFFORTS,
  recentRuntimes = [],
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
  advancedLabel = "Advanced",
  specModalTitle = "Runtime spec",
  specSections,
  specTabs,
  presets,
  resolution,
}: PromptRunEditorProps) {
  if (specTabs && specSections) {
    throw new Error(
      "PromptRunEditor: pass either specSections or specTabs, not both",
    );
  }
  const [specOpen, setSpecOpen] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const spec = value.spec ?? {};
  const modelMode = modelModeOf(value);
  const presetCatalog = presets ?? [];
  const runRuntime =
    resolution?.spec ??
    authoredRuntimeSpec(
      {
        id: "selection",
        name: "Selection",
        spec,
        presets: value.presets ?? [],
      },
      presetCatalog,
    );

  // Spec-level run settings shown on the runtime bar. The permission field is
  // dropped under `specTabs` because the inline Permissions tab already owns it,
  // and a value with two editors in one layout is a value that drifts.
  const barActions: RuntimeBarActionsProps = {
    fields: [
      ...(specTabs
        ? []
        : [
            permissionField({
              spec,
              families,
              effectiveMode: runRuntime.mode,
              onChange: (next) => onChange({ ...value, spec: next }),
            }),
          ]),
      ...(presets === undefined
        ? []
        : [
            presetsField({
              presets: presetCatalog,
              value: value.presets ?? [],
              onChange: (next) => onChange({ ...value, presets: next }),
              onReorder: () => setPresetsOpen(true),
            }),
          ]),
    ].filter((field): field is RuntimeBarAction => field !== undefined),
    menu: specTabs
      ? []
      : [
          {
            label: advancedLabel,
            icon: UiGearSix,
            onSelect: () => setSpecOpen(true),
          },
        ],
  };

  const specEditorProps: SpecRuntimeEditorProps = {
    value: spec,
    onChange: (next) => onChange({ ...value, spec: next }),
    models,
    families,
    tools,
    effectiveModel: runRuntime.model,
    effectiveMode: runRuntime.mode,
    ...(permissionCatalog ? { permissionCatalog } : {}),
    ...(secretSelector ? { secretSelector } : {}),
    ...(cliOptions ? { cliOptions } : {}),
    ...(fixtureSchemas ? { fixtureSchemas } : {}),
    ...(sandboxCatalog ? { sandboxCatalog } : {}),
    ...(sandboxCreate ? { sandboxCreate } : {}),
  };
  const promptBlocks = (
    <PromptBlocks
      value={value}
      onChange={onChange}
      models={models}
      variablesSchema={variablesSchema}
      onVariablesValidityChange={onVariablesValidityChange}
      promptEditor={promptEditor}
      promptLabel={promptLabel}
      promptPlaceholder={promptPlaceholder}
      enableAttachments={enableAttachments}
      attachmentUpload={attachmentUpload}
      attachmentLimits={attachmentLimits}
    />
  );

  return (
    <div className={cn("grid grid-cols-1 gap-density-4", className)}>
      <SegmentedControl
        aria-label="Model mode"
        size="sm"
        value={modelMode}
        options={MODEL_MODES}
        onChange={(mode) => onChange(withModelMode(value, mode))}
        className="w-fit"
      />
      {header}

      <Block title="Runtime">
        <RuntimeRows
          value={value}
          onChange={onChange}
          models={models}
          families={families}
          reasoningEfforts={reasoningEfforts}
          effectiveRuntime={runRuntime}
          actions={barActions}
        />
        <RecentRuntimes
          runtimes={recentRuntimes}
          models={models}
          families={families}
          onSelect={(runtime) => onChange(withRecentRuntime(value, runtime))}
        />
        {children}
      </Block>

      {specTabs ? (
        <SpecRuntimeEditor
          {...specEditorProps}
          tabs={[
            {
              id: "prompt",
              label: promptLabel,
              content: (
                <div className="grid grid-cols-1 gap-density-4">
                  {promptBlocks}
                </div>
              ),
            },
            ...specTabs,
          ]}
          showHeader={false}
          hostFields={HOST_FIELDS[modelMode]}
          promptVariant="system"
        />
      ) : (
        promptBlocks
      )}

      {footer}

      {presets !== undefined && (
        <Modal
          open={presetsOpen}
          onClose={() => setPresetsOpen(false)}
          title="Presets"
          size="lg"
          closeOnEsc
        >
          <OrderedPresetSelect
            presets={presetCatalog}
            value={value.presets ?? []}
            onChange={(next) => onChange({ ...value, presets: next })}
          />
        </Modal>
      )}

      {!specTabs && (
        <Modal
          open={specOpen}
          onClose={() => setSpecOpen(false)}
          title={specModalTitle}
          size="full"
          closeOnEsc
          className="h-[95vh]"
        >
          <SpecRuntimeEditor
            {...specEditorProps}
            {...(specSections ? { sections: specSections } : {})}
            onSave={() => setSpecOpen(false)}
            onCancel={() => setSpecOpen(false)}
            saveLabel="Done"
            footerStatus={labelForMode(spec.mode, families)}
          />
        </Modal>
      )}
    </div>
  );
}
