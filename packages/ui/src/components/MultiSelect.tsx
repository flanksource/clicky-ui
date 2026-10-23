import { useMemo, useState, type ReactNode, type Ref } from "react";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Button } from "./button";
import { Select } from "./select";
import { cn } from "../lib/utils";
import { Icon, type LabelIconSpec } from "../data/Icon";
import { UiChevronDown, UiChevronUp } from "../icons";
import { useEscapeLayer, useFloatingZIndex } from "../overlay/modalStack";

export type MultiSelectOption = {
  /** Stable option value written into the selected value array. */
  value: string;
  /** Visible option label in the menu and trigger summary. */
  label: ReactNode;
  /** Secondary text rendered below the option label. */
  description?: string;
  /** Optional compact label used after the option is selected. */
  selectedLabel?: string;
  /** Leading glyph rendered with the option label. */
  icon?: LabelIconSpec;
  /** Prevents selecting this option while still showing it in the menu. */
  disabled?: boolean;
  /** Optional browser tooltip for truncated or explanatory labels. */
  title?: string;
  /**
   * Row count behind this option (e.g. a facet's per-value count). Consumers
   * render it where it fits their layout — a trailing badge, a pill count —
   * rather than this component drawing it itself.
   */
  count?: number;
  /** Facet values used to filter the available choices without changing selection. */
  facets?: Record<string, string>;
};

export type MultiSelectProps = {
  /** Available options, rendered in the order provided. */
  options: MultiSelectOption[];
  /** Controlled selected option values. */
  value: string[];
  /** Called with the complete next value array after each toggle. */
  onChange: (next: string[]) => void;
  /** Trigger text when nothing is selected. Also labels the menu. */
  placeholder?: string;
  /** Accessible name for the trigger. Use when the field is labelled
   *  elsewhere so the trigger doesn't have to borrow `placeholder` for its
   *  name (which would force a synthesized placeholder). */
  ariaLabel?: string;
  /** Disables opening and changing selections. */
  disabled?: boolean;
  /** Classes applied to the root wrapper. */
  className?: string;
  /** Classes applied to the trigger button. */
  triggerClassName?: string;
  /** Classes applied to the popover menu. */
  menuClassName?: string;
  /** Named facets displayed above the choices, with counts computed from all options. */
  facets?: { key: string; label: string; labels?: Record<string, string> }[];
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options",
  ariaLabel,
  disabled,
  className,
  triggerClassName,
  menuClassName,
  facets = [],
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [facetValues, setFacetValues] = useState<Record<string, string>>({});
  const filtered = options.filter((option) => facets.every((facet) => !facetValues[facet.key] || option.facets?.[facet.key] === facetValues[facet.key]));

  // Portaled (floating-ui) so the menu escapes `overflow` clipping from
  // scroll-container ancestors, matching Combobox/DropdownMenu.
  const floatingZ = useFloatingZIndex();
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context, { escapeKey: false }),
    useRole(context, { role: "menu" }),
  ]);
  useEscapeLayer(open, () => {
    setOpen(false);
    if (refs.domReference.current instanceof HTMLElement) refs.domReference.current.focus();
  });

  const selected = useMemo(() => {
    const selectedOptions = options.filter((option) => value.includes(option.value));
    const labels = selectedOptions
      .map((option) => option.label)
      .filter((label): label is string => typeof label === "string");

    if (selectedOptions.length === 0) return placeholder;
    if (labels.length === 0) return `${selectedOptions.length} selected`;
    if (labels.length <= 2) return labels.join(", ");
    return `${labels.length} selected`;
  }, [options, placeholder, value]);

  function toggleOption(nextValue: string) {
    if (value.includes(nextValue)) {
      onChange(value.filter((current) => current !== nextValue));
      return;
    }
    onChange([...value, nextValue]);
  }

  // `min-w-0` here, and a shrinkable trigger below, let the summary ellipsize
  // inside a width-capped flex parent (a FilterBar chip) rather than overflow
  // onto its neighbour.
  return (
    <div className={cn("inline-flex min-w-0", className)}>
      <Button
        ref={refs.setReference as Ref<HTMLButtonElement>}
        type="button"
        variant="outline"
        disabled={disabled}
        aria-label={ariaLabel ?? `${placeholder} filter`}
        className={cn(
          "w-fit max-w-[15rem] min-w-0 justify-between gap-3 text-left font-normal",
          triggerClassName,
          // Empty means the trigger is showing its placeholder, so it reads at
          // placeholder weight rather than at helper-text weight.
          value.length === 0 && "text-placeholder",
        )}
        {...getReferenceProps()}
      >
        <span className="truncate">{selected}</span>
        <Icon icon={open ? UiChevronUp : UiChevronDown} className="shrink-0 text-muted-foreground" />
      </Button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              role="menu"
              aria-label={placeholder}
              style={{ ...floatingStyles, zIndex: floatingZ }}
              className={cn(
                "min-w-[14rem] max-w-[20rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5",
                menuClassName,
              )}
              {...getFloatingProps()}
            >
          <div className="mb-1 flex items-center justify-between gap-2 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>{placeholder}</span>
            <button
              type="button"
              className="text-[10px] text-primary disabled:text-muted-foreground"
              onClick={() => onChange([])}
              disabled={value.length === 0}
            >
              Clear all
            </button>
          </div>
          {facets.length > 0 && <div className="space-y-2 border-b border-border px-2 pb-2">
            {facets.map((facet) => {
              const counts = new Map<string, number>();
              for (const option of options) {
                const value = option.facets?.[facet.key];
                if (value !== undefined) counts.set(value, (counts.get(value) ?? 0) + 1);
              }
              return <div key={facet.key} className="space-y-1">
                <span className="text-xs font-medium">{facet.label}</span>
                <Select aria-label={facet.label} value={facetValues[facet.key] ?? ""}
                  onChange={(event) => setFacetValues((previous) => ({ ...previous, [facet.key]: event.target.value }))}
                  options={[{ value: "", label: `All (${options.length})` }, ...[...counts].map(([value, count]) => ({ value, label: `${facet.labels?.[value] ?? value} (${count})` }))]} />
              </div>;
            })}
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...new Set([...value, ...filtered.filter((option) => !option.disabled).map((option) => option.value)])])}>Select all shown</Button>
          </div>}
          <div className="max-h-64 overflow-auto">
            {filtered.length === 0 && <p role="status" className="px-2 py-3 text-sm text-muted-foreground">No matching options</p>}
            {filtered.map((option) => {
              const checked = value.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                    option.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <input
                    type="checkbox"
                    role="menuitemcheckbox"
                    className="size-4 rounded border border-input"
                    checked={checked}
                    disabled={option.disabled}
                    onChange={() => toggleOption(option.value)}
                  />
                  <span className="min-w-0 truncate">{option.label}</span>
                </label>
              );
            })}
          </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
