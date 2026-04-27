import { forwardRef, useRef, type InputHTMLAttributes } from "react";
import { Icon } from "../data/Icon";
import { cn } from "../lib/utils";

export type DateTimePickerProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  openButtonLabel?: string;
};

export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
  (
    {
      value = "",
      onChange,
      className,
      inputClassName,
      buttonClassName,
      openButtonLabel = "Open time picker",
      ...props
    },
    ref,
  ) => {
    const visibleRef = useRef<HTMLInputElement | null>(null);
    const pickerRef = useRef<HTMLInputElement | null>(null);

    function assignRef(node: HTMLInputElement | null) {
      visibleRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }

    return (
      <div className={cn("relative", className)}>
        <input
          {...props}
          ref={assignRef}
          type="text"
          value={value}
          className={cn(
            "h-8 w-full rounded-md border border-input bg-background px-2 pr-8 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            inputClassName,
          )}
          onChange={(event) => onChange?.(event.target.value)}
        />
        <input
          ref={pickerRef}
          type="datetime-local"
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-0 w-0 opacity-0"
          value={toDateTimeLocalValue(value)}
          onChange={(event) => onChange?.(event.target.value)}
        />
        <button
          type="button"
          aria-label={openButtonLabel}
          disabled={props.disabled}
          className={cn(
            "absolute inset-y-0 right-1 inline-flex items-center text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            buttonClassName,
          )}
          onClick={() => {
            visibleRef.current?.focus();
            pickerRef.current?.showPicker?.();
          }}
        >
          <Icon name="codicon:calendar" className="text-sm" />
        </button>
      </div>
    );
  },
);

DateTimePicker.displayName = "DateTimePicker";

function toDateTimeLocalValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed === "now" || trimmed.startsWith("now")) return "";

  const withTime = /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? `${trimmed}T00:00` : trimmed;

  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(withTime) ? withTime.slice(0, 16) : "";
}
