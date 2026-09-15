import { UiRobotAi } from "../../icons";
import { cn } from "../../lib/utils";
import { Icon, type StaticIconComponent } from "../Icon";
import { runtimeModeIcon } from "../runtime/runtime-mode";
import {
  effortLevelColor,
  effortLevelIcon,
  effortLevelLabel,
} from "./effort-icons";
import { shortContextModelName } from "./ContextMeter.model";
import { providerIcon, providerIconColor } from "./provider-icons";

type ContextMeterBarProps = {
  pct: number;
  provider?: string | undefined;
  executionMode?: string | undefined;
  model?: string | undefined;
  modelIcon?: StaticIconComponent | undefined;
  modelIconClassName?: string | undefined;
  effort?: string | undefined;
  barClassName: string;
  textClassName: string;
  className?: string | undefined;
};

export function ContextMeterBar({
  pct,
  provider,
  executionMode,
  model,
  modelIcon,
  modelIconClassName,
  effort,
  barClassName,
  textClassName,
  className,
}: ContextMeterBarProps) {
  const ProviderGlyph = modelIcon ?? providerIcon(provider) ?? UiRobotAi;
  const ModeGlyph = runtimeModeIcon(executionMode);
  const EffortGlyph = effort ? effortLevelIcon(effort) : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground",
        className,
      )}
      aria-label={`Context ${pct}% used`}
    >
      <span
        data-context-identity="provider"
        data-context-provider={provider ?? "unknown"}
        title={provider ? `Provider: ${provider}` : "Provider"}
        className="inline-flex shrink-0"
      >
        <Icon
          icon={ProviderGlyph}
          className={cn(
            "size-3.5",
            modelIconClassName ?? providerIconColor(provider),
          )}
        />
      </span>
      {model ? (
        <span
          data-context-identity="model"
          className="min-w-0 max-w-32 truncate font-medium text-foreground"
          title={model}
        >
          {shortContextModelName(model)}
        </span>
      ) : null}
      {ModeGlyph ? (
        <span
          data-context-identity="mode"
          data-context-mode={executionMode}
          title={`Mode: ${executionMode}`}
          className="inline-flex shrink-0"
        >
          <Icon icon={ModeGlyph} className="size-3.5" />
        </span>
      ) : null}
      {EffortGlyph && effort ? (
        <span
          data-context-identity="effort"
          data-context-effort={effort}
          title={`${effortLevelLabel(effort)} effort`}
          className="inline-flex shrink-0"
        >
          <Icon
            icon={EffortGlyph}
            className={cn("size-3.5", effortLevelColor(effort))}
          />
        </span>
      ) : null}
      <span
        data-context-identity="progress"
        className="inline-flex shrink-0 items-center"
      >
        <span
          data-context-progress="horizontal"
          aria-hidden="true"
          className="h-1.5 w-16 overflow-hidden rounded-full bg-muted max-md:hidden @max-[48rem]:hidden"
        >
          <span
            className={cn(
              "block h-full rounded-full transition-all",
              barClassName,
            )}
            style={{ width: `${pct}%` }}
          />
        </span>
        <span
          data-context-progress="vertical"
          aria-hidden="true"
          className="relative hidden h-4 w-1.5 overflow-hidden rounded-full bg-muted max-md:inline-flex @max-[48rem]:inline-flex"
        >
          <span
            className={cn(
              "absolute inset-x-0 bottom-0 block w-full rounded-full transition-all",
              barClassName,
            )}
            style={{ height: `${pct}%` }}
          />
        </span>
      </span>
      <span
        data-context-identity="percentage"
        className={cn("shrink-0 font-medium tabular-nums", textClassName)}
      >
        {pct}%
      </span>
    </span>
  );
}
