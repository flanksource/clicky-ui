import { useMemo } from "react";
import { Icon } from "../data/Icon";
import { UiAdd, UiClose } from "../icons";
import {
  buildPathTree,
  splitPath,
  type PathTreeNode,
} from "../lib/path-tree";
import { cn } from "../lib/utils";
import { TreePickerField } from "./TreePickerField";
import type { FormSize } from "./json-schema-form-size";
import type {
  FieldControl,
  FieldOption,
  LookupHierarchy,
} from "./json-schema-form-types";

type OptionNode = PathTreeNode<FieldOption>;

// optionOf returns the option a node commits, or undefined for a pure folder —
// an intermediate segment (`logs` in `logs.api`) that no option itself names.
function optionOf(node: OptionNode): FieldOption | undefined {
  return node.items[0];
}

function treeFrom(
  options: FieldOption[],
  hierarchy: LookupHierarchy,
): OptionNode[] {
  return buildPathTree(options, (option) =>
    splitPath(option.label || option.value, hierarchy.delimiters),
  );
}

// toValues normalises the committed value of a multi lookup. The schema type is
// an array of strings, but a form mid-edit can hold anything, so anything that
// is not a usable string is dropped rather than rendered as a broken chip.
function toValues(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function OptionRow({ node }: { node: OptionNode }) {
  const option = optionOf(node);
  return (
    <span
      className={cn(
        "min-w-0 flex-1 truncate text-sm",
        option ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {node.label}
    </span>
  );
}

/**
 * LookupTreeControl is the hierarchical form of the entity-reference picker: it
 * browses the fetched options as a tree rather than scrolling one long flat
 * list. Reached when the lookup descriptor declares `hierarchy`.
 *
 * Only the *presentation* is hierarchical — the committed value is always the
 * option's own value, never a path. Folder-only nodes are not selectable, but
 * an option whose label is a prefix of others (a node that is both folder and
 * leaf) stays selectable.
 */
export function LookupTreeControl({
  field,
  fieldId,
  readOnly,
  size,
  options,
  loading,
  hierarchy,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  size: FormSize;
  options: FieldOption[];
  loading: boolean;
  hierarchy: LookupHierarchy;
}) {
  const roots = useMemo(
    () => treeFrom(options, hierarchy),
    [options, hierarchy],
  );
  const multi = field.lookup?.multi === true;
  const placeholder = loading ? "Loading…" : "Select…";

  if (!multi) {
    const value = typeof field.value === "string" ? field.value : "";
    const selected =
      findByValue(roots, value) ?? (null as OptionNode | null);
    return (
      <div id={fieldId} data-jsf-input>
        <TreePickerField<OptionNode>
          roots={roots}
          getKey={(node) => node.key}
          getChildren={(node) => node.children}
          getSearchText={(node) => node.key}
          // Every branch starts closed — the tree exists to keep a long option
          // list scannable, which a pre-expanded first level undoes.
          defaultOpen={() => false}
          renderRow={({ node }) => <OptionRow node={node} />}
          isSelectable={(node) => optionOf(node) !== undefined}
          onSelect={(node) => field.onChange(optionOf(node)?.value)}
          selected={selected}
          revealSelected
          ariaLabel={field.label}
          disabled={readOnly}
          size={size}
          placeholder={placeholder}
          {...(value ? { label: value } : {})}
        />
      </div>
    );
  }

  const values = toValues(field.value);
  return (
    <div id={fieldId} data-jsf-input className="flex flex-col gap-1.5">
      {values.length > 0 && (
        <ul className="flex flex-wrap gap-1">
          {values.map((entry) => (
            <li
              key={entry}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 py-0.5 pl-2 pr-1 text-xs"
            >
              <span className="truncate">{entry}</span>
              {!readOnly && (
                <button
                  type="button"
                  aria-label={`Remove ${entry}`}
                  onClick={() =>
                    field.onChange(values.filter((kept) => kept !== entry))
                  }
                  className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Icon icon={UiClose} className="text-[0.7rem]" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!readOnly && (
        <TreePickerField<OptionNode>
          roots={roots}
          getKey={(node) => node.key}
          getChildren={(node) => node.children}
          getSearchText={(node) => node.key}
          // Every branch starts closed — the tree exists to keep a long option
          // list scannable, which a pre-expanded first level undoes.
          defaultOpen={() => false}
          renderRow={({ node }) => <OptionRow node={node} />}
          // Already-chosen values stay visible but inert, so the list does not
          // reshuffle underneath the pointer mid-selection.
          isSelectable={(node) => {
            const option = optionOf(node);
            return option !== undefined && !values.includes(option.value);
          }}
          onSelect={(node) => {
            const option = optionOf(node);
            if (option) field.onChange([...values, option.value]);
          }}
          ariaLabel={field.label}
          size={size}
          renderTrigger={({ triggerRef, toggle }) => (
            <button
              ref={triggerRef}
              type="button"
              onClick={toggle}
              className="inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed border-input px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-input hover:text-foreground"
            >
              <Icon icon={UiAdd} className="text-[0.7rem]" />
              {loading ? "Loading…" : `Add ${field.label ?? "value"}`}
            </button>
          )}
        />
      )}
    </div>
  );
}

function findByValue(nodes: OptionNode[], value: string): OptionNode | null {
  if (!value) return null;
  for (const node of nodes) {
    if (optionOf(node)?.value === value) return node;
    const nested = findByValue(node.children, value);
    if (nested) return nested;
  }
  return null;
}
