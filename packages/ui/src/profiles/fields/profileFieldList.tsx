import { useState } from "react";
import { AccordionList } from "../../components/AccordionList";
import { IconButton } from "../../components/IconButton";
import { Button } from "../../components/button";
import {
  DropdownMenu,
  type DropdownMenuItem,
} from "../../overlay/DropdownMenu";
import {
  UiAdd,
  UiDotsVertical,
  UiEye,
  UiEyeClosed,
  UiFilter,
  UiFilterFilled,
  UiRefresh,
  UiTrash,
} from "../../icons";
import { LabelIcon } from "../../data/Icon";
import { ProfileFieldEditorForm } from "./profileFieldEditor";
import { profileTypeIcon } from "./profileFieldIcons";
import type { ProfileFieldState } from "./profileFieldState";
import {
  inferredFilterKind,
  patchColumnFilter,
  PROFILE_FILTER_KIND_OPTIONS,
  type ProfileColumn,
  type ProfileFieldFilter,
} from "../wizard/profileWizardModel";

const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

const inputClassNameSm =
  "h-7 min-w-0 rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

/** Search, type and selection filters. `compact` lays them out on one row for
 * the editor route's pinned toolbar; the wizard stacks them in its card. */
export function ProfileFieldFilters({
  state,
  compact = false,
}: {
  state: ProfileFieldState;
  compact?: boolean;
}) {
  const className = compact ? inputClassNameSm : inputClassName;
  const patch = (next: Partial<ProfileFieldFilter>) =>
    state.setFilter((current) => ({ ...current, ...next }));
  const search = (
    <input
      type="search"
      value={state.filter.query}
      onChange={(event) => patch({ query: event.target.value })}
      placeholder={`Search ${state.available.length} fields`}
      aria-label="Search fields"
      className={className}
    />
  );
  const selects = (
    <>
      <select
        value={state.filter.type}
        aria-label="Filter by field type"
        className={compact ? `${className} w-[5.25rem]` : className}
        onChange={(event) => patch({ type: event.target.value })}
      >
        <option value="">All types</option>
        {state.types.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <select
        value={state.filter.selection}
        aria-label="Filter by selection"
        className={compact ? `${className} w-[5.5rem]` : className}
        onChange={(event) =>
          patch({
            selection: event.target.value as ProfileFieldFilter["selection"],
          })
        }
      >
        <option value="all">All fields</option>
        <option value="selected">Selected</option>
        <option value="unselected">Not selected</option>
      </select>
    </>
  );
  if (compact) {
    return (
      <div
        data-profile-field-filters="compact"
        className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-1"
      >
        {search}
        {selects}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {search}
      <div className="grid grid-cols-2 gap-2">{selects}</div>
    </div>
  );
}

export function ProfileFieldSidebarList({
  state,
  reset,
  onFieldSelect,
  onAdd,
}: {
  state: ProfileFieldState;
  reset?: {
    disabled: boolean;
    title: string;
    onReset: () => void;
  };
  onFieldSelect?: (name: string) => void;
  onAdd?: () => void;
}) {
  const [dragFrom, setDragFrom] = useState<number>();
  const [dragOver, setDragOver] = useState<number>();
  const fields = state.visibleFields;

  return (
    <div className="space-y-2 py-1">
      <ProfileFieldFilters state={state} compact />
      <div className="space-y-0.5">
        {fields.map((field, index) => {
          const selected = state.selectedNames.has(field.name);
          const active = field.name === state.activeField?.name;
          const draggable = selected;
          const dropEdge =
            dragFrom === undefined || dragOver !== index || dragFrom === index
              ? undefined
              : dragFrom < index
                ? "bottom"
                : "top";
          return (
            <div
              key={field.name}
              data-profile-tree-item
              data-profile-column-row
              data-drop-edge={dropEdge}
              className={`group relative flex min-w-0 items-center gap-1 rounded-md px-1 py-0.5 ${
                active ? "bg-primary/[0.08]" : "hover:bg-muted/50"
              } ${
                dropEdge === "top"
                  ? "shadow-[inset_0_2px_0_0_var(--color-primary)]"
                  : dropEdge === "bottom"
                    ? "shadow-[inset_0_-2px_0_0_var(--color-primary)]"
                    : ""
              }`}
              onDragOver={(event) => {
                if (!draggable || dragFrom === undefined) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDragOver(index);
              }}
              onDrop={(event) => {
                if (!draggable || dragFrom === undefined) return;
                event.preventDefault();
                const source = fields[dragFrom];
                if (source) state.reorderField(source.name, field.name);
                setDragFrom(undefined);
                setDragOver(undefined);
              }}
            >
              <button
                type="button"
                draggable={draggable}
                disabled={!draggable}
                aria-label={`Reorder ${field.name}`}
                className="shrink-0 cursor-grab rounded text-muted-foreground hover:text-foreground disabled:cursor-default disabled:opacity-30"
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  setDragFrom(index);
                }}
                onDragEnd={() => {
                  setDragFrom(undefined);
                  setDragOver(undefined);
                }}
                onKeyDown={(event) => {
                  const next =
                    event.key === "ArrowUp"
                      ? fields[index - 1]
                      : event.key === "ArrowDown"
                        ? fields[index + 1]
                        : undefined;
                  if (!next || !state.selectedNames.has(next.name)) return;
                  event.preventDefault();
                  state.reorderField(field.name, next.name);
                }}
              >
                <UiDotsVertical className="size-3.5" />
              </button>
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                className={`flex min-w-0 flex-1 items-center gap-1.5 rounded px-1 py-1 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selected
                    ? ""
                    : "text-muted-foreground line-through opacity-60"
                }`}
                onClick={() => {
                  if (onFieldSelect) onFieldSelect(field.name);
                  else state.setActiveName(field.name);
                }}
              >
                <span className="truncate font-mono font-medium">
                  {field.name}
                </span>
              </button>
              <ProfileFieldRowMenu field={field} state={state} />
            </div>
          );
        })}
        {fields.length === 0 ? (
          <p
            data-profile-tree-item
            className="relative rounded-md px-2 py-2 text-xs text-muted-foreground"
          >
            No fields match these filters.
          </p>
        ) : null}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {state.configuredCount} of {state.available.length} included
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {reset ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={reset.disabled}
            title={reset.title}
            onClick={reset.onReset}
          >
            Reset
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          data-profile-tree-item
          className={`relative justify-start ${reset ? "" : "col-span-2"}`}
          onClick={() => {
            state.addField();
            onAdd?.();
          }}
        >
          <UiAdd className="size-3.5" />
          Add column
        </Button>
      </div>
    </div>
  );
}

function ProfileFieldRowMenu({
  field,
  state,
}: {
  field: ProfileColumn;
  state: ProfileFieldState;
}) {
  const selected = state.selectedNames.has(field.name);
  const filterable = !field.filter?.disabled;
  const items: DropdownMenuItem[] = selected
    ? [
        {
          label: field.hidden ? "Show column" : "Hide column",
          icon: field.hidden ? UiEye : UiEyeClosed,
          onSelect: () => state.patchField(field, { hidden: !field.hidden }),
        },
        {
          label: filterable ? "Disable filtering" : "Enable filtering",
          icon: filterable ? UiFilterFilled : UiFilter,
          onSelect: () =>
            state.patchField(field, {
              filter: patchColumnFilter(field.filter, {
                disabled: filterable ? true : undefined,
              }),
            }),
        },
        {
          label: "Remove column",
          icon: UiTrash,
          iconColor: "var(--color-destructive)",
          onSelect: () => state.removeField(field),
        },
      ]
    : [
        {
          label: "Restore column",
          icon: UiRefresh,
          onSelect: () => state.setFieldSelection(field, true),
        },
      ];

  return (
    <DropdownMenu
      align="right"
      menuLabel={`${field.name} field actions`}
      menuClassName="min-w-40"
      header={
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <LabelIcon icon={profileTypeIcon(field.type)} className="text-sm" />
          <span>{field.type ?? "auto"} type</span>
        </span>
      }
      trigger={
        <span
          role="button"
          tabIndex={0}
          aria-label={`More actions for ${field.name}`}
          className="inline-flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <UiDotsVertical className="size-3.5" />
          <span className="sr-only">More actions for {field.name}</span>
        </span>
      }
      items={items}
    />
  );
}

/**
 * The profile's columns as an accordion list: one summary row per column, the
 * open one showing that column's whole editor.
 *
 * A spreadsheet of inline cells could only ever carry the four properties that
 * fit a cell; the other nine had to live somewhere else. This is the shape the
 * params editor already uses for the same problem — AccordionList owns the
 * disclosure, the roving focus and the drag — so the two lists behave alike.
 *
 * Rows are dragged by their handle to reorder the profile's columns. Only
 * configured fields take part: a deleted one has no position of its own, so it
 * is neither draggable nor a drop target.
 */
export function ProfileFieldList({ state }: { state: ProfileFieldState }) {
  // The open row follows the active field; `collapsed` is the one thing the
  // active field cannot express, since it always resolves to a column (there is
  // no "no active column" state to close the list into).
  const [collapsed, setCollapsed] = useState(false);
  const fields = state.visibleFields;
  const activeIndex = fields.findIndex(
    (field) => field.name === state.activeField?.name,
  );
  const expanded = collapsed || activeIndex < 0 ? null : activeIndex;

  return (
    <div className="min-h-0 flex-1 overflow-auto p-2">
      <AccordionList<ProfileColumn>
        items={fields}
        size="sm"
        listClassName="bg-card"
        itemId={(index) => `profile-column-${fields[index]?.name ?? index}`}
        itemLabel={({ item }) => item.name}
        expanded={expanded}
        onExpandedChange={(index) => {
          setCollapsed(index === null);
          const next = index === null ? undefined : fields[index];
          if (next) state.setActiveName(next.name);
        }}
        allowDrag
        canDrag={({ item }) => state.selectedNames.has(item.name)}
        onReorder={(from, to) => {
          const source = fields[from];
          const target = fields[to];
          if (source && target) state.reorderField(source.name, target.name);
        }}
        // Hiding and filtering are states the row has to show at rest, not
        // actions to be discovered on hover.
        revealActions={false}
        renderActions={({ item }) => (
          <ProfileFieldRowActions field={item} state={state} />
        )}
        renderHeader={({ item }) => (
          <ProfileFieldRowHeader field={item} state={state} />
        )}
        renderBody={({ item }) => (
          <ProfileFieldEditorForm
            field={item}
            onChange={(patch) => state.patchField(item, patch)}
          />
        )}
      />
      {fields.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          No fields match these filters.
        </p>
      ) : null}
    </div>
  );
}

