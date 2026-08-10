import { useMemo, useState } from "react";
import { UiFullscreen, UiListTree } from "../icons";
import { Icon } from "../data/Icon";
import { IconButton } from "./IconButton";
import { InputField, type InputFieldInputProps } from "./InputField";
import { buildJSONPathNode, type JSONPathNode } from "./jsonPathTree";
import {
  JSONPathPlayground,
  type JSONPathEvalRequest,
  type JSONPathEvalResult,
} from "./JSONPathPlayground";
import { TreePickerField } from "./TreePickerField";

export type { JSONPathNode } from "./jsonPathTree";

export type JSONPathFieldProps = Omit<InputFieldInputProps, "onChange" | "suffix" | "value"> & {
  json?: unknown;
  value: string;
  onChange: (path: string) => void;
  isSelectable?: (node: JSONPathNode) => boolean;
  getPath?: (node: JSONPathNode) => string;
  pickerLabel?: string;
  /**
   * Every sampled row, for the playground's row switcher. Defaults to `json`
   * alone — a field absent from the first row cannot be browsed otherwise.
   */
  rows?: unknown[];
  /** Enables the playground's live match preview. See JSONPathPlaygroundProps. */
  evaluate?: (request: JSONPathEvalRequest) => Promise<JSONPathEvalResult>;
  /**
   * Commits a picked path together with the column it must be rooted at, set
   * when the path addresses a decoded JSON-encoded column. Consumers that own
   * the whole column can write `source` alongside `jsonpath`; the default just
   * calls `onChange`, leaving the pairing to whoever writes `source` by hand.
   */
  onSelectPath?: (path: string, context: { root?: string }) => void;
  /**
   * The column the current path is already rooted at — its saved `source`. The
   * playground browses and evaluates from there, so a column that already pairs
   * the two does not read as broken.
   */
  source?: string;
};

export function JSONPathField({
  json,
  value,
  onChange,
  isSelectable,
  getPath,
  pickerLabel,
  rows,
  evaluate,
  onSelectPath,
  source,
  disabled,
  className,
  "aria-label": ariaLabel,
  ...inputProps
}: JSONPathFieldProps) {
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const roots = useMemo(() => json === undefined ? [] : [buildJSONPathNode(json, "$", 0)], [json]);
  const playgroundRows = useMemo(
    () => rows ?? (json === undefined ? [] : [json]),
    [rows, json],
  );
  const browseLabel = pickerLabel ?? `Browse ${ariaLabel ?? "JSONPath"} JSON paths`;
  const pickerDisabled = Boolean(disabled) || json === undefined;
  const commit = onSelectPath ?? ((path: string) => onChange(path));

  return (
    <>
      <TreePickerField<JSONPathNode>
        className="w-full"
        roots={roots}
        getKey={(node) => node.key}
        getChildren={(node) => node.children}
        getSearchText={(node) => `${node.path} ${node.summary}`}
        defaultOpen={(_node, depth) => depth < 2}
        {...(isSelectable ? { isSelectable } : {})}
        disabled={pickerDisabled}
        onSelect={(node) => onChange(getPath?.(node) ?? node.path)}
        // The dropdown caps its walk to open instantly, so it can run out of
        // room on a document this row happens to be. The playground is where
        // that document is browsed in full.
        renderFooter={({ close }) => (
          <button
            type="button"
            onClick={() => {
              close();
              setPlaygroundOpen(true);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Icon icon={UiFullscreen} className="text-xs" />
            Open playground…
          </button>
        )}
        renderRow={({ node }) => (
          <span className="flex min-w-0 flex-1 items-center gap-density-2 font-mono text-xs">
            <span className="shrink-0 text-primary">{node.path}</span>
            <span className="truncate text-muted-foreground" title={node.summary}>{node.summary}</span>
          </span>
        )}
        renderTrigger={({ open, triggerRef, toggle }) => (
          <InputField
            {...inputProps}
            {...(disabled !== undefined ? { disabled } : {})}
            aria-label={ariaLabel}
            className={className}
            value={value}
            onChange={onChange}
            suffix={(
              <IconButton
                ref={triggerRef}
                icon={UiListTree}
                label={browseLabel}
                disabled={pickerDisabled}
                aria-haspopup="tree"
                aria-expanded={open}
                onClick={toggle}
              />
            )}
          />
        )}
      />
      {playgroundOpen && (
        <JSONPathPlayground
          open
          onClose={() => setPlaygroundOpen(false)}
          rows={playgroundRows}
          value={value}
          onCommit={commit}
          assignsRoot={onSelectPath !== undefined}
          {...(source ? { source } : {})}
          {...(evaluate ? { evaluate } : {})}
          title={`${ariaLabel ?? "JSONPath"} playground`}
        />
      )}
    </>
  );
}
