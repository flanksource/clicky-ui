import {
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Icon, LabelIcon } from "../data/Icon";
import { FilterPill } from "../data/FilterPill";
import { UiClose } from "../icons";
import { DropdownMenu } from "../overlay/DropdownMenu";
import type { ComboboxOption, ComboboxTriStateMode } from "./combobox-types";

type ComboboxTagsProps = {
  disabled: boolean | undefined;
  /** Per-value include/exclude modes; set only in tristate mode. */
  modes: Record<string, ComboboxTriStateMode> | undefined;
  onRemove: (value: string) => void;
  onSetMode: (value: string, mode: string) => void;
  options: ComboboxOption[];
  values: string[];
};

const ROW_FLOW = "[data-combobox-tag], [data-combobox-more], input";

/**
 * How many leading tags fit on the control's first row beside the "+N more"
 * chip and the input. Starts from all of them and drops one per layout pass
 * until nothing wraps; a new selection or control width measures again.
 */
export function useSingleRowTagCount(
  anchorRef: RefObject<HTMLDivElement | null>,
  values: string[],
): number {
  const [limit, setLimit] = useState<number>();
  const [width, setWidth] = useState(0);
  const key = values.join("\u0000");
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorRef]);
  useLayoutEffect(() => {
    setLimit(undefined);
  }, [key, width]);
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || !values.length) return;
    const flow = [...anchor.children].filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.matches(ROW_FLOW),
    );
    const first = flow[0];
    if (!first) return;
    const threshold = first.offsetTop + Math.max(first.offsetHeight / 2, 1);
    if (!flow.some((element) => element.offsetTop > threshold)) return;
    setLimit((current) => Math.max(0, (current ?? values.length) - 1));
  });
  return Math.min(limit ?? values.length, values.length);
}

/** The "+N more" chip: opens a scrolling list of the tags that did not fit. */
export function ComboboxMoreTags({ values, ...tagProps }: ComboboxTagsProps) {
  return (
    <span data-combobox-more className="inline-flex h-6 shrink-0">
      <DropdownMenu
        role="dialog"
        align="left"
        menuLabel="More selected"
        trigger={
          <button
            type="button"
            aria-label={`Show ${values.length} more selected`}
            className="inline-flex h-6 items-center whitespace-nowrap rounded-md border border-dashed border-border px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            +{values.length} more
          </button>
        }
      >
        {() => (
          <div
            data-combobox-more-list
            className="flex max-h-60 w-80 max-w-[calc(100vw-2rem)] flex-col items-start gap-1 overflow-y-auto p-1"
          >
            <ComboboxTags values={values} {...tagProps} />
          </div>
        )}
      </DropdownMenu>
    </span>
  );
}

export function ComboboxTags({
  disabled,
  modes,
  onRemove,
  onSetMode,
  options,
  values,
}: ComboboxTagsProps) {
  return values.map((value, index) => {
    const option = options.find((entry) => entry.value === value);
    const label = option?.selectedLabel ?? option?.label ?? value;
    const mode = modes?.[value];
    const remove = !disabled && (
      <button
        type="button"
        aria-label={`Remove ${label}`}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onRemove(value)}
      >
        <Icon icon={UiClose} className="size-3" />
      </button>
    );

    // A tristate pill carries its mode in the same colours the menu rows use.
    // The pill body flips include ↔ exclude; returning to neutral is what the
    // close button means, so the two affordances never overlap.
    if (mode) {
      return (
        <span
          key={`${value}-${index}`}
          data-combobox-tag={value}
          data-combobox-tag-mode={mode}
          className="inline-flex h-6 max-w-full items-center gap-1"
        >
          <FilterPill
            mode={mode}
            label={
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <LabelIcon
                  icon={option?.icon}
                  className="shrink-0 text-muted-foreground"
                />
                <span className="truncate">{label}</span>
              </span>
            }
            title={
              mode === "include" ? `${label} included` : `${label} excluded`
            }
            className="max-w-full"
            {...(disabled
              ? {}
              : {
                  onClick: () =>
                    onSetMode(
                      value,
                      mode === "include" ? "exclude" : "include",
                    ),
                })}
          />
          {remove}
        </span>
      );
    }

    return (
      <ComboboxTag
        key={`${value}-${index}`}
        value={value}
        {...(option ? { option } : {})}
      >
        {remove}
      </ComboboxTag>
    );
  });
}

export function ComboboxTag({
  value,
  option,
  children,
}: {
  value: string;
  option?: ComboboxOption;
  children?: ReactNode;
}) {
  return (
    <span
      data-combobox-tag={value}
      className="inline-flex h-6 max-w-full items-center gap-1 rounded-md bg-muted px-2 text-xs"
    >
      <LabelIcon
        icon={option?.icon}
        className="shrink-0 text-muted-foreground"
      />
      <span className="truncate">
        {option?.selectedLabel ?? option?.label ?? value}
      </span>
      {children}
    </span>
  );
}
