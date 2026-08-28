import { useId, useMemo, type ReactNode } from "react";
import { cn } from "../../../lib/utils";
import type { ChatModel, ToolMeta } from "../../chat/types";
import type {
  AISpecRuntimePermissionCatalog,
  AISpecRuntimeValue,
} from "../SpecRuntimeEditor.model";
import type { SpecRuntimeSandboxCreateConfig } from "../SandboxCreateWizard.model";
import { CLIArgsSection, type SpecRuntimeCLIOptions } from "./CLIArgsSection";
import { CommitSection } from "./CommitSection";
import { EnvironmentAdvanced, EnvironmentSection } from "./EnvironmentSection";
import { Footer } from "./Footer";
import { ModelContextAdvanced } from "./ModelContextAdvanced";
import { ModelAdvanced, ModelSection } from "./ModelSection";
import { PermissionsAdvanced, PermissionsSection } from "./PermissionsSection";
import { PromptAdvanced, PromptSection } from "./PromptSection";
import { Rail } from "./Rail";
import { SandboxSection } from "./SandboxSection";
import { SectionCard } from "./SectionCard";
import { VerifySection } from "./VerifySection";
import { WorkspaceSection } from "./WorkspaceSection";
import {
  buildPermissionCatalog,
  specPermissionEntries,
  withAddedPermission,
  withPermissionEntries,
} from "./permissions-model";
import { summarizeTarget } from "./summaries";
import {
  SPEC_RUNTIME_SECTIONS,
  type SpecRuntimeSandboxCatalog,
  type SpecRuntimeSecretSelectorConfig,
  type SpecSectionId,
} from "./types";
import {
  SPEC_RUNTIME_FAMILIES,
  familyForModel,
  firstMode,
  runtimeBackendError,
  runtimeBackendFromModel,
  runtimeModelError,
  modeForBackend,
  type SpecRuntimeFamily,
} from "../../runtime/runtime-mode";
import {
  runtimeFieldSection,
  runtimeFieldSupport,
  runtimeSchemaPropertyAtPath,
  SUPPORT_ALL_RUNTIME_FIELDS,
} from "../../runtime/runtime-field-support";
import { useScrollSpy } from "./use-scrollspy";

export type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
export type {
  SpecRuntimeSandboxAgent,
  SpecRuntimeSandboxBackend,
  SpecRuntimeSandboxCatalog,
  SpecRuntimeSandboxKind,
  SpecRuntimeSecretSelectorConfig,
} from "./types";
export type { SpecRuntimeCLIOptions } from "./CLIArgsSection";
export {
  SPEC_RUNTIME_FAMILIES,
  type SpecRuntimeFamily,
  type SpecRuntimeModeOption,
} from "../../runtime/runtime-mode";

export type SpecRuntimeEditorProps = {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  models?: ChatModel[] | undefined;
  /** Provider families for the two-axis Family → Mode picker in the model section. */
  families?: SpecRuntimeFamily[] | undefined;
  /** Resolved backend used to validate posture when this editable layer inherits backend. */
  effectiveBackend?: string | undefined;
  /** Resolved model used to identify the inherited provider family. */
  effectiveModel?: string | undefined;
  tools?: ToolMeta[] | undefined;
  permissionCatalog?: AISpecRuntimePermissionCatalog | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  /** Schema for the backend's extra CLI args; enables the CLI flags section. */
  cliOptions?: SpecRuntimeCLIOptions | undefined;
  /** Sandbox adapter catalog; enables the Sandbox section. */
  sandboxCatalog?: SpecRuntimeSandboxCatalog | undefined;
  /** Host-owned sandbox creation and credential-reference adapter. */
  sandboxCreate?: SpecRuntimeSandboxCreateConfig | undefined;
  /** Optional ordered section selection for embedded editors that only need part of the runtime spec. */
  sections?: readonly SpecSectionId[] | undefined;
  /** Presents prompt.user as a complete .prompt document body. */
  promptVariant?: "runtime" | "document" | undefined;
  /** Disables value controls while preserving section navigation and disclosures. */
  readOnly?: boolean | undefined;
  className?: string | undefined;
  title?: ReactNode | undefined;
  eyebrow?: ReactNode | undefined;
  /** Hide the editor rail when a host modal already supplies the context. */
  showHeader?: boolean | undefined;
  /** Content rendered before the first section inside the editor column. */
  beforeSections?: ReactNode | undefined;
  /** Sections that should start collapsed in embedded contexts. */
  defaultCollapsedSections?: readonly SpecSectionId[] | undefined;
  /** Restrict task-owned fields when editing a reusable preset fragment. */
  variant?: "run" | "preset" | undefined;
  /** Renders the sticky footer's save action when set. */
  onSave?: (() => void) | undefined;
  /** Renders the sticky footer's cancel action when set. */
  onCancel?: (() => void) | undefined;
  saveLabel?: string | undefined;
  footerStatus?: ReactNode | undefined;
};

