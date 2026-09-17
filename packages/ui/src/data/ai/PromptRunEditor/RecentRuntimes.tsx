import { Button } from "../../../components/button";
import { UiHistory } from "../../../icons";
import { cn } from "../../../lib/utils";
import { Icon } from "../../Icon";
import { effortLevelLabel } from "../../chat/effort-icons";
import type { ChatModel } from "../../chat/types";
import { runtimeFamilyBrand, runtimeModelForValue } from "../../runtime/RuntimeBar.model";
import {
  familyById,
  firstMode,
  selectionForRuntime,
  type SpecRuntimeFamily,
} from "../../runtime/runtime-mode";
import { recentRuntimeKey, type AISpecRuntimeModel } from "./model";

// Host-supplied runtimes the operator ran recently, one click from reuse.
export function RecentRuntimes({
  runtimes,
  models,
  families,
  onSelect,
}: {
  runtimes: readonly AISpecRuntimeModel[];
  models: ChatModel[];
  families: SpecRuntimeFamily[];
  onSelect: (runtime: AISpecRuntimeModel) => void;
}) {
  if (runtimes.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Icon icon={UiHistory} className="size-3.5" />
        Recent
      </span>
      <ul aria-label="Recently used runtimes" className="contents">
        {runtimes.map((runtime) => (
          <li key={recentRuntimeKey(runtime)}>
            <RecentRuntimeChip
              runtime={runtime}
              models={models}
              families={families}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecentRuntimeChip({
  runtime,
  models,
  families,
  onSelect,
}: {
  runtime: AISpecRuntimeModel;
  models: ChatModel[];
  families: SpecRuntimeFamily[];
  onSelect: (runtime: AISpecRuntimeModel) => void;
}) {
  const selection = selectionForRuntime(families, runtime.mode, runtime.model, models);
  const family = familyById(families, selection.family);
  const mode = family.modes.find((entry) => entry.id === selection.mode) ?? firstMode(family);
  const brand = runtimeFamilyBrand(family);
  const parts = [
    runtimeModelForValue(models, runtime)?.label ?? runtime.model ?? "Default model",
    `${family.label} ${mode.label}`,
    ...(runtime.effort ? [effortLevelLabel(runtime.effort)] : []),
  ];

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-6 gap-1 rounded-full px-2 text-xs font-normal"
      onClick={() => onSelect(runtime)}
    >
      {brand.icon && <Icon icon={brand.icon} className={cn("size-3.5 shrink-0", brand.color)} />}
      {parts.map((part, index) => (
        <span key={index} className={cn(index === 0 && "font-mono")}>
          {index > 0 && <span aria-hidden className="pr-1 text-muted-foreground">·</span>}
          {part}
        </span>
      ))}
    </Button>
  );
}
