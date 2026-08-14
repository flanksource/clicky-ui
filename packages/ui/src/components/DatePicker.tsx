import { forwardRef, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Icon } from "../data/Icon";
import { UiCalendar } from "../icons";
import { cn } from "../lib/utils";

export type DatePickerProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  // `prefix` is a global HTML attribute typed as string; omit it so our
  // ReactNode adornment prop below is not intersected down to `string & ReactNode`.
  "type" | "value" | "onChange" | "prefix"
> & {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  openButtonLabel?: string;
  /** Trailing in-field adornment, rendered left of the calendar button. */
  suffix?: ReactNode;
  /** Leading in-field adornment, rendered at the left edge of the input. */
  prefix?: ReactNode;
};

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      value = "",
      onChange,
      className,
      inputClassName,
      buttonClassName,
      openButtonLabel = "Open date picker",
      suffix,
      prefix,
      ...props
    },
    ref,
  ) => {
    const localRef = useRef<HTMLInputElement | null>(null);

    function assignRef(node: HTMLInputElement | null) {
      localRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }

    return (
      <div data-jsf-control className={cn("relative", className)}>
        {prefix && <div className="absolute inset-y-0 left-1.5 flex items-center">{prefix}</div>}
        <input
          {...props}
          ref={assignRef}
          type="date"
          value={value}
          className={cn(
            "h-control-h w-full rounded-md border border-input bg-background px-control-px pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
            prefix && "pl-8",
            inputClassName,
          )}
          onChange={(event) => onChange?.(event.target.value)}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-7 flex items-center">{suffix}</div>
        )}
        <button
          type="button"
          aria-label={openButtonLabel}
          className={cn(
            "absolute inset-y-0 right-1 inline-flex items-center text-muted-foreground",
            buttonClassName,
          )}
          onClick={() => {
            localRef.current?.focus();
            localRef.current?.showPicker?.();
          }}
        >
          <Icon icon={UiCalendar} className="text-sm" />
        </button>
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";
