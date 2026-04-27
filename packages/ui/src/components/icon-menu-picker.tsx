import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { Button } from "./button";

export type IconMenuOption<T extends string> = {
  value: T;
  icon: string;
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
    className,
    triggerClassName,
    menuClassName,
  }: IconMenuPickerProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const activeIndex = useMemo(
    () =>
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    [options, value],
  );

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const select = useCallback(
    (next: T) => {
      onChange(next);
      close(true);
    },
    [close, onChange],
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (!rootRef.current?.contains(event.target as Node)) {
        close(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    const node = itemRefs.current[activeIndex];
    node?.focus();
  }, [activeIndex, open]);

  const focusItem = (index: number) => {
    const wrapped = (index + options.length) % options.length;
    itemRefs.current[wrapped]?.focus();
  };

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const focusedIndex = itemRefs.current.findIndex((node) => node === document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem((focusedIndex < 0 ? activeIndex : focusedIndex) + 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem((focusedIndex < 0 ? activeIndex : focusedIndex) - 1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusItem(options.length - 1);
      return;
    }
    if (event.key === "Tab") {
      close(false);
    }
  };

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const selected = options[activeIndex];
  if (!selected) {
    throw new Error(`IconMenuPicker: value "${value}" not found in options for ${ariaLabel}`);
  }

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        title={triggerTitle ?? `${ariaLabel}: ${selected.label}`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
        className={cn("text-muted-foreground hover:text-foreground", triggerClassName)}
      >
        <Icon name={selected.icon} />
      </Button>
      {open && (
        <div
          role="menu"
          aria-label={ariaLabel}
          onKeyDown={onMenuKeyDown}
          className={cn(
            "absolute left-0 top-[calc(100%+0.375rem)] z-50 min-w-[12rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5",
            menuClassName,
          )}
        >
          {options.map((option, index) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => select(option.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    select(option.value);
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  active && "text-foreground",
                )}
              >
                <Icon name={option.icon} className="shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate capitalize">{option.label}</span>
                {active ? (
                  <Icon name="ph:check" className="shrink-0 text-foreground" />
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
      )}
    </div>
  );
}

export const IconMenuPicker = forwardRef(IconMenuPickerInner) as <T extends string>(
  props: IconMenuPickerProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => JSX.Element;
