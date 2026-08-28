import { UiCheck, UiLock } from "../../../icons";
import { cn } from "../../../lib/utils";
import { Badge } from "../../Badge";
import { effectiveLayer, layerLabel } from "./prompt-catalog-model";
import { PromptSourceBadge } from "./PromptSourceBadge";
import type { PromptCatalogEntry, PromptCatalogLayer } from "./types";

export type PromptLayerStripProps = {
  entry: PromptCatalogEntry;
  selectedOrigin?: string | undefined;
  onSelect: (layer: PromptCatalogLayer) => void;
};

// PromptLayerStrip shows the config chain lowest → highest precedence, marks
// the layer whose override runs, and lets the user pick which layer to view or
// edit. Read-only layers stay selectable so their content can be inspected.
export function PromptLayerStrip({
  entry,
  selectedOrigin,
  onSelect,
}: PromptLayerStripProps) {
  const effective = effectiveLayer(entry);
  if (entry.layers.length === 0) {
    return (
      <p className="px-density-4 py-density-2 text-xs text-muted-foreground">
        No configuration layers for this prompt.
      </p>
    );
  }
  return (
    <div
      role="group"
      aria-label="Configuration layers"
      className="flex flex-wrap items-stretch gap-2 px-density-4 py-density-2"
    >
      {entry.layers.map((layer, index) => {
        const active = layer.origin === selectedOrigin;
        return (
          <button
            key={layer.origin}
            type="button"
            aria-pressed={active}
            title={layer.path}
            onClick={() => onSelect(layer)}
            className={cn(
              "flex min-w-44 flex-col gap-1 rounded-md border px-3 py-2 text-left text-xs transition",
              active
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted",
            )}
          >
            <span className="flex items-center gap-1.5 font-medium">
              <span className="text-muted-foreground">{index + 1}.</span>
              <span>{layerLabel(layer.origin)}</span>
              {!layer.editable ? (
                <UiLock
                  className="text-muted-foreground"
                  aria-label="read-only"
                />
              ) : null}
            </span>
            <span className="flex flex-wrap items-center gap-1.5">
              {layer.source === "none" ? (
                <span className="text-muted-foreground">unset</span>
              ) : (
                <PromptSourceBadge source={layer.source} />
              )}
              {layer.fields && layer.fields.length > 0 ? (
                <span className="font-mono text-[11px] text-muted-foreground">
                  {layer.fields.join(", ")}
                </span>
              ) : null}
              {effective?.origin === layer.origin ? (
                <Badge
                  variant="soft"
                  tone="success"
                  size="xs"
                  icon={UiCheck}
                  clickToCopy={false}
                >
                  effective
                </Badge>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
