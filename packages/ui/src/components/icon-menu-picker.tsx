import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead,
} from "@floating-ui/react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { useEscapeLayer, useFloatingZIndex } from "../overlay/modalStack";
import { UiCheck, UiChevronDown } from "../icons";
import { Button } from "./button";
import { IconButton } from "./IconButton";

export type IconMenuOption<T extends string> = {
  value: T;
  icon: StaticIconComponent;
  label: string;
  description?: string;
};

export type IconMenuPickerProps<T extends string> = {
  value: T;
  onChange: (next: T) => void;
  options: IconMenuOption<T>[];
  ariaLabel: string;
  triggerTitle?: string | undefined;
  footer?: ReactNode | undefined;
  showLabel?: boolean | undefined;
  className?: string | undefined;
  triggerClassName?: string | undefined;
  menuClassName?: string | undefined;
};

function IconMenuPickerInner<T extends string>(
  {
    value,
    onChange,
    options,
    ariaLabel,
    triggerTitle,
    footer,
    showLabel,
    className,
    triggerClassName,
    menuClassName,
  }: IconMenuPickerProps<T>,
  forwardedRef: React.Ref<HTMLDivElement>,
) {
  const [open, setOpen] = useState(false);
  const floatingZ = useFloatingZIndex();
  // Index of the item highlighted by keyboard navigation. Null until the user
  // arrows/typeaheads, so a pointer-opened menu starts with the selected row
  // focused (selectedIndex below) rather than the first.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<(HTMLElement | null)[]>([]);
  const labelsRef = useRef<string[]>(options.map((o) => o.label));
  labelsRef.current = options.map((o) => o.label);

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value],
  );

  const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    // offset(6) reproduces the previous 0.375rem gap; flip opens the menu
    // upward when the trigger is near the bottom edge; shift slides it back
    // on-screen at the left/right edges. The 8px padding keeps a gutter.
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, { escapeKey: false });
  const role = useRole(context, { role: "menu" });
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    onMatch: setActiveIndex,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNav,
    typeahead,
  ]);
  useEscapeLayer(open, () => {
    setOpen(false);
    if (refs.domReference.current instanceof HTMLElement) refs.domReference.current.focus();
  });

  // Keep the trigger wrapper available both to floating-ui (as the positioning
  // reference) and to the consumer's forwarded ref.
  const referenceRef = useMergeRefs([refs.setReference, forwardedRef]);

  const select = (next: T) => {
    onChange(next);
    setOpen(false);
  };

  const selected = options[selectedIndex];
  if (!selected) {
    throw new Error(`IconMenuPicker: value "${value}" not found in options for ${ariaLabel}`);
  }

  const triggerTitleText = triggerTitle ?? `${ariaLabel}: ${selected.label}`;

  return (
    <div ref={referenceRef} className={cn("relative inline-flex", showLabel && "w-full", className)}>
      {showLabel ? (
        <Button
          type="button"
          variant="ghost"
          size="default"
          aria-label={ariaLabel}
          aria-haspopup="menu"
          aria-expanded={open}
          title={triggerTitleText}
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground",
            triggerClassName,
          )}
          {...getReferenceProps()}
        >
          <Icon icon={selected.icon} className="shrink-0 text-foreground" />
          <span className="min-w-0 flex-1 truncate text-left capitalize">
            {`${ariaLabel}: ${selected.label}`}
          </span>
          <Icon icon={UiChevronDown} className="shrink-0 text-muted-foreground" />
        </Button>
      ) : (
        <IconButton
          icon={selected.icon}
          label={ariaLabel}
          title={triggerTitleText}
          aria-haspopup="menu"
          aria-expanded={open}
          className={triggerClassName}
          {...getReferenceProps()}
        />
      )}
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={selectedIndex}>
            <div
              ref={refs.setFloating}
              role="menu"
              aria-label={ariaLabel}
              style={{ ...floatingStyles, zIndex: floatingZ }}
              className={cn(
                "min-w-[12rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5",
                menuClassName,
              )}
              {...getFloatingProps()}
            >
              {options.map((option, index) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value}
                    ref={(node) => {
                      listRef.current[index] = node;
                    }}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    tabIndex={index === activeIndex ? 0 : -1}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                      active && "text-foreground",
                    )}
                    {...getItemProps({
                      onClick: () => select(option.value),
                      onKeyDown: (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          select(option.value);
                        }
                      },
                    })}
                  >
                    <Icon icon={option.icon} className="shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate capitalize">{option.label}</span>
                    {active ? (
                      <Icon icon={UiCheck} className="shrink-0 text-foreground" />
                    ) : (
                      <span className="inline-block size-4 shrink-0" aria-hidden />
                    )}
                  </button>
                );
              })}
              {footer ? (
                <div className="mt-1 border-t border-border/60 px-2 py-1.5 text-[11px] text-muted-foreground">
                  {footer}
                </div>
              ) : null}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}

export const IconMenuPicker = forwardRef(IconMenuPickerInner) as <T extends string>(
  props: IconMenuPickerProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => JSX.Element;
