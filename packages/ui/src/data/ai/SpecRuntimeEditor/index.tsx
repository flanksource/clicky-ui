import { useId, useMemo, type ReactNode } from "react";
import { cn } from "../../../lib/utils";
import type { ChatModel, ToolMeta } from "../../chat/types";
import type {
  AISpecRuntimePermissionCatalog,
  AISpecRuntimeValue,
} from "../SpecRuntimeEditor.model";
import { CLIArgsSection, type SpecRuntimeCLIOptions } from "./CLIArgsSection";
import { CommitSection } from "./CommitSection";
import { EnvironmentAdvanced, EnvironmentSection } from "./EnvironmentSection";
import { Footer } from "./Footer";
import { ModelAdvanced, ModelSection } from "./ModelSection";
import { PermissionsAdvanced, PermissionsSection } from "./PermissionsSection";
import { PromptAdvanced, PromptSection } from "./PromptSection";
import { Rail } from "./Rail";
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
  type SpecRuntimeSecretSelectorConfig,
  type SpecSectionId,
} from "./types";
import type { SpecRuntimeFamily } from "../runtime-mode";
import { useScrollSpy } from "./use-scrollspy";

export type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
export type { SpecRuntimeSecretSelectorConfig } from "./types";
export type { SpecRuntimeCLIOptions } from "./CLIArgsSection";
export {
  SPEC_RUNTIME_FAMILIES,
  type SpecRuntimeFamily,
  type SpecRuntimeModeOption,
} from "../runtime-mode";

export type SpecRuntimeEditorProps = {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  models?: ChatModel[] | undefined;
  /** Provider families for the two-axis Family → Mode picker in the model section. */
  families?: SpecRuntimeFamily[] | undefined;
  tools?: ToolMeta[] | undefined;
  permissionCatalog?: AISpecRuntimePermissionCatalog | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  /** Schema for the backend's extra CLI args; enables the CLI flags section. */
  cliOptions?: SpecRuntimeCLIOptions | undefined;
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
  /** Renders the sticky footer's save action when set. */
  onSave?: (() => void) | undefined;
  /** Renders the sticky footer's cancel action when set. */
  onCancel?: (() => void) | undefined;
  saveLabel?: string | undefined;
  footerStatus?: ReactNode | undefined;
};

const ADVANCED_HINTS: Partial<Record<SpecSectionId, string>> = {
  model: "caching",
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
  tools = [],
  permissionCatalog,
  secretSelector,
  cliOptions,
  sections: sectionFilter,
  className,
  title = "Runtime Spec",
  eyebrow = "Agent configuration",
  showHeader = true,
  beforeSections,
  defaultCollapsedSections,
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
  const entries = useMemo(
    () => specPermissionEntries(value, catalog),
    [value, catalog],
  );

  const allowedSections = useMemo(
    () => (sectionFilter ? new Set(sectionFilter) : undefined),
    [sectionFilter],
  );
  const sections = SPEC_RUNTIME_SECTIONS.filter(
    (section) =>
      (section.id !== "cli" || cliOptions) &&
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
            {...(families ? { families } : {})}
          />
        );
      case "prompt":
        return <PromptSection value={value} onChange={onChange} />;
      case "workspace":
        return (
          <WorkspaceSection
            value={value}
            onChange={onChange}
            secretSelector={secretSelector}
          />
        );
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
            {...(families ? { families } : {})}
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
            {...(families ? { families } : {})}
          />
        );
      case "prompt":
        return <PromptAdvanced value={value} onChange={onChange} />;
      case "permissions":
        return (
          <PermissionsAdvanced
            value={value}
            onChange={onChange}
            entries={entries}
            onApplyEntries={applyEntries}
            onAddEntry={addEntry}
          />
        );
      case "environment":
        return <EnvironmentAdvanced value={value} onChange={onChange} />;
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
