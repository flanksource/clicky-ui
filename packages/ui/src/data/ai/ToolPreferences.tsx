import { useMemo, useState } from "react";
import { Button } from "../../components/button";
import { UiCode2, UiCoins, UiShield, UiSliders } from "../../icons";
import { cn } from "../../lib/utils";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { Modal } from "../../overlay/Modal";
import { Icon } from "../Icon";
import { DEFAULT_REASONING_EFFORTS } from "../chat/effort-icons";
import type {
  ChatBudgetConfig,
  ChatModel,
  ChatModelRuntime,
  ChatUsageSummary,
  ClaudePermissionMode,
  ToolAnnotations,
  ToolMeta,
  ToolMode,
} from "../chat/types";
import type { SpecRuntimeFamily } from "../runtime/runtime-mode";
import { AdvancedChatConfig } from "./AdvancedChatConfig";
import { AdvancedCostsPanel } from "./AdvancedCostsPanel";
import { ToolSchemaBrowser } from "./ToolSchemaBrowser";
import {
  CompactToolList,
  CompactToolPreferencesList,
  type CompactToolPreferencesListProps,
} from "./ToolPreferencesList";
import { groupedToolEntries, type ToolGroup } from "./ToolPreferences.model";

export type { ClaudePermissionMode, ToolAnnotations, ToolMeta, ToolMode };
export { CompactToolPreferencesList, type CompactToolPreferencesListProps };

export type ToolPreferencesProps = {
  tools: ToolMeta[];
  value: Record<string, ToolMode>;
  onChange: (prefs: Record<string, ToolMode>) => void;
  models?: ChatModel[] | undefined;
  runtime?: ChatModelRuntime | undefined;
  onRuntimeChange?: ((runtime: ChatModelRuntime) => void) | undefined;
  model?: string | undefined;
  onModelChange?: ((model: string) => void) | undefined;
  runtimeFamilies?: SpecRuntimeFamily[] | undefined;
  reasoningEfforts?: string[] | undefined;
  reasoningEffort?: string | undefined;
  onReasoningEffortChange?: ((effort: string) => void) | undefined;
  permissionMode?: ClaudePermissionMode | undefined;
  onPermissionModeChange?: ((mode: ClaudePermissionMode) => void) | undefined;
  temperature?: number | undefined;
  onTemperatureChange?: ((temperature: number | undefined) => void) | undefined;
  budget?: ChatBudgetConfig | undefined;
  onBudgetChange?: ((budget: ChatBudgetConfig) => void) | undefined;
  usage?: ChatUsageSummary | null | undefined;
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

type AdvancedTab = "config" | "costs" | "permissions" | "browser";

const ADVANCED_TABS: AdvancedTab[] = ["config", "costs", "permissions", "browser"];

const ADVANCED_TAB_ICONS: Record<AdvancedTab, typeof UiSliders> = {
  config: UiSliders,
  costs: UiCoins,
  permissions: UiShield,
  browser: UiCode2,
};

export function ToolPreferences({
  tools,
  value,
  onChange,
  models = [],
  runtime,
  onRuntimeChange,
  model,
  onModelChange,
  runtimeFamilies,
  reasoningEfforts = DEFAULT_REASONING_EFFORTS,
  reasoningEffort,
  onReasoningEffortChange,
  permissionMode = "default",
  onPermissionModeChange,
  temperature,
  onTemperatureChange,
  budget,
  onBudgetChange,
  usage,
  costsApi,
  threadId,
  toolsLoading = false,
  toolsError = null,
  catalogLoading = false,
  catalogError = null,
  onCatalogRetry,
  className = "",
}: ToolPreferencesProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedTab, setAdvancedTab] = useState<AdvancedTab>("config");
  const groups = useMemo(() => groupedToolEntries(tools), [tools]);
  const resolvedRuntime =
    runtime ??
    ({
      ...(model ? { model } : {}),
      ...(reasoningEffort ? { effort: reasoningEffort } : {}),
      ...(temperature !== undefined ? { temperature } : {}),
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
          <div>
            <div className="mb-1 px-1 text-xs font-semibold">
              Tool Preferences
            </div>
            <CompactToolList
              groups={groups}
              value={value}
              onChange={onChange}
              emptyLabel="No tools available"
            />
            <div className="mt-2 border-t border-border pt-2">
              <button
                type="button"
                className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
                onClick={() => {
                  closeMenu();
                  setAdvancedOpen(true);
                }}
              >
                Advanced
              </button>
            </div>
          </div>
        )}
      </DropdownMenu>
      <Modal
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        title="Advanced Chat Settings"
        size="xl"
      >
        <div className="flex h-[70vh] min-h-0 flex-col gap-3">
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
              permissionMode={permissionMode}
              onPermissionModeChange={onPermissionModeChange}
              temperature={temperature}
              onTemperatureChange={onTemperatureChange}
              budget={budget}
              onBudgetChange={onBudgetChange}
              usage={usage}
              catalogLoading={catalogLoading}
              catalogError={catalogError}
              onCatalogRetry={onCatalogRetry}
            />
          ) : advancedTab === "costs" ? (
            <AdvancedCostsPanel costsApi={costsApi} threadId={threadId} />
          ) : advancedTab === "permissions" ? (
            <AdvancedPermissionsPanel
              groups={groups}
              value={value}
              onChange={onChange}
            />
          ) : (
            <ToolSchemaBrowser tools={tools} className="min-h-0 flex-1" />
          )}
        </div>
      </Modal>
    </>
  );
}

function AdvancedPermissionsPanel({
  groups,
  value,
  onChange,
}: {
  groups: ToolGroup[];
  value: Record<string, ToolMode>;
  onChange: (prefs: Record<string, ToolMode>) => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto rounded border border-border p-1">
      <CompactToolList
        groups={groups}
        value={value}
        onChange={onChange}
        emptyLabel="No tools"
      />
    </div>
  );
}