function ProfileFieldRowHeader({
  field,
  state,
}: {
  field: ProfileColumn;
  state: ProfileFieldState;
}) {
  const selected = state.selectedNames.has(field.name);
  const fieldState = !selected
    ? "deleted"
    : field.hidden
      ? "hidden"
      : "visible";
  return (
    <span
      data-field-state={fieldState}
      className={`flex min-w-0 flex-1 items-center gap-2 ${
        fieldState === "deleted"
          ? "text-muted-foreground line-through opacity-60"
          : fieldState === "hidden"
            ? "text-muted-foreground opacity-60"
            : ""
      }`}
    >
      <LabelIcon
        icon={profileTypeIcon(field.type)}
        className="shrink-0 text-[15px] text-muted-foreground"
      />
      <span className="shrink-0 font-mono text-sm font-medium">
        {field.name}
      </span>
      {field.label ? (
        <span className="shrink-0 truncate text-sm text-muted-foreground">
          {field.label}
        </span>
      ) : null}
      <code className="truncate font-mono text-xs text-muted-foreground">
        {summarizeColumn(field)}
      </code>
      {field.cel ? (
        <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
          cel
        </span>
      ) : null}
    </span>
  );
}

/** Hide, filter and delete — the per-column actions the list carries, so a
 *  column can be shaped without opening it. */