const ADVANCED_HINTS: Partial<Record<SpecSectionId, string>> = {
  model: "fallbacks, session, caching, memory, skills",
  prompt: "schema",
  permissions: "tools, MCP, plugins",
  environment: "dotenv files",
};

// Full-page runtime spec editor (design "Runtime Spec Editor v2"): a live
// summary rail with scrollspy nav, preset quick-starts, and stacked numbered
// sections. Container-responsive so it works embedded in a modal or standalone.
export function SpecRuntimeEditor({
  value,
  onChange,
  models = [],
  families,
  effectiveBackend,
  effectiveModel,
  tools = [],
  permissionCatalog,
  secretSelector,
  cliOptions,
  sandboxCatalog,
  sandboxCreate,
  sections: sectionFilter,
  promptVariant = "runtime",
  readOnly = false,
  className,
  title = "Runtime Spec",
  eyebrow = "Agent configuration",
  showHeader = true,
  beforeSections,
  defaultCollapsedSections,
  variant = "run",
  onSave,
  onCancel,
  saveLabel = "Save & run",
  footerStatus = "Ready to run",
}: SpecRuntimeEditorProps) {
  const idPrefix = useId();
  const commitChange: (next: AISpecRuntimeValue) => void = readOnly
    ? () => undefined
    : onChange;
  const catalog = useMemo(
    () => buildPermissionCatalog(permissionCatalog, tools),
    [permissionCatalog, tools],
  );
  const runtimeFamilies = families?.length ? families : SPEC_RUNTIME_FAMILIES;
  const selectedFamily = familyForModel(
    runtimeFamilies,
    models,
    value.model || effectiveModel,
  );
  const backend =
    runtimeBackendFromModel(value.model) ||
    value.backend?.trim() ||
    effectiveBackend?.trim() ||
    firstMode(runtimeFamilies[0] ?? SPEC_RUNTIME_FAMILIES[0]!).backend;
  const runtimeError =
    runtimeModelError(value.model || effectiveModel) ??
    runtimeBackendError(runtimeFamilies, backend, selectedFamily?.id);
  const selectedRuntime = runtimeError
    ? undefined
    : modeForBackend(runtimeFamilies, backend, selectedFamily?.id);
  const supports = selectedRuntime
    ? runtimeFieldSupport(runtimeFamilies, backend, selectedFamily?.id)
    : SUPPORT_ALL_RUNTIME_FIELDS;
  const runtimeSchema = selectedRuntime?.schema;
  const hasSandboxSection =
    runtimeSchema != null &&
    runtimeSchemaPropertyAtPath(runtimeSchema, "sandbox.mode") != null;
  const entries = useMemo(
    () => specPermissionEntries(value, catalog),
    [value, catalog],
  );
  const skillsSection = selectedRuntime
    ? (runtimeFieldSection(
        runtimeFamilies,
        backend,
        "permissions.skills",
        selectedFamily?.id,
      ) ?? "model")
    : "model";
  const modelSkillEntries = entries.filter(
    (entry) =>
      entry.domain === "skills" &&
      skillsSection === "model" &&
      supports("permissions.skills"),
  );
  const permissionEntries = entries.filter(
    (entry) =>
      (entry.domain !== "skills" || skillsSection === "permissions") &&
      supports(`permissions.${entry.domain}`),
  );
  const hasPermissionSection =
    (skillsSection === "permissions" && supports("permissions.skills")) ||
    (["tools", "mcp", "plugins"] as const).some((domain) =>
      supports(`permissions.${domain}`),
    );

  const requestedSections = useMemo(
    () =>
      sectionFilter
        ? sectionFilter.map((id) => {
            const section = SPEC_RUNTIME_SECTIONS.find(
              (candidate) => candidate.id === id,
            );
            if (!section)
              throw new Error(
                `unknown runtime editor section ${JSON.stringify(id)}`,
              );
            return section;
          })
        : SPEC_RUNTIME_SECTIONS,
    [sectionFilter],
  );
  // Sandbox modes come from the selected runtime schema. The adapter catalog is
  // optional metadata for configured Docker and Git Agent backends.
  const sections = requestedSections.filter(
    (section) =>
      (section.id !== "cli" || (cliOptions && supports("cliArgs"))) &&
      (section.id !== "sandbox" || hasSandboxSection) &&
      (section.id !== "permissions" || hasPermissionSection),
  );
  const collapsedSections = useMemo(
    () => new Set(defaultCollapsedSections ?? []),
    [defaultCollapsedSections],
  );
  const domId = (id: SpecSectionId) => `${idPrefix}-${id}`;
  const { sectionRef } = useScrollSpy(
    sections.map((section) => domId(section.id)),
  );

  const applyEntries = (
    applied: Parameters<typeof withPermissionEntries>[1],
    mode: Parameters<typeof withPermissionEntries>[2],
  ) => commitChange(withPermissionEntries(value, applied, mode));
  const addEntry = (
    domain: Parameters<typeof withAddedPermission>[1],
    id: string,
  ) => {
    const next = withAddedPermission(value, domain, id);
    if (next) commitChange(next);
  };

  const sectionBody = (id: SpecSectionId): ReactNode => {
    switch (id) {
      case "model":
        return (
          <ModelSection
            value={value}
            onChange={commitChange}
            models={models}
            effectiveBackend={effectiveBackend}
            effectiveModel={effectiveModel}
            families={runtimeFamilies}
          />
        );
      case "prompt":
        return (
          <PromptSection
            value={value}
            onChange={commitChange}
            supports={supports}
            variant={promptVariant}
          />
        );
      case "workspace":
        return (
          <WorkspaceSection
            value={value}
            onChange={commitChange}
            secretSelector={secretSelector}
            variant={variant}
            supports={supports}
          />
        );
      case "sandbox":
        return runtimeSchema ? (
          <SandboxSection
            value={value}
            onChange={commitChange}
            schema={runtimeSchema}
            {...(sandboxCatalog ? { catalog: sandboxCatalog } : {})}
            families={runtimeFamilies}
            {...(sandboxCreate ? { createConfig: sandboxCreate } : {})}
          />
        ) : null;
      case "permissions":
        return supports("permissions") ? (
          <PermissionsSection
            value={value}
            onChange={commitChange}
            entries={permissionEntries}
          />
        ) : null;
      case "environment":
        return (
          <EnvironmentSection
            value={value}
            onChange={commitChange}
            secretSelector={secretSelector}
          />
        );
      case "verify":
        return (
          <VerifySection
            value={value}
            onChange={commitChange}
            models={models}
            families={runtimeFamilies}
            {...(secretSelector ? { secretSelector } : {})}
          />
        );
      case "commit":
        return <CommitSection value={value} onChange={commitChange} />;
      case "cli":
        return cliOptions ? (
          <CLIArgsSection
            value={value}
            onChange={commitChange}
            cliOptions={cliOptions}
          />
        ) : null;
    }
  };

  const sectionAdvanced = (id: SpecSectionId): ReactNode => {
    switch (id) {
      case "model":
        return (
          <div className="grid gap-density-3">
            <ModelAdvanced
              value={value}
              onChange={commitChange}
              models={models}
              supports={supports}
              families={runtimeFamilies}
            />
            <ModelContextAdvanced
              value={value}
              onChange={commitChange}
              entries={modelSkillEntries}
              onApplyEntries={applyEntries}
              onAddEntry={addEntry}
              showSkills={skillsSection === "model"}
              supports={supports}
            />
          </div>
        );
      case "prompt":
        return supports("prompt.schema") ? (
          <PromptAdvanced value={value} onChange={commitChange} />
        ) : undefined;
      case "permissions":
        return (
          <PermissionsAdvanced
            entries={permissionEntries}
            onApplyEntries={applyEntries}
            onAddEntry={addEntry}
            includeSkills={skillsSection === "permissions"}
            supports={supports}
          />
        );
      case "environment":
        return variant === "run" ? (
          <EnvironmentAdvanced value={value} onChange={commitChange} />
        ) : undefined;
      default:
        return undefined;
    }
  };

  const valueControls = (content: ReactNode) =>
    readOnly && content ? (
      <fieldset disabled className="m-0 min-w-0 border-0 p-0">
        {content}
      </fieldset>
    ) : (
      content
    );

  return (
    <div className={cn("@container", className)}>
      <div className="mx-auto max-w-[820px] px-density-4 py-density-4">
        {showHeader && (
          <Rail
            eyebrow={eyebrow}
            title={title}
            target={summarizeTarget(value)}
          />
        )}
        {runtimeError ? (
          <div
            role="alert"
            className="mb-density-3 rounded-md border border-destructive/40 bg-destructive/10 px-density-3 py-density-2 text-sm text-destructive"
          >
            {runtimeError} Select a valid backend below or switch to Raw to
            repair the prompt source.
          </div>
        ) : null}
        {beforeSections}
        {sections.map((section, index) => (
          <SectionCard
            key={section.id}
            meta={
              section.id === "prompt" && promptVariant === "document"
                ? {
                    ...section,
                    hint: "The .prompt document body and its explicit system fields.",
                  }
                : section
            }
            number={String(index + 1).padStart(2, "0")}
            domId={domId(section.id)}
            sectionRef={sectionRef(domId(section.id))}
            advanced={valueControls(sectionAdvanced(section.id))}
            advancedHint={ADVANCED_HINTS[section.id]}
            defaultCollapsed={collapsedSections.has(section.id)}
          >
            {valueControls(sectionBody(section.id))}
          </SectionCard>
        ))}
      </div>
      {(onSave || onCancel) && (
        <Footer
          status={footerStatus}
          saveLabel={saveLabel}
          onSave={onSave}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
