import { Fragment, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { FilterPill } from "../data/FilterPill";
import { Icon, LabelIcon } from "../data/Icon";
import { UiCheck } from "../icons";
import { cn } from "../lib/utils";
import type {
  ComboboxOption,
  ComboboxTriStateMode,
} from "./combobox-types";
import type { ComboboxMenuPosition } from "./combobox-utils";

export function ComboboxMenu({
  customEntry,
  filtered,
  floatingZ,
  footer,
  hasOptions,
  highlighted,
  isSelected,
  listId,
  listRef,
  loading,
  menuPos,
  modes,
  multiple,
  onHighlight,
  onSelect,
  onSetMode,
  tristate,
}: {
  customEntry: ComboboxOption | null;
  filtered: ComboboxOption[];
  floatingZ: number;
  footer: ReactNode;
  /** Whether the control has an option set at all (before filtering). */
  hasOptions: boolean;
  highlighted: number;
  isSelected: (value: string) => boolean;
  listId: string | undefined;
  listRef: RefObject<HTMLDivElement>;
  loading: boolean | undefined;
  menuPos: ComboboxMenuPosition;
  modes: Record<string, ComboboxTriStateMode>;
  multiple: boolean;
  onHighlight: (index: number) => void;
  onSelect: (option: ComboboxOption) => void;
  onSetMode: (value: string, mode: string) => void;
  tristate: boolean;
}) {
  return createPortal(
    <div
      id={listId}
      ref={listRef}
      role="listbox"
      aria-multiselectable={multiple || undefined}
      style={{
        position: "fixed",
        ...(menuPos.top != null
          ? { top: menuPos.top }
          : { bottom: menuPos.bottom }),
        left: menuPos.left,
        minWidth: menuPos.width,
        maxWidth: menuPos.maxWidth,
        maxHeight: menuPos.maxHeight,
        zIndex: floatingZ,
      }}
      className="w-max overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5"
    >
      {loading && filtered.length === 0 && (
        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      )}
      {/* "No results" answers "did my query match anything?" — a control with
          no option set at all (a free tag list) was never asked the question, so
          it says nothing rather than reporting an empty search. */}
      {!loading && filtered.length === 0 && !customEntry && hasOptions && (
        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
          No results
        </div>
      )}
      {filtered.map((option, index) => {
        const selected = isSelected(option.value);
        const mode = tristate ? modes[option.value] : undefined;
        const showHeader =
          option.group != null &&
          option.group !== filtered[index - 1]?.group;
        return (
          <Fragment key={option.value}>
            {showHeader && (
              <div
                role="presentation"
                className="select-none px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                {option.group}
              </div>
            )}
            <div
              id={listId ? `${listId}-${index}` : undefined}
              role="option"
              aria-selected={tristate ? mode != null : selected}
              aria-disabled={option.disabled}
              {...(mode != null
                ? {
                    "aria-label": `${option.label}, ${
                      mode === "include" ? "included" : "excluded"
                    }`,
                  }
                : {})}
              {...(option.title !== undefined ? { title: option.title } : {})}
              {...(tristate
                ? { "data-filter-option": option.value }
                : {})}
              onMouseDown={(event) => {
                event.preventDefault();
                if (!tristate && !option.disabled) onSelect(option);
              }}
              {...(tristate
                ? {
                    onClick: () => {
                      if (!option.disabled) onSelect(option);
                    },
                  }
                : {})}
              onMouseEnter={() => onHighlight(index)}
              className={cn(
                "flex cursor-pointer gap-2 rounded-sm px-2 py-1.5 text-sm",
                option.description ? "items-start" : "items-center",
                index === highlighted && "bg-accent",
                selected && !tristate && "font-medium",
                option.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {tristate ? (
                <div className="min-w-0 flex-1">
                  <FilterPill
                    mode={mode ?? "neutral"}
                    togglePosition="right"
                    interactive={false}
                    label={option.label}
                    onModeChange={(next) => onSetMode(option.value, next)}
                    className="w-full justify-between"
                  />
                  <ComboboxOptionDescription description={option.description} />
                </div>
              ) : (
                <>
                  <Icon
                    icon={UiCheck}
                    className={cn(
                      "shrink-0 text-xs",
                      option.description && "mt-1",
                      selected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <LabelIcon
                    icon={option.icon}
                    className={cn(
                      "text-sm text-muted-foreground",
                      option.description && "mt-1",
                    )}
                  />
                  <ComboboxOptionText option={option} />
                  {option.trailing != null && (
                    // Capped and truncating rather than `shrink-0`: in a menu
                    // clamped by the viewport edge the label is what identifies
                    // the option, so the preview yields first.
                    <span className="ml-auto min-w-0 max-w-[55%] truncate pl-2 text-right text-xs text-muted-foreground">
                      {option.trailing}
                    </span>
                  )}
                </>
              )}
            </div>
          </Fragment>
        );
      })}
      {customEntry && (
        <div
          id={listId ? `${listId}-${filtered.length}` : undefined}
          role="option"
          aria-selected={false}
          data-filter-add-custom={customEntry.value}
          title={customEntry.title}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(customEntry)}
          onMouseEnter={() => onHighlight(filtered.length)}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary",
            highlighted === filtered.length && "bg-accent",
          )}
        >
          <LabelIcon
            icon={customEntry.icon}
            className="text-sm text-muted-foreground"
          />
          <span className="min-w-0 truncate">{customEntry.label}</span>
        </div>
      )}
      {footer != null && (
        <div className="select-none px-2 py-1.5 text-[11px] text-muted-foreground">
          {footer}
        </div>
      )}
    </div>,
    document.body,
  );
}

function ComboboxOptionText({ option }: { option: ComboboxOption }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block truncate">{option.label}</span>
      <ComboboxOptionDescription description={option.description} />
    </span>
  );
}

function ComboboxOptionDescription({ description }: { description: string | undefined }) {
  return description ? (
    <span className="mt-0.5 block whitespace-pre-line text-xs font-normal leading-4 text-muted-foreground">
      {description}
    </span>
  ) : null;
}
