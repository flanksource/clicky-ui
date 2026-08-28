import { useState } from "react";
import { Button } from "../../../components/button";
import {
  SegmentedControl,
  type SegmentedOption,
} from "../../../components/SegmentedControl";
import { UiRefresh, UiSave, UiWarningTriangle } from "../../../icons";
import type { PromptSaveSource } from "./prompt-page-model";

const SOURCE_OPTIONS: SegmentedOption<PromptSaveSource>[] = [
  {
    id: "inline",
    label: "Inline",
    title: "Store the spec in this layer's config",
  },
  {
    id: "file",
    label: "File",
    title: "Store the whole document in a .prompt file",
  },
];

export type PromptPageSaveBarProps = {
  source: PromptSaveSource;
  onSourceChange: (source: PromptSaveSource) => void;
  path: string;
  onPathChange: (path: string) => void;
  dirty: boolean;
  saving: boolean;
  canRemove: boolean;
  error?: string | undefined;
  conflict: boolean;
  onSave: () => void;
  onRemove: () => void;
  onReload: () => void;
};

// PromptPageSaveBar holds the destination choice, the save/remove/reload
// actions and their errors. A stale-base rejection is a conflict, not a
// failure: it names the fix (reload) instead of inviting a retry that would
// hit the same wall.
export function PromptPageSaveBar({
  source,
  onSourceChange,
  path,
  onPathChange,
  dirty,
  saving,
  canRemove,
  error,
  conflict,
  onSave,
  onRemove,
  onReload,
}: PromptPageSaveBarProps) {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const pathMissing = source === "file" && path.trim() === "";

  return (
    <div className="flex flex-col gap-2 border-t border-border px-density-4 py-density-3">
      <div className="mx-auto flex w-full max-w-[820px] flex-col gap-2">
        {conflict ? (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/40 dark:text-amber-300"
          >
            <UiWarningTriangle className="shrink-0" />
            <span className="min-w-0 flex-1">
              This layer changed since it was loaded. Reload to see the current
              document; your draft will be discarded.
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onReload}
              disabled={saving}
            >
              <UiRefresh className="mr-1" />
              Reload
            </Button>
          </div>
        ) : error ? (
          <p
            role="alert"
            className="whitespace-pre-wrap text-xs text-destructive"
          >
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Save to
          </span>
          <SegmentedControl
            size="sm"
            value={source}
            options={SOURCE_OPTIONS}
            onChange={onSourceChange}
            aria-label="Save location"
          />
          {source === "file" ? (
            <input
              type="text"
              aria-label="Prompt file path"
              className="min-w-64 flex-1 rounded-md border border-border bg-background p-1.5 font-mono text-xs"
              value={path}
              placeholder=".gavel/prompts/my-prompt.prompt"
              spellCheck={false}
              onChange={(event) => onPathChange(event.currentTarget.value)}
            />
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            {canRemove && !confirmingRemove ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingRemove(true)}
                disabled={saving}
              >
                Remove override from this layer
              </Button>
            ) : null}
            {confirmingRemove ? (
              <span className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">
                  Remove this layer&apos;s override?
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirmingRemove(false);
                    onRemove();
                  }}
                  disabled={saving}
                >
                  Remove
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingRemove(false)}
                  disabled={saving}
                >
                  Keep
                </Button>
              </span>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReload}
              disabled={saving}
            >
              <UiRefresh className="mr-1" />
              Reload
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={saving || !dirty || pathMissing}
              loading={saving}
            >
              <UiSave className="mr-1" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
