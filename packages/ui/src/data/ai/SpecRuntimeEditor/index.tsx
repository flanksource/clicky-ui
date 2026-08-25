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
  sectionNumber,
  type SpecRuntimeSandboxCatalog,
  type SpecRuntimeSecretSelectorConfig,
  type SpecSectionId,
} from "./types";
import {
  SPEC_RUNTIME_FAMILIES,
  firstMode,
  type SpecRuntimeFamily,
} from "../../runtime/runtime-mode";
import { runtimeFieldSupport } from "../../runtime/runtime-field-support";
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
  tools?: ToolMeta[] | undefined;
  permissionCatalog?: AISpecRuntimePermissionCatalog | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  /** Schema for the backend's extra CLI args; enables the CLI flags section. */
  cliOptions?: SpecRuntimeCLIOptions | undefined;
  /** Sandbox adapter catalog; enables the Sandbox section. */
  sandboxCatalog?: SpecRuntimeSandboxCatalog | undefined;
  /** Host-owned sandbox creation and credential-reference adapter. */
  sandboxCreate?: SpecRuntimeSandboxCreateConfig | undefined;
  /** Optional section allow-list for embedded editors that only need part of the runtime spec. */
  sections?: readonly SpecSectionId[] | undefined;
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
  model: "fallbacks, session, caching",
  prompt: "schema",
  permissions: "full permission tree",
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
  tools = [],
  permissionCatalog,
  secretSelector,
  cliOptions,
  sandboxCatalog,
  sandboxCreate,
  sections: sectionFilter,
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
  const catalog = useMemo(
    () => buildPermissionCatalog(permissionCatalog, tools),
    [permissionCatalog, tools],
  );
  const runtimeFamilies = families?.length ? families : SPEC_RUNTIME_FAMILIES;
  const backend =
    value.backend?.trim() ||
    effectiveBackend?.trim() ||
    firstMode(runtimeFamilies[0] ?? SPEC_RUNTIME_FAMILIES[0]!).backend;
  const supports = runtimeFieldSupport(runtimeFamilies, backend);
  const entries = useMemo(
    () => specPermissionEntries(value, catalog),
    [value, catalog],
  );

  const allowedSections = useMemo(
    () => (sectionFilter ? new Set(sectionFilter) : undefined),
    [sectionFilter],
  );
  // "cli" and "sandbox" describe host-supplied catalogs; without one there is
  // nothing to choose from, so the section is omitted rather than rendered empty.
  const sections = SPEC_RUNTIME_SECTIONS.filter(
    (section) =>
      (section.id !== "cli" || (cliOptions && supports("cliArgs"))) &&
      (section.id !== "sandbox" || sandboxCatalog) &&
      (allowedSections == null || allowedSections.has(section.id)),
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
  ) => onChange(withPermissionEntries(value, applied, mode));
  const addEntry = (
    domain: Parameters<typeof withAddedPermission>[1],
    id: string,
  ) => {
    const next = withAddedPermission(value, domain, id);
    if (next) onChange(next);
  };

  const sectionBody = (id: SpecSectionId): ReactNode => {
    switch (id) {
      case "model":
        return (
          <ModelSection
            value={value}
            onChange={onChange}
            models={models}
            effectiveBackend={effectiveBackend}
            families={runtimeFamilies}
          />
        );
      case "prompt":
        return (
          <PromptSection
            value={value}
            onChange={onChange}
            supports={supports}
          />
        );
      case "workspace":
        return (
          <WorkspaceSection
            value={value}
            onChange={onChange}
            secretSelector={secretSelector}
            variant={variant}
            supports={supports}
          />
        );
      case "sandbox":
        return sandboxCatalog ? (
          <SandboxSection
            value={value}
            onChange={onChange}
            catalog={sandboxCatalog}
            families={runtimeFamilies}
            {...(sandboxCreate ? { createConfig: sandboxCreate } : {})}
          />
        ) : null;
      case "permissions":
        return (
          <PermissionsSection
            value={value}
            onChange={onChange}
            entries={entries}
            onApplyEntries={applyEntries}
            onAddEntry={addEntry}
          />
        );
      case "environment":
        return (
          <EnvironmentSection
            value={value}
            onChange={onChange}
            secretSelector={secretSelector}
          />
        );
      case "verify":
        return (
          <VerifySection
            value={value}
            onChange={onChange}
            models={models}
            families={runtimeFamilies}
            {...(secretSelector ? { secretSelector } : {})}
          />
        );
      case "commit":
        return <CommitSection value={value} onChange={onChange} />;
      case "cli":
        return cliOptions ? (
          <CLIArgsSection
            value={value}
            onChange={onChange}
            cliOptions={cliOptions}
          />
        ) : null;
    }
  };

  const sectionAdvanced = (id: SpecSectionId): ReactNode => {
    switch (id) {
      case "model":
        return (
          <ModelAdvanced
            value={value}
            onChange={onChange}
            models={models}
            supports={supports}
            families={runtimeFamilies}
          />
        );
      case "prompt":
        return supports("prompt.schema") ? (
          <PromptAdvanced value={value} onChange={onChange} />
        ) : undefined;
      case "permissions":
        return (
          <PermissionsAdvanced
            value={value}
            onChange={onChange}
            entries={entries}
            onApplyEntries={applyEntries}
            onAddEntry={addEntry}
            supports={supports}
          />
        );
      case "environment":
        return variant === "run" ? (
          <EnvironmentAdvanced value={value} onChange={onChange} />
        ) : undefined;
      default:
        return undefined;
    }
  };

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
        {beforeSections}
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            meta={section}
            number={sectionNumber(section.id)}
            domId={domId(section.id)}
            sectionRef={sectionRef(domId(section.id))}
            advanced={sectionAdvanced(section.id)}
            advancedHint={ADVANCED_HINTS[section.id]}
            defaultCollapsed={collapsedSections.has(section.id)}
          >
            {sectionBody(section.id)}
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
