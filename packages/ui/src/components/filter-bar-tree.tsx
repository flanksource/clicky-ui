import { useMemo } from "react";
import { FilterPill, type FilterMode } from "../data/FilterPill";
import { Icon } from "../data/Icon";
import { UiChevronDown } from "../icons";
import { cn } from "../lib/utils";
import {
  comboboxLabelProps,
  lookupFieldWidthClass,
  nextFilterMode,
  updateMultiFilterValue,
  useDebouncedMultiDraft,
} from "./filter-bar-field-utils";
import {
  hasSelectedDescendant,
  treeSelectionSummary,
  type FilterBarTreeFilter,
  type FilterTreeNode,
} from "./filter-bar-tree-model";
import { inputSizeClass } from "./json-schema-form-size";
import { TreePickerField } from "./TreePickerField";

export type { FilterBarTreeFilter, FilterTreeNode };

const isFolder = (node: FilterTreeNode) => (node.children?.length ?? 0) > 0;

// TreeFilterField renders a "tree" filter as the same inline-labelled field the
// lookup comboboxes use, opening a TreePickerField whose every row (folder or
// leaf) carries the include/exclude/neutral switch of the "multi" kind. The
// panel stays open across selections, and opens already expanded down to
// whatever is selected. Clicking a folder row only expands it; clicking a leaf
// row cycles neutral, include, exclude.
export function TreeFilterField({
  filter,
  grow,
}: {
  filter: FilterBarTreeFilter;
  grow: boolean;
}) {
  const [draft, setDraft] = useDebouncedMultiDraft(filter.value, filter.onChange);
  const summary = useMemo(
    () => treeSelectionSummary(filter.nodes, draft),
    [filter.nodes, draft],
  );
  const { label, ariaLabel } = comboboxLabelProps(filter);
  const setMode = (key: string, mode: FilterMode) =>
    setDraft(updateMultiFilterValue(draft, key, mode));

  return (
    <TreePickerField<FilterTreeNode>
      roots={filter.nodes}
      getKey={(node) => node.key}
      getChildren={(node) => node.children}
      getSearchText={(node) => [node.label, node.key, node.description].filter(Boolean).join(" ")}
      defaultOpen={(node) => hasSelectedDescendant(node, draft)}
      isSelectable={(node) => !isFolder(node)}
      onSelect={(node) => setMode(node.key, nextFilterMode(draft[node.key] ?? "neutral"))}
      closeOnSelect={false}
      ariaLabel={filter.label}
      size="sm"
      {...(filter.disabled !== undefined ? { disabled: filter.disabled } : {})}
      className={cn(lookupFieldWidthClass(grow), filter.className)}
      renderTrigger={({ open, disabled, triggerRef, toggle }) => (
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel ?? filter.label}
          aria-haspopup="tree"
          aria-expanded={open}
          title={summary || filter.description}
          onClick={toggle}
          className={cn(
            "relative flex w-full items-center gap-1.5 rounded-md border border-input bg-background pr-8 text-left text-foreground",
            inputSizeClass.sm,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <span className="shrink-0 whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <span className={cn("min-w-0 flex-1 truncate", !summary && "text-placeholder")}>
            {summary || filter.placeholder}
          </span>
          <span className="pointer-events-none absolute right-0 flex h-full items-center px-2 text-muted-foreground">
            <Icon icon={UiChevronDown} className="text-xs" />
          </span>
        </button>
      )}
      renderRow={({ node }) => (
        <FilterPill
          className="min-w-0 flex-1 justify-between"
          togglePosition="right"
          mode={draft[node.key] ?? "neutral"}
          title={node.label}
          label={
            <span className="block min-w-0 text-left">
              <span className="block truncate">{node.label}</span>
              {node.description && (
                <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                  {node.description}
                </span>
              )}
            </span>
          }
          onModeChange={(next) => setMode(node.key, next)}
        />
      )}
    />
  );
}