function ProfileFieldRowActions({
  field,
  state,
}: {
  field: ProfileColumn;
  state: ProfileFieldState;
}) {
  const selected = state.selectedNames.has(field.name);
  // A column is filterable unless it opts out, matching the server's inference.
  const filterable = !field.filter?.disabled;
  return (
    <>
      <IconButton
        icon={field.hidden ? UiEye : UiEyeClosed}
        label={`${field.hidden ? "Show" : "Hide"} ${field.name}`}
        disabled={!selected}
        onClick={() => state.patchField(field, { hidden: !field.hidden })}
      />
      <IconButton
        // Filled while the column is filtered, hollow and muted while it is not:
        // the pair the icon set already ships for exactly this "is it on?"
        // question, next to the eye that answers the same for hiding.
        icon={filterable ? UiFilterFilled : UiFilter}
        label={`${filterable ? "Offer no filter for" : "Filter"} ${field.name}`}
        disabled={!selected}
        className={filterable ? undefined : "text-muted-foreground/60"}
        onClick={() =>
          state.patchField(field, {
            filter: patchColumnFilter(field.filter, {
              disabled: filterable ? true : undefined,
            }),
          })
        }
      />
      {selected ? (
        <IconButton
          icon={UiTrash}
          label={`Delete ${field.name}`}
          className="text-destructive hover:text-destructive"
          onClick={() => state.removeField(field)}
        />
      ) : (
        // A deleted column is still listed (the sample reported it), so its way
        // back has to live on the row — nothing else offers it now that the
        // editor is the row's own panel.
        <IconButton
          icon={UiRefresh}
          label={`Restore ${field.name}`}
          onClick={() => state.setFieldSelection(field, true)}
        />
      )}
    </>
  );
}

/** The properties the collapsed row can still answer for: what the column holds
 *  and how it is filtered. */
function summarizeColumn(field: ProfileColumn): string {
  const kind = field.filter?.kind ?? inferredFilterKind(field);
  const label =
    PROFILE_FILTER_KIND_OPTIONS.find((option) => option.value === kind)
      ?.label ?? kind;
  return [
    field.type ?? "auto",
    field.filter?.disabled ? "no filter" : label.toLowerCase(),
  ].join(" · ");
}
