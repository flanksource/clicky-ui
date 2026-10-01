import { useMemo, useState } from "react";
import { Button } from "../../components/button";
import { UiCoins, UiShield, UiSliders } from "../../icons";
import { cn } from "../../lib/utils";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { Modal } from "../../overlay/Modal";
import { Icon } from "../Icon";
import { DEFAULT_REASONING_EFFORTS } from "../chat/effort-icons";
import type {
  ChatBudgetConfig,
  ChatModel,
  ChatModelRuntime,
  ClaudePermissionMode,
  ToolAnnotations,
  ToolMeta,
  ToolPolicy,
} from "../chat/types";
import type { SpecRuntimeFamily } from "../runtime/runtime-mode";
import { AdvancedChatConfig } from "./AdvancedChatConfig";
import { AdvancedCostsPanel } from "./AdvancedCostsPanel";
import { ToolSchemaBrowser } from "./ToolSchemaBrowser";
import { buildToolSchemaSections } from "./ToolSchemaBrowser.model";
import { ToolPolicyTree } from "./ToolSchemaBrowser.tree";
import {
  CompactToolPreferencesList,
  type CompactToolPreferencesListProps,
} from "./ToolPreferencesList";
import type { PermissionPolicy, PermissionRule } from "../chat/tool-policy";

export type { ClaudePermissionMode, ToolAnnotations, ToolMeta, ToolPolicy };
export { CompactToolPreferencesList, type CompactToolPreferencesListProps };

export type ToolPreferencesProps = {
  tools: ToolMeta[];
  value: Record<string, ToolPolicy>;
  onRule: (rule: PermissionRule) => void;
  /** The user's saved rules, edited by the Permissions tab's strategy editor. */
  rules?: PermissionPolicy | undefined;
  onRulesChange?: ((rules: PermissionPolicy) => void) | undefined;
  models?: ChatModel[] | undefined;
  runtime?: ChatModelRuntime | undefined;
  onRuntimeChange?: ((runtime: ChatModelRuntime) => void) | undefined;
  model?: string | undefined;
  onModelChange?: ((model: string) => void) | undefined;
  runtimeFamilies?: SpecRuntimeFamily[] | undefined;
  reasoningEfforts?: string[] | undefined;
  runtimeLocked?: boolean | undefined;
  reasoningEffort?: string | undefined;
  onReasoningEffortChange?: ((effort: string) => void) | undefined;
  permissionMode?: ClaudePermissionMode | undefined;
  onPermissionModeChange?: ((mode: ClaudePermissionMode) => void) | undefined;
  budget?: ChatBudgetConfig | undefined;
  onBudgetChange?: ((budget: ChatBudgetConfig) => void) | undefined;
  /** Base sessions endpoint for the Costs tab, e.g. `/api/chat/sessions`. */
  costsApi?: string | undefined;
  /** Thread whose costs the Costs tab reports. */
  threadId?: string | undefined;
  toolsLoading?: boolean | undefined;
  toolsError?: string | null | undefined;
  catalogLoading?: boolean | undefined;
  catalogError?: string | null | undefined;
  onCatalogRetry?: (() => void) | undefined;
  className?: string;
};

export type AdvancedTab = "config" | "costs" | "permissions";

const ADVANCED_TABS: AdvancedTab[] = ["config", "costs", "permissions"];

const ADVANCED_TAB_ICONS: Record<AdvancedTab, typeof UiSliders> = {
  config: UiSliders,
  costs: UiCoins,
  permissions: UiShield,
};

export function ToolPreferences({
  className = "",
  ...props
}: ToolPreferencesProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <>
      <DropdownMenu
        align="right"
        className={className}
        menuClassName="w-72 max-h-[70vh] overflow-y-auto p-1"
        trigger={
          <Button
            variant="ghost"
            size="icon"
            title="Tool preferences"
            data-testid="tool-preferences-btn"
          >
            <Icon icon={UiSliders} className="size-4" />
          </Button>
        }
      >
        {(closeMenu) => (
          <ToolPreferencesMenu
            tools={props.tools}
            value={props.value}
            onRule={props.onRule}
            onAdvanced={() => {
              closeMenu();
              setAdvancedOpen(true);
            }}
          />
        )}
      </DropdownMenu>
      <Modal
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        title="Advanced Chat Settings"
        size="xl"
      >
        <AdvancedChatSettings {...props} className="h-[70vh]" />
      </Modal>
    </>
  );
}

