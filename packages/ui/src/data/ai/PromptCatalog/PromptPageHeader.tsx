import type { ReactNode } from "react";
import { Button } from "../../../components/button";
import { UiArrowLeft, UiWarningTriangle } from "../../../icons";
import { Badge } from "../../Badge";
import { CopyBadge } from "../../diagnostics/ErrorDetails";
import {
  effectiveLayer,
  layerLabel,
  layersAbove,
  runtimeSummary,
} from "./prompt-catalog-model";
import { PromptSourceBadge } from "./PromptSourceBadge";
import type { PromptCatalogEntry, PromptCatalogLayer } from "./types";

export type PromptPageHeaderProps = {
  entry: PromptCatalogEntry;
  selectedLayer?: PromptCatalogLayer | undefined;
  onBack?: (() => void) | undefined;
  actions?: ReactNode | undefined;
};

export function PromptPageHeader({
  entry,
  selectedLayer,
  onBack,
  actions,
}: PromptPageHeaderProps) {
  const effective = effectiveLayer(entry);
  const shadowing = selectedLayer ? layersAbove(entry, selectedLayer) : [];
  return (
    <header className="flex flex-col gap-2 border-b border-border px-density-4 py-density-3">
      <div className="flex items-start gap-3">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Back to prompts"
          >
            <UiArrowLeft />
          </Button>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold leading-tight">
              {entry.title}
            </h1>
            <PromptSourceBadge
              source={entry.source}
              parseError={entry.parseError}
            />
            <CopyBadge label="id" value={entry.id} />
            {entry.configPath && entry.configPath !== entry.id ? (
              <CopyBadge label="config" value={entry.configPath} />
            ) : null}
          </div>
          {entry.description ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {entry.description}
            </p>
          ) : null}
          <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-[auto_1fr]">
            <dt className="text-muted-foreground">Used by</dt>
            <dd className="flex flex-wrap gap-1">
              {(entry.usedBy ?? []).length === 0 ? (
                <span className="text-muted-foreground">—</span>
              ) : (
                (entry.usedBy ?? []).map((command) => (
                  <Badge
                    key={command}
                    variant="soft"
                    tone="neutral"
                    size="xs"
                    className="font-mono"
                    clickToCopy={false}
                  >
                    {command}
                  </Badge>
                ))
              )}
            </dd>
            <dt className="text-muted-foreground">Runs as</dt>
            <dd
              className={
                entry.effective.error ? "text-destructive" : "font-mono"
              }
            >
              {runtimeSummary(entry.effective)}
              {entry.effective.model ? (
                <span className="ml-1 font-sans text-muted-foreground">
                  (from {entry.effective.modelSource})
                </span>
              ) : null}
            </dd>
            <dt className="text-muted-foreground">Runs from</dt>
            <dd>
              {effective ? (
                <>
                  {layerLabel(effective.origin)}
                  <span className="ml-1 font-mono text-muted-foreground">
                    {effective.filePath ?? effective.path}
                  </span>
                </>
              ) : (
                "built-in default"
              )}
            </dd>
          </dl>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {shadowing.length > 0 ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/40 dark:text-amber-300"
        >
          <UiWarningTriangle className="shrink-0" />
          <span>
            A higher layer (
            {shadowing.map((layer) => layerLabel(layer.origin)).join(", ")})
            overrides this prompt; saving here changes nothing until that
            override is removed.
          </span>
        </div>
      ) : null}
    </header>
  );
}
