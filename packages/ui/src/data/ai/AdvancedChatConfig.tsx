import { Button } from "../../components/button";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { RuntimeBar, type RuntimeBarValue } from "../runtime/RuntimeBar";
import type { RuntimeBarAction } from "../runtime/RuntimeBarActions";
import {
  SEGMENT_CAPTION_CLASS,
  SEGMENT_KEY_CLASS,
  SegmentItemLabel,
} from "../runtime/RuntimeBarSegment";
import type { SpecRuntimeFamily } from "../runtime/runtime-mode";
import type {
  ChatBudgetConfig,
  ChatModel,
  ChatModelRuntime,
  ClaudePermissionMode,
} from "../chat/types";
import { CLAUDE_PERMISSION_MODE_OPTIONS } from "../chat/types";
import { sessionTone } from "./session-tones";
import { permissionModeVisual } from "./SpecRuntimeEditor/permission-mode-visuals";

export type AdvancedChatConfigProps = {
  models: ChatModel[];
  runtime: ChatModelRuntime;
  onRuntimeChange?: ((runtime: ChatModelRuntime) => void) | undefined;
  runtimeFamilies?: SpecRuntimeFamily[] | undefined;
  reasoningEfforts: string[];
  runtimeLocked?: boolean | undefined;
  permissionMode: ClaudePermissionMode;
  onPermissionModeChange?: ((mode: ClaudePermissionMode) => void) | undefined;
  budget?: ChatBudgetConfig | undefined;
  onBudgetChange?: ((budget: ChatBudgetConfig) => void) | undefined;
  catalogLoading?: boolean | undefined;
  catalogError?: string | null | undefined;
  onCatalogRetry?: (() => void) | undefined;
};

export function AdvancedChatConfig({
  models,
  runtime,
  onRuntimeChange,
  runtimeFamilies,
  reasoningEfforts,
  runtimeLocked = false,
  permissionMode,
  onPermissionModeChange,
  budget,
  onBudgetChange,
  catalogLoading = false,
  catalogError = null,
  onCatalogRetry,
}: AdvancedChatConfigProps) {
  // The bar edits the run's cost cap alongside its identity; the chat keeps the
  // two in separate settings, so split them on the way out.
  const barValue: RuntimeBarValue = {
    ...runtime,
    ...(budget?.cost !== undefined ? { budget: { cost: budget.cost } } : {}),
  };
  const handleBarChange = ({ budget: limits, ...next }: RuntimeBarValue) => {
    onRuntimeChange?.(next);
    if (limits?.cost === budget?.cost) return;
    const updated: ChatBudgetConfig = { ...budget };
    if (limits?.cost === undefined) delete updated.cost;
    else updated.cost = limits.cost;
    onBudgetChange?.(updated);
  };

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
      <section className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Runtime
        </div>
        {runtimeLocked && (
          <div className="rounded border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Model and backend are locked after the first message. Fork this
            conversation to change them; effort, permissions and cost remain
            adjustable.
          </div>
        )}
        {catalogLoading && (
          <div className="text-xs text-muted-foreground">
            Checking model and runtime availability…
          </div>
        )}
        {catalogError && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive"
          >
            <span>{catalogError}</span>
            {onCatalogRetry && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onCatalogRetry}
              >
                Retry
              </Button>
            )}
          </div>
        )}
        <RuntimeBar
          ariaLabel="Advanced runtime"
          value={barValue}
          onChange={handleBarChange}
          models={models}
          reasoningEfforts={reasoningEfforts}
          locked={runtimeLocked}
          showCost
          actions={{
            fields: [
              chatPermissionField(permissionMode, onPermissionModeChange),
            ],
          }}
          {...(runtimeFamilies ? { families: runtimeFamilies } : {})}
          className="max-w-full"
        />
      </section>
    </div>
  );
}

const PERMISSION_GROUP = "Permission mode";

function chatPermissionField(
  current: ClaudePermissionMode,
  onChange: ((mode: ClaudePermissionMode) => void) | undefined,
): RuntimeBarAction {
  const option = CLAUDE_PERMISSION_MODE_OPTIONS.find(
    (entry) => entry.value === current,
  );
  const label = option?.label ?? current;
  // The chat speaks Claude's permission vocabulary, so it borrows Claude's
  // per-mode glyphs and tones from the shared runtime-bar visuals.
  const visual = (mode: ClaudePermissionMode) =>
    permissionModeVisual("claude", mode);
  const currentVisual = visual(current);
  return {
    id: "permissions.mode",
    isSet: true,
    label: PERMISSION_GROUP,
    icon: currentVisual.icon,
    iconClassName: sessionTone(currentVisual.tone).text,
    title: `${PERMISSION_GROUP} — ${label}`,
    caption: (
      <>
        <span className={cn(SEGMENT_KEY_CLASS, "min-w-0 truncate")}>Perms</span>
        <Icon
          icon={currentVisual.icon}
          className={cn(
            "size-4 shrink-0",
            sessionTone(currentVisual.tone).text,
          )}
        />
        <span className={cn(SEGMENT_CAPTION_CLASS, "shrink-0")}>{label}</span>
      </>
    ),
    items: CLAUDE_PERMISSION_MODE_OPTIONS.map((entry) => ({
      group: PERMISSION_GROUP,
      icon: visual(entry.value).icon,
      iconClassName: sessionTone(visual(entry.value).tone).text,
      label: (
        <SegmentItemLabel
          text={entry.label}
          hint={entry.description}
          selected={entry.value === current}
          stacked
        />
      ),
      onSelect: () => onChange?.(entry.value),
    })),
  };
}