export type ToolPreferencesMenuProps = {
  tools: ToolMeta[];
  value: Record<string, ToolPolicy>;
  onRule: (rule: PermissionRule) => void;
  /** Shows the Advanced action; omitted, the menu has no Advanced entry. */
  onAdvanced?: (() => void) | undefined;
  className?: string;
};

export function ToolPreferencesMenu({
  tools,
  value,
  onRule,
  onAdvanced,
  className,
}: ToolPreferencesMenuProps) {
  const sections = useMemo(
    () => buildToolSchemaSections(tools, "tree"),
    [tools],
  );
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const toggle = (key: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className={className}>
      <div className="mb-1 px-1 text-xs font-semibold">Tool Preferences</div>
      <ToolPolicyTree
        sections={sections}
        view="tree"
        value={value}
        onRule={onRule}
        isOpen={(key) => !collapsed.has(key)}
        onToggle={toggle}
        emptyLabel="No tools available"
      />
      {onAdvanced && (
        <div className="mt-2 border-t border-border pt-2">
          <button
            type="button"
            className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
            onClick={onAdvanced}
          >
            Advanced
          </button>
        </div>
      )}
    </div>
  );
}

export type AdvancedChatSettingsProps = ToolPreferencesProps & {
  defaultTab?: AdvancedTab | undefined;
};

export function AdvancedChatSettings({
  tools,
  value,
  onRule,
  rules,
  onRulesChange,
  models = [],
  runtime,
  onRuntimeChange,
  model,
  onModelChange,
  runtimeFamilies,
  reasoningEfforts = DEFAULT_REASONING_EFFORTS,
  runtimeLocked = false,
  reasoningEffort,
  onReasoningEffortChange,
  permissionMode = "default",
  onPermissionModeChange,
  budget,
  onBudgetChange,
  costsApi,
  threadId,
  toolsLoading = false,
  toolsError = null,
  catalogLoading = false,
  catalogError = null,
  onCatalogRetry,
  defaultTab = "config",
  className,
}: AdvancedChatSettingsProps) {
  const [advancedTab, setAdvancedTab] = useState<AdvancedTab>(defaultTab);
  const resolvedRuntime =
    runtime ??
    ({
      ...(model ? { model } : {}),
      ...(reasoningEffort ? { effort: reasoningEffort } : {}),
    } satisfies ChatModelRuntime);
  const handleRuntimeChange = (next: ChatModelRuntime) => {
    onRuntimeChange?.(next);
    if ((next.id ?? next.model ?? "") !== (model ?? "")) {
      onModelChange?.(next.id ?? next.model ?? "");
    }
    if ((next.effort ?? "") !== (reasoningEffort ?? "")) {
      onReasoningEffortChange?.(next.effort ?? "");
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      <div className="flex items-center gap-1 rounded border border-border bg-muted/30 p-1">
        {ADVANCED_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded px-3 text-xs font-medium capitalize",
              advancedTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60",
            )}
            onClick={() => setAdvancedTab(tab)}
          >
            <Icon icon={ADVANCED_TAB_ICONS[tab]} className="size-3.5" />
            {tab}
          </button>
        ))}
        <div className="flex-1" />
        {toolsLoading && (
          <span className="pr-2 text-[11px] text-muted-foreground">
            Loading tools
          </span>
        )}
        {toolsError && (
          <span className="pr-2 text-[11px] text-destructive">
            {toolsError}
          </span>
        )}
      </div>
      {advancedTab === "config" ? (
        <AdvancedChatConfig
          models={models}
          runtime={resolvedRuntime}
          onRuntimeChange={handleRuntimeChange}
          runtimeFamilies={runtimeFamilies}
          reasoningEfforts={reasoningEfforts}
          runtimeLocked={runtimeLocked}
          permissionMode={permissionMode}
          onPermissionModeChange={onPermissionModeChange}
          budget={budget}
          onBudgetChange={onBudgetChange}
          catalogLoading={catalogLoading}
          catalogError={catalogError}
          onCatalogRetry={onCatalogRetry}
        />
      ) : advancedTab === "costs" ? (
        <AdvancedCostsPanel costsApi={costsApi} threadId={threadId} />
      ) : (
        <ToolSchemaBrowser
          tools={tools}
          value={value}
          onRule={onRule}
          rules={rules}
          onRulesChange={onRulesChange}
          className="min-h-0 flex-1"
        />
      )}
    </div>
  );
}
